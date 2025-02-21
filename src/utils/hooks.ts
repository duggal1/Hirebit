import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/src/utils/auth";
import { prisma } from "@/src/utils/db";


// Ensure that a user is authenticated; otherwise, redirect to /login.
export async function requireUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session.user;
}

// Ensure that the authenticated user has a company; if not, redirect (e.g., to a company creation page).
export async function requireCompany() {
  const user = await requireUser();
  
  const company = await prisma.company.findUnique({
    where: {
      userId: user.id,
    },
    // Optionally, select any fields you need:
    select: {
      id: true,
      companyID: true,
      name: true,
      // ... add any other fields you want to use
    },
  });

  if (!company) {
    // Redirect to a page where the user can create or complete their company profile.
    redirect("/onbording");
  }

  return company;
}
