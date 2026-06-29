// ============================================
// Database Seed Script
// Run: npx tsx src/scripts/seed.ts
// ============================================

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

// Load variables from .env.local
config({ path: ".env.local" });

// Direct import paths (script runs outside Next.js)
const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found. Set it in .env.local or as environment variable.");
  process.exit(1);
}

async function seed() {
  console.log("🌱 Starting database seed...\n");

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  const db = mongoose.connection.db!;

  // Clear existing data
  const collections = ["users", "patients", "doctors", "appointments", "prescriptions", "reviews", "payments", "notifications", "counters"];
  for (const col of collections) {
    try {
      await db.collection(col).drop();
      console.log(`  🗑️  Dropped ${col}`);
    } catch {
      // Collection may not exist
    }
  }
  console.log("");

  // ---- Create Counters ----
  await db.collection("counters").insertMany([
    { _id: "patientId" as any, seq: 1003 },
    { _id: "doctorId" as any, seq: 1006 },
  ]);
  console.log("✅ Counters created");

  // ---- Hash password ----
  const password = await bcrypt.hash("password123", 12);

  // ---- Create Doctors ----
  const doctorUsers = [
    { userId: "DOC-1001", name: "Dr. Sarah Chen", email: "sarah.chen@medicore.com", role: "doctor", phone: "+1-555-0101", avatar: "", password },
    { userId: "DOC-1002", name: "Dr. James Wilson", email: "james.wilson@medicore.com", role: "doctor", phone: "+1-555-0102", avatar: "", password },
    { userId: "DOC-1003", name: "Dr. Priya Patel", email: "priya.patel@medicore.com", role: "doctor", phone: "+1-555-0103", avatar: "", password },
    { userId: "DOC-1004", name: "Dr. Michael Roberts", email: "michael.roberts@medicore.com", role: "doctor", phone: "+1-555-0104", avatar: "", password },
    { userId: "DOC-1005", name: "Dr. Emily Thompson", email: "emily.thompson@medicore.com", role: "doctor", phone: "+1-555-0105", avatar: "", password },
    { userId: "DOC-1006", name: "Dr. Alexander Kim", email: "alex.kim@medicore.com", role: "doctor", phone: "+1-555-0106", avatar: "", password },
  ];

  const insertedDoctorUsers = await db.collection("users").insertMany(doctorUsers);
  const doctorUserIds = Object.values(insertedDoctorUsers.insertedIds);
  console.log(`✅ ${doctorUsers.length} doctor users created`);

  const doctorProfiles = [
    {
      user: doctorUserIds[0], userId: "DOC-1001", specialization: "Cardiology", qualification: "MD, FACC",
      experience: 15, rating: 4.9, totalReviews: 234, consultationFee: 250,
      bio: "Board-certified cardiologist with 15+ years of experience in interventional cardiology and cardiac imaging.",
      languages: ["English", "Mandarin"], hospital: "MediCore General Hospital", department: "Cardiology",
      availableSlots: [
        { day: "Monday", slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"] },
        { day: "Tuesday", slots: ["09:00", "09:30", "10:00", "14:00", "14:30", "15:00", "15:30"] },
        { day: "Wednesday", slots: ["09:00", "10:00", "10:30", "11:00", "14:00", "15:00"] },
        { day: "Thursday", slots: ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30"] },
        { day: "Friday", slots: ["09:00", "09:30", "10:00", "10:30", "11:00"] },
      ],
    },
    {
      user: doctorUserIds[1], userId: "DOC-1002", specialization: "Orthopedics", qualification: "MD, FAAOS",
      experience: 12, rating: 4.7, totalReviews: 189, consultationFee: 200,
      bio: "Orthopedic surgeon specializing in sports medicine, joint replacement, and minimally invasive procedures.",
      languages: ["English", "Spanish"], hospital: "MediCore General Hospital", department: "Orthopedics",
      availableSlots: [
        { day: "Monday", slots: ["10:00", "10:30", "11:00", "11:30", "14:00", "14:30"] },
        { day: "Tuesday", slots: ["09:00", "09:30", "10:00", "14:00", "14:30", "15:00"] },
        { day: "Wednesday", slots: ["09:00", "09:30", "10:00", "10:30", "11:00"] },
        { day: "Thursday", slots: ["10:00", "10:30", "14:00", "14:30", "15:00", "15:30"] },
        { day: "Friday", slots: ["09:00", "09:30", "10:00", "10:30"] },
      ],
    },
    {
      user: doctorUserIds[2], userId: "DOC-1003", specialization: "Dermatology", qualification: "MD, FAAD",
      experience: 10, rating: 4.8, totalReviews: 312, consultationFee: 180,
      bio: "Dermatologist with expertise in cosmetic dermatology, skin cancer, and autoimmune skin conditions.",
      languages: ["English", "Hindi", "Gujarati"], hospital: "MediCore General Hospital", department: "Dermatology",
      availableSlots: [
        { day: "Monday", slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"] },
        { day: "Tuesday", slots: ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00"] },
        { day: "Wednesday", slots: ["14:00", "14:30", "15:00", "15:30", "16:00"] },
        { day: "Thursday", slots: ["09:00", "09:30", "10:00", "10:30", "11:00"] },
        { day: "Friday", slots: ["09:00", "09:30", "10:00", "14:00", "14:30"] },
      ],
    },
    {
      user: doctorUserIds[3], userId: "DOC-1004", specialization: "Neurology", qualification: "MD, PhD, FAAN",
      experience: 20, rating: 4.9, totalReviews: 156, consultationFee: 300,
      bio: "Renowned neurologist specializing in movement disorders, epilepsy, and neurodegenerative diseases.",
      languages: ["English", "French"], hospital: "MediCore General Hospital", department: "Neurology",
      availableSlots: [
        { day: "Monday", slots: ["09:00", "09:30", "10:00", "14:00", "14:30"] },
        { day: "Tuesday", slots: ["10:00", "10:30", "11:00", "14:00", "14:30", "15:00"] },
        { day: "Wednesday", slots: ["09:00", "09:30", "10:00", "10:30"] },
        { day: "Thursday", slots: ["09:00", "09:30", "14:00", "14:30", "15:00"] },
      ],
    },
    {
      user: doctorUserIds[4], userId: "DOC-1005", specialization: "Pediatrics", qualification: "MD, FAAP",
      experience: 8, rating: 4.6, totalReviews: 278, consultationFee: 150,
      bio: "Compassionate pediatrician dedicated to child health and development.",
      languages: ["English"], hospital: "MediCore General Hospital", department: "Pediatrics",
      availableSlots: [
        { day: "Monday", slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30"] },
        { day: "Tuesday", slots: ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30"] },
        { day: "Wednesday", slots: ["09:00", "09:30", "10:00", "14:00", "14:30", "15:00"] },
        { day: "Thursday", slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00"] },
        { day: "Friday", slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"] },
      ],
    },
    {
      user: doctorUserIds[5], userId: "DOC-1006", specialization: "General Medicine", qualification: "MD, FACP",
      experience: 14, rating: 4.5, totalReviews: 445, consultationFee: 120,
      bio: "Internal medicine physician with broad experience in chronic disease management and preventive healthcare.",
      languages: ["English", "Korean"], hospital: "MediCore General Hospital", department: "Internal Medicine",
      availableSlots: [
        { day: "Monday", slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"] },
        { day: "Tuesday", slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"] },
        { day: "Wednesday", slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"] },
        { day: "Thursday", slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"] },
        { day: "Friday", slots: ["09:00", "09:30", "10:00", "10:30", "11:00"] },
      ],
    },
  ];

  await db.collection("doctors").insertMany(doctorProfiles);
  console.log(`✅ ${doctorProfiles.length} doctor profiles created`);

  // ---- Create Patients ----
  const patientUsers = [
    { userId: "PAT-1001", name: "John Anderson", email: "john@example.com", role: "patient", phone: "+1-555-0201", avatar: "", password },
    { userId: "PAT-1002", name: "Maria Garcia", email: "maria@example.com", role: "patient", phone: "+1-555-0202", avatar: "", password },
    { userId: "PAT-1003", name: "David Lee", email: "david@example.com", role: "patient", phone: "+1-555-0203", avatar: "", password },
  ];

  const insertedPatientUsers = await db.collection("users").insertMany(patientUsers);
  const patientUserIds = Object.values(insertedPatientUsers.insertedIds);
  console.log(`✅ ${patientUsers.length} patient users created`);

  const patientProfiles = [
    {
      user: patientUserIds[0], userId: "PAT-1001", dateOfBirth: "1990-05-15", gender: "male",
      bloodGroup: "O+", address: "123 Oak Street, Springfield, IL 62701", emergencyContact: "+1-555-0301",
      medicalHistory: ["Hypertension", "Seasonal allergies"], allergies: ["Penicillin"], insuranceId: "INS-2024-00123",
    },
    {
      user: patientUserIds[1], userId: "PAT-1002", dateOfBirth: "1985-08-22", gender: "female",
      bloodGroup: "A+", address: "456 Elm Drive, Austin, TX 78701", emergencyContact: "+1-555-0302",
      medicalHistory: ["Diabetes Type 2", "Asthma"], allergies: ["Sulfa drugs", "Latex"], insuranceId: "INS-2024-00456",
    },
    {
      user: patientUserIds[2], userId: "PAT-1003", dateOfBirth: "1978-12-03", gender: "male",
      bloodGroup: "B+", address: "789 Pine Avenue, Seattle, WA 98101", emergencyContact: "+1-555-0303",
      medicalHistory: ["High cholesterol", "Migraine"], allergies: [], insuranceId: "INS-2024-00789",
    },
  ];

  await db.collection("patients").insertMany(patientProfiles);
  console.log(`✅ ${patientProfiles.length} patient profiles created`);

  // ---- Create Appointments ----
  const appointments = [
    { patientId: "PAT-1001", doctorId: "DOC-1001", patientUser: patientUserIds[0], doctorUser: doctorUserIds[0], patientName: "John Anderson", doctorName: "Dr. Sarah Chen", doctorSpecialization: "Cardiology", date: "2026-06-15", time: "09:00", status: "confirmed", type: "in-person", reason: "Annual heart checkup and ECG", notes: "Patient reports occasional chest discomfort during exercise", diagnosis: "", prescriptionId: "", paymentStatus: "completed", paymentAmount: 250, createdAt: new Date("2026-06-01"), updatedAt: new Date("2026-06-02") },
    { patientId: "PAT-1001", doctorId: "DOC-1003", patientUser: patientUserIds[0], doctorUser: doctorUserIds[2], patientName: "John Anderson", doctorName: "Dr. Priya Patel", doctorSpecialization: "Dermatology", date: "2026-06-18", time: "10:30", status: "pending", type: "video", reason: "Persistent skin rash on arms", notes: "", diagnosis: "", prescriptionId: "", paymentStatus: "pending", paymentAmount: 180, createdAt: new Date("2026-06-05"), updatedAt: new Date("2026-06-05") },
    { patientId: "PAT-1002", doctorId: "DOC-1005", patientUser: patientUserIds[1], doctorUser: doctorUserIds[4], patientName: "Maria Garcia", doctorName: "Dr. Emily Thompson", doctorSpecialization: "Pediatrics", date: "2026-06-14", time: "14:00", status: "confirmed", type: "in-person", reason: "Child vaccination schedule", notes: "", diagnosis: "", prescriptionId: "", paymentStatus: "completed", paymentAmount: 150, createdAt: new Date("2026-06-03"), updatedAt: new Date("2026-06-04") },
    { patientId: "PAT-1001", doctorId: "DOC-1004", patientUser: patientUserIds[0], doctorUser: doctorUserIds[3], patientName: "John Anderson", doctorName: "Dr. Michael Roberts", doctorSpecialization: "Neurology", date: "2026-05-20", time: "10:00", status: "completed", type: "in-person", reason: "Recurring headaches and dizziness", notes: "", diagnosis: "Tension-type headaches, mild vestibular dysfunction", prescriptionId: "", paymentStatus: "completed", paymentAmount: 300, createdAt: new Date("2026-05-10"), updatedAt: new Date("2026-05-20") },
    { patientId: "PAT-1003", doctorId: "DOC-1002", patientUser: patientUserIds[2], doctorUser: doctorUserIds[1], patientName: "David Lee", doctorName: "Dr. James Wilson", doctorSpecialization: "Orthopedics", date: "2026-05-25", time: "11:00", status: "completed", type: "in-person", reason: "Knee pain after jogging", notes: "", diagnosis: "Mild patellar tendinitis", prescriptionId: "", paymentStatus: "completed", paymentAmount: 200, createdAt: new Date("2026-05-18"), updatedAt: new Date("2026-05-25") },
    { patientId: "PAT-1002", doctorId: "DOC-1001", patientUser: patientUserIds[1], doctorUser: doctorUserIds[0], patientName: "Maria Garcia", doctorName: "Dr. Sarah Chen", doctorSpecialization: "Cardiology", date: "2026-06-20", time: "14:30", status: "pending", type: "in-person", reason: "Follow-up: blood pressure monitoring", notes: "", diagnosis: "", prescriptionId: "", paymentStatus: "pending", paymentAmount: 250, createdAt: new Date("2026-06-08"), updatedAt: new Date("2026-06-08") },
    { patientId: "PAT-1001", doctorId: "DOC-1006", patientUser: patientUserIds[0], doctorUser: doctorUserIds[5], patientName: "John Anderson", doctorName: "Dr. Alexander Kim", doctorSpecialization: "General Medicine", date: "2026-04-15", time: "09:30", status: "completed", type: "video", reason: "General health checkup", notes: "", diagnosis: "Good overall health, slightly elevated blood sugar", prescriptionId: "", paymentStatus: "completed", paymentAmount: 120, createdAt: new Date("2026-04-05"), updatedAt: new Date("2026-04-15") },
    { patientId: "PAT-1003", doctorId: "DOC-1004", patientUser: patientUserIds[2], doctorUser: doctorUserIds[3], patientName: "David Lee", doctorName: "Dr. Michael Roberts", doctorSpecialization: "Neurology", date: "2026-06-25", time: "09:30", status: "confirmed", type: "phone", reason: "Follow-up for migraine management", notes: "", diagnosis: "", prescriptionId: "", paymentStatus: "completed", paymentAmount: 300, createdAt: new Date("2026-06-10"), updatedAt: new Date("2026-06-11") },
  ];

  const insertedApts = await db.collection("appointments").insertMany(appointments);
  console.log(`✅ ${appointments.length} appointments created`);

  // ---- Create Prescriptions ----
  const aptIds = Object.values(insertedApts.insertedIds);
  const prescriptions = [
    {
      appointmentId: aptIds[3].toString(), patientId: "PAT-1001", doctorId: "DOC-1004",
      patientName: "John Anderson", doctorName: "Dr. Michael Roberts", date: "2026-05-20",
      diagnosis: "Tension-type headaches with mild vestibular dysfunction",
      medications: [
        { name: "Amitriptyline", dosage: "25mg", frequency: "Once daily at bedtime", duration: "4 weeks", instructions: "Take with water" },
        { name: "Meclizine", dosage: "25mg", frequency: "As needed for dizziness", duration: "2 weeks", instructions: "Do not drive after taking" },
      ],
      instructions: "Maintain regular sleep schedule. Avoid prolonged screen time.",
      followUpDate: "2026-06-17", createdAt: new Date("2026-05-20"), updatedAt: new Date("2026-05-20"),
    },
    {
      appointmentId: aptIds[4].toString(), patientId: "PAT-1003", doctorId: "DOC-1002",
      patientName: "David Lee", doctorName: "Dr. James Wilson", date: "2026-05-25",
      diagnosis: "Mild patellar tendinitis in right knee",
      medications: [
        { name: "Naproxen", dosage: "500mg", frequency: "Twice daily", duration: "2 weeks", instructions: "Take with food" },
        { name: "Topical Diclofenac Gel", dosage: "1%", frequency: "Apply 3 times daily", duration: "3 weeks", instructions: "Apply to affected area" },
      ],
      instructions: "RICE protocol for the first week. Avoid high-impact activities.",
      followUpDate: "2026-06-22", createdAt: new Date("2026-05-25"), updatedAt: new Date("2026-05-25"),
    },
  ];

  await db.collection("prescriptions").insertMany(prescriptions);
  console.log(`✅ ${prescriptions.length} prescriptions created`);

  // ---- Create Reviews ----
  const reviews = [
    { patientId: "PAT-1001", doctorId: "DOC-1004", patientName: "John Anderson", appointmentId: aptIds[3].toString(), rating: 5, comment: "Dr. Roberts is incredibly thorough and knowledgeable.", createdAt: new Date("2026-05-21"), updatedAt: new Date("2026-05-21") },
    { patientId: "PAT-1003", doctorId: "DOC-1002", patientName: "David Lee", appointmentId: aptIds[4].toString(), rating: 4, comment: "Dr. Wilson was professional and efficient. The diagnosis was accurate.", createdAt: new Date("2026-05-26"), updatedAt: new Date("2026-05-26") },
    { patientId: "PAT-1001", doctorId: "DOC-1006", patientName: "John Anderson", appointmentId: aptIds[6].toString(), rating: 5, comment: "Dr. Kim is a fantastic physician. Very caring and attentive.", createdAt: new Date("2026-04-16"), updatedAt: new Date("2026-04-16") },
    { patientId: "PAT-1002", doctorId: "DOC-1005", patientName: "Maria Garcia", appointmentId: aptIds[2].toString(), rating: 5, comment: "Dr. Thompson is wonderful with children.", createdAt: new Date("2026-06-15"), updatedAt: new Date("2026-06-15") },
  ];

  await db.collection("reviews").insertMany(reviews);
  console.log(`✅ ${reviews.length} reviews created`);

  // ---- Create Notifications ----
  const notifs = [
    { userId: "PAT-1001", title: "Appointment Confirmed", message: "Your appointment with Dr. Sarah Chen on June 15 has been confirmed.", type: "appointment", read: false, createdAt: new Date("2026-06-02"), updatedAt: new Date("2026-06-02") },
    { userId: "PAT-1001", title: "Prescription Available", message: "Dr. Michael Roberts has added a new prescription for your recent visit.", type: "prescription", read: false, createdAt: new Date("2026-05-20"), updatedAt: new Date("2026-05-20") },
    { userId: "DOC-1001", title: "New Appointment Request", message: "John Anderson has requested an appointment for June 15 at 9:00 AM.", type: "appointment", read: false, createdAt: new Date("2026-06-01"), updatedAt: new Date("2026-06-01") },
    { userId: "DOC-1001", title: "New Review", message: "Maria Garcia left a 5-star review for your service.", type: "review", read: true, createdAt: new Date("2026-05-28"), updatedAt: new Date("2026-05-28") },
  ];

  await db.collection("notifications").insertMany(notifs);
  console.log(`✅ ${notifs.length} notifications created`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Test Credentials:");
  console.log("   Patient: john@example.com / password123 (ID: PAT-1001)");
  console.log("   Doctor:  sarah.chen@medicore.com / password123 (ID: DOC-1001)");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
