"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Experience } from "@/lib/types";
import { ExperienceForm, type ExperienceFormValues } from "@/components/ExperienceForm";

export default function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = usePromise(params);
  const supabase = createClient();
  const router = useRouter();
  const [exp, setExp] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("experiences")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setExp(data as Experience);
        setLoading(false);
      });
  }, [id, supabase]);

  async function handleSubmit(values: ExperienceFormValues) {
    const { error } = await supabase
      .from("experiences")
      .update(values)
      .eq("id", id);
    if (error) return error.message;
    router.push("/dashboard");
  }

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-white/60" />;
  if (!exp) return <p className="text-sm text-ink/60">Experience not found.</p>;

  return (
    <div>
      <h1 className="font-display text-2xl text-navy">Edit experience</h1>
      <div className="mt-4">
        <ExperienceForm
          initial={exp}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
