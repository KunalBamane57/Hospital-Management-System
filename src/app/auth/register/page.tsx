"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Loader2, Stethoscope, User } from "lucide-react";
import { toast } from "sonner";

const patientSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    gender: z.enum(["male", "female", "other"]),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const doctorSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    specialization: z.string().min(1, "Specialization is required"),
    experience: z.string().min(1, "Experience is required"),
    qualification: z.string().min(1, "Qualification is required"),
    consultationFee: z.string().min(1, "Consultation fee is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PatientForm = z.infer<typeof patientSchema>;
type DoctorForm = z.infer<typeof doctorSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [isLoading, setIsLoading] = useState(false);

  const patientForm = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
  });

  const doctorForm = useForm<DoctorForm>({
    resolver: zodResolver(doctorSchema),
  });

  const onSubmitPatient = async (data: PatientForm) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "patient",
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error("Registration failed", { description: result.error });
        setIsLoading(false);
        return;
      }
      toast.success("Account created!", {
        description: `Your Patient ID is ${result.userId}. Logging you in...`,
      });
      // Auto sign-in after registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        role: "patient",
        redirect: false,
      });
      if (signInResult?.ok) {
        router.push("/patient/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Registration failed", { description: "An unexpected error occurred." });
    }
    setIsLoading(false);
  };

  const onSubmitDoctor = async (data: DoctorForm) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "doctor",
          name: `Dr. ${data.name}`,
          email: data.email,
          password: data.password,
          phone: data.phone,
          specialization: data.specialization,
          experience: parseInt(data.experience),
          qualification: data.qualification,
          consultationFee: parseInt(data.consultationFee),
          department: data.specialization,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error("Registration failed", { description: result.error });
        setIsLoading(false);
        return;
      }
      toast.success("Account created!", {
        description: `Your Doctor ID is ${result.userId}. Logging you in...`,
      });
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        role: "doctor",
        redirect: false,
      });
      if (signInResult?.ok) {
        router.push("/doctor/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Registration failed", { description: "An unexpected error occurred." });
    }
    setIsLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-xl shadow-primary/30">
            <Activity className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              Create Your Medi<span className="text-gradient">Core</span> Account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Start managing your healthcare today
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardContent className="pt-6">
            {/* Role Tabs */}
            <Tabs
              value={role}
              onValueChange={(v) => setRole(v as "patient" | "doctor")}
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl">
                <TabsTrigger value="patient" className="rounded-lg gap-2 text-sm">
                  <User className="h-4 w-4" />
                  Patient
                </TabsTrigger>
                <TabsTrigger value="doctor" className="rounded-lg gap-2 text-sm">
                  <Stethoscope className="h-4 w-4" />
                  Doctor
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Patient Form */}
            {role === "patient" && (
              <form onSubmit={patientForm.handleSubmit(onSubmitPatient)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pat-name">Full Name</Label>
                  <Input id="pat-name" placeholder="John Anderson" className="h-11 rounded-xl" {...patientForm.register("name")} />
                  {patientForm.formState.errors.name && <p className="text-xs text-destructive">{patientForm.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pat-email">Email</Label>
                  <Input id="pat-email" type="email" placeholder="john@example.com" className="h-11 rounded-xl" {...patientForm.register("email")} />
                  {patientForm.formState.errors.email && <p className="text-xs text-destructive">{patientForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pat-phone">Phone Number</Label>
                  <Input id="pat-phone" type="tel" placeholder="+1-555-0123" className="h-11 rounded-xl" {...patientForm.register("phone")} />
                  {patientForm.formState.errors.phone && <p className="text-xs text-destructive">{patientForm.formState.errors.phone.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select onValueChange={(v) => patientForm.setValue("gender", v as "male" | "female" | "other")}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {patientForm.formState.errors.gender && <p className="text-xs text-destructive">{patientForm.formState.errors.gender.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pat-dob">Date of Birth</Label>
                    <Input id="pat-dob" type="date" className="h-11 rounded-xl" {...patientForm.register("dateOfBirth")} />
                    {patientForm.formState.errors.dateOfBirth && <p className="text-xs text-destructive">{patientForm.formState.errors.dateOfBirth.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pat-password">Password</Label>
                  <Input id="pat-password" type="password" placeholder="••••••••" className="h-11 rounded-xl" {...patientForm.register("password")} />
                  {patientForm.formState.errors.password && <p className="text-xs text-destructive">{patientForm.formState.errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pat-confirm">Confirm Password</Label>
                  <Input id="pat-confirm" type="password" placeholder="••••••••" className="h-11 rounded-xl" {...patientForm.register("confirmPassword")} />
                  {patientForm.formState.errors.confirmPassword && <p className="text-xs text-destructive">{patientForm.formState.errors.confirmPassword.message}</p>}
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Patient Account"}
                </Button>
              </form>
            )}

            {/* Doctor Form */}
            {role === "doctor" && (
              <form onSubmit={doctorForm.handleSubmit(onSubmitDoctor)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-name">Full Name</Label>
                  <Input id="doc-name" placeholder="Sarah Chen" className="h-11 rounded-xl" {...doctorForm.register("name")} />
                  {doctorForm.formState.errors.name && <p className="text-xs text-destructive">{doctorForm.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-email">Email</Label>
                  <Input id="doc-email" type="email" placeholder="doctor@medicore.com" className="h-11 rounded-xl" {...doctorForm.register("email")} />
                  {doctorForm.formState.errors.email && <p className="text-xs text-destructive">{doctorForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-phone">Phone Number</Label>
                  <Input id="doc-phone" type="tel" placeholder="+1-555-0101" className="h-11 rounded-xl" {...doctorForm.register("phone")} />
                  {doctorForm.formState.errors.phone && <p className="text-xs text-destructive">{doctorForm.formState.errors.phone.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Specialization</Label>
                    <Select onValueChange={(v) => doctorForm.setValue("specialization", v as any)}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="Dermatology">Dermatology</SelectItem>
                        <SelectItem value="Neurology">Neurology</SelectItem>
                        <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="General Medicine">General Medicine</SelectItem>
                        <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
                        <SelectItem value="ENT">ENT</SelectItem>
                        <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                        <SelectItem value="Gynecology">Gynecology</SelectItem>
                      </SelectContent>
                    </Select>
                    {doctorForm.formState.errors.specialization && <p className="text-xs text-destructive">{doctorForm.formState.errors.specialization.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-exp">Experience (years)</Label>
                    <Input id="doc-exp" type="number" placeholder="10" className="h-11 rounded-xl" {...doctorForm.register("experience")} />
                    {doctorForm.formState.errors.experience && <p className="text-xs text-destructive">{doctorForm.formState.errors.experience.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doc-qual">Qualification</Label>
                    <Input id="doc-qual" placeholder="MD, FACC" className="h-11 rounded-xl" {...doctorForm.register("qualification")} />
                    {doctorForm.formState.errors.qualification && <p className="text-xs text-destructive">{doctorForm.formState.errors.qualification.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-fee">Consultation Fee ($)</Label>
                    <Input id="doc-fee" type="number" placeholder="200" className="h-11 rounded-xl" {...doctorForm.register("consultationFee")} />
                    {doctorForm.formState.errors.consultationFee && <p className="text-xs text-destructive">{doctorForm.formState.errors.consultationFee.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-password">Password</Label>
                  <Input id="doc-password" type="password" placeholder="••••••••" className="h-11 rounded-xl" {...doctorForm.register("password")} />
                  {doctorForm.formState.errors.password && <p className="text-xs text-destructive">{doctorForm.formState.errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-confirm">Confirm Password</Label>
                  <Input id="doc-confirm" type="password" placeholder="••••••••" className="h-11 rounded-xl" {...doctorForm.register("confirmPassword")} />
                  {doctorForm.formState.errors.confirmPassword && <p className="text-xs text-destructive">{doctorForm.formState.errors.confirmPassword.message}</p>}
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Doctor Account"}
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-semibold text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
