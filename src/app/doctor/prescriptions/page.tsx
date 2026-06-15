"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, Pill, Clock, AlertCircle, Stethoscope } from "lucide-react";
import { Prescription } from "@/types";

export default function DoctorPrescriptionsPage() {
  const { currentUser, getPrescriptionsByDoctor } = useAppStore();

  if (!currentUser) return null;

  const prescriptions = getPrescriptionsByDoctor(currentUser.id);

  const handleDownload = (presc: Prescription) => {
    const text = `MEDICORE HOSPITAL - Digital Prescription\n\nPatient: ${presc.patientName}\nDoctor: ${presc.doctorName}\nDate: ${presc.date}\nDiagnosis: ${presc.diagnosis}\n\nMedications:\n${presc.medications.map((m, i) => `${i + 1}. ${m.name} - ${m.dosage} - ${m.frequency} (${m.duration})`).join("\n")}\n\nInstructions: ${presc.instructions}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prescription-${presc.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="text-gradient">Prescriptions</span>
        </h1>
        <p className="text-muted-foreground mt-1">View and manage prescriptions you&apos;ve created</p>
      </div>

      {prescriptions.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-semibold">No Prescriptions</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Prescriptions you create for patients will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((presc, i) => (
            <Card key={presc.id} className="border-0 shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="gradient-primary px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-white" />
                  <div>
                    <p className="text-white font-semibold text-sm">Prescription #{presc.id}</p>
                    <p className="text-white/70 text-xs">{presc.date} • {presc.patientName}</p>
                  </div>
                </div>
                <Button size="sm" variant="secondary" className="bg-white/20 text-white border-0 hover:bg-white/30 rounded-xl text-xs" onClick={() => handleDownload(presc)}>
                  <Download className="mr-1 h-3.5 w-3.5" /> Download
                </Button>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {presc.patientName.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{presc.patientName}</p>
                    <Badge variant="outline" className="rounded-full text-[10px] mt-0.5">Patient</Badge>
                  </div>
                </div>
                <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-3">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-0.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Diagnosis
                  </p>
                  <p className="text-sm">{presc.diagnosis}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {presc.medications.map((med, j) => (
                    <div key={j} className="rounded-xl border p-3 flex-1 min-w-[200px]">
                      <p className="font-semibold text-sm">{med.name}</p>
                      <p className="text-xs text-primary">{med.dosage} • {med.frequency}</p>
                      <p className="text-xs text-muted-foreground">{med.duration}</p>
                    </div>
                  ))}
                </div>
                {presc.followUpDate && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                    Follow-up: {new Date(presc.followUpDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
