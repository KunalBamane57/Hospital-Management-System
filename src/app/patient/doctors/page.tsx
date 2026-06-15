"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { specializations } from "@/data/mock-data";
import {
  Search,
  Star,
  Clock,
  MapPin,
  GraduationCap,
  DollarSign,
  ArrowRight,
  Stethoscope,
  Filter,
  Users,
  Globe,
} from "lucide-react";

export default function DoctorsPage() {
  const { doctors } = useAppStore();
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("All Specializations");
  const [sortBy, setSortBy] = useState("rating");

  const filteredDoctors = useMemo(() => {
    let result = doctors.filter((doc) => {
      const matchSearch =
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(search.toLowerCase());
      const matchSpecialization =
        specialization === "All Specializations" ||
        doc.specialization === specialization;
      return matchSearch && matchSpecialization;
    });

    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "experience":
        result.sort((a, b) => b.experience - a.experience);
        break;
      case "fee-low":
        result.sort((a, b) => a.consultationFee - b.consultationFee);
        break;
      case "fee-high":
        result.sort((a, b) => b.consultationFee - a.consultationFee);
        break;
      case "reviews":
        result.sort((a, b) => b.totalReviews - a.totalReviews);
        break;
    }

    return result;
  }, [doctors, search, specialization, sortBy]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Find <span className="text-gradient">Doctors</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse and book appointments with qualified healthcare professionals
        </p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by doctor name or specialization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 rounded-xl"
              />
            </div>
            <Select value={specialization} onValueChange={(v) => v && setSpecialization(v)}>
              <SelectTrigger className="h-11 w-full sm:w-52 rounded-xl">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => v && setSortBy(v)}>
              <SelectTrigger className="h-11 w-full sm:w-44 rounded-xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
                <SelectItem value="fee-low">Fee: Low to High</SelectItem>
                <SelectItem value="fee-high">Fee: High to Low</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{filteredDoctors.length}</span>{" "}
          doctors found
        </p>
      </div>

      {/* Doctor Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredDoctors.map((doctor, i) => (
          <Card
            key={doctor.id}
            className="group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 rounded-2xl border-2 border-primary/10 shrink-0">
                  <AvatarFallback className="rounded-2xl gradient-primary text-white text-lg font-bold">
                    {doctor.name
                      .replace("Dr. ", "")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold truncate">{doctor.name}</h3>
                      <p className="text-sm text-primary font-medium">
                        {doctor.specialization}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 shrink-0">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                        {doctor.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {doctor.qualification}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {doctor.bio}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  {doctor.experience} yrs exp
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5 text-emerald-500" />
                  {doctor.totalReviews} reviews
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Globe className="h-3.5 w-3.5 text-purple-500" />
                  {doctor.languages.join(", ")}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-red-500" />
                  {doctor.hospital.replace("MediCore ", "")}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1.5 flex-wrap">
                {doctor.availableSlots.slice(0, 3).map((slot) => (
                  <Badge
                    key={slot.day}
                    variant="outline"
                    className="rounded-full text-[10px] px-2 py-0.5 border-primary/20 text-primary"
                  >
                    {slot.day.slice(0, 3)}
                  </Badge>
                ))}
                {doctor.availableSlots.length > 3 && (
                  <Badge
                    variant="outline"
                    className="rounded-full text-[10px] px-2 py-0.5"
                  >
                    +{doctor.availableSlots.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <div>
                  <span className="text-lg font-bold text-primary">
                    ${doctor.consultationFee}
                  </span>
                  <span className="text-xs text-muted-foreground">/visit</span>
                </div>
                <Link href={`/patient/doctors/${doctor.id}`}>
                  <Button
                    size="sm"
                    className="gradient-primary text-white border-0 shadow-md shadow-primary/20 rounded-xl hover:shadow-lg transition-all"
                  >
                    Book Now
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/5 transition-all duration-500 group-hover:scale-[2]" />
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Stethoscope className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold">No Doctors Found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
