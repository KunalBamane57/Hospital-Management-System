import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1000 },
});

const Counter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI in .env.local");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const counterNames = ["patientId", "doctorId"];

    for (const name of counterNames) {
      const exists = await Counter.findById(name);
      if (!exists) {
        await Counter.create({ _id: name, seq: 1000 });
        console.log(`Created counter for ${name}`);
      } else {
        console.log(`Counter for ${name} already exists`);
      }
    }

    console.log("Seed complete.");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
    process.exit(0);
  }
}

seed();
