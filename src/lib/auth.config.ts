// ============================================
// NextAuth.js Configuration (Edge-compatible)
// ============================================

import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as Record<string, unknown>).userId as string;
        token.role = (user as Record<string, unknown>).role as string;
        token.phone = (user as Record<string, unknown>).phone as string;
        token.avatar = (user as Record<string, unknown>).avatar as string;
        token.dbId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).userId = token.userId;
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
        (session.user as any).avatar = token.avatar;
        (session.user as any).dbId = token.dbId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
