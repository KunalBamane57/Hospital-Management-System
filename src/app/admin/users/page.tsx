"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users, Search, Shield, UserCheck, UserX, RefreshCw,
  Stethoscope, User, Trash2, Filter,
} from "lucide-react";
import { toast } from "sonner";

interface UserData {
  _id: string;
  userId: string;
  name: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  phone: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  patient: User,
  doctor: Stethoscope,
  admin: Shield,
};

const ROLE_BADGE: Record<string, string> = {
  patient: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  doctor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  admin: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
};

const ROLE_LABELS: Record<string, string> = {
  patient: "Patient",
  doctor: "Doctor",
  admin: "Admin",
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("Failed to load users");
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAction = async (userId: string, action: string, newRole?: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, action, newRole }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || "User updated");
        fetchUsers();
      } else {
        toast.error(json.error || "Failed to update user");
      }
    } catch {
      toast.error("An error occurred");
    }
    setActionLoading(null);
  };

  const handleDelete = async (userId: string, userName: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok) {
        toast.success(`${userName} deleted successfully`);
        fetchUsers();
      } else {
        toast.error(json.error || "Failed to delete user");
      }
    } catch {
      toast.error("An error occurred while deleting");
    }
    setActionLoading(null);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive !== false) ||
      (statusFilter === "inactive" && user.isActive === false);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const roleCounts = users.reduce(
    (acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; },
    {} as Record<string, number>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            User <span className="text-gradient">Management</span>
          </h1>
          <p className="mt-1 text-muted-foreground">Manage roles, status, and delete users</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Role Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        {(["patient", "doctor", "admin"] as const).map((role) => {
          const Icon = ROLE_ICONS[role];
          const colors = { patient: "from-blue-500 to-indigo-600", doctor: "from-emerald-500 to-teal-600", admin: "from-purple-500 to-violet-600" };
          return (
            <Card key={role}
              className={`cursor-pointer border-0 shadow-md transition-all duration-200 hover:shadow-lg ${roleFilter === role ? "ring-2 ring-primary" : ""}`}
              onClick={() => setRoleFilter(roleFilter === role ? "all" : role)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${colors[role]} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{roleCounts[role] || 0}</p>
                    <p className="text-xs text-muted-foreground">{ROLE_LABELS[role]}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, email, or ID..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} className="h-10 pl-9 rounded-xl" />
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={(val) => setRoleFilter((val as string) || "all")}>
                <SelectTrigger className="w-[140px] h-10 rounded-xl">
                  <Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter((val as string) || "all")}>
                <SelectTrigger className="w-[130px] h-10 rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" /> Users
            <Badge variant="outline" className="ml-2 font-mono text-xs">
              {filteredUsers.length} of {users.length}
            </Badge>
          </CardTitle>
          <CardDescription>Manage all registered users — change roles, deactivate, or delete</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Users className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No users found matching your criteria</p>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const Icon = ROLE_ICONS[user.role] || User;
                const isCurrentUser = user._id === (session?.user as any)?.dbId;
                const canModify = !isCurrentUser && user.role !== "admin";

                return (
                  <div key={user._id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/50 transition-colors">
                    {/* User info */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/10">
                        <AvatarFallback className="text-xs font-bold gradient-primary text-white">
                          {user.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">
                            {user.name}
                            {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(you)</span>}
                          </p>
                          {user.isActive === false && (
                            <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px]">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <p className="text-xs text-muted-foreground font-mono">{user.userId}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <Badge className={`${ROLE_BADGE[user.role]} text-xs gap-1`}>
                        <Icon className="h-3 w-3" /> {ROLE_LABELS[user.role]}
                      </Badge>

                      {canModify && (
                        <>
                          {/* Role change */}
                          <Select onValueChange={(newRole) => { if (newRole) handleAction(user._id, "change_role", newRole as string); }}>
                            <SelectTrigger className="w-[120px] h-8 text-xs rounded-lg">
                              <SelectValue placeholder="Change role" />
                            </SelectTrigger>
                            <SelectContent>
                              {["patient", "doctor", "admin"]
                                .filter((r) => r !== user.role)
                                .map((r) => (
                                  <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>

                          {/* Activate / Deactivate */}
                          <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg gap-1"
                            disabled={actionLoading === user._id}
                            onClick={() => handleAction(user._id, user.isActive === false ? "activate" : "deactivate")}>
                            {user.isActive === false ? (
                              <><UserCheck className="h-3 w-3 text-emerald-500" /> Activate</>
                            ) : (
                              <><UserX className="h-3 w-3 text-red-500" /> Deactivate</>
                            )}
                          </Button>

                          {/* Delete with confirmation */}
                          <AlertDialog>
                            <AlertDialogTrigger render={<Button size="sm" variant="outline" className="h-8 text-xs rounded-lg gap-1 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600" disabled={actionLoading === user._id} />}>
                              <Trash2 className="h-3 w-3" /> Delete
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User Permanently?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete <strong>{user.name}</strong> ({user.userId})
                                  and all associated data including appointments, prescriptions, reviews,
                                  and payments. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(user._id, user.name)}
                                  className="bg-red-500 hover:bg-red-600 text-white">
                                  Delete Permanently
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
