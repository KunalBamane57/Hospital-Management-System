// ============================================
// Zustand Store - Hospital Appointment Booking System
// Now integrated with MongoDB via API routes
// ============================================

import { create } from "zustand";
import {
  Doctor,
  Appointment,
  Prescription,
  Review,
  Notification,
  AppointmentStatus,
  PaymentStatus,
} from "@/types";

interface AppState {
  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Doctors
  doctors: Doctor[];
  fetchDoctors: (specialization?: string, search?: string) => Promise<void>;
  getDoctorById: (id: string) => Doctor | undefined;
  fetchDoctorById: (id: string) => Promise<Doctor | null>;

  // Appointments
  appointments: Appointment[];
  fetchAppointments: (status?: string) => Promise<void>;
  getAppointmentsByPatient: (patientId: string) => Appointment[];
  getAppointmentsByDoctor: (doctorId: string) => Appointment[];
  getUpcomingAppointments: (userId: string, role: "patient" | "doctor") => Appointment[];
  bookAppointment: (appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">) => Promise<boolean>;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => Promise<void>;
  updatePaymentStatus: (appointmentId: string, status: PaymentStatus) => Promise<void>;
  rescheduleAppointment: (appointmentId: string, newDate: string, newTime: string) => Promise<void>;
  addDiagnosis: (appointmentId: string, diagnosis: string, notes: string) => Promise<void>;

  // Prescriptions
  prescriptions: Prescription[];
  fetchPrescriptions: () => Promise<void>;
  getPrescriptionsByPatient: (patientId: string) => Prescription[];
  getPrescriptionsByDoctor: (doctorId: string) => Prescription[];
  addPrescription: (prescription: Omit<Prescription, "id" | "createdAt">) => Promise<boolean>;

  // Reviews
  reviews: Review[];
  fetchReviews: (doctorId?: string) => Promise<void>;
  getReviewsByDoctor: (doctorId: string) => Review[];
  addReview: (review: Omit<Review, "id" | "createdAt">) => Promise<boolean>;

  // Notifications
  notifications: Notification[];
  fetchNotifications: () => Promise<void>;
  getNotificationsByUser: (userId: string) => Notification[];
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: (userId: string) => Promise<void>;
}

export const useAppStore = create<AppState>()((set, get) => ({
  // ---- Loading ----
  isLoading: false,
  setLoading: (loading: boolean) => set({ isLoading: loading }),

  // ---- Doctors ----
  doctors: [],

  fetchDoctors: async (specialization?: string, search?: string) => {
    try {
      const params = new URLSearchParams();
      if (specialization) params.set("specialization", specialization);
      if (search) params.set("search", search);
      const res = await fetch(`/api/doctors?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        set({ doctors: data });
      }
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    }
  },

  getDoctorById: (id: string) => get().doctors.find((d) => d.id === id),

  fetchDoctorById: async (id: string) => {
    try {
      const res = await fetch(`/api/doctors?id=${id}`);
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch doctor:", error);
      return null;
    }
  },

  // ---- Appointments ----
  appointments: [],

  fetchAppointments: async (status?: string) => {
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      const res = await fetch(`/api/appointments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        set({ appointments: data });
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  },

  getAppointmentsByPatient: (patientId: string) =>
    get().appointments.filter((a) => a.patientId === patientId),

  getAppointmentsByDoctor: (doctorId: string) =>
    get().appointments.filter((a) => a.doctorId === doctorId),

  getUpcomingAppointments: (userId: string, role: "patient" | "doctor") => {
    const today = new Date().toISOString().split("T")[0];
    return get()
      .appointments.filter(
        (a) =>
          (role === "patient" ? a.patientId === userId : a.doctorId === userId) &&
          a.date >= today &&
          (a.status === "confirmed" || a.status === "pending")
      )
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  },

  bookAppointment: async (appointment) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointment),
      });
      if (res.ok) {
        await get().fetchAppointments();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to book appointment:", error);
      return false;
    }
  },

  updateAppointmentStatus: async (appointmentId: string, status: AppointmentStatus) => {
    try {
      await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, status }),
      });
      await get().fetchAppointments();
    } catch (error) {
      console.error("Failed to update appointment:", error);
    }
  },

  updatePaymentStatus: async (appointmentId: string, paymentStatus: PaymentStatus) => {
    try {
      await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, paymentStatus }),
      });
      await get().fetchAppointments();
    } catch (error) {
      console.error("Failed to update payment:", error);
    }
  },

  rescheduleAppointment: async (appointmentId: string, newDate: string, newTime: string) => {
    try {
      await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, date: newDate, time: newTime }),
      });
      await get().fetchAppointments();
    } catch (error) {
      console.error("Failed to reschedule:", error);
    }
  },

  addDiagnosis: async (appointmentId: string, diagnosis: string, notes: string) => {
    try {
      await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, diagnosis, notes }),
      });
      await get().fetchAppointments();
    } catch (error) {
      console.error("Failed to add diagnosis:", error);
    }
  },

  // ---- Prescriptions ----
  prescriptions: [],

  fetchPrescriptions: async () => {
    try {
      const res = await fetch("/api/prescriptions");
      if (res.ok) {
        const data = await res.json();
        set({ prescriptions: data });
      }
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error);
    }
  },

  getPrescriptionsByPatient: (patientId: string) =>
    get().prescriptions.filter((p) => p.patientId === patientId),

  getPrescriptionsByDoctor: (doctorId: string) =>
    get().prescriptions.filter((p) => p.doctorId === doctorId),

  addPrescription: async (prescription) => {
    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prescription),
      });
      if (res.ok) {
        await get().fetchPrescriptions();
        await get().fetchAppointments();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to add prescription:", error);
      return false;
    }
  },

  // ---- Reviews ----
  reviews: [],

  fetchReviews: async (doctorId?: string) => {
    try {
      const params = new URLSearchParams();
      if (doctorId) params.set("doctorId", doctorId);
      const res = await fetch(`/api/reviews?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        set({ reviews: data });
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  },

  getReviewsByDoctor: (doctorId: string) =>
    get().reviews.filter((r) => r.doctorId === doctorId),

  addReview: async (review) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review),
      });
      if (res.ok) {
        await get().fetchReviews();
        await get().fetchDoctors();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to add review:", error);
      return false;
    }
  },

  // ---- Notifications ----
  notifications: [],

  fetchNotifications: async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        set({ notifications: data });
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  },

  getNotificationsByUser: (userId: string) =>
    get()
      .notifications.filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

  markNotificationRead: async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
      }));
    } catch (error) {
      console.error("Failed to mark notification read:", error);
    }
  },

  markAllNotificationsRead: async (userId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.userId === userId ? { ...n, read: true } : n
        ),
      }));
    } catch (error) {
      console.error("Failed to mark all notifications read:", error);
    }
  },
}));
