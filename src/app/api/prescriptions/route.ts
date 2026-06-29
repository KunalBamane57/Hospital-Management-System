// ============================================
// Prescriptions API Route
// ============================================

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import PrescriptionModel from "@/models/Prescription";
import AppointmentModel from "@/models/Appointment";
import NotificationModel from "@/models/Notification";
import { z } from "zod";

const createPrescriptionSchema = z.object({
  appointmentId: z.string().optional(),
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  date: z.string().optional(),
  diagnosis: z.string().min(1),
  medications: z.array(z.object({
    name: z.string().min(1),
    dosage: z.string().min(1),
    frequency: z.string().optional(),
    duration: z.string().optional(),
    instructions: z.string().optional(),
  })).min(1),
  instructions: z.string().optional(),
  followUpDate: z.string().optional(),
});

// GET /api/prescriptions
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const userId = session.user.userId;
    const role = session.user.role;

    const query: Record<string, unknown> =
      role === "patient" ? { patientId: userId } : { doctorId: userId };

    const prescriptions = await PrescriptionModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const formatted = prescriptions.map((p) => ({
      id: p._id.toString(),
      appointmentId: p.appointmentId,
      patientId: p.patientId,
      doctorId: p.doctorId,
      patientName: p.patientName,
      doctorName: p.doctorName,
      date: p.date,
      diagnosis: p.diagnosis,
      medications: p.medications,
      instructions: p.instructions,
      followUpDate: p.followUpDate,
      createdAt: p.createdAt
        ? new Date(p.createdAt).toISOString().split("T")[0]
        : "",
    }));

    return NextResponse.json(formatted);
  } catch (error: unknown) {
    console.error("Prescriptions GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/prescriptions - Create a new prescription
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "doctor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const parsed = createPrescriptionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const prescription: any = await PrescriptionModel.create({
      appointmentId: parsed.data.appointmentId,
      patientId: parsed.data.patientId,
      doctorId: session.user.userId,
      patientName: parsed.data.patientName,
      doctorName: session.user.name || "",
      date: parsed.data.date || new Date().toISOString().split("T")[0],
      diagnosis: parsed.data.diagnosis,
      medications: parsed.data.medications,
      instructions: parsed.data.instructions,
      followUpDate: parsed.data.followUpDate || "",
    });

    // Link prescription to appointment
    if (parsed.data.appointmentId) {
      await AppointmentModel.findByIdAndUpdate(parsed.data.appointmentId, {
        prescriptionId: prescription._id.toString(),
      });
    }

    // Create notification for patient
    await NotificationModel.create({
      userId: parsed.data.patientId,
      title: "New Prescription",
      message: `${session.user.name} has added a new prescription for your recent visit.`,
      type: "prescription",
    });

    return NextResponse.json(
      {
        message: "Prescription created successfully",
        id: prescription._id.toString(),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Prescriptions POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
