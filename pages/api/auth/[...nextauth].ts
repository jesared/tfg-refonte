import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email?.toLowerCase() ?? null,
          image: profile.picture,
          emailVerified: profile.email_verified ? new Date() : null,
        };
      },

      // ⚠️ Permet de lier automatiquement un email existant
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  session: {
    strategy: "database",
  },

  callbacks: {
    async signIn({ user }) {
      // Sécurité : refuser si pas d'email
      if (!user.email) return false;

      // Évite les conflits d'email liés à la casse entre Google et la base
      user.email = user.email.toLowerCase();
      return true;
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user as { role?: string }).role ?? "USER";
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
