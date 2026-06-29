// ============================================
// Doctor Model
// ============================================

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAvailableSlot {
  day: string;
  slots: string[];
}

export interface IDoctor extends Document {
  user: Types.ObjectId;
  userId: string; // DOC-1001
  specialization: string;
  qualification: string;
  experience: number;
  rating: number;
  totalReviews: number;
  consultationFee: number;
  bio: string;
  availableSlots: IAvailableSlot[];
  languages: string[];
  hospital: string;
  department: string;
  createdAt: Date;
  updatedAt: Date;
}

const AvailableSlotSchema = new Schema<IAvailableSlot>(
  {
    day: { type: String, required: true },
    slots: { type: [String], default: [] },
  },
  { _id: false }
);

const DoctorSchema = new Schema<IDoctor>(
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
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
    },
    qualification: {
      type: String,
      required: [true, "Qualification is required"],
    },
    experience: {
      type: Number,
      required: [true, "Experience is required"],
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    consultationFee: {
      type: Number,
      required: [true, "Consultation fee is required"],
      min: 0,
    },
    bio: {
      type: String,
      default: "",
    },
    availableSlots: {
      type: [AvailableSlotSchema],
      default: [],
    },
    languages: {
      type: [String],
      default: ["English"],
    },
    hospital: {
      type: String,
      default: "MediCore General Hospital",
    },
    department: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Doctor: Model<IDoctor> =
  mongoose.models.Doctor || mongoose.model<IDoctor>("Doctor", DoctorSchema);

export default Doctor;
