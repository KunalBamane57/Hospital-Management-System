// ============================================
// NextAuth Type Extensions
// ============================================

import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      userId: string;
      role: "patient" | "doctor" | "admin";
      phone: string;
      avatar: string;
      dbId: string;
    } & DefaultSession["user"];
  }

  interface User {
    userId?: string;
    role?: string;
    phone?: string;
    avatar?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: string;
    phone?: string;
    avatar?: string;
    dbId?: string;
  }
}
