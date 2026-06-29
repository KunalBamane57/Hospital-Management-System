// ============================================
// Patient Model
// ============================================

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPatient extends Document {
  user: Types.ObjectId;
  userId: string; // PAT-1001
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  bloodGroup: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string[];
  allergies: string[];
  insuranceId: string;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    dateOfBirth: {
      type: String,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Gender is required"],
    },
    bloodGroup: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    emergencyContact: {
      type: String,
      default: "",
    },
    medicalHistory: {
      type: [String],
      default: [],
    },
    allergies: {
      type: [String],
      default: [],
    },
    insuranceId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Patient: Model<IPatient> =
  mongoose.models.Patient || mongoose.model<IPatient>("Patient", PatientSchema);

export default Patient;
