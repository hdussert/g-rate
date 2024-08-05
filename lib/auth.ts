import { sql } from "@vercel/postgres";
import { compare } from "bcrypt";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  // Secret for Next-auth, without this JWT encryption/decryption won't work
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_APP_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_APP_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const response =
          await sql`SELECT * FROM users WHERE email = ${credentials?.email}`; // TODO: What happens if undefined?
        const user = response.rows[0];

        const isPasswordValid = await compare(
          credentials?.password || "",
          user.password
        );

        if (user && isPasswordValid) {
          return {
            id: user.id,
            email: user.email,
          };
        }

        return null;
      },
    }),
  ],

  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (account?.provider === "github") {
        const githubId = account.providerAccountId;

        const response =
          await sql`SELECT * FROM users WHERE github_id = ${githubId}`;
        const user = response.rows[0];

        if (!user) {
          const response =
            await sql`INSERT INTO users (provider, github_id) VALUES ('github', ${githubId})`;
        }
      }
      return true;
    },
  },
};
