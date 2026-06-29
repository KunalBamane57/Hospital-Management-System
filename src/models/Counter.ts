// ============================================
// Counter Model - Auto-incrementing IDs
// ============================================

import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICounter extends Omit<Document, "_id"> {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1000 },
});

const Counter: Model<ICounter> =
  mongoose.models.Counter || mongoose.model<ICounter>("Counter", CounterSchema);

export default Counter;

/**
 * Get the next sequence number for a given counter name.
 * Used to generate unique IDs like PAT-1001, DOC-1001, etc.
 */
export async function getNextSequence(name: string): Promise<number> {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}
