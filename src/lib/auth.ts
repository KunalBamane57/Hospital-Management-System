// ============================================
// NextAuth.js Configuration
// ============================================

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Patient from "@/models/Patient";
import Doctor from "@/models/Doctor";

import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await dbConnect();

        const user = await User.findOne({
          email: credentials.email as string,
        }).select("+password");

        if (!user) {
          throw new Error("No account found with this email");
        }

        // Check if user is active
        if (user.isActive === false) {
          throw new Error("Your account has been deactivated. Contact an administrator.");
        }

        // If a specific role is requested, verify it matches
        if (credentials.role && user.role !== credentials.role) {
          throw new Error(
            `This account is registered as a ${user.role}. Please use the ${user.role} login.`
          );
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        // Get profile data
        let profileData: Record<string, unknown> = {};
        if (user.role === "patient") {
          const patient = await Patient.findOne({ user: user._id });
          if (patient) {
            profileData = {
              dateOfBirth: patient.dateOfBirth,
              gender: patient.gender,
              bloodGroup: patient.bloodGroup,
            };
          }
        } else if (user.role === "doctor") {
          const doctor = await Doctor.findOne({ user: user._id });
          if (doctor) {
            profileData = {
              specialization: doctor.specialization,
              qualification: doctor.qualification,
              experience: doctor.experience,
              consultationFee: doctor.consultationFee,
            };
          }
        }

        return {
          id: user._id.toString(),
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          ...profileData,
        };
      },
    }),
  ],
});
