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
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link href="/dashboard">
          <Button variant="outline">← Back</Button>
        </Link>
        <h1 className="text-2xl font-bold">Create Event</h1>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>
      <EventForm onSubmit={handleSubmit} />
    </div>
  );
}
