"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Star, Send, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function ReviewsPage() {
  const { currentUser, getAppointmentsByPatient, reviews, addReview, getDoctorById } = useAppStore();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) return null;

  const appointments = getAppointmentsByPatient(currentUser.id);
  const completedAppts = appointments.filter((a) => a.status === "completed");
  const reviewedAptIds = reviews.filter((r) => r.patientId === currentUser.id).map((r) => r.appointmentId);
  const unreviewedAppts = completedAppts.filter((a) => !reviewedAptIds.includes(a.id));
  const myReviews = reviews.filter((r) => r.patientId === currentUser.id);

  const handleSubmitReview = async () => {
    if (!rating || !comment.trim()) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    const apt = appointments.find((a) => a.id === selectedAptId);
    addReview({
      patientId: currentUser.id,
      doctorId: selectedDoctorId,
      patientName: currentUser.name,
      appointmentId: selectedAptId,
      rating,
      comment,
    });
    toast.success("Review Submitted!", {
      description: `Thank you for reviewing ${apt?.doctorName}`,
    });
    setShowReviewDialog(false);
    setRating(0);
    setComment("");
    setSelectedAptId("");
    setSelectedDoctorId("");
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="text-gradient">Reviews</span>
        </h1>
        <p className="text-muted-foreground mt-1">Rate your experience and help other patients</p>
      </div>

      {/* Pending Reviews */}
      {unreviewedAppts.length > 0 && (
        <Card className="border-0 shadow-sm border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="text-base">Pending Reviews</CardTitle>
            <CardDescription>Share your experience from recent visits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unreviewedAppts.map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 rounded-xl border p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="gradient-primary text-white text-sm">
                      {apt.doctorName.replace("Dr. ", "").split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{apt.doctorName}</p>
                    <p className="text-xs text-muted-foreground">{apt.doctorSpecialization} • {apt.date}</p>
                  </div>
                  <Button
                    size="sm"
                    className="gradient-primary text-white border-0 rounded-xl"
                    onClick={() => {
                      setSelectedAptId(apt.id);
                      setSelectedDoctorId(apt.doctorId);
                      setShowReviewDialog(true);
                    }}
                  >
                    <Star className="mr-1.5 h-3.5 w-3.5" />
                    Rate
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Reviews */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            My Reviews ({myReviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Star className="h-14 w-14 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-semibold">No Reviews Yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Your submitted reviews will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myReviews.map((review, i) => {
                const doctor = getDoctorById(review.doctorId);
                return (
                  <div
                    key={review.id}
                    className="rounded-xl border p-5 animate-slide-up"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11">
                          <AvatarFallback className="gradient-primary text-white text-sm">
                            {doctor?.name.replace("Dr. ", "").split(" ").map((n) => n[0]).join("") || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{doctor?.name}</p>
                          <p className="text-xs text-muted-foreground">{doctor?.specialization}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            className={`h-4 w-4 ${j < review.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/20"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{review.createdAt}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>Share your experience to help others</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center gap-1 py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i + 1)}
                  className="p-1 transition-transform hover:scale-125"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      i < (hoverRating || rating)
                        ? "text-amber-500 fill-amber-500"
                        : "text-muted-foreground/20"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm font-medium">
              {rating === 0 ? "Select a rating" : rating === 5 ? "Excellent!" : rating === 4 ? "Very Good" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
            </p>
            <Textarea
              placeholder="Write your review here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="rounded-xl min-h-24"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSubmitReview}
              disabled={!rating || !comment.trim() || isSubmitting}
              className="gradient-primary text-white border-0"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
