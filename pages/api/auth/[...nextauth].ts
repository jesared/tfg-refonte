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
      return true;
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user as any).role ?? "USER";
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
