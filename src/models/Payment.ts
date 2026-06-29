// ============================================
// Payment Model
// ============================================

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  amount: number;
  status: "pending" | "completed" | "refunded" | "failed";
  method: string;
  transactionId: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "refunded", "failed"],
      default: "pending",
    },
    method: {
      type: String,
      default: "card",
    },
    transactionId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
