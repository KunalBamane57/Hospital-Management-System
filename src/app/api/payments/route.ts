// ============================================
// Payments API Route
// ============================================

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import PaymentModel from "@/models/Payment";
import AppointmentModel from "@/models/Appointment";
import NotificationModel from "@/models/Notification";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const userId = session.user.userId;
    const role = session.user.role;
    const query: Record<string, unknown> = role === "patient" ? { patientId: userId } : { doctorId: userId };
    const payments = await PaymentModel.find(query).sort({ createdAt: -1 }).lean();
    const formatted = payments.map((p) => ({
      id: p._id.toString(), appointmentId: p.appointmentId, patientId: p.patientId, doctorId: p.doctorId,
      amount: p.amount, status: p.status, method: p.method, transactionId: p.transactionId,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : "",
    }));
    return NextResponse.json(formatted);
  } catch (error: unknown) {
    console.error("Payments GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const body = await request.json();
    const { appointmentId, amount, method } = body;
    const appointment = await AppointmentModel.findById(appointmentId);
    if (!appointment) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    const payment = await PaymentModel.create({
      appointmentId: appointment._id.toString(), patientId: appointment.patientId, doctorId: appointment.doctorId,
      amount: amount || appointment.paymentAmount, status: "completed", method: method || "card",
      transactionId: `TXN-${Date.now()}`,
    });
    await AppointmentModel.findByIdAndUpdate(appointmentId, { paymentStatus: "completed" });
    await NotificationModel.create({
      userId: appointment.patientId, title: "Payment Successful",
      message: `Payment of $${payment.amount} for your appointment has been processed.`, type: "payment",
    });
    return NextResponse.json({ message: "Payment processed", id: payment._id.toString(), transactionId: payment.transactionId }, { status: 201 });
  } catch (error: unknown) {
    console.error("Payments POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
