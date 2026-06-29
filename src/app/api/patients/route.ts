// ============================================
// Patients API Route (for Doctor view)
// ============================================

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import AppointmentModel from "@/models/Appointment";
import UserModel from "@/models/User";
import PatientModel from "@/models/Patient";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "doctor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();

    // Get unique patient IDs from this doctor's appointments
    const appointments = await AppointmentModel.find({ doctorId: session.user.userId }).lean();
    const patientIds = [...new Set(appointments.map((a) => a.patientId))];

    const patients = await Promise.all(
      patientIds.map(async (pid) => {
        const user = await UserModel.findOne({ userId: pid });
        const patient = user ? await PatientModel.findOne({ user: user._id }) : null;
        if (!user) return null;
        return {
          id: user.userId, name: user.name, email: user.email, phone: user.phone,
          avatar: user.avatar, role: "patient",
          dateOfBirth: patient?.dateOfBirth || "", gender: patient?.gender || "",
          bloodGroup: patient?.bloodGroup || "", address: patient?.address || "",
          emergencyContact: patient?.emergencyContact || "",
          medicalHistory: patient?.medicalHistory || [], allergies: patient?.allergies || [],
          createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        };
      })
    );

    return NextResponse.json(patients.filter(Boolean));
  } catch (error: unknown) {
    console.error("Patients GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
