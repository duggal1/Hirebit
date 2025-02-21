import { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/src/utils/db";

export const authConfig: NextAuthConfig = {
	adapter: PrismaAdapter(prisma),
	providers: [GitHub, Google],
	session: { strategy: "jwt" },
	pages: {
		signIn: '/login',
		error: '/login',
	},
	callbacks: {
		async signIn({ user, account, profile }) {
			if (account && user.email) {
				const existingUser = await prisma.user.findUnique({
					where: { email: user.email },
					include: { Account: true },
				});

				if (existingUser) {
					const existingAccount = existingUser.Account.find(
						(acc) => acc.provider === account.provider
					);

					if (!existingAccount) {
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
		async session({ session, token }) {
			return {
				...session,
				user: {
					...session.user,
					id: token.sub,
				},
			};
		},
		async jwt({ token, user }) {
			if (user) {
				token.sub = user.id;
			}
			return token;
		},
	},
};