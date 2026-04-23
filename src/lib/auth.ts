import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Demo Account",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "demo" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.username === "fleet_admin" && credentials?.password === "OT-Admin#2024!Global") {
          return { id: "admin", name: "Fleet Admin", email: "admin@opentrack.com" };
        }
        if (credentials?.username === "demo" && credentials?.password === "Secrte#123") {
          return { id: "1", name: "Demo User", email: "demo@opentrack.com" };
        }
        return null;
      }
    }),
  ],
  pages: {
    signIn: "/", // We'll put the login on the landing page for now
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
