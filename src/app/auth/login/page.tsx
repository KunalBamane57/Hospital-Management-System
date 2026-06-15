"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Loader2, Stethoscope, User } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppStore();
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: role === "patient" ? "john@example.com" : "sarah.chen@medicore.com",
      password: "password123",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const success = login(data.email, data.password, role);
    if (success) {
      toast.success("Welcome back!", {
        description: `You've been logged in as a ${role}.`,
      });
      router.push(`/${role}/dashboard`);
    } else {
      toast.error("Login failed", { description: "Invalid credentials." });
    }
    setIsLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-xl shadow-primary/30">
            <Activity className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              Welcome to Medi<span className="text-gradient">Core</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to access your healthcare dashboard
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <Tabs
              value={role}
              onValueChange={(v) => setRole(v as "patient" | "doctor")}
              className="w-full"
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
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={
                    role === "patient"
                      ? "john@example.com"
                      : "sarah.chen@medicore.com"
                  }
                  className="h-11 rounded-xl"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 rounded-xl"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Demo credentials hint */}
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-primary">Demo:</strong> Use any email to log in.
                  Try{" "}
                  <code className="rounded bg-primary/10 px-1 py-0.5 text-[10px] text-primary">
                    {role === "patient"
                      ? "john@example.com"
                      : "sarah.chen@medicore.com"}
                  </code>{" "}
                  with any password.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `Sign In as ${role === "patient" ? "Patient" : "Doctor"}`
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-primary hover:underline"
              >
                Create Account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
