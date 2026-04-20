import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { labs, type Lab } from "@/db/schema";

export async function requireLab(): Promise<Lab> {
  const { orgId } = await auth();
  if (!orgId) redirect("/onboarding");

  const [lab] = await db
    .select()
    .from(labs)
    .where(eq(labs.clerkOrgId, orgId))
    .limit(1);

  if (!lab) redirect("/onboarding");

  return lab;
}
