// ============================================
// Appointment Model
// ============================================

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAppointment extends Document {
  patientId: string;
  doctorId: string;
  patientUser: Types.ObjectId;
  doctorUser: Types.ObjectId;
  patientName: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled";
  type: "in-person" | "video" | "phone";
  reason: string;
  notes: string;
  diagnosis: string;
  prescriptionId: string;
  paymentStatus: "pending" | "completed" | "refunded" | "failed";
  paymentAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: String,
      required: true,
      index: true,
    },
    doctorId: {
      type: String,
      required: true,
      index: true,
    },
    patientUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    doctorSpecialization: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "rescheduled"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["in-person", "video", "phone"],
      default: "in-person",
    },
    reason: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    diagnosis: {
      type: String,
      default: "",
    },
    prescriptionId: {
      type: String,
      default: "",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "refunded", "failed"],
      default: "pending",
    },
    paymentAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying appointments by doctor+date
AppointmentSchema.index({ doctorId: 1, date: 1 });

const Appointment: Model<IAppointment> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", AppointmentSchema);

export default Appointment;
