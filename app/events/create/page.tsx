// app/events/create/page.tsx
"use client";

import { EventForm, type EventFormValues } from "@/app/events/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function CreateEventPage() {
  const router = useRouter();
  const supabase = createClient();
  const [existingVenues, setExistingVenues] = useState<Array<{ id: string; name: string; address: string; city: string; state: string; capacity: number }>>([]);
  const [loadingVenues, setLoadingVenues] = useState<boolean>(true);

  useEffect(() => {
    const loadVenues = async () => {
      setLoadingVenues(true);
      const { data, error } = await supabase
        .from("venues")
        .select("id, name, address, city, state, capacity")
        .order("name", { ascending: true });
      if (error) {
        // eslint-disable-next-line no-console
        console.warn("Failed to load existing venues:", error);
      } else if (data) {
        setExistingVenues(data as any);
      }
      setLoadingVenues(false);
    };
    loadVenues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (values: EventFormValues) => {
    try {
      const {
        name,
        sport_type,
        description,
        event_date,
        venueMode,
        existingVenueId,
        venue_name,
        venue_address,
        venue_city,
        venue_state,
        venue_capacity,
      } = values;

      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) {
        throw new Error(`Auth error: ${userErr.message || JSON.stringify(userErr)}`);
      }
      if (!userRes?.user) {
        throw new Error("Auth error: No user in session. Please log in again.");
      }

      const { data: eventRes, error: eventErr } = await supabase
        .from("events")
        .insert([
          {
            user_id: userRes.user.id,
            name,
            sport_type,
            description: description ?? null,
            event_date, // expects YYYY-MM-DD from the form
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

      try {
        let insertVenue = {
          event_id: eventRes.id,
          name: venue_name,
          address: venue_address,
          city: venue_city,
          state: venue_state,
          capacity: Number(venue_capacity),
        } as any;

        if (venueMode === "existing" && existingVenueId) {
          const chosen = existingVenues.find((v) => v.id === existingVenueId);
          if (chosen) {
            insertVenue = {
              event_id: eventRes.id,
              name: chosen.name,
              address: chosen.address,
              city: chosen.city,
              state: chosen.state,
              capacity: Number(chosen.capacity),
            };
          }
        }

        const { error: venueErr } = await supabase.from("venues").insert([insertVenue]);
        if (venueErr) {
          // eslint-disable-next-line no-console
          console.warn("Venue insert warning (event created without venue):", venueErr);
          toast.warning("Event created, but venue could not be saved.");
        }
      } catch (vErr) {
        // eslint-disable-next-line no-console
        console.warn("Venue insert exception (event created without venue):", vErr);
        toast.warning("Event created, but venue could not be saved.");
      }

      toast.success("Event created!");
      router.push("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to create event: ${JSON.stringify(error)}`;
      // Also log to console for debugging
      // eslint-disable-next-line no-console
      console.error("Create event error:", error);
      toast.error(message);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Event</h1>
      <EventForm onSubmit={handleSubmit} existingVenues={existingVenues} />
    </div>
  );
}
