"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/store/useAppStore";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Star, MessageSquare, TrendingUp, Users } from "lucide-react";
import { Doctor } from "@/types";

export default function DoctorReviewsPage() {
  const { data: session } = useSession();
  const { reviews, fetchReviews, fetchDoctorById } = useAppStore();
  const [doctor, setDoctor] = useState<any>(null);

  useEffect(() => {
    if (session?.user?.userId) {
      fetchReviews();
      fetchDoctorById(session.user.userId).then((d: any) => setDoctor(d));
    }
  }, [session?.user?.userId, fetchReviews, fetchDoctorById]);

  if (!session?.user || !doctor) return null;
  const myReviews = reviews.filter((r) => r.doctorId === session.user.userId);

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: myReviews.filter((rev) => rev.rating === r).length,
    percentage: myReviews.length > 0 ? (myReviews.filter((rev) => rev.rating === r).length / myReviews.length) * 100 : 0,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="text-gradient">Reviews & Ratings</span>
        </h1>
        <p className="text-muted-foreground mt-1">See what your patients are saying about you</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Overall Rating"
          value={doctor.rating as number}
          icon={Star}
          iconClassName="bg-amber-500/10 text-amber-500"
          description={`Based on ${doctor.totalReviews as number} reviews`}
        />
        <StatCard
          title="Total Reviews"
          value={myReviews.length}
          icon={MessageSquare}
          iconClassName="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          title="5-Star Reviews"
          value={myReviews.filter((r) => r.rating === 5).length}
          icon={TrendingUp}
          iconClassName="bg-emerald-500/10 text-emerald-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Rating Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ratingDist.map((item) => (
              <div key={item.rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-8">
                  <span className="text-sm font-medium">{item.rating}</span>
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                </div>
                <Progress value={item.percentage} className="flex-1 h-2.5" />
                <span className="text-xs text-muted-foreground w-6 text-right">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Reviews List */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Patient Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {myReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Star className="h-14 w-14 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-semibold">No Reviews Yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Patient reviews will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myReviews.map((review, i) => (
                  <div key={review.id} className="rounded-xl border p-4 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {review.patientName.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{review.patientName}</p>
                          <p className="text-xs text-muted-foreground">{review.createdAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`h-3.5 w-3.5 ${j < review.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/20"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
