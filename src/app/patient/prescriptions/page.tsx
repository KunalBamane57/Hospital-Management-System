"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  Calendar,
  Pill,
  Clock,
  AlertCircle,
  Stethoscope,
  Printer,
} from "lucide-react";
import { Prescription } from "@/types";

export default function PrescriptionsPage() {
  const { currentUser, getPrescriptionsByPatient } = useAppStore();

  if (!currentUser) return null;

  const prescriptions = getPrescriptionsByPatient(currentUser.id);

  const handleDownload = (presc: Prescription) => {
    const text = `
═══════════════════════════════════════════
           MEDICORE HOSPITAL
        Digital Prescription
═══════════════════════════════════════════

Patient: ${presc.patientName}
Doctor: ${presc.doctorName}
Date: ${presc.date}
Diagnosis: ${presc.diagnosis}

─── MEDICATIONS ───────────────────────────
${presc.medications.map((m, i) => `
${i + 1}. ${m.name}
   Dosage: ${m.dosage}
   Frequency: ${m.frequency}
   Duration: ${m.duration}
   ${m.instructions ? `Note: ${m.instructions}` : ""}
`).join("")}
─── INSTRUCTIONS ──────────────────────────
${presc.instructions}

${presc.followUpDate ? `Follow-up Date: ${presc.followUpDate}` : ""}

═══════════════════════════════════════════
    This is a digitally generated prescription
═══════════════════════════════════════════
    `.trim();

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
          My <span className="text-gradient">Prescriptions</span>
        </h1>
        <p className="text-muted-foreground mt-1">View and download your medical prescriptions</p>
      </div>

      {prescriptions.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-semibold">No Prescriptions Yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Prescriptions from your completed appointments will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((presc, i) => (
            <Card
              key={presc.id}
              className="border-0 shadow-sm overflow-hidden animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Prescription Header */}
              <div className="gradient-primary px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Prescription #{presc.id}</p>
                    <p className="text-white/70 text-xs">{presc.date}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 text-white border-0 hover:bg-white/30 rounded-xl text-xs"
                    onClick={() => handleDownload(presc)}
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download
                  </Button>
                </div>
              </div>

              <CardContent className="p-6 space-y-5">
                {/* Doctor & Diagnosis */}
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/10 shrink-0">
                    <AvatarFallback className="gradient-primary text-white text-sm font-bold">
                      {presc.doctorName.replace("Dr. ", "").split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{presc.doctorName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="rounded-full text-xs border-primary/20 text-primary">
                        <Stethoscope className="mr-1 h-3 w-3" />
                        Prescribing Doctor
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-4">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Diagnosis
                  </p>
                  <p className="text-sm">{presc.diagnosis}</p>
                </div>

                {/* Medications */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary" />
                    Medications ({presc.medications.length})
                  </h4>
                  <div className="space-y-2">
                    {presc.medications.map((med, j) => (
                      <div
                        key={j}
                        className="rounded-xl border p-4 hover:border-primary/20 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm">{med.name}</p>
                            <p className="text-xs text-primary mt-0.5">{med.dosage}</p>
                          </div>
                          <Badge variant="outline" className="rounded-full text-[10px]">
                            {med.duration}
                          </Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {med.frequency}
                          </span>
                          {med.instructions && (
                            <span className="text-xs text-muted-foreground">
                              • {med.instructions}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-4">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                    Special Instructions
                  </p>
                  <p className="text-sm leading-relaxed">{presc.instructions}</p>
                </div>

                {/* Follow-up */}
                {presc.followUpDate && (
                  <div className="flex items-center gap-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-4">
                    <Calendar className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Follow-up Date
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(presc.followUpDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
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
