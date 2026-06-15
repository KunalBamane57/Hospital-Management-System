"use client";

import { useAppStore } from "@/store/useAppStore";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  DollarSign,
  Star,
  ArrowRight,
  Activity,
  TrendingUp,
  FileText,
  Bell,
  Video,
  Phone,
  MapPin,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Doctor } from "@/types";

const weeklyData = [
  { day: "Mon", patients: 8 },
  { day: "Tue", patients: 6 },
  { day: "Wed", patients: 10 },
  { day: "Thu", patients: 7 },
  { day: "Fri", patients: 5 },
  { day: "Sat", patients: 3 },
  { day: "Sun", patients: 0 },
];

const revenueData = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 3800 },
  { month: "Mar", revenue: 5100 },
  { month: "Apr", revenue: 4600 },
  { month: "May", revenue: 5500 },
  { month: "Jun", revenue: 6200 },
];

const COLORS = ["#4f8ef7", "#34d399", "#f59e0b", "#ef4444"];

export default function DoctorDashboard() {
  const { currentUser, getAppointmentsByDoctor, getUpcomingAppointments, getNotificationsByUser, getPrescriptionsByDoctor } =
    useAppStore();

  if (!currentUser) return null;

  const doctor = currentUser as Doctor;
  const allAppointments = getAppointmentsByDoctor(currentUser.id);
  const upcomingAppointments = getUpcomingAppointments(currentUser.id, "doctor");
  const completedAppointments = allAppointments.filter((a) => a.status === "completed");
  const notifications = getNotificationsByUser(currentUser.id);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const totalRevenue = allAppointments
    .filter((a) => a.paymentStatus === "completed")
    .reduce((sum, a) => sum + a.paymentAmount, 0);

  const uniquePatients = new Set(allAppointments.map((a) => a.patientId)).size;

  const statusData = [
    { name: "Confirmed", value: allAppointments.filter((a) => a.status === "confirmed").length },
    { name: "Completed", value: completedAppointments.length },
    { name: "Pending", value: allAppointments.filter((a) => a.status === "pending").length },
    { name: "Cancelled", value: allAppointments.filter((a) => a.status === "cancelled").length },
  ];

  const typeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-3.5 w-3.5" />;
      case "phone": return <Phone className="h-3.5 w-3.5" />;
      default: return <MapPin className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome, <span className="text-gradient">{doctor.name}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s your practice overview for today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-3 py-1.5">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{doctor.rating}</span>
            <span className="text-xs text-muted-foreground">({doctor.totalReviews})</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Appointments"
          value={upcomingAppointments.length}
          description="Scheduled for today"
          icon={Calendar}
          iconClassName="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          title="Total Patients"
          value={uniquePatients}
          description="Unique patients treated"
          icon={Users}
          iconClassName="bg-emerald-500/10 text-emerald-500"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Completed"
          value={completedAppointments.length}
          description="Sessions completed"
          icon={CheckCircle2}
          iconClassName="bg-purple-500/10 text-purple-500"
        />
        <StatCard
          title="Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          description="Total earnings"
          icon={DollarSign}
          iconClassName="bg-amber-500/10 text-amber-500"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Appointments */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
              <CardDescription>Your next scheduled patients</CardDescription>
            </div>
            <Link href="/doctor/appointments">
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 5).map((apt, i) => (
                  <div
                    key={apt.id}
                    className="group flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 hover:shadow-md hover:border-primary/20 animate-slide-up"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <Avatar className="h-11 w-11 border-2 border-primary/10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                        {apt.patientName.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{apt.patientName}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{apt.reason}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(apt.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />{apt.time}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          {typeIcon(apt.type)}
                          {apt.type}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Weekly Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.01 240)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="oklch(0.6 0.02 240)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.6 0.02 240)" />
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                    />
                    <Bar dataKey="patients" fill="oklch(0.55 0.18 240)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.01 240)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="oklch(0.6 0.02 240)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.6 0.02 240)" />
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                      formatter={(value) => [`$${value}`, "Revenue"]}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={2.5} dot={{ fill: "#34d399", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Distribution + Notifications */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Appointment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="h-40 w-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                      {statusData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {statusData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-2 text-sm">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-muted-foreground">{entry.name}</span>
                    <span className="ml-auto font-bold">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="h-5 min-w-5 rounded-full bg-destructive text-[10px] text-white">{unreadCount}</Badge>
              )}
            </CardTitle>
            <Link href="/doctor/notifications">
              <Button variant="ghost" size="sm" className="text-primary">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.slice(0, 4).map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 rounded-xl p-3 transition-colors ${
                    !notif.read ? "bg-primary/5" : "hover:bg-muted/50"
                  }`}
                >
                  <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${
                    notif.type === "appointment" ? "bg-blue-500/10 text-blue-500"
                    : notif.type === "review" ? "bg-amber-500/10 text-amber-500"
                    : "bg-muted text-muted-foreground"
                  }`}>
                    {notif.type === "appointment" ? <Calendar className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{notif.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{notif.message}</p>
                  </div>
                  {!notif.read && <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
