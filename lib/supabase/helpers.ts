// lib/supabase/helpers.ts
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export const EventFilterSchema = z.object({
  name: z.string().optional(),
  sport: z.string().optional(),
});

export async function getFilteredEvents(input: z.infer<typeof EventFilterSchema>) {
  const supabase = await createClient();
  const { name, sport } = input;

  let query = supabase
    .from("events")
    .select(
      `
      id,
      name,
      sport_type,
      event_date,
      venues (
        name,
        city,
        state
      )
    `
    )
    .order("event_date", { ascending: true });

  if (name) query = query.ilike("name", `%${name}%`);
  if (sport && sport !== "all") query = query.eq("sport_type", sport);

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data;
}
