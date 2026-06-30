"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar, DollarSign, Users, TrendingUp, Activity, Stethoscope,
  AlertTriangle, BarChart3, ArrowUpRight, ArrowDownRight, RefreshCw, Crown,
} from "lucide-react";

interface AnalyticsData {
  stats: {
    totalAppointments: number;
    totalRevenue: number;
    totalDoctors: number;
    totalPatients: number;
    totalUsers: number;
    cancellationRate: number;
    completionRate: number;
  };
  dailyAppointments: Array<{ date: string; label: string; total: number; completed: number; cancelled: number; pending: number }>;
  revenueData: Array<{ month: string; revenue: number }>;
  topDoctors: Array<{ name: string; specialization: string; count: number; revenue: number }>;
  patientGrowth: Array<{ month: string; newPatients: number; totalPatients: number }>;
  statusCounts: { completed: number; cancelled: number; pending: number; confirmed: number; rescheduled: number };
  cancellationRate: number;
}

const COLORS = {
  primary: "#6366f1", secondary: "#8b5cf6", success: "#10b981",
  warning: "#f59e0b", danger: "#ef4444", info: "#06b6d4",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`, { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error("Failed to fetch analytics:", e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAnalytics(); }, [period]);

  if (loading) return <LoadingSkeleton />;

  if (!data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-xl font-semibold">Failed to load analytics</h2>
          <Button onClick={fetchAnalytics} className="mt-4" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  const { stats, dailyAppointments, revenueData, topDoctors, patientGrowth, statusCounts } = data;

  const pieData = [
    { name: "Confirmed", value: statusCounts.confirmed, color: COLORS.primary },
    { name: "Pending", value: statusCounts.pending, color: COLORS.warning },
    { name: "Completed", value: statusCounts.completed, color: COLORS.success },
    { name: "Cancelled", value: statusCounts.cancelled, color: COLORS.danger },
    { name: "Rescheduled", value: statusCounts.rescheduled, color: COLORS.secondary },
  ].filter((d) => d.value > 0);

  const tooltipStyle = {
    borderRadius: "12px",
    border: "1px solid hsl(var(--border))",
    backgroundColor: "hsl(var(--card))",
    color: "hsl(var(--foreground))",
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="mt-1 text-muted-foreground">Hospital performance overview and key metrics</p>
        </div>
        <div className="flex items-center gap-2">
          {["7", "14", "30", "90"].map((p) => (
            <Button key={p} variant={period === p ? "default" : "outline"} size="sm"
              onClick={() => setPeriod(p)}
              className={period === p ? "gradient-primary text-white border-0" : ""}>
              {p}d
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign} trend={12.5} desc="All time" gradient="from-emerald-500 to-teal-600" />
        <KPICard title="Total Appointments" value={stats.totalAppointments.toLocaleString()}
          icon={Calendar} trend={8.2} desc="All doctors" gradient="from-blue-500 to-indigo-600" />
        <KPICard title="Total Patients" value={stats.totalPatients.toLocaleString()}
          icon={Users} trend={15.3} desc="Registered" gradient="from-violet-500 to-purple-600" />
        <KPICard title="Active Doctors" value={stats.totalDoctors.toLocaleString()}
          icon={Stethoscope} trend={3.1} desc="On platform" gradient="from-amber-500 to-orange-600" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Daily Appointments */}
        <Card className="lg:col-span-4 overflow-hidden border-0 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-primary" /> Daily Appointments
                </CardTitle>
                <CardDescription>Last {period} days breakdown</CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs">{stats.completionRate}% completion</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyAppointments} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false}
                    interval={Math.floor(dailyAppointments.length / 7)} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="completed" name="Completed" fill={COLORS.success} radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="pending" name="Pending" fill={COLORS.warning} stackId="a" />
                  <Bar dataKey="cancelled" name="Cancelled" fill={COLORS.danger} radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cancellation / Status Pie */}
        <Card className="lg:col-span-3 overflow-hidden border-0 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-primary" /> Cancellation Rate
                </CardTitle>
                <CardDescription>Appointment status distribution</CardDescription>
              </div>
              <Badge className={`${stats.cancellationRate > 15
                ? "bg-red-500/10 text-red-500 border-red-500/20"
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>
                {stats.cancellationRate}% cancel rate
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[320px] flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="45%" innerRadius={65} outerRadius={100}
                      paddingAngle={4} dataKey="value" stroke="none">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v} appointments`, ""]} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Activity className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No appointment data yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-emerald-500" /> Revenue Trend
            </CardTitle>
            <CardDescription>Monthly revenue over 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.success} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={COLORS.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${v?.toLocaleString() || 0}`, "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke={COLORS.success} strokeWidth={2.5}
                    fill="url(#revGrad)" dot={{ fill: COLORS.success, strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Patient Growth */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-violet-500" /> Patient Growth
            </CardTitle>
            <CardDescription>Monthly registration trend</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={patientGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line yAxisId="left" type="monotone" dataKey="newPatients" name="New Patients"
                    stroke={COLORS.info} strokeWidth={2.5} dot={{ fill: COLORS.info, strokeWidth: 2, r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="totalPatients" name="Total Patients"
                    stroke={COLORS.secondary} strokeWidth={2.5} strokeDasharray="5 5"
                    dot={{ fill: COLORS.secondary, strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Doctors */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-amber-500" /> Top Performing Doctors
          </CardTitle>
          <CardDescription>Ranked by completed appointments</CardDescription>
        </CardHeader>
        <CardContent>
          {topDoctors.length > 0 ? (
            <div className="space-y-4">
              {topDoctors.map((doc, i) => {
                const maxCount = topDoctors[0]?.count || 1;
                const pct = Math.round((doc.count / maxCount) * 100);
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div key={i}>
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-lg font-bold">
                        {i < 3 ? medals[i] : <span className="text-sm text-muted-foreground">#{i + 1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className="font-semibold text-sm truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.specialization}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{doc.count} <span className="text-xs text-muted-foreground font-normal">appts</span></p>
                            <p className="text-xs text-emerald-500 font-medium">${doc.revenue.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Stethoscope className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No completed appointments yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, trend, desc, gradient }: {
  title: string; value: string; icon: React.ComponentType<{ className?: string }>;
  trend: number; desc: string; gradient: string;
}) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.04] group-hover:opacity-[0.08] transition-opacity`} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <div className="flex items-center gap-1.5">
              {trend >= 0 ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" /> : <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />}
              <span className={`text-xs font-semibold ${trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>{trend >= 0 ? "+" : ""}{trend}%</span>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </div>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div><Skeleton className="h-8 w-64" /><Skeleton className="mt-2 h-4 w-40" /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[130px] rounded-xl" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-7">
        <Skeleton className="lg:col-span-4 h-[400px] rounded-xl" />
        <Skeleton className="lg:col-span-3 h-[400px] rounded-xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[350px] rounded-xl" /><Skeleton className="h-[350px] rounded-xl" />
      </div>
    </div>
  );
}
