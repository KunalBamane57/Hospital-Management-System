// ============================================
// Registration API Route
// ============================================

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Patient from "@/models/Patient";
import Doctor from "@/models/Doctor";
import { getNextSequence } from "@/models/Counter";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { role, name, email, password, phone, ...profileData } = body;

    // Validate required fields
    if (!name || !email || !password || !phone || !role) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate unique user ID
    const prefix = role === "patient" ? "PAT" : "DOC";
    const counterName = role === "patient" ? "patientId" : "doctorId";
    const seq = await getNextSequence(counterName);
    const userId = `${prefix}-${seq}`;

    // Create user document
    const user = await User.create({
      userId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      phone,
      avatar: "",
    });

    // Create role-specific profile
    if (role === "patient") {
      await Patient.create({
        user: user._id,
        userId,
        dateOfBirth: profileData.dateOfBirth || "",
        gender: profileData.gender || "other",
        bloodGroup: profileData.bloodGroup || "",
        address: profileData.address || "",
        emergencyContact: profileData.emergencyContact || "",
        medicalHistory: [],
        allergies: [],
        insuranceId: "",
      });
    } else if (role === "doctor") {
      await Doctor.create({
        user: user._id,
        userId,
        specialization: profileData.specialization || "",
        qualification: profileData.qualification || "",
        experience: profileData.experience || 0,
        consultationFee: profileData.consultationFee || 0,
        bio: profileData.bio || "",
        languages: profileData.languages || ["English"],
        hospital: profileData.hospital || "MediCore General Hospital",
        department: profileData.department || profileData.specialization || "",
        availableSlots: [],
        rating: 0,
        totalReviews: 0,
      });
    }

    return NextResponse.json(
      {
        message: "Registration successful",
        userId,
        role,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
