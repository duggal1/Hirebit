// app/api/company/route.ts
import { requireCompany } from "@/src/utils/hooks";
import { NextResponse } from "next/server";


export async function GET() {
  const company = await requireCompany();
  return NextResponse.json(company);
}
