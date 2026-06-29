"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/store/useAppStore";
import { PaymentBadge, StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, DollarSign, TrendingUp, ArrowDownRight, Receipt } from "lucide-react";

export default function PaymentsPage() {
  const { data: session } = useSession();
  const { appointments, fetchAppointments } = useAppStore();

  useEffect(() => {
    if (session?.user?.userId) fetchAppointments();
  }, [session?.user?.userId, fetchAppointments]);

  if (!session?.user) return null;
  const paidTotal = appointments
    .filter((a) => a.paymentStatus === "completed")
    .reduce((sum, a) => sum + a.paymentAmount, 0);
  const pendingTotal = appointments
    .filter((a) => a.paymentStatus === "pending")
    .reduce((sum, a) => sum + a.paymentAmount, 0);
  const refundedTotal = appointments
    .filter((a) => a.paymentStatus === "refunded")
    .reduce((sum, a) => sum + a.paymentAmount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="text-gradient">Payments</span>
        </h1>
        <p className="text-muted-foreground mt-1">Track your healthcare expenses and payment history</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Paid"
          value={`$${paidTotal}`}
          icon={DollarSign}
          iconClassName="bg-emerald-500/10 text-emerald-500"
          description="Successfully paid"
        />
        <StatCard
          title="Pending"
          value={`$${pendingTotal}`}
          icon={CreditCard}
          iconClassName="bg-amber-500/10 text-amber-500"
          description="Awaiting payment"
        />
        <StatCard
          title="Refunded"
          value={`$${refundedTotal}`}
          icon={ArrowDownRight}
          iconClassName="bg-purple-500/10 text-purple-500"
          description="Total refunds"
        />
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CreditCard className="h-14 w-14 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-semibold">No Transactions Yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Your payment history will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((apt) => (
                      <TableRow key={apt.id} className="group">
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{apt.doctorName}</p>
                            <p className="text-xs text-muted-foreground">{apt.doctorSpecialization}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(apt.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-full text-[11px] capitalize">
                            {apt.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={apt.status} />
                        </TableCell>
                        <TableCell>
                          <PaymentBadge status={apt.paymentStatus} />
                        </TableCell>
                        <TableCell className="text-right font-semibold">${apt.paymentAmount}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
