"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  UserCircle, Mail, Phone, MapPin, Star, GraduationCap,
  Clock, Globe, DollarSign, Save, Loader2, Stethoscope, Building,
} from "lucide-react";
import { toast } from "sonner";
import { Doctor } from "@/types";

export default function DoctorProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (session?.user?.userId) {
      fetch("/api/user/me")
        .then((r) => r.json())
        .then((data) => {
          setProfile(data);
          setFormData({ name: data.name || "", email: data.email || "", phone: data.phone || "" });
        })
        .catch(console.error);
    }
  }, [session?.user?.userId]);

  if (!session?.user || !profile || "error" in profile) return null;
  const doctor = profile as Record<string, unknown>;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setProfile({ ...profile, ...formData });
      toast.success("Profile Updated", { description: "Your profile has been saved successfully." });
      setIsEditing(false);
    } catch {
      toast.error("Failed to update profile");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            My <span className="text-gradient">Profile</span>
          </h1>
          <p className="text-muted-foreground mt-1">Manage your professional profile</p>
        </div>
        <Button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isSaving}
          className={isEditing ? "gradient-primary text-white border-0" : ""}
          variant={isEditing ? "default" : "outline"}
        >
          {isSaving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
          ) : isEditing ? (
            <><Save className="mr-2 h-4 w-4" />Save Changes</>
          ) : (
            "Edit Profile"
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="gradient-primary p-6 pb-16" />
          <CardContent className="relative px-6 pb-6">
            <Avatar className="absolute -top-12 left-1/2 -translate-x-1/2 h-24 w-24 border-4 border-card rounded-2xl">
              <AvatarFallback className="rounded-2xl gradient-primary text-white text-3xl font-bold">
                {(doctor.name as string || "").replace("Dr. ", "").split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="pt-14 text-center">
              <h2 className="text-xl font-bold">{doctor.name as string}</h2>
              <p className="text-sm text-primary font-medium">{doctor.specialization as string}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{doctor.qualification as string}</p>

              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{doctor.rating as number}</span>
                </div>
                <span className="text-xs text-muted-foreground">({doctor.totalReviews as number} reviews)</span>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{doctor.email as string}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{doctor.phone as string}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{doctor.hospital as string}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p className="text-lg font-bold text-primary">{doctor.experience as number} yrs</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Fee</p>
                  <p className="text-lg font-bold text-emerald-500">${doctor.consultationFee as number}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  {isEditing ? (
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-11 rounded-xl" />
                  ) : (
                    <p className="text-sm font-medium h-11 flex items-center px-3 rounded-xl bg-muted/50">{doctor.name as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  {isEditing ? (
                    <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-11 rounded-xl" />
                  ) : (
                    <p className="text-sm font-medium h-11 flex items-center px-3 rounded-xl bg-muted/50">{doctor.email as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  {isEditing ? (
                    <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="h-11 rounded-xl" />
                  ) : (
                    <p className="text-sm font-medium h-11 flex items-center px-3 rounded-xl bg-muted/50">{doctor.phone as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <p className="text-sm font-medium h-11 flex items-center gap-2 px-3 rounded-xl bg-muted/50">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    {doctor.department as string}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <p className="text-sm font-medium h-11 flex items-center px-3 rounded-xl bg-muted/50">{doctor.specialization as string}</p>
                </div>
                <div className="space-y-2">
                  <Label>Qualification</Label>
                  <p className="text-sm font-medium h-11 flex items-center px-3 rounded-xl bg-muted/50">{doctor.qualification as string}</p>
                </div>
                <div className="space-y-2">
                  <Label>Experience</Label>
                  <p className="text-sm font-medium h-11 flex items-center gap-2 px-3 rounded-xl bg-muted/50">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {doctor.experience as number} years
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Consultation Fee</Label>
                  <p className="text-sm font-medium h-11 flex items-center gap-2 px-3 rounded-xl bg-muted/50">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    ${doctor.consultationFee as number}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Languages
                </Label>
                <div className="flex flex-wrap gap-2">
                  {(doctor.languages as string[]).map((lang: string) => (
                    <Badge key={lang} variant="outline" className="rounded-full text-xs px-3 py-1 border-primary/20 text-primary">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-sm leading-relaxed">{doctor.bio as string}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
