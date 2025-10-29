// app/dashboard/actions.ts
"use server";

import { EventFilterSchema, getFilteredEvents } from "@/lib/supabase/helpers";
import { createClient } from "@/lib/supabase/server";

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

export async function logoutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
  return { success: true };
}
