// ============================================
// Reviews API Route
// ============================================

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import ReviewModel from "@/models/Review";
import DoctorModel from "@/models/Doctor";
import NotificationModel from "@/models/Notification";
import { z } from "zod";

const createReviewSchema = z.object({
  doctorId: z.string().min(1),
  appointmentId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(1000),
});

// GET /api/reviews
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");

    let query: Record<string, unknown> = {};

    if (doctorId) {
      query = { doctorId };
    } else {
      const userId = session.user.userId;
      const role = session.user.role;
      query =
        role === "patient" ? { patientId: userId } : { doctorId: userId };
    }

    const reviews = await ReviewModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const formatted = reviews.map((r) => ({
      id: r._id.toString(),
      patientId: r.patientId,
      doctorId: r.doctorId,
      patientName: r.patientName,
      appointmentId: r.appointmentId,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt
        ? new Date(r.createdAt).toISOString().split("T")[0]
        : "",
    }));

    return NextResponse.json(formatted);
  } catch (error: unknown) {
    console.error("Reviews GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Submit a review
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "patient") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const review: any = await ReviewModel.create({
      patientId: session.user.userId,
      doctorId: parsed.data.doctorId,
      patientName: session.user.name || "",
      appointmentId: parsed.data.appointmentId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });

    // Update doctor's average rating
    const doctorReviews = await ReviewModel.find({ doctorId: parsed.data.doctorId });
    const avgRating =
      doctorReviews.reduce((sum, r) => sum + r.rating, 0) /
      doctorReviews.length;

    await DoctorModel.findOneAndUpdate(
      { userId: parsed.data.doctorId },
      {
        rating: Math.round(avgRating * 10) / 10,
        totalReviews: doctorReviews.length,
      }
    );

    // Create notification for doctor
    await NotificationModel.create({
      userId: parsed.data.doctorId,
      title: "New Review",
      message: `${session.user.name} left a ${parsed.data.rating}-star review for your service.`,
      type: "review",
    });

    return NextResponse.json(
      {
        message: "Review submitted successfully",
        id: review._id.toString(),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Reviews POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
