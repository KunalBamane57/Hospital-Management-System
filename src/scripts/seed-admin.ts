// ============================================
// Seed Admin User Script
// Run: npx tsx src/scripts/seed-admin.ts
// ============================================

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["patient", "doctor", "admin"], required: true },
    phone: { type: String, required: true, trim: true },
    avatar: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1000 },
});

async function seedAdmin() {
  try {
    console.log("🔌 Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");

    const User = mongoose.models.User || mongoose.model("User", UserSchema);
    const Counter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

    const adminEmail = "admin@medicore.com";
    const adminPassword = "admin123";

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log(`⏭️  Admin (${adminEmail}) already exists — skipping`);
    } else {
      const counter = await Counter.findByIdAndUpdate(
        "adminId",
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const userId = `ADM-${counter.seq}`;
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      await User.create({
        userId,
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        phone: "+1-555-0001",
        avatar: "",
        isActive: true,
      });

      console.log(`✅ Created admin: ${adminEmail} (ID: ${userId})`);
    }

    console.log("\n🎉 Admin seeding complete!");
    console.log("\n📋 Login Credentials:");
    console.log("─────────────────────────────────────");
    console.log("Admin: admin@medicore.com / admin123");
    console.log("─────────────────────────────────────\n");
  } catch (error) {
    console.error("❌ Seeding error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

seedAdmin();
