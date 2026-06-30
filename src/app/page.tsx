"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  Activity,
  Calendar,
  Shield,
  Clock,
  Star,
  Users,
  ArrowRight,
  Heart,
  Stethoscope,
  Brain,
  Bone,
  Eye,
  Baby,
  CheckCircle2,
  Phone,
  Video,
  MapPin,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Easy Booking",
    description: "Book appointments with top doctors in just a few clicks. Choose your preferred date and time.",
  },
  {
    icon: Video,
    title: "Video Consults",
    description: "Connect with doctors virtually from the comfort of your home via secure video calls.",
  },
  {
    icon: Shield,
    title: "Secure Records",
    description: "Your medical records and prescriptions are encrypted and securely stored in the cloud.",
  },
  {
    icon: Clock,
    title: "24/7 Access",
    description: "Access your health records, prescriptions, and appointment history anytime, anywhere.",
  },
  {
    icon: Star,
    title: "Verified Doctors",
    description: "All our doctors are verified professionals with proven track records and patient reviews.",
  },
  {
    icon: Phone,
    title: "Real-time Updates",
    description: "Get instant notifications about appointment confirmations, reminders, and changes.",
  },
];

const specialties = [
  { icon: Heart, name: "Cardiology", doctors: 12 },
  { icon: Brain, name: "Neurology", doctors: 8 },
  { icon: Bone, name: "Orthopedics", doctors: 10 },
  { icon: Eye, name: "Ophthalmology", doctors: 6 },
  { icon: Stethoscope, name: "General Medicine", doctors: 15 },
  { icon: Baby, name: "Pediatrics", doctors: 9 },
];

const stats = [
  { value: "500+", label: "Qualified Doctors" },
  { value: "50K+", label: "Happy Patients" },
  { value: "100+", label: "Specializations" },
  { value: "4.9", label: "Average Rating" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-primary/25">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Medi<span className="text-gradient">Core</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#specialties" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Specialties</a>
            <a href="#stats" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button render={<Link href="/auth/login" />} variant="ghost" className="hidden sm:inline-flex">
              Log In
            </Button>
            <Button render={<Link href="/auth/register" />} className="gradient-primary text-white border-0 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-60 -left-40 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-primary/3 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 rounded-full bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-medium hover:bg-primary/15">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Trusted by 50,000+ patients
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Your Health,{" "}
              <span className="text-gradient">Our Priority</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Book appointments with world-class doctors, manage prescriptions,
              and take control of your healthcare journey — all in one platform.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                render={<Link href="/auth/register" />}
                size="lg"
                className="gradient-primary text-white border-0 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all h-13 px-8 text-base rounded-xl"
              >
                Book Appointment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                render={<Link href="/auth/login" />}
                size="lg"
                variant="outline"
                className="h-13 px-8 text-base rounded-xl"
              >
                <Users className="mr-2 h-5 w-5" />
                Doctor Login
              </Button>
            </div>
          </div>

          {/* Floating Cards */}
          <div className="relative mt-16 sm:mt-20 hidden md:block">
            <div className="absolute left-10 top-0 animate-float">
              <Card className="w-56 border-0 shadow-xl glass">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Appointment Confirmed</p>
                    <p className="text-xs text-muted-foreground">Dr. Sarah Chen • 9:00 AM</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="absolute right-10 top-10 animate-float" style={{ animationDelay: "2s" }}>
              <Card className="w-52 border-0 shadow-xl glass">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Star className="h-5 w-5 text-primary fill-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">4.9 Rating</p>
                    <p className="text-xs text-muted-foreground">Based on 50K reviews</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="absolute left-1/3 top-24 animate-float" style={{ animationDelay: "4s" }}>
              <Card className="w-48 border-0 shadow-xl glass">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                    <MapPin className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">500+ Doctors</p>
                    <p className="text-xs text-muted-foreground">Across all specialties</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="border-y bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold text-gradient sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge className="mb-4 rounded-full bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
              Features
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need for{" "}
              <span className="text-gradient">Better Healthcare</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              A comprehensive platform designed to simplify your healthcare experience
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
                <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-primary/5 transition-all duration-500 group-hover:scale-[2]" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section id="specialties" className="border-t bg-card/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge className="mb-4 rounded-full bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
              Specialties
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Find the Right <span className="text-gradient">Specialist</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Access top doctors across various medical specializations
            </p>
          </div>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {specialties.map((specialty, i) => (
              <Card
                key={specialty.name}
                className="group cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:gradient-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/25">
                    <specialty.icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{specialty.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {specialty.doctors} doctors available
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:translate-x-1" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl gradient-hero p-10 sm:p-16 text-center">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 right-0 h-60 w-60 rounded-full bg-white/5 blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to Take Control of Your Health?
              </h2>
              <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
                Join thousands of patients who trust MediCore for their healthcare needs.
                Book your first appointment today.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  render={<Link href="/auth/register" />}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 shadow-xl h-13 px-8 text-base rounded-xl font-semibold"
                >
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  render={<Link href="/auth/login" />}
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 h-13 px-8 text-base rounded-xl bg-transparent"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                <Activity className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-bold">
                Medi<span className="text-gradient">Core</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 MediCore. All rights reserved. Made with{" "}
              <Heart className="inline h-3.5 w-3.5 text-red-500 fill-red-500" /> for better healthcare.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
