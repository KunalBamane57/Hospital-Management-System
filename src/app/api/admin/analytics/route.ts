// ============================================
// Admin Analytics API Route
// ============================================

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import Payment from "@/models/Payment";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get("period") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    const startDateStr = startDate.toISOString().split("T")[0];

    // ---- 1. Daily Appointments ----
    const allAppointments = await Appointment.find({}).lean();

    const dailyMap = new Map<string, { total: number; completed: number; cancelled: number; pending: number }>();
    for (let i = 0; i < period; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (period - 1 - i));
      const dateStr = d.toISOString().split("T")[0];
      dailyMap.set(dateStr, { total: 0, completed: 0, cancelled: 0, pending: 0 });
    }

    allAppointments.forEach((apt) => {
      if (apt.date >= startDateStr && dailyMap.has(apt.date)) {
        const day = dailyMap.get(apt.date)!;
        day.total++;
        if (apt.status === "completed") day.completed++;
        else if (apt.status === "cancelled") day.cancelled++;
        else day.pending++;
      }
    });

    const dailyAppointments = Array.from(dailyMap.entries()).map(([date, stats]) => ({
      date,
      label: new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      ...stats,
    }));

    // ---- 2. Revenue Data (last 6 months) ----
    const payments = await Payment.find({ status: "completed" }).lean();

    const last6Months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      last6Months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }

    const monthlyRevenue = new Map<string, number>();
    last6Months.forEach((k) => monthlyRevenue.set(k, 0));

    payments.forEach((p) => {
      const c = new Date(p.createdAt);
      const key = `${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyRevenue.has(key)) {
        monthlyRevenue.set(key, (monthlyRevenue.get(key) || 0) + p.amount);
      }
    });

    const revenueData = last6Months.map((key) => {
      const [year, month] = key.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return {
        month: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        revenue: monthlyRevenue.get(key) || 0,
      };
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // ---- 3. Top Doctors ----
    const doctorStats = new Map<string, { name: string; specialization: string; count: number; revenue: number }>();

    allAppointments
      .filter((a) => a.status === "completed")
      .forEach((apt) => {
        if (!doctorStats.has(apt.doctorId)) {
          doctorStats.set(apt.doctorId, { name: apt.doctorName, specialization: apt.doctorSpecialization, count: 0, revenue: 0 });
        }
        const doc = doctorStats.get(apt.doctorId)!;
        doc.count++;
        doc.revenue += apt.paymentAmount || 0;
      });

    const topDoctors = Array.from(doctorStats.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // ---- 4. Patient Growth ----
    const patientUsers = await User.find({ role: "patient" }).select("createdAt").lean();

    const monthlyGrowth = new Map<string, number>();
    last6Months.forEach((k) => monthlyGrowth.set(k, 0));

    patientUsers.forEach((u) => {
      const c = new Date(u.createdAt);
      const key = `${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyGrowth.has(key)) {
        monthlyGrowth.set(key, (monthlyGrowth.get(key) || 0) + 1);
      }
    });

    let cumulative = patientUsers.filter((u) => {
      const c = new Date(u.createdAt);
      const key = `${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, "0")}`;
      return key < last6Months[0];
    }).length;

    const patientGrowth = last6Months.map((key) => {
      const [year, month] = key.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const newP = monthlyGrowth.get(key) || 0;
      cumulative += newP;
      return {
        month: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        newPatients: newP,
        totalPatients: cumulative,
      };
    });

    // ---- 5. Status / Cancellation ----
    const statusCounts = {
      completed: allAppointments.filter((a) => a.status === "completed").length,
      cancelled: allAppointments.filter((a) => a.status === "cancelled").length,
      pending: allAppointments.filter((a) => a.status === "pending").length,
      confirmed: allAppointments.filter((a) => a.status === "confirmed").length,
      rescheduled: allAppointments.filter((a) => a.status === "rescheduled").length,
    };

    const total = allAppointments.length;
    const cancellationRate = total > 0 ? Math.round((statusCounts.cancelled / total) * 100) : 0;

    // ---- 6. Summary ----
    const totalDoctors = await User.countDocuments({ role: "doctor" });
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalUsers = await User.countDocuments({});

    return NextResponse.json({
      stats: {
        totalAppointments: total,
        totalRevenue,
        totalDoctors,
        totalPatients,
        totalUsers,
        cancellationRate,
        completionRate: total > 0 ? Math.round((statusCounts.completed / total) * 100) : 0,
      },
      dailyAppointments,
      revenueData,
      topDoctors,
      patientGrowth,
      statusCounts,
      cancellationRate,
    });
  } catch (error: unknown) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
