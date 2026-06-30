// Quick script to fix admin role if it was set to super_admin
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI!;

async function fixRoles() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected");

  const User = mongoose.connection.collection("users");

  // Fix any super_admin or receptionist roles to admin
  const result = await User.updateMany(
    { role: { $in: ["super_admin", "receptionist"] } },
    { $set: { role: "admin" } }
  );
  console.log(`Updated ${result.modifiedCount} users to admin role`);

  // Make sure all users have isActive field
  const result2 = await User.updateMany(
    { isActive: { $exists: false } },
    { $set: { isActive: true } }
  );
  console.log(`Added isActive to ${result2.modifiedCount} users`);

  // Show current users
  const users = await User.find({}, { projection: { userId: 1, email: 1, role: 1, isActive: 1 } }).toArray();
  console.log("\n📋 Current users:");
  users.forEach((u) => console.log(`  ${u.userId} | ${u.email} | ${u.role} | active: ${u.isActive}`));

  await mongoose.disconnect();
  console.log("\n🔌 Done");
  process.exit(0);
}

fixRoles();
