"use client";

import { useAppStore } from "@/store/useAppStore";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge, PaymentBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Activity,
  CreditCard,
  FileText,
  Stethoscope,
  Bell,
  Video,
  Phone,
  MapPin,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const monthlyData = [
  { month: "Jan", appointments: 2 },
  { month: "Feb", appointments: 1 },
  { month: "Mar", appointments: 3 },
  { month: "Apr", appointments: 1 },
  { month: "May", appointments: 2 },
  { month: "Jun", appointments: 3 },
];

const COLORS = ["#4f8ef7", "#34d399", "#f59e0b", "#ef4444"];

export default function PatientDashboard() {
  const { currentUser, getAppointmentsByPatient, getUpcomingAppointments, getNotificationsByUser, getPrescriptionsByPatient } =
    useAppStore();

  if (!currentUser) return null;

  const allAppointments = getAppointmentsByPatient(currentUser.id);
  const upcomingAppointments = getUpcomingAppointments(currentUser.id, "patient");
  const completedAppointments = allAppointments.filter((a) => a.status === "completed");
  const cancelledAppointments = allAppointments.filter((a) => a.status === "cancelled");
  const notifications = getNotificationsByUser(currentUser.id);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const prescriptions = getPrescriptionsByPatient(currentUser.id);
  const totalSpent = allAppointments
    .filter((a) => a.paymentStatus === "completed")
    .reduce((sum, a) => sum + a.paymentAmount, 0);

  const pieData = [
    { name: "Confirmed", value: allAppointments.filter((a) => a.status === "confirmed").length },
    { name: "Completed", value: completedAppointments.length },
    { name: "Pending", value: allAppointments.filter((a) => a.status === "pending").length },
    { name: "Cancelled", value: cancelledAppointments.length },
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
            Welcome back, <span className="text-gradient">{currentUser.name.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s an overview of your health journey
          </p>
        </div>
        <Link href="/patient/doctors">
          <Button className="gradient-primary text-white border-0 shadow-lg shadow-primary/25 rounded-xl">
            <Stethoscope className="mr-2 h-4 w-4" />
            Book Appointment
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Upcoming"
          value={upcomingAppointments.length}
          description="Scheduled appointments"
          icon={Calendar}
          iconClassName="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          title="Completed"
          value={completedAppointments.length}
          description="Past visits"
          icon={CheckCircle2}
          iconClassName="bg-emerald-500/10 text-emerald-500"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Prescriptions"
          value={prescriptions.length}
          description="Active prescriptions"
          icon={FileText}
          iconClassName="bg-purple-500/10 text-purple-500"
        />
        <StatCard
          title="Total Spent"
          value={`$${totalSpent}`}
          description="Healthcare expenses"
          icon={CreditCard}
          iconClassName="bg-amber-500/10 text-amber-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Appointments */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
              <CardDescription>Your next scheduled visits</CardDescription>
            </div>
            <Link href="/patient/appointments">
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
                <Link href="/patient/doctors">
                  <Button variant="link" className="text-primary mt-2">
                    Book your first appointment
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 4).map((apt, i) => (
                  <div
                    key={apt.id}
                    className="group flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 hover:shadow-md hover:border-primary/20 animate-slide-up"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <Avatar className="h-12 w-12 border-2 border-primary/10">
                      <AvatarFallback className="gradient-primary text-white text-sm font-bold">
                        {apt.doctorName
                          .replace("Dr. ", "")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{apt.doctorName}</p>
                      <p className="text-xs text-muted-foreground">{apt.doctorSpecialization}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(apt.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {apt.time}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          {typeIcon(apt.type)}
                          {apt.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={apt.status} />
                      <PaymentBadge status={apt.paymentStatus} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Appointment Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Activity
              </CardTitle>
              <CardDescription>Appointments per month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorAppt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.55 0.18 240)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.55 0.18 240)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.01 240)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="oklch(0.6 0.02 240)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.6 0.02 240)" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="appointments"
                      stroke="oklch(0.55 0.18 240)"
                      strokeWidth={2}
                      fill="url(#colorAppt)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="h-40 w-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {pieData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[i] }}
                    />
                    <span className="text-muted-foreground">{entry.name}</span>
                    <span className="ml-auto font-semibold">{entry.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notifications */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Recent Notifications
              {unreadCount > 0 && (
                <Badge className="ml-2 h-5 min-w-5 rounded-full bg-destructive text-[10px] text-white">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
          </div>
          <Link href="/patient/notifications">
            <Button variant="ghost" size="sm" className="text-primary">
              View All
            </Button>
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
                <div
                  className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${
                    notif.type === "appointment"
                      ? "bg-blue-500/10 text-blue-500"
                      : notif.type === "prescription"
                      ? "bg-purple-500/10 text-purple-500"
                      : notif.type === "payment"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-amber-500/10 text-amber-500"
                  }`}
                >
                  {notif.type === "appointment" ? (
                    <Calendar className="h-4 w-4" />
                  ) : notif.type === "prescription" ? (
                    <FileText className="h-4 w-4" />
                  ) : notif.type === "payment" ? (
                    <CreditCard className="h-4 w-4" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{notif.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {notif.message}
                  </p>
                </div>
                {!notif.read && (
                  <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
