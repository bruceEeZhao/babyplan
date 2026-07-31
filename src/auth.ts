import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        phone: { label: "手机号", type: "tel" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        const phone = credentials?.phone as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!phone || !password) return null;

        const parent = await prisma.parent.findUnique({ where: { phone } });
        if (!parent) return null;
        const ok = await bcrypt.compare(password, parent.passwordHash);
        if (!ok) return null;

        return { id: parent.id, phone: parent.phone, name: parent.nickname };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.parentId = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = (token.parentId as string) ?? "";
      return session;
    },
  },
});
