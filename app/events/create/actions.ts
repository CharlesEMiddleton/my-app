"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const VenueSchema = z.object({
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  capacity: z.coerce.number(),
});

const CreateEventSchema = z.object({
  name: z.string(),
  sport_type: z.string(),
  description: z.string().optional(),
  event_date: z.string(),
  venues: z.array(VenueSchema).min(1),
});

export async function createEventAction(input: z.infer<typeof CreateEventSchema>) {
  const supabase = await createClient();

  // Get authenticated user
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes?.user) {
    throw new Error(`Auth error: ${userErr?.message || "Not authenticated"}`);
  }

  // Validate input
  const validated = CreateEventSchema.safeParse(input);
  if (!validated.success) {
    throw new Error(`Validation error: ${validated.error.message}`);
  }

  const { name, sport_type, description, event_date, venues } = validated.data;

  // Create the event
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

  if (eventErr || !eventRes) {
    throw new Error(`Event insert failed: ${eventErr?.message || "Failed to insert event"}`);
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
      // Log warning but don't throw - event is created
      // eslint-disable-next-line no-console
      console.warn("Some venues could not be saved:", venueErr);
      return { success: true, eventId: eventRes.id, venueWarning: true };
    }
  }

  return { success: true, eventId: eventRes.id };
}

