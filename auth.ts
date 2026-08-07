import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/** Freno a la fuerza bruta: por IP y por cuenta atacada. */
const MAX_LOGIN_ATTEMPTS = 8;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutos

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;

        // Se limita por IP y por cuenta: lo primero frena a un atacante contra
        // muchos correos, lo segundo a una botnet contra una sola cuenta.
        const ip = await clientIp();
        const normalized = email.trim().toLowerCase();
        if (!rateLimit(`login:ip:${ip}`, MAX_LOGIN_ATTEMPTS, LOGIN_WINDOW_MS).ok) return null;
        if (!rateLimit(`login:user:${normalized}`, MAX_LOGIN_ATTEMPTS, LOGIN_WINDOW_MS).ok) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name ?? undefined, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.role) (session.user as { role?: string }).role = token.role as string;
        if (token.sub) (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
});
