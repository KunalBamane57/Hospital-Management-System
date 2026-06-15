// ============================================
// Hospital Appointment Booking System - Types
// ============================================

export type UserRole = "patient" | "doctor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar: string;
  createdAt: string;
}

export interface Patient extends User {
  role: "patient";
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  bloodGroup: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string[];
  allergies: string[];
  insuranceId?: string;
}

export interface Doctor extends User {
  role: "doctor";
  specialization: string;
  qualification: string;
  experience: number;
  rating: number;
  totalReviews: number;
  consultationFee: number;
  bio: string;
  availableSlots: AvailableSlot[];
  languages: string[];
  hospital: string;
  department: string;
}

export interface AvailableSlot {
  day: string;
  slots: string[];
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "rescheduled";

export type PaymentStatus = "pending" | "completed" | "refunded" | "failed";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  type: "in-person" | "video" | "phone";
  reason: string;
  notes?: string;
  diagnosis?: string;
  prescriptionId?: string;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  medications: Medication[];
  instructions: string;
  followUpDate?: string;
  createdAt: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Review {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  appointmentId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "appointment" | "prescription" | "payment" | "review" | "system";
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue?: number;
  totalPatients?: number;
  averageRating?: number;
}
