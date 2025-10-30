// app/events/create/page.tsx
"use client";

import { EventForm, type EventFormValues } from "@/app/events/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createEventAction } from "./actions";

export default function CreateEventPage() {
  const router = useRouter();

  const handleSubmit = async (values: EventFormValues) => {
    try {
      const result = await createEventAction(values);

      if (result.venueWarning) {
        toast.warning("Event created, but some venues could not be saved.");
      } else {
        toast.success("Event created!");
      }
      router.push("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to create event: ${JSON.stringify(error)}`;
      // eslint-disable-next-line no-console
      console.error("Create event error:", error);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-cyan-950">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard">
            <Button variant="outline" className="border-cyan-700 text-cyan-300 hover:bg-cyan-900/30">← Back</Button>
          </Link>
          <h1 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-cyan-400">Create Event</h1>
          <div className="w-24" />
        </div>

        <div className="rounded-xl border border-cyan-800/40 bg-black/30 backdrop-blur-sm p-5">
          <EventForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
