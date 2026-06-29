// ============================================
// User Profile API Route
// ============================================

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import UserModel from "@/models/User";
import PatientModel from "@/models/Patient";
import DoctorModel from "@/models/Doctor";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  avatar: z.string().url().optional(),
  
  // Patient fields
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  medicalHistory: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  insuranceId: z.string().optional(),

  // Doctor fields
  specialization: z.string().optional(),
  qualification: z.string().optional(),
  experience: z.number().nonnegative().optional(),
  consultationFee: z.number().nonnegative().optional(),
  bio: z.string().optional(),
  availableSlots: z.array(z.object({
    day: z.string(),
    slots: z.array(z.string()),
  })).optional(),
  languages: z.array(z.string()).optional(),
  hospital: z.string().optional(),
  department: z.string().optional(),
});

// GET /api/user/me - Get current user's full profile
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const user = await UserModel.findOne({ userId: session.user.userId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let profile: Record<string, unknown> = {
      id: user.userId, name: user.name, email: user.email, role: user.role,
      phone: user.phone, avatar: user.avatar,
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    };

    if (user.role === "patient") {
      const patient = await PatientModel.findOne({ user: user._id });
      if (patient) {
        profile = { ...profile, dateOfBirth: patient.dateOfBirth, gender: patient.gender,
          bloodGroup: patient.bloodGroup, address: patient.address,
          emergencyContact: patient.emergencyContact, medicalHistory: patient.medicalHistory,
          allergies: patient.allergies, insuranceId: patient.insuranceId,
        };
      }
    } else {
      const doctor = await DoctorModel.findOne({ user: user._id });
      if (doctor) {
        profile = { ...profile, specialization: doctor.specialization, qualification: doctor.qualification,
          experience: doctor.experience, rating: doctor.rating, totalReviews: doctor.totalReviews,
          consultationFee: doctor.consultationFee, bio: doctor.bio,
          availableSlots: doctor.availableSlots, languages: doctor.languages,
          hospital: doctor.hospital, department: doctor.department,
        };
      }
    }
    return NextResponse.json(profile);
  } catch (error: unknown) {
    console.error("User GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/user/me - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }
    
    const { name, phone, avatar, ...profileData } = parsed.data;

    // Update base user fields
    const userUpdate: Record<string, unknown> = {};
    if (name) userUpdate.name = name;
    if (phone) userUpdate.phone = phone;
    if (avatar !== undefined) userUpdate.avatar = avatar;

    if (Object.keys(userUpdate).length > 0) {
      await UserModel.findOneAndUpdate({ userId: session.user.userId }, userUpdate);
    }

    // Update role-specific profile
    if (session.user.role === "patient") {
      const patientUpdate: Record<string, unknown> = {};
      const patientKeys = ["dateOfBirth", "gender", "bloodGroup", "address", "emergencyContact", "medicalHistory", "allergies", "insuranceId"] as const;
      for (const key of patientKeys) {
        if (profileData[key as keyof typeof profileData] !== undefined) {
          patientUpdate[key] = profileData[key as keyof typeof profileData];
        }
      }
      if (Object.keys(patientUpdate).length > 0) {
        await PatientModel.findOneAndUpdate({ userId: session.user.userId }, patientUpdate);
      }
    } else {
      const doctorUpdate: Record<string, unknown> = {};
      const doctorKeys = ["specialization", "qualification", "experience", "consultationFee", "bio", "availableSlots", "languages", "hospital", "department"] as const;
      for (const key of doctorKeys) {
        if (profileData[key as keyof typeof profileData] !== undefined) {
          doctorUpdate[key] = profileData[key as keyof typeof profileData];
        }
      }
      if (Object.keys(doctorUpdate).length > 0) {
        await DoctorModel.findOneAndUpdate({ userId: session.user.userId }, doctorUpdate);
      }
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error: unknown) {
    console.error("User PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
