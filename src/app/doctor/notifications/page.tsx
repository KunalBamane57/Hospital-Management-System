"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, FileText, CreditCard, Star, CheckCheck } from "lucide-react";

export default function DoctorNotificationsPage() {
  const { data: session } = useSession();
  const { notifications, fetchNotifications, markNotificationRead, markAllNotificationsRead } = useAppStore();

  useEffect(() => {
    if (session?.user?.userId) {
      fetchNotifications();
    }
  }, [session?.user?.userId, fetchNotifications]);

  if (!session?.user) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "appointment": return <Calendar className="h-4 w-4" />;
      case "prescription": return <FileText className="h-4 w-4" />;
      case "payment": return <CreditCard className="h-4 w-4" />;
      case "review": return <Star className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "appointment": return "bg-blue-500/10 text-blue-500";
      case "prescription": return "bg-purple-500/10 text-purple-500";
      case "payment": return "bg-emerald-500/10 text-emerald-500";
      case "review": return "bg-amber-500/10 text-amber-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="text-gradient">Notifications</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllNotificationsRead(session.user.userId)} className="rounded-xl">
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Bell className="h-16 w-16 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-semibold">No Notifications</h3>
              <p className="text-sm text-muted-foreground mt-1">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif, i) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && markNotificationRead(notif.id)}
                  className={`group flex items-start gap-3 rounded-xl p-4 transition-all cursor-pointer animate-slide-up ${
                    !notif.read ? "bg-primary/5 hover:bg-primary/8" : "hover:bg-muted/50"
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${getIconBg(notif.type)}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notif.read ? "font-semibold" : "font-medium"}`}>{notif.title}</p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{notif.createdAt}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                  </div>
                  {!notif.read && <span className="h-2.5 w-2.5 rounded-full bg-primary mt-2 shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
