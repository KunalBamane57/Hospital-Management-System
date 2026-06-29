// ============================================
// Doctors API Route
// ============================================

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import User from "@/models/User";

// GET /api/doctors - Fetch all doctors or a specific doctor
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const specialization = searchParams.get("specialization");
    const search = searchParams.get("search");

    if (id) {
      // Fetch single doctor
      const doctor = await Doctor.findOne({ userId: id }).populate(
        "user",
        "name email phone avatar userId"
      );

      if (!doctor) {
        return NextResponse.json(
          { error: "Doctor not found" },
          { status: 404 }
        );
      }

      const user = doctor.user as unknown as {
        name: string;
        email: string;
        phone: string;
        avatar: string;
        userId: string;
      };

      return NextResponse.json({
        id: doctor.userId,
        name: user.name,
        email: user.email,
        role: "doctor",
        phone: user.phone,
        avatar: user.avatar,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experience: doctor.experience,
        rating: doctor.rating,
        totalReviews: doctor.totalReviews,
        consultationFee: doctor.consultationFee,
        bio: doctor.bio,
        availableSlots: doctor.availableSlots,
        languages: doctor.languages,
        hospital: doctor.hospital,
        department: doctor.department,
        createdAt: doctor.createdAt ? new Date(doctor.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      });
    }

    // Fetch all doctors with optional filtering
    const query: Record<string, unknown> = {};
    if (specialization && specialization !== "All Specializations") {
      query.specialization = specialization;
    }

    let doctors = await Doctor.find(query).populate(
      "user",
      "name email phone avatar userId"
    );

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      doctors = doctors.filter((doc) => {
        const user = doc.user as unknown as { name: string };
        if (!user) return false;
        return (
          user.name.toLowerCase().includes(searchLower) ||
          doc.specialization.toLowerCase().includes(searchLower)
        );
      });
    }

    const formattedDoctors = doctors.map((doc) => {
      const user = doc.user as unknown as {
        name: string;
        email: string;
        phone: string;
        avatar: string;
        userId: string;
      };

      if (!user) return null;

      return {
        id: doc.userId,
        name: user.name,
        email: user.email,
        role: "doctor",
        phone: user.phone,
        avatar: user.avatar,
        specialization: doc.specialization,
        qualification: doc.qualification,
        experience: doc.experience,
        rating: doc.rating,
        totalReviews: doc.totalReviews,
        consultationFee: doc.consultationFee,
        bio: doc.bio,
        availableSlots: doc.availableSlots,
        languages: doc.languages,
        hospital: doc.hospital,
        department: doc.department,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      };
    }).filter(Boolean);

    return NextResponse.json(formattedDoctors);
  } catch (error: unknown) {
    console.error("Doctors API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
