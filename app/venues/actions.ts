"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { withErrorHandling, formatSupabaseError, type ActionResult } from "@/lib/actions/error-handler";

const VenueSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Venue name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
});

export type VenueFormData = z.infer<typeof VenueSchema>;

/**
 * Get all template venues (venues without an event_id)
 */
export async function getTemplateVenues(): Promise<ActionResult<Array<{
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  capacity: number;
}>>> {
  return withErrorHandling(async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("venues")
      .select("id, name, address, city, state, capacity")
      .is("event_id", null)
      .order("name", { ascending: true });

    if (error) {
      throw new Error(formatSupabaseError(error));
    }

    return (data || []) as Array<{
      id: string;
      name: string;
      address: string;
      city: string;
      state: string;
      capacity: number;
    }>;
  });
}

/**
 * Create a new template venue
 */
export async function createVenueAction(
  input: Omit<VenueFormData, "id">
): Promise<ActionResult<{ id: string }>> {
  return withErrorHandling(async () => {
    const supabase = await createClient();

    // Get authenticated user
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes?.user) {
      throw new Error("Authentication required");
    }

    // Validate input
    const validated = VenueSchema.omit({ id: true }).safeParse(input);
    if (!validated.success) {
      throw new Error(`Validation error: ${validated.error.message}`);
    }

    const { name, address, city, state, capacity } = validated.data;

    // Create venue (event_id intentionally omitted for template)
    const { data, error } = await supabase
      .from("venues")
      .insert([
        {
          name,
          address,
          city,
          state,
          capacity: Number(capacity),
        },
      ])
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(formatSupabaseError(error || new Error("Failed to create venue")));
    }

    return { id: data.id };
  });
}

/**
 * Update an existing template venue
 */
export async function updateVenueAction(
  venueId: string,
  input: Omit<VenueFormData, "id">
): Promise<ActionResult<void>> {
  return withErrorHandling(async () => {
    const supabase = await createClient();

    // Get authenticated user
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes?.user) {
      throw new Error("Authentication required");
    }

    // Validate input
    const validated = VenueSchema.omit({ id: true }).safeParse(input);
    if (!validated.success) {
      throw new Error(`Validation error: ${validated.error.message}`);
    }

    const { name, address, city, state, capacity } = validated.data;

    // Update venue (only template venues - event_id IS NULL)
    const { error } = await supabase
      .from("venues")
      .update({
        name,
        address,
        city,
        state,
        capacity: Number(capacity),
      })
      .eq("id", venueId)
      .is("event_id", null);

    if (error) {
      throw new Error(formatSupabaseError(error));
    }

    return undefined;
  });
}

/**
 * Delete a template venue
 */
export async function deleteVenueAction(venueId: string): Promise<ActionResult<void>> {
  return withErrorHandling(async () => {
    const supabase = await createClient();

    // Get authenticated user
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes?.user) {
      throw new Error("Authentication required");
    }

    // Delete venue (only template venues - event_id IS NULL)
    const { error } = await supabase
      .from("venues")
      .delete()
      .eq("id", venueId)
      .is("event_id", null);

    if (error) {
      throw new Error(formatSupabaseError(error));
    }

    return undefined;
  });
}
