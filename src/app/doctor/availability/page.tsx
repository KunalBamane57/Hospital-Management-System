"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Clock, Calendar, Plus, Trash2, Save, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Doctor, AvailableSlot } from "@/types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ALL_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

export default function AvailabilityPage() {
  const { currentUser } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);

  if (!currentUser) return null;
  const doctor = currentUser as Doctor;

  const [availability, setAvailability] = useState<AvailableSlot[]>(
    doctor.availableSlots || []
  );

  const isDayEnabled = (day: string) => availability.some((s) => s.day === day);

  const toggleDay = (day: string) => {
    if (isDayEnabled(day)) {
      setAvailability(availability.filter((s) => s.day !== day));
    } else {
      setAvailability([...availability, { day, slots: ["09:00", "09:30", "10:00", "14:00", "14:30", "15:00"] }]);
    }
  };

  const isSlotSelected = (day: string, slot: string) => {
    const daySlots = availability.find((s) => s.day === day);
    return daySlots?.slots.includes(slot) || false;
  };

  const toggleSlot = (day: string, slot: string) => {
    setAvailability(
      availability.map((s) => {
        if (s.day !== day) return s;
        const slots = s.slots.includes(slot)
          ? s.slots.filter((t) => t !== slot)
          : [...s.slots, slot].sort();
        return { ...s, slots };
      })
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Availability Updated!", { description: "Your consultation schedule has been saved." });
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="text-gradient">Availability</span>
          </h1>
          <p className="text-muted-foreground mt-1">Manage your consultation schedule and time slots</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gradient-primary text-white border-0 shadow-lg shadow-primary/25 rounded-xl">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{availability.length}</p>
              <p className="text-xs text-muted-foreground">Working Days</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <Clock className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{availability.reduce((sum, s) => sum + s.slots.length, 0)}</p>
              <p className="text-xs text-muted-foreground">Total Slots</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
              <CheckCircle2 className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Math.round(availability.reduce((sum, s) => sum + s.slots.length * 30, 0) / 60)}h
              </p>
              <p className="text-xs text-muted-foreground">Weekly Hours</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule */}
      <div className="space-y-4">
        {DAYS.map((day) => {
          const enabled = isDayEnabled(day);
          const daySlots = availability.find((s) => s.day === day)?.slots || [];

          return (
            <Card key={day} className={`border-0 shadow-sm transition-all ${enabled ? "" : "opacity-60"}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Switch checked={enabled} onCheckedChange={() => toggleDay(day)} />
                    <div>
                      <h3 className="font-semibold">{day}</h3>
                      <p className="text-xs text-muted-foreground">
                        {enabled ? `${daySlots.length} slots active` : "Not available"}
                      </p>
                    </div>
                  </div>
                  {enabled && (
                    <Badge variant="outline" className="rounded-full text-xs border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Available
                    </Badge>
                  )}
                </div>

                {enabled && (
                  <>
                    <Separator className="mb-4" />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Morning Slots</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {ALL_SLOTS.filter((s) => parseInt(s) < 13).map((slot) => (
                          <Button
                            key={slot}
                            size="sm"
                            variant={isSlotSelected(day, slot) ? "default" : "outline"}
                            className={`rounded-xl text-xs h-8 ${
                              isSlotSelected(day, slot) ? "gradient-primary text-white border-0 shadow-sm" : ""
                            }`}
                            onClick={() => toggleSlot(day, slot)}
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Afternoon Slots</p>
                      <div className="flex flex-wrap gap-2">
                        {ALL_SLOTS.filter((s) => parseInt(s) >= 13).map((slot) => (
                          <Button
                            key={slot}
                            size="sm"
                            variant={isSlotSelected(day, slot) ? "default" : "outline"}
                            className={`rounded-xl text-xs h-8 ${
                              isSlotSelected(day, slot) ? "gradient-primary text-white border-0 shadow-sm" : ""
                            }`}
                            onClick={() => toggleSlot(day, slot)}
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
