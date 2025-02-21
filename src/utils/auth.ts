import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import Google from "next-auth/providers/google";
import { User } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: User & {
      id: string;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GitHub, Google],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if user exists with a different provider
      if (account && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { Account: true },
        });

        if (existingUser) {
          // If user exists but doesn't have an account with this provider
          const existingAccount = existingUser.Account.find(
            (acc) => acc.provider === account.provider
          );

          if (!existingAccount) {
            // Link the new account to the existing user
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                token_type: account.token_type,
                scope: account.scope,
                expires_at: account.expires_at,
                id_token: account.id_token,
                refresh_token: account.refresh_token,
              },
            });
          }
        }
      }
      return true;
    },
    session: async ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
        },
      };
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    error: '/login',
    signIn: '/login',
  },
});