"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Mail, Phone, MapPin, Shield, Heart, AlertTriangle, Save, Loader2, Droplets, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Patient } from "@/types";

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
  });

  if (!currentUser) return null;

  const patient = currentUser as Patient;

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    updateProfile(currentUser.id, formData);
    toast.success("Profile Updated", { description: "Your profile has been saved successfully." });
    setIsEditing(false);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            My <span className="text-gradient">Profile</span>
          </h1>
          <p className="text-muted-foreground mt-1">Manage your personal and medical information</p>
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
                {currentUser.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="pt-14 text-center">
              <h2 className="text-xl font-bold">{currentUser.name}</h2>
              <p className="text-sm text-muted-foreground">Patient</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {currentUser.email}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {currentUser.phone}
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Blood Group</p>
                  <p className="text-lg font-bold text-primary">{patient.bloodGroup}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="text-lg font-bold capitalize">{patient.gender}</p>
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
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-11 rounded-xl"
                    />
                  ) : (
                    <p className="text-sm font-medium h-11 flex items-center px-3 rounded-xl bg-muted/50">{currentUser.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  {isEditing ? (
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-11 rounded-xl"
                    />
                  ) : (
                    <p className="text-sm font-medium h-11 flex items-center px-3 rounded-xl bg-muted/50">{currentUser.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-11 rounded-xl"
                    />
                  ) : (
                    <p className="text-sm font-medium h-11 flex items-center px-3 rounded-xl bg-muted/50">{currentUser.phone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <p className="text-sm font-medium h-11 flex items-center gap-2 px-3 rounded-xl bg-muted/50">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Not set"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <p className="text-sm font-medium flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/50">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  {patient.address || "Not set"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-red-500" />
                  Blood Group
                </Label>
                <Badge variant="outline" className="rounded-full text-sm px-3 py-1 border-red-500/20 text-red-500">
                  {patient.bloodGroup}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label>Medical History</Label>
                <div className="flex flex-wrap gap-2">
                  {patient.medicalHistory?.length > 0 ? patient.medicalHistory.map((item) => (
                    <Badge key={item} variant="outline" className="rounded-full text-xs px-3 py-1">
                      {item}
                    </Badge>
                  )) : <p className="text-sm text-muted-foreground">None recorded</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Allergies
                </Label>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies?.length > 0 ? patient.allergies.map((allergy) => (
                    <Badge key={allergy} className="rounded-full text-xs px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" variant="outline">
                      {allergy}
                    </Badge>
                  )) : <p className="text-sm text-muted-foreground">None recorded</p>}
                </div>
              </div>
              {patient.insuranceId && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    Insurance ID
                  </Label>
                  <Badge variant="outline" className="rounded-full text-sm px-3 py-1 border-blue-500/20 text-blue-500">
                    {patient.insuranceId}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
