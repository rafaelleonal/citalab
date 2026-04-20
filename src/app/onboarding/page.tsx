import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreateOrganization } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { labs } from "@/db/schema";
import { OnboardingWizard } from "./_components/wizard";

export default async function OnboardingPage() {
  const { orgId } = await auth();

  if (!orgId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Crea tu organización
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Primero registra el nombre de tu laboratorio en el sistema.
          </p>
        </div>
        <CreateOrganization afterCreateOrganizationUrl="/onboarding" />
      </div>
    );
  }

  const [existing] = await db
    .select({ id: labs.id })
    .from(labs)
    .where(eq(labs.clerkOrgId, orgId))
    .limit(1);

  if (existing) redirect("/dashboard");

  return <OnboardingWizard />;
}
