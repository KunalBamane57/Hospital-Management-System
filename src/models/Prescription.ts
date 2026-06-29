// ============================================
// Prescription Model
// ============================================

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface IPrescription extends Document {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  medications: IMedication[];
  instructions: string;
  followUpDate: string;
  createdAt: Date;
  updatedAt: Date;
}

const MedicationSchema = new Schema<IMedication>(
  {
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String, default: "" },
  },
  { _id: false }
);

const PrescriptionSchema = new Schema<IPrescription>(
  {
    appointmentId: {
      type: String,
      required: true,
      index: true,
    },
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
    patientName: {
      type: String,
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    medications: {
      type: [MedicationSchema],
      default: [],
    },
    instructions: {
      type: String,
      default: "",
    },
    followUpDate: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Prescription: Model<IPrescription> =
  mongoose.models.Prescription ||
  mongoose.model<IPrescription>("Prescription", PrescriptionSchema);

export default Prescription;
