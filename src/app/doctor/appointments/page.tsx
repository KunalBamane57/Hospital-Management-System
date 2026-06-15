"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { StatusBadge, PaymentBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileText,
  Stethoscope,
  Loader2,
  ClipboardList,
  Pill,
  Plus,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Appointment, Medication } from "@/types";
import { timeSlots } from "@/data/mock-data";

export default function DoctorAppointmentsPage() {
  const {
    currentUser,
    getAppointmentsByDoctor,
    updateAppointmentStatus,
    rescheduleAppointment,
    addDiagnosis,
    addPrescription,
    getPatientById,
  } = useAppStore();

  const [diagnosisDialog, setDiagnosisDialog] = useState<Appointment | null>(null);
  const [prescriptionDialog, setPrescriptionDialog] = useState<Appointment | null>(null);
  const [rescheduleDialog, setRescheduleDialog] = useState<Appointment | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [prescInstructions, setPrescInstructions] = useState("");
  const [prescDiagnosis, setPrescDiagnosis] = useState("");
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);
  const [followUpDate, setFollowUpDate] = useState("");
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [newTime, setNewTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!currentUser) return null;

  const appointments = getAppointmentsByDoctor(currentUser.id);
  const pending = appointments.filter((a) => a.status === "pending").sort((a, b) => a.date.localeCompare(b.date));
  const confirmed = appointments.filter((a) => a.status === "confirmed").sort((a, b) => a.date.localeCompare(b.date));
  const completed = appointments.filter((a) => a.status === "completed");
  const others = appointments.filter((a) => a.status === "cancelled" || a.status === "rescheduled");

  const handleApprove = async (aptId: string) => {
    updateAppointmentStatus(aptId, "confirmed");
    toast.success("Appointment approved!");
  };

  const handleComplete = async (apt: Appointment) => {
    setDiagnosisDialog(apt);
  };

  const handleSaveDiagnosis = async () => {
    if (!diagnosisDialog) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    addDiagnosis(diagnosisDialog.id, diagnosis, notes);
    updateAppointmentStatus(diagnosisDialog.id, "completed");
    toast.success("Appointment completed with diagnosis notes!");
    setDiagnosisDialog(null);
    setDiagnosis("");
    setNotes("");
    setIsLoading(false);
  };

  const handleSavePrescription = async () => {
    if (!prescriptionDialog) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const validMeds = medications.filter((m) => m.name && m.dosage);
    addPrescription({
      appointmentId: prescriptionDialog.id,
      patientId: prescriptionDialog.patientId,
      doctorId: currentUser.id,
      patientName: prescriptionDialog.patientName,
      doctorName: currentUser.name,
      date: new Date().toISOString().split("T")[0],
      diagnosis: prescDiagnosis,
      medications: validMeds,
      instructions: prescInstructions,
      followUpDate: followUpDate || undefined,
    });
    toast.success("Prescription created successfully!");
    setPrescriptionDialog(null);
    setPrescDiagnosis("");
    setPrescInstructions("");
    setMedications([{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
    setFollowUpDate("");
    setIsLoading(false);
  };

  const handleReschedule = async () => {
    if (!rescheduleDialog || !newDate || !newTime) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    rescheduleAppointment(rescheduleDialog.id, format(newDate, "yyyy-MM-dd"), newTime);
    toast.success("Appointment rescheduled!");
    setRescheduleDialog(null);
    setNewDate(undefined);
    setNewTime("");
    setIsLoading(false);
  };

  const handleCancel = (aptId: string) => {
    updateAppointmentStatus(aptId, "cancelled");
    toast.success("Appointment cancelled.");
  };

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-3.5 w-3.5" />;
      case "phone": return <Phone className="h-3.5 w-3.5" />;
      default: return <MapPin className="h-3.5 w-3.5" />;
    }
  };

  const AppointmentRow = ({ apt, actions }: { apt: Appointment; actions?: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-md hover:border-primary/20">
      <Avatar className="h-11 w-11 border-2 border-primary/10 shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
          {apt.patientName.split(" ").map((n) => n[0]).join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm">{apt.patientName}</p>
          <StatusBadge status={apt.status} />
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1">{apt.reason}</p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarIcon className="h-3 w-3" />
            {new Date(apt.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />{apt.time}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground capitalize">
            {typeIcon(apt.type)}{apt.type}
          </span>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="text-gradient">Appointments</span>
        </h1>
        <p className="text-muted-foreground mt-1">Manage patient appointments and bookings</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-11 rounded-xl">
          <TabsTrigger value="pending" className="rounded-lg text-xs sm:text-sm gap-1">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="rounded-lg text-xs sm:text-sm gap-1">
            Confirmed ({confirmed.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg text-xs sm:text-sm gap-1">
            Completed ({completed.length})
          </TabsTrigger>
          <TabsTrigger value="others" className="rounded-lg text-xs sm:text-sm gap-1">
            Others ({others.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6 space-y-3">
              {pending.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CalendarIcon className="h-14 w-14 text-muted-foreground/20 mb-4" />
                  <h3 className="text-lg font-semibold">No Pending Requests</h3>
                </div>
              ) : (
                pending.map((apt, i) => (
                  <div key={apt.id} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <AppointmentRow
                      apt={apt}
                      actions={
                        <>
                          <Button size="sm" className="gradient-primary text-white border-0 rounded-xl text-xs" onClick={() => handleApprove(apt.id)}>
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => setRescheduleDialog(apt)}>
                            <RefreshCw className="mr-1 h-3.5 w-3.5" /> Reschedule
                          </Button>
                          <Button size="sm" variant="destructive" className="rounded-xl text-xs" onClick={() => handleCancel(apt.id)}>
                            <XCircle className="mr-1 h-3.5 w-3.5" /> Decline
                          </Button>
                        </>
                      }
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confirmed" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6 space-y-3">
              {confirmed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle2 className="h-14 w-14 text-muted-foreground/20 mb-4" />
                  <h3 className="text-lg font-semibold">No Confirmed Appointments</h3>
                </div>
              ) : (
                confirmed.map((apt, i) => (
                  <div key={apt.id} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <AppointmentRow
                      apt={apt}
                      actions={
                        <>
                          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs" onClick={() => handleComplete(apt)}>
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Complete
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => {
                            setPrescriptionDialog(apt);
                            setPrescDiagnosis(apt.diagnosis || "");
                          }}>
                            <ClipboardList className="mr-1 h-3.5 w-3.5" /> Prescribe
                          </Button>
                        </>
                      }
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6 space-y-3">
              {completed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle2 className="h-14 w-14 text-muted-foreground/20 mb-4" />
                  <h3 className="text-lg font-semibold">No Completed Appointments</h3>
                </div>
              ) : (
                completed.map((apt, i) => (
                  <div key={apt.id} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <AppointmentRow apt={apt} />
                    {apt.diagnosis && (
                      <div className="ml-15 mt-2 rounded-lg bg-muted/50 p-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Diagnosis</p>
                        <p className="text-sm">{apt.diagnosis}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="others" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6 space-y-3">
              {others.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <XCircle className="h-14 w-14 text-muted-foreground/20 mb-4" />
                  <h3 className="text-lg font-semibold">No Records</h3>
                </div>
              ) : (
                others.map((apt, i) => (
                  <div key={apt.id} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <AppointmentRow apt={apt} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diagnosis Dialog */}
      <Dialog open={!!diagnosisDialog} onOpenChange={() => setDiagnosisDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Appointment</DialogTitle>
            <DialogDescription>Add diagnosis notes for {diagnosisDialog?.patientName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Diagnosis</Label>
              <Textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Enter diagnosis..." className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes..." className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiagnosisDialog(null)}>Cancel</Button>
            <Button onClick={handleSaveDiagnosis} disabled={!diagnosis || isLoading} className="gradient-primary text-white border-0">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prescription Dialog */}
      <Dialog open={!!prescriptionDialog} onOpenChange={() => setPrescriptionDialog(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Create Prescription
            </DialogTitle>
            <DialogDescription>Create a digital prescription for {prescriptionDialog?.patientName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Diagnosis</Label>
              <Textarea value={prescDiagnosis} onChange={(e) => setPrescDiagnosis(e.target.value)} placeholder="Enter diagnosis..." className="rounded-xl" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  Medications
                </Label>
                <Button type="button" variant="outline" size="sm" className="rounded-xl text-xs" onClick={addMedication}>
                  <Plus className="mr-1 h-3 w-3" /> Add
                </Button>
              </div>
              {medications.map((med, i) => (
                <div key={i} className="rounded-xl border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Medication {i + 1}</span>
                    {medications.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeMedication(i)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Medicine name" value={med.name} onChange={(e) => updateMedication(i, "name", e.target.value)} className="h-9 rounded-lg text-sm" />
                    <Input placeholder="Dosage (e.g., 500mg)" value={med.dosage} onChange={(e) => updateMedication(i, "dosage", e.target.value)} className="h-9 rounded-lg text-sm" />
                    <Input placeholder="Frequency" value={med.frequency} onChange={(e) => updateMedication(i, "frequency", e.target.value)} className="h-9 rounded-lg text-sm" />
                    <Input placeholder="Duration" value={med.duration} onChange={(e) => updateMedication(i, "duration", e.target.value)} className="h-9 rounded-lg text-sm" />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Special Instructions</Label>
              <Textarea value={prescInstructions} onChange={(e) => setPrescInstructions(e.target.value)} placeholder="Diet, exercise, lifestyle..." className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label>Follow-up Date (Optional)</Label>
              <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="h-10 rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrescriptionDialog(null)}>Cancel</Button>
            <Button
              onClick={handleSavePrescription}
              disabled={!prescDiagnosis || medications.every((m) => !m.name) || isLoading}
              className="gradient-primary text-white border-0"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Create Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={!!rescheduleDialog} onOpenChange={() => setRescheduleDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>Select a new date and time for {rescheduleDialog?.patientName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Calendar mode="single" selected={newDate} onSelect={setNewDate} disabled={(date) => date < new Date()} className="rounded-xl mx-auto" />
            {newDate && (
              <div>
                <p className="text-sm font-medium mb-2">Select Time</p>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <Button key={time} variant={newTime === time ? "default" : "outline"} size="sm" onClick={() => setNewTime(time)}
                      className={`text-xs rounded-xl ${newTime === time ? "gradient-primary text-white border-0" : ""}`}>
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialog(null)}>Cancel</Button>
            <Button onClick={handleReschedule} disabled={!newDate || !newTime || isLoading} className="gradient-primary text-white border-0">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
