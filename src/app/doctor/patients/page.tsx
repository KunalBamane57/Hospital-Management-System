"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Phone, Mail, Calendar, Droplets, AlertTriangle, Heart } from "lucide-react";
import { Patient } from "@/types";

export default function DoctorPatientsPage() {
  const { data: session } = useSession();
  const { appointments, fetchAppointments } = useAppStore();
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    if (session?.user?.userId) {
      fetchAppointments();
      fetch("/api/patients")
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setPatients(data);
        })
        .catch(console.error);
    }
  }, [session?.user?.userId, fetchAppointments]);

  if (!session?.user) return null;

  const doctorAppointments = appointments.filter((a) => a.doctorId === session.user.userId);
  const patientIds = [...new Set(doctorAppointments.map((a) => a.patientId))];
  const doctorPatients = patientIds.map((id) => {
    const patientAppts = doctorAppointments.filter((a) => a.patientId === id);
    const lastVisit = patientAppts
      .filter((a) => a.status === "completed")
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    
    const latestAppt = patientAppts[0];
    const fullPatientInfo = patients.find(p => p.id === id);

    const patient = {
      id: id,
      name: fullPatientInfo?.name || latestAppt.patientName || "Unknown Patient",
      email: fullPatientInfo?.email || "N/A",
      phone: fullPatientInfo?.phone || "N/A",
      gender: fullPatientInfo?.gender || "N/A",
      bloodGroup: fullPatientInfo?.bloodGroup || "N/A",
      avatar: fullPatientInfo?.avatar || "",
      dateOfBirth: fullPatientInfo?.dateOfBirth,
      medicalHistory: fullPatientInfo?.medicalHistory || [],
      allergies: fullPatientInfo?.allergies || []
    };
    return { patient, appointments: patientAppts, lastVisit };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          My <span className="text-gradient">Patients</span>
        </h1>
        <p className="text-muted-foreground mt-1">View patient details and medical history</p>
      </div>

      {doctorPatients.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-semibold">No Patients Yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Patients who book appointments with you will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {doctorPatients.map(({ patient, appointments: appts, lastVisit }, i) => {
            const pat = patient as Patient;
            return (
              <Card key={pat.id} className="border-0 shadow-sm animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row gap-5">
                    {/* Patient Info */}
                    <div className="flex items-start gap-4 md:w-72 shrink-0">
                      <Avatar className="h-14 w-14 rounded-2xl border-2 border-primary/10">
                        <AvatarFallback className="rounded-2xl bg-primary/10 text-primary text-lg font-bold">
                          {pat.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="font-semibold">{pat.name}</h3>
                        <div className="mt-1 space-y-1">
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />{pat.email}
                          </p>
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />{pat.phone}
                          </p>
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            DOB: {pat.dateOfBirth ? new Date(pat.dateOfBirth).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Medical Info */}
                    <div className="flex-1 space-y-3 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-5">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="rounded-xl bg-muted/50 p-3 text-center">
                          <p className="text-xs text-muted-foreground">Blood Group</p>
                          <p className="text-lg font-bold text-red-500">{pat.bloodGroup}</p>
                        </div>
                        <div className="rounded-xl bg-muted/50 p-3 text-center">
                          <p className="text-xs text-muted-foreground">Gender</p>
                          <p className="text-lg font-bold capitalize">{pat.gender}</p>
                        </div>
                        <div className="rounded-xl bg-muted/50 p-3 text-center">
                          <p className="text-xs text-muted-foreground">Total Visits</p>
                          <p className="text-lg font-bold text-primary">{appts.length}</p>
                        </div>
                        <div className="rounded-xl bg-muted/50 p-3 text-center">
                          <p className="text-xs text-muted-foreground">Last Visit</p>
                          <p className="text-sm font-bold">{lastVisit ? new Date(lastVisit.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                            <Heart className="h-3 w-3 text-red-500" /> Medical History
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {pat.medicalHistory?.length > 0 ? pat.medicalHistory.map((h) => (
                              <Badge key={h} variant="outline" className="rounded-full text-[10px] px-2">{h}</Badge>
                            )) : <span className="text-xs text-muted-foreground">None</span>}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-amber-500" /> Allergies
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {pat.allergies?.length > 0 ? pat.allergies.map((a) => (
                              <Badge key={a} variant="outline" className="rounded-full text-[10px] px-2 border-amber-500/20 text-amber-600 dark:text-amber-400">{a}</Badge>
                            )) : <span className="text-xs text-muted-foreground">None</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
