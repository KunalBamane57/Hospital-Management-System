// ============================================
// Appointments API Route
// ============================================

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import AppointmentModel from "@/models/Appointment";
import UserModel from "@/models/User";
import NotificationModel from "@/models/Notification";
import { z } from "zod";

const bookAppointmentSchema = z.object({
  doctorId: z.string().min(1),
  doctorName: z.string().min(1),
  doctorSpecialization: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  time: z.string().min(1),
  type: z.enum(["in-person", "video", "phone"]).optional(),
  reason: z.string().min(1).max(500),
  paymentAmount: z.number().nonnegative().optional(),
});

const updateAppointmentSchema = z.object({
  appointmentId: z.string().min(1),
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "rescheduled"]).optional(),
  paymentStatus: z.enum(["pending", "completed", "failed", "refunded"]).optional(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
  time: z.string().optional(),
});

// GET /api/appointments - Fetch appointments for current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const userId = session.user.userId;
    const role = session.user.role;

    const query: Record<string, unknown> =
      role === "patient" ? { patientId: userId } : { doctorId: userId };

    if (status && status !== "all") {
      query.status = status;
    }

    const appointments = await AppointmentModel.find(query)
      .sort({ date: -1, time: -1 })
      .lean();

    const formatted = appointments.map((apt) => ({
      id: apt._id.toString(),
      patientId: apt.patientId,
      doctorId: apt.doctorId,
      patientName: apt.patientName,
      doctorName: apt.doctorName,
      doctorSpecialization: apt.doctorSpecialization,
      date: apt.date,
      time: apt.time,
      status: apt.status,
      type: apt.type,
      reason: apt.reason,
      notes: apt.notes,
      diagnosis: apt.diagnosis,
      prescriptionId: apt.prescriptionId,
      paymentStatus: apt.paymentStatus,
      paymentAmount: apt.paymentAmount,
      createdAt: apt.createdAt
        ? new Date(apt.createdAt).toISOString().split("T")[0]
        : "",
      updatedAt: apt.updatedAt
        ? new Date(apt.updatedAt).toISOString().split("T")[0]
        : "",
    }));

    return NextResponse.json(formatted);
  } catch (error: unknown) {
    console.error("Appointments GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Book a new appointment
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "patient") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const parsed = bookAppointmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const {
      doctorId,
      doctorName,
      doctorSpecialization,
      date,
      time,
      type,
      reason,
      paymentAmount,
    } = parsed.data;

    // Find the doctor's ObjectId
    const doctorUser = await UserModel.findOne({ userId: doctorId });
    if (!doctorUser) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    // Find patient's ObjectId
    const patientUser = await UserModel.findOne({
      userId: session.user.userId,
    });
    if (!patientUser) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    const appointment = await AppointmentModel.create({
      patientId: session.user.userId,
      doctorId,
      patientUser: patientUser._id,
      doctorUser: doctorUser._id,
      patientName: session.user.name || "",
      doctorName,
      doctorSpecialization,
      date,
      time,
      status: "pending",
      type: type || "in-person",
      reason,
      paymentStatus: "pending",
      paymentAmount: paymentAmount || 0,
    });

    // Create notifications
    await NotificationModel.create([
      {
        userId: session.user.userId,
        title: "Appointment Booked",
        message: `Your appointment with ${doctorName} on ${date} at ${time} has been booked.`,
        type: "appointment",
      },
      {
        userId: doctorId,
        title: "New Appointment Request",
        message: `${session.user.name} has requested an appointment on ${date} at ${time}.`,
        type: "appointment",
      },
    ]);

    return NextResponse.json(
      {
        message: "Appointment booked successfully",
        id: appointment._id.toString(),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Appointments POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/appointments - Update appointment status
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const parsed = updateAppointmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const { appointmentId, status, paymentStatus, diagnosis, notes, date, time } = parsed.data;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (diagnosis !== undefined) updateData.diagnosis = diagnosis;
    if (notes !== undefined) updateData.notes = notes;
    if (date) {
      updateData.date = date;
      updateData.status = "rescheduled";
    }
    if (time) updateData.time = time;

    const appointment = await AppointmentModel.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true }
    );

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Create notification for status changes
    if (status) {
      const targetUserId =
        session.user.role === "doctor"
          ? appointment.patientId
          : appointment.doctorId;

      await NotificationModel.create({
        userId: targetUserId,
        title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your appointment on ${appointment.date} at ${appointment.time} has been ${status}.`,
        type: "appointment",
      });
    }

    return NextResponse.json({ message: "Appointment updated successfully" });
  } catch (error: unknown) {
    console.error("Appointments PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
