"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/store/useAppStore";
import { StatusBadge, PaymentBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Phone,
  MapPin,
  RefreshCw,
  XCircle,
  FileText,
  Star,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { Appointment } from "@/types";

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const { appointments, fetchAppointments, updateAppointmentStatus, rescheduleAppointment } = useAppStore();
  const [rescheduleDialog, setRescheduleDialog] = useState<Appointment | null>(null);
  const [cancelDialog, setCancelDialog] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [newTime, setNewTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.userId) fetchAppointments();
  }, [session?.user?.userId, fetchAppointments]);

  if (!session?.user) return null;

  const upcoming = appointments
    .filter((a) => a.status === "confirmed" || a.status === "pending")
    .sort((a, b) => a.date.localeCompare(b.date));
  const completed = appointments.filter((a) => a.status === "completed");
  const cancelled = appointments.filter((a) => a.status === "cancelled" || a.status === "rescheduled");

  const typeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-3.5 w-3.5" />;
      case "phone": return <Phone className="h-3.5 w-3.5" />;
      default: return <MapPin className="h-3.5 w-3.5" />;
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleDialog || !newDate || !newTime) return;
    setIsLoading(true);
    await rescheduleAppointment(rescheduleDialog.id, format(newDate, "yyyy-MM-dd"), newTime);
    toast.success("Appointment Rescheduled", {
      description: `Moved to ${format(newDate, "MMM dd, yyyy")} at ${newTime}`,
    });
    setRescheduleDialog(null);
    setNewDate(undefined);
    setNewTime("");
    setIsLoading(false);
  };

  const handleCancel = async () => {
    if (!cancelDialog) return;
    setIsLoading(true);
    await updateAppointmentStatus(cancelDialog.id, "cancelled");
    toast.success("Appointment Cancelled", {
      description: "Your appointment has been cancelled and payment will be refunded.",
    });
    setCancelDialog(null);
    setIsLoading(false);
  };

  const AppointmentCard = ({ apt, showActions = false }: { apt: Appointment; showActions?: boolean }) => (
    <div className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border p-4 transition-all duration-200 hover:shadow-md hover:border-primary/20">
      <Avatar className="h-12 w-12 border-2 border-primary/10 shrink-0">
        <AvatarFallback className="gradient-primary text-white text-sm font-bold">
          {apt.doctorName.replace("Dr. ", "").split(" ").map((n) => n[0]).join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm">{apt.doctorName}</p>
            <p className="text-xs text-primary">{apt.doctorSpecialization}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={apt.status} />
            {showActions && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => { setRescheduleDialog(apt); }}>
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setCancelDialog(apt)}>
                  <XCircle className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarIcon className="h-3 w-3" />
            {new Date(apt.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {apt.time}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {typeIcon(apt.type)}
            <span className="capitalize">{apt.type}</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1">{apt.reason}</p>
      </div>
      <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
        <PaymentBadge status={apt.paymentStatus} />
        <span className="text-sm font-semibold">${apt.paymentAmount}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          My <span className="text-gradient">Appointments</span>
        </h1>
        <p className="text-muted-foreground mt-1">Manage and track all your appointments</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-11 rounded-xl">
          <TabsTrigger value="upcoming" className="rounded-lg gap-2 text-sm">
            <CalendarIcon className="h-4 w-4" />
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4" />
            Completed ({completed.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-lg gap-2 text-sm">
            <XCircle className="h-4 w-4" />
            Others ({cancelled.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              {upcoming.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CalendarIcon className="h-14 w-14 text-muted-foreground/20 mb-4" />
                  <h3 className="text-lg font-semibold">No Upcoming Appointments</h3>
                  <p className="text-sm text-muted-foreground mt-1">Book your next appointment with a doctor</p>
                  <Link href="/patient/doctors">
                    <Button className="mt-4 gradient-primary text-white border-0 rounded-xl">Find Doctors</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((apt, i) => (
                    <div key={apt.id} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                      <AppointmentCard apt={apt} showActions />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              {completed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle2 className="h-14 w-14 text-muted-foreground/20 mb-4" />
                  <h3 className="text-lg font-semibold">No Completed Appointments</h3>
                  <p className="text-sm text-muted-foreground mt-1">Your completed visits will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completed.map((apt, i) => (
                    <div key={apt.id} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                      <AppointmentCard apt={apt} />
                      {apt.diagnosis && (
                        <div className="ml-16 mt-2 rounded-lg bg-muted/50 p-3">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Diagnosis</p>
                          <p className="text-sm">{apt.diagnosis}</p>
                          {apt.prescriptionId && (
                            <Link href="/patient/prescriptions">
                              <Button variant="link" size="sm" className="text-primary p-0 h-auto mt-1 text-xs">
                                <FileText className="mr-1 h-3 w-3" /> View Prescription
                              </Button>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancelled" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              {cancelled.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <XCircle className="h-14 w-14 text-muted-foreground/20 mb-4" />
                  <h3 className="text-lg font-semibold">No Cancelled Appointments</h3>
                </div>
              ) : (
                <div className="space-y-3">
                  {cancelled.map((apt, i) => (
                    <div key={apt.id} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                      <AppointmentCard apt={apt} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reschedule Dialog */}
      <Dialog open={!!rescheduleDialog} onOpenChange={() => setRescheduleDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Select a new date and time for your appointment with {rescheduleDialog?.doctorName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={newDate}
              onSelect={setNewDate}
              disabled={(date) => date < new Date()}
              className="rounded-xl mx-auto"
            />
            {newDate && (
              <div>
                <p className="text-sm font-medium mb-2">Select Time</p>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={newTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewTime(time)}
                      className={`text-xs rounded-xl ${newTime === time ? "gradient-primary text-white border-0" : ""}`}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialog(null)}>Cancel</Button>
            <Button
              onClick={handleReschedule}
              disabled={!newDate || !newTime || isLoading}
              className="gradient-primary text-white border-0"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={!!cancelDialog} onOpenChange={() => setCancelDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your appointment with {cancelDialog?.doctorName} on{" "}
              {cancelDialog && new Date(cancelDialog.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-destructive/5 border border-destructive/10 p-4">
            <p className="text-sm text-destructive">
              This action cannot be undone. Your payment of ${cancelDialog?.paymentAmount} will be refunded within 5-7 business days.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(null)}>Keep Appointment</Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
