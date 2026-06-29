"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Star,
  Bell,
  Settings,
  LogOut,
  Menu,
  Heart,
  Stethoscope,
  ClipboardList,
  Clock,
  CreditCard,
  UserCircle,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";

const patientNavItems = [
  { href: "/patient/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/patient/doctors", icon: Stethoscope, label: "Find Doctors" },
  { href: "/patient/appointments", icon: Calendar, label: "Appointments" },
  { href: "/patient/prescriptions", icon: FileText, label: "Prescriptions" },
  { href: "/patient/payments", icon: CreditCard, label: "Payments" },
  { href: "/patient/reviews", icon: Star, label: "Reviews" },
  { href: "/patient/profile", icon: UserCircle, label: "Profile" },
];

const doctorNavItems = [
  { href: "/doctor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/doctor/appointments", icon: Calendar, label: "Appointments" },
  { href: "/doctor/patients", icon: Users, label: "Patients" },
  { href: "/doctor/prescriptions", icon: ClipboardList, label: "Prescriptions" },
  { href: "/doctor/availability", icon: Clock, label: "Availability" },
  { href: "/doctor/reviews", icon: Star, label: "Reviews" },
  { href: "/doctor/profile", icon: UserCircle, label: "Profile" },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { notifications, fetchNotifications } = useAppStore();

  const user = session?.user;
  const isDoctor = user?.role === "doctor";
  const navItems = isDoctor ? doctorNavItems : patientNavItems;

  useEffect(() => {
    if (user?.userId) {
      fetchNotifications();
    }
  }, [user?.userId, fetchNotifications]);

  const unreadNotifications = user?.userId
    ? notifications.filter((n) => n.userId === user.userId && !n.read).length
    : 0;

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-primary/25">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">
            Medi<span className="text-gradient">Core</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {isDoctor ? "Doctor Portal" : "Patient Portal"}
          </p>
        </div>
      </div>

      <Separator className="mx-4" />

      {/* User ID Badge */}
      {user?.userId && (
        <div className="px-6 py-3">
          <Badge variant="outline" className="text-xs font-mono">
            ID: {user.userId}
          </Badge>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "gradient-primary text-white shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Separator className="my-4" />

        {/* Secondary nav */}
        <nav className="space-y-1">
          <Link
            href={`/${user?.role}/notifications`}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
              pathname.includes("/notifications")
                ? "gradient-primary text-white shadow-md shadow-primary/25"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Bell className="h-4.5 w-4.5" />
            Notifications
            {unreadNotifications > 0 && (
              <Badge className="ml-auto h-5 min-w-5 rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white">
                {unreadNotifications}
              </Badge>
            )}
          </Link>
          <Link
            href={`/${user?.role}/settings`}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
              pathname.includes("/settings")
                ? "gradient-primary text-white shadow-md shadow-primary/25"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Settings className="h-4.5 w-4.5" />
            Settings
          </Link>
        </nav>
      </ScrollArea>

      {/* User Profile Section */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarFallback className="gradient-primary text-sm font-bold text-white">
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-[280px] lg:flex-col lg:border-r lg:bg-card/50 lg:backdrop-blur-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-lg border border-border"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
