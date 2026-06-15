"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Star,
  Clock,
  MapPin,
  GraduationCap,
  Globe,
  Users,
  Calendar as CalendarIcon,
  CheckCircle2,
  Video,
  Phone,
  DollarSign,
  ArrowLeft,
  Loader2,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

export default function DoctorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getDoctorById, currentUser, bookAppointment, getReviewsByDoctor, addNotification } = useAppStore();
  const doctor = getDoctorById(id);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState<"in-person" | "video" | "phone">("in-person");
  const [reason, setReason] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  if (!doctor || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Doctor not found</p>
        <Link href="/patient/doctors">
          <Button variant="link" className="mt-2 text-primary">
            Back to Doctors
          </Button>
        </Link>
      </div>
    );
  }

  const reviews = getReviewsByDoctor(doctor.id);

  const getAvailableSlots = () => {
    if (!selectedDate) return [];
    const dayName = format(selectedDate, "EEEE");
    const daySlots = doctor.availableSlots.find((s) => s.day === dayName);
    return daySlots?.slots || [];
  };

  const availableSlots = getAvailableSlots();

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) return;
    setIsBooking(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    bookAppointment({
      patientId: currentUser.id,
      doctorId: doctor.id,
      patientName: currentUser.name,
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      status: "pending",
      type: appointmentType,
      reason,
      paymentStatus: "completed",
      paymentAmount: doctor.consultationFee,
    });

    addNotification({
      userId: currentUser.id,
      title: "Appointment Booked!",
      message: `Your appointment with ${doctor.name} on ${format(selectedDate, "MMM dd, yyyy")} at ${selectedTime} has been booked.`,
      type: "appointment",
      read: false,
    });

    addNotification({
      userId: doctor.id,
      title: "New Appointment Request",
      message: `${currentUser.name} has booked an appointment for ${format(selectedDate, "MMM dd, yyyy")} at ${selectedTime}.`,
      type: "appointment",
      read: false,
    });

    setIsBooking(false);
    setShowPayment(false);
    toast.success("Appointment Booked!", {
      description: `Your appointment with ${doctor.name} has been confirmed.`,
    });
    router.push("/patient/appointments");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <Link href="/patient/doctors">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Doctors
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Doctor Profile */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="gradient-primary p-6 pb-12" />
            <CardContent className="relative px-6 pb-6">
              <Avatar className="absolute -top-10 left-6 h-20 w-20 rounded-2xl border-4 border-card">
                <AvatarFallback className="rounded-2xl gradient-primary text-white text-2xl font-bold">
                  {doctor.name
                    .replace("Dr. ", "")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="pt-12">
                <h2 className="text-xl font-bold">{doctor.name}</h2>
                <p className="text-primary font-medium text-sm">{doctor.specialization}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{doctor.qualification}</p>

                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      {doctor.rating}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({doctor.totalReviews} reviews)
                  </span>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>{doctor.experience} years experience</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span>{doctor.hospital}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <GraduationCap className="h-4 w-4 text-purple-500" />
                    <span>{doctor.department}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-emerald-500" />
                    <span>{doctor.languages.join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <DollarSign className="h-4 w-4 text-amber-500" />
                    <span className="font-semibold">${doctor.consultationFee}</span>
                    <span className="text-muted-foreground">per consultation</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {doctor.bio}
                </p>

                <div className="mt-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Available Days</p>
                  <div className="flex flex-wrap gap-1.5">
                    {doctor.availableSlots.map((slot) => (
                      <Badge
                        key={slot.day}
                        variant="outline"
                        className="rounded-full text-xs border-primary/20 text-primary"
                      >
                        {slot.day}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Section */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="book" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-11 rounded-xl">
              <TabsTrigger value="book" className="rounded-lg">Book Appointment</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-lg">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="book" className="mt-4 space-y-4">
              {/* Appointment Type */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Consultation Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {(["in-person", "video", "phone"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setAppointmentType(type)}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                          appointmentType === type
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        {type === "in-person" ? (
                          <MapPin className={`h-5 w-5 ${appointmentType === type ? "text-primary" : "text-muted-foreground"}`} />
                        ) : type === "video" ? (
                          <Video className={`h-5 w-5 ${appointmentType === type ? "text-primary" : "text-muted-foreground"}`} />
                        ) : (
                          <Phone className={`h-5 w-5 ${appointmentType === type ? "text-primary" : "text-muted-foreground"}`} />
                        )}
                        <span className={`text-xs font-medium capitalize ${appointmentType === type ? "text-primary" : "text-muted-foreground"}`}>
                          {type === "in-person" ? "In-Person" : type === "video" ? "Video Call" : "Phone Call"}
                        </span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Date & Time Selection */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Select Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => {
                        const dayName = format(date, "EEEE");
                        const isAvailable = doctor.availableSlots.some(
                          (s) => s.day === dayName
                        );
                        return date < new Date() || !isAvailable;
                      }}
                      className="rounded-xl"
                    />
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Select Time</CardTitle>
                    <CardDescription>
                      {selectedDate
                        ? `Available slots for ${format(selectedDate, "EEEE, MMM dd")}`
                        : "Please select a date first"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!selectedDate ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <CalendarIcon className="h-10 w-10 text-muted-foreground/20 mb-3" />
                        <p className="text-sm text-muted-foreground">
                          Select a date to see available time slots
                        </p>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Clock className="h-10 w-10 text-muted-foreground/20 mb-3" />
                        <p className="text-sm text-muted-foreground">
                          No available slots for this date
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTime(time)}
                            className={`rounded-xl text-xs ${
                              selectedTime === time
                                ? "gradient-primary text-white border-0 shadow-md"
                                : ""
                            }`}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Reason */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Reason for Visit</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Briefly describe your reason for visiting..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="rounded-xl min-h-20"
                  />
                </CardContent>
              </Card>

              {/* Book Button */}
              <div className="flex items-center justify-between rounded-xl border bg-card p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Consultation Fee</p>
                  <p className="text-2xl font-bold text-primary">${doctor.consultationFee}</p>
                </div>
                <Button
                  disabled={!selectedDate || !selectedTime || !reason}
                  onClick={() => setShowPayment(true)}
                  className="gradient-primary text-white border-0 shadow-lg shadow-primary/25 rounded-xl h-12 px-8"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Pay
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  {reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Star className="h-12 w-12 text-muted-foreground/20 mb-3" />
                      <p className="text-muted-foreground">No reviews yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="rounded-xl border p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {review.patientName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{review.patientName}</p>
                                <p className="text-xs text-muted-foreground">{review.createdAt}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${
                                    i < review.rating
                                      ? "text-amber-500 fill-amber-500"
                                      : "text-muted-foreground/20"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Complete your payment to confirm the appointment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/50 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Doctor</span>
                <span className="font-medium">{doctor.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {selectedDate && format(selectedDate, "MMM dd, yyyy")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium capitalize">{appointmentType}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">
                  ${doctor.consultationFee}
                </span>
              </div>
            </div>

            {/* Mock payment form */}
            <div className="space-y-3">
              <div className="rounded-xl border p-3 flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">•••• •••• •••• 4242</span>
                <Badge className="ml-auto rounded bg-blue-500/10 text-blue-500 text-[10px]">VISA</Badge>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayment(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBookAppointment}
              disabled={isBooking}
              className="gradient-primary text-white border-0"
            >
              {isBooking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm & Pay
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
