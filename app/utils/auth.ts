import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GitHub, Google],
});

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Authentication required');
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}
