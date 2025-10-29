"use server";

import { createClient } from "@/lib/supabase/server";

export async function getEventDetails(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select(`
      id,
      name,
      sport_type,
      description,
      event_date,
      venues (
        name,
        address,
        city,
        state,
        capacity
      )
    `)
    .eq("id", eventId)
    .single();

  if (error || !data) {
    throw new Error(`Failed to load event: ${error?.message || "Event not found"}`);
  }

  // Normalize venues to array
  const venues = Array.isArray(data.venues)
    ? data.venues
    : data.venues
    ? [data.venues]
    : [];

  return {
    id: data.id,
    name: data.name ?? "",
    sport_type: data.sport_type ?? "N/A",
    description: data.description ?? "",
    event_date: data.event_date ? new Date(data.event_date).toISOString() : null,
    venues: venues.map((v: any) => ({
      name: v.name ?? "",
      address: v.address ?? "",
      city: v.city ?? "",
      state: v.state ?? "",
      capacity: v.capacity ?? 0,
    })),
  };
}

