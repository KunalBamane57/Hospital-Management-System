// ============================================
// Notifications API Route
// ============================================

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import NotificationModel from "@/models/Notification";
import { z } from "zod";

const updateNotificationSchema = z.object({
  notificationId: z.string().optional(),
  markAll: z.boolean().optional(),
});

// GET /api/notifications
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const notifications = await NotificationModel.find({
      userId: session.user.userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = notifications.map((n) => ({
      id: n._id.toString(),
      userId: n.userId,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt
        ? new Date(n.createdAt).toISOString().split("T")[0]
        : "",
    }));

    return NextResponse.json(formatted);
  } catch (error: unknown) {
    console.error("Notifications GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Mark as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const parsed = updateNotificationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }
    
    const { notificationId, markAll } = parsed.data;

    if (markAll) {
      await NotificationModel.updateMany(
        { userId: session.user.userId, read: false },
        { read: true }
      );
    } else if (notificationId) {
      await NotificationModel.findByIdAndUpdate(notificationId, { read: true });
    }

    return NextResponse.json({ message: "Notifications updated" });
  } catch (error: unknown) {
    console.error("Notifications PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
