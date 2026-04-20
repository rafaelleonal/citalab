"use client";

import { useRouter } from "next/navigation";
import { OnboardingWizard } from "../_components/wizard";

export default function OnboardingPreviewPage() {
  const router = useRouter();
  return (
    <OnboardingWizard
      initialStep={3}
      onComplete={() => router.push("/dashboard")}
    />
  );
}
