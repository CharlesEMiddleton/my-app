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

const UpdateEventSchema = z.object({
  name: z.string(),
  sport_type: z.string(),
  description: z.string().optional(),
  event_date: z.string(),
  venues: z.array(VenueSchema).min(1),
});

export async function getEventForEdit(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select(`id, name, sport_type, description, event_date, venues ( name, address, city, state, capacity )`)
    .eq("id", eventId)
    .single();

  if (error || !data) {
    throw new Error(`Failed to load event: ${error?.message || "Event not found"}`);
  }

  // Convert venues to array format
  const venuesArray = Array.isArray(data.venues)
    ? data.venues.map((v: any) => ({
        name: v.name ?? "",
        address: v.address ?? "",
        city: v.city ?? "",
        state: v.state ?? "",
        capacity: v.capacity ?? 100,
      }))
    : data.venues
    ? [
        {
          name: (data.venues as any).name ?? "",
          address: (data.venues as any).address ?? "",
          city: (data.venues as any).city ?? "",
          state: (data.venues as any).state ?? "",
          capacity: (data.venues as any).capacity ?? 100,
        },
      ]
    : [
        {
          name: "",
          address: "",
          city: "",
          state: "",
          capacity: 100,
        },
      ];

  return {
    id: data.id,
    name: data.name ?? "",
    sport_type: data.sport_type ?? "Football",
    description: data.description ?? "",
    event_date: data.event_date ? new Date(data.event_date).toISOString().slice(0, 10) : "",
    venues: venuesArray,
  };
}

export async function updateEventAction(eventId: string, input: z.infer<typeof UpdateEventSchema>) {
  const supabase = await createClient();

  // Validate input
  const validated = UpdateEventSchema.safeParse(input);
  if (!validated.success) {
    throw new Error(`Validation error: ${validated.error.message}`);
  }

  const { name, sport_type, description, event_date, venues } = validated.data;

  // Verify event ownership
  const { data: eventCheck, error: checkErr } = await supabase
    .from("events")
    .select("user_id, id")
    .eq("id", eventId)
    .single();

  if (checkErr || !eventCheck) {
    throw new Error(`Could not verify event ownership: ${checkErr?.message || "Event not found"}`);
  }

  // Update the event
  const { error: eventErr } = await supabase
    .from("events")
    .update({
      name,
      sport_type,
      description: description ?? null,
      event_date,
    })
    .eq("id", eventId);

  if (eventErr) {
    throw new Error(`Event update failed: ${eventErr.message}`);
  }

  // Delete existing venues for this event (best effort - RLS may block)
  try {
    await supabase.from("venues").delete().eq("event_id", eventId);
  } catch (delEx) {
    // eslint-disable-next-line no-console
    console.warn("Venue delete exception, proceeding:", delEx);
  }

  // Insert all venues from the form
  if (venues && venues.length > 0) {
    const venueInserts = venues.map((venue) => ({
      event_id: eventId,
      name: venue.name,
      address: venue.address,
      city: venue.city,
      state: venue.state,
      capacity: Number(venue.capacity),
    }));

    const { error: venueErr } = await supabase.from("venues").insert(venueInserts);
    if (venueErr) {
      throw new Error(`Failed to save venues: ${venueErr.message}`);
    }
  }

  return { success: true };
}

export async function deleteEventAction(eventId: string) {
  const supabase = await createClient();

  // Delete related venues first (best effort)
  try {
    await supabase.from("venues").delete().eq("event_id", eventId);
  } catch (venueEx) {
    // eslint-disable-next-line no-console
    console.warn("Venue delete exception, continuing:", venueEx);
  }

  // Delete the event itself
  const { data, error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .select();

  if (error) {
    throw new Error(`Failed to delete event: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error("Event delete failed: No rows were deleted. Check RLS policies.");
  }

  return { success: true };
}

