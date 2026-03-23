import { PrismaAdapter } from "@auth/prisma-adapter";
import { authenticateUser } from "@expense-manager/auth";
import { db } from "@expense-manager/db";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          !credentials ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        try {
          const user = await authenticateUser(
            {
              email: credentials.email,
              password: credentials.password,
            },
            { db },
          );

          return {
            id: user.id,
            email: user.email ?? undefined,
            name: user.name ?? undefined,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }

      return token;
    },
    session({ session, token, user }) {
      if (session.user) {
        session.user.id = user?.id ?? String(token.sub ?? "");
      }

      return session;
    },
  },
});
