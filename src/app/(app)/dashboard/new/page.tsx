"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import { ExperienceForm, type ExperienceFormValues } from "@/components/ExperienceForm";

export default function NewExperiencePage() {
  const supabase = createClient();
  const router = useRouter();
  const { user } = useAuth();

  async function handleSubmit(values: ExperienceFormValues) {
    if (!user) return "You need to be signed in as a curator.";
    const { error } = await supabase.from("experiences").insert({
      ...values,
      curator_id: user.id,
    });
    if (error) return error.message;
    router.push("/dashboard");
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-navy">New experience</h1>
      <p className="mt-1 text-sm text-ink/60">
        This is what learners will see as a ticket card.
      </p>
      <div className="mt-4">
        <ExperienceForm submitLabel="Publish experience" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
