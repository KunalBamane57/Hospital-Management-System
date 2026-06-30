// ============================================
// Admin Users API - List, Update Role, Delete
// ============================================

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import User from "@/models/User";
import Patient from "@/models/Patient";
import Doctor from "@/models/Doctor";
import Appointment from "@/models/Appointment";
import Prescription from "@/models/Prescription";
import Review from "@/models/Review";
import Payment from "@/models/Payment";
import Notification from "@/models/Notification";

// GET - List all users
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users });
  } catch (error: unknown) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update user role or deactivate/activate
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const body = await request.json();
    const { targetUserId, action, newRole } = body;

    if (!targetUserId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent self-modification
    if (targetUser._id.toString() === (session.user as any).dbId) {
      return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 });
    }

    // Prevent modifying other admins
    if (targetUser.role === "admin") {
      return NextResponse.json({ error: "Cannot modify another admin" }, { status: 403 });
    }

    switch (action) {
      case "change_role": {
        if (!newRole || !["patient", "doctor", "admin"].includes(newRole)) {
          return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }
        targetUser.role = newRole;
        await targetUser.save();
        break;
      }
      case "deactivate": {
        targetUser.isActive = false;
        await targetUser.save();
        break;
      }
      case "activate": {
        targetUser.isActive = true;
        await targetUser.save();
        break;
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error: unknown) {
    console.error("Admin users PATCH error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}

// DELETE - Permanently delete a user and all their data
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("id");

    if (!targetUserId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent self-deletion
    if (targetUser._id.toString() === (session.user as any).dbId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Prevent deleting other admins
    if (targetUser.role === "admin") {
      return NextResponse.json({ error: "Cannot delete another admin" }, { status: 403 });
    }

    const userId = targetUser.userId;

    // Delete all related data
    if (targetUser.role === "patient") {
      await Patient.deleteOne({ userId });
      await Appointment.deleteMany({ patientId: userId });
      await Prescription.deleteMany({ patientId: userId });
      await Review.deleteMany({ patientId: userId });
      await Payment.deleteMany({ patientId: userId });
    } else if (targetUser.role === "doctor") {
      await Doctor.deleteOne({ userId });
      await Appointment.deleteMany({ doctorId: userId });
      await Prescription.deleteMany({ doctorId: userId });
      await Review.deleteMany({ doctorId: userId });
      await Payment.deleteMany({ doctorId: userId });
    }

    // Delete notifications for this user
    await Notification.deleteMany({ userId });

    // Delete the user document
    await User.findByIdAndDelete(targetUserId);

    return NextResponse.json({
      message: `User ${targetUser.name} (${userId}) and all related data deleted successfully`,
    });
  } catch (error: unknown) {
    console.error("Admin users DELETE error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
