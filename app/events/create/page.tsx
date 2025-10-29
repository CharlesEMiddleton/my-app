// app/events/create/page.tsx
"use client";

import { EventForm, type EventFormValues } from "@/app/events/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CreateEventPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (values: EventFormValues) => {
    try {
      const { name, sport_type, description, event_date, venues } = values;

      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) {
        throw new Error(`Auth error: ${userErr.message || JSON.stringify(userErr)}`);
      }
      if (!userRes?.user) {
        throw new Error("Auth error: No user in session. Please log in again.");
      }

      // Create the event first
      const { data: eventRes, error: eventErr } = await supabase
        .from("events")
        .insert([
          {
            user_id: userRes.user.id,
            name,
            sport_type,
            description: description ?? null,
            event_date,
          },
        ])
        .select("id")
        .single();

      if (eventErr) {
        throw new Error(`Event insert failed: ${eventErr.message || JSON.stringify(eventErr)}`);
      }
      if (!eventRes) {
        throw new Error("Event insert failed: No event returned");
      }

      // Insert all venues for this event
      if (venues && venues.length > 0) {
        const venueInserts = venues.map((venue) => ({
          event_id: eventRes.id,
          name: venue.name,
          address: venue.address,
          city: venue.city,
          state: venue.state,
          capacity: Number(venue.capacity),
        }));

        const { error: venueErr } = await supabase.from("venues").insert(venueInserts);
        if (venueErr) {
          // eslint-disable-next-line no-console
          console.warn("Some venues could not be saved:", venueErr);
          toast.warning("Event created, but some venues could not be saved.");
        }
      }

      toast.success("Event created!");
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
      <h1 className="text-2xl font-bold mb-4">Create Event</h1>
      <EventForm onSubmit={handleSubmit} />
    </div>
  );
}
