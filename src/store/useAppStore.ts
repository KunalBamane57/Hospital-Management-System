// ============================================
// Zustand Store - Hospital Appointment Booking System
// ============================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  User,
  Patient,
  Doctor,
  Appointment,
  Prescription,
  Review,
  Notification,
  AppointmentStatus,
  PaymentStatus,
} from "@/types";
import {
  mockDoctors,
  mockPatients,
  mockAppointments,
  mockPrescriptions,
  mockReviews,
  mockNotifications,
} from "@/data/mock-data";

interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: "patient" | "doctor") => boolean;
  register: (data: Partial<Patient>) => boolean;
  logout: () => void;

  // Doctors
  doctors: Doctor[];
  getDoctorById: (id: string) => Doctor | undefined;

  // Patients
  patients: Patient[];
  getPatientById: (id: string) => Patient | undefined;

  // Appointments
  appointments: Appointment[];
  getAppointmentsByPatient: (patientId: string) => Appointment[];
  getAppointmentsByDoctor: (doctorId: string) => Appointment[];
  getUpcomingAppointments: (userId: string, role: "patient" | "doctor") => Appointment[];
  bookAppointment: (appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">) => void;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => void;
  updatePaymentStatus: (appointmentId: string, status: PaymentStatus) => void;
  rescheduleAppointment: (appointmentId: string, newDate: string, newTime: string) => void;
  addDiagnosis: (appointmentId: string, diagnosis: string, notes: string) => void;

  // Prescriptions
  prescriptions: Prescription[];
  getPrescriptionsByPatient: (patientId: string) => Prescription[];
  getPrescriptionsByDoctor: (doctorId: string) => Prescription[];
  addPrescription: (prescription: Omit<Prescription, "id" | "createdAt">) => void;

  // Reviews
  reviews: Review[];
  getReviewsByDoctor: (doctorId: string) => Review[];
  addReview: (review: Omit<Review, "id" | "createdAt">) => void;

  // Notifications
  notifications: Notification[];
  getNotificationsByUser: (userId: string) => Notification[];
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void;

  // Profile
  updateProfile: (userId: string, data: Partial<User>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ---- Auth State ----
      currentUser: null,
      isAuthenticated: false,

      login: (email: string, _password: string, role: "patient" | "doctor") => {
        if (role === "patient") {
          const patient = mockPatients.find((p) => p.email === email);
          if (patient) {
            set({ currentUser: patient, isAuthenticated: true });
            return true;
          }
        } else {
          const doctor = mockDoctors.find((d) => d.email === email);
          if (doctor) {
            set({ currentUser: doctor, isAuthenticated: true });
            return true;
          }
        }
        // For demo: allow any email login
        const demoUser: User =
          role === "patient"
            ? { ...mockPatients[0], email }
            : { ...mockDoctors[0], email };
        set({ currentUser: demoUser, isAuthenticated: true });
        return true;
      },

      register: (data: Partial<Patient>) => {
        const newPatient: Patient = {
          id: `pat-${Date.now()}`,
          name: data.name || "New Patient",
          email: data.email || "",
          role: "patient",
          phone: data.phone || "",
          avatar: "/avatars/patient-1.jpg",
          dateOfBirth: data.dateOfBirth || "",
          gender: data.gender || "other",
          bloodGroup: data.bloodGroup || "O+",
          address: data.address || "",
          emergencyContact: data.emergencyContact || "",
          medicalHistory: [],
          allergies: [],
          createdAt: new Date().toISOString().split("T")[0],
        };
        set((state) => ({
          patients: [...state.patients, newPatient],
          currentUser: newPatient,
          isAuthenticated: true,
        }));
        return true;
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },

      // ---- Doctors ----
      doctors: mockDoctors,
      getDoctorById: (id: string) => get().doctors.find((d) => d.id === id),

      // ---- Patients ----
      patients: mockPatients,
      getPatientById: (id: string) => get().patients.find((p) => p.id === id),

      // ---- Appointments ----
      appointments: mockAppointments,

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

      bookAppointment: (appointment) => {
        const newAppointment: Appointment = {
          ...appointment,
          id: `apt-${Date.now()}`,
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
        };
        set((state) => ({
          appointments: [...state.appointments, newAppointment],
        }));
      },

      updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => {
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === appointmentId
              ? { ...a, status, updatedAt: new Date().toISOString().split("T")[0] }
              : a
          ),
        }));
      },

      updatePaymentStatus: (appointmentId: string, status: PaymentStatus) => {
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === appointmentId
              ? { ...a, paymentStatus: status, updatedAt: new Date().toISOString().split("T")[0] }
              : a
          ),
        }));
      },

      rescheduleAppointment: (appointmentId: string, newDate: string, newTime: string) => {
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === appointmentId
              ? {
                  ...a,
                  date: newDate,
                  time: newTime,
                  status: "rescheduled" as AppointmentStatus,
                  updatedAt: new Date().toISOString().split("T")[0],
                }
              : a
          ),
        }));
      },

      addDiagnosis: (appointmentId: string, diagnosis: string, notes: string) => {
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === appointmentId
              ? {
                  ...a,
                  diagnosis,
                  notes,
                  updatedAt: new Date().toISOString().split("T")[0],
                }
              : a
          ),
        }));
      },

      // ---- Prescriptions ----
      prescriptions: mockPrescriptions,

      getPrescriptionsByPatient: (patientId: string) =>
        get().prescriptions.filter((p) => p.patientId === patientId),

      getPrescriptionsByDoctor: (doctorId: string) =>
        get().prescriptions.filter((p) => p.doctorId === doctorId),

      addPrescription: (prescription) => {
        const newPrescription: Prescription = {
          ...prescription,
          id: `presc-${Date.now()}`,
          createdAt: new Date().toISOString().split("T")[0],
        };
        set((state) => ({
          prescriptions: [...state.prescriptions, newPrescription],
          appointments: state.appointments.map((a) =>
            a.id === prescription.appointmentId
              ? { ...a, prescriptionId: newPrescription.id }
              : a
          ),
        }));
      },

      // ---- Reviews ----
      reviews: mockReviews,

      getReviewsByDoctor: (doctorId: string) =>
        get().reviews.filter((r) => r.doctorId === doctorId),

      addReview: (review) => {
        const newReview: Review = {
          ...review,
          id: `rev-${Date.now()}`,
          createdAt: new Date().toISOString().split("T")[0],
        };
        set((state) => {
          const doctorReviews = [...state.reviews.filter((r) => r.doctorId === review.doctorId), newReview];
          const avgRating =
            doctorReviews.reduce((sum, r) => sum + r.rating, 0) / doctorReviews.length;
          return {
            reviews: [...state.reviews, newReview],
            doctors: state.doctors.map((d) =>
              d.id === review.doctorId
                ? { ...d, rating: Math.round(avgRating * 10) / 10, totalReviews: d.totalReviews + 1 }
                : d
            ),
          };
        });
      },

      // ---- Notifications ----
      notifications: mockNotifications,

      getNotificationsByUser: (userId: string) =>
        get()
          .notifications.filter((n) => n.userId === userId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

      markNotificationRead: (notificationId: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        }));
      },

      markAllNotificationsRead: (userId: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.userId === userId ? { ...n, read: true } : n
          ),
        }));
      },

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}`,
          createdAt: new Date().toISOString().split("T")[0],
        };
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));
      },

      // ---- Profile ----
      updateProfile: (userId: string, data: Partial<User>) => {
        set((state) => {
          const isDoctor = state.currentUser?.role === "doctor";
          const updatedUser = state.currentUser?.id === userId
            ? { ...state.currentUser, ...data }
            : state.currentUser;

          if (isDoctor) {
            return {
              doctors: state.doctors.map((d) =>
                d.id === userId ? { ...d, ...data, role: "doctor" as const } : d
              ),
              currentUser: updatedUser,
            };
          }
          return {
            patients: state.patients.map((p) =>
              p.id === userId ? { ...p, ...data, role: "patient" as const } as Patient : p
            ),
            currentUser: updatedUser,
          };
        });
      },
    }),
    {
      name: "hospital-booking-store",
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
