// app/dashboard/actions.ts
"use server";

import { EventFilterSchema, getFilteredEvents } from "@/lib/supabase/helpers";

export async function fetchEventsServerAction(prevState: any, formData: FormData) {
  const validated = EventFilterSchema.safeParse({
    name: formData.get("name")?.toString() || "",
    sport: formData.get("sport")?.toString() || "",
  });

  if (!validated.success) {
    return { error: "Invalid filter input", events: [] };
  }

  try {
    const events = await getFilteredEvents(validated.data);
    return { events };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to fetch events", events: [] };
  }
}
