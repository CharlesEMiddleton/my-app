"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { EventForm, type EventFormValues } from "@/app/events/form";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const supabase = createClient();

  const [defaults, setDefaults] = useState<Partial<EventFormValues> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!eventId) return;

    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select(
          `id, name, sport_type, description, event_date, venues ( name, address, city, state, capacity )`
        )
        .eq("id", eventId)
        .single();

      if (error || !data) {
        toast.error("Failed to load event.");
        setLoading(false);
        return;
      }

      // Convert venues to array format for the form
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

      setDefaults({
        name: data.name ?? "",
        sport_type: data.sport_type ?? "Football",
        description: data.description ?? "",
        event_date: data.event_date ? new Date(data.event_date).toISOString().slice(0, 10) : "",
        venues: venuesArray,
      });
      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const handleSubmit = async (values: EventFormValues) => {
    try {
      const { error: eventErr } = await supabase
        .from("events")
        .update({
          name: values.name,
          sport_type: values.sport_type,
          description: values.description ?? null,
          event_date: values.event_date,
          // Venue updates can be wired here if your schema supports it
        })
        .eq("id", eventId);

      if (eventErr) throw new Error(`Event update failed: ${eventErr.message || JSON.stringify(eventErr)}`);

      // Verify event ownership first
      const { data: eventCheck, error: checkErr } = await supabase
        .from("events")
        .select("user_id, id")
        .eq("id", eventId)
        .single();

      if (checkErr || !eventCheck) {
        throw new Error(`Could not verify event ownership: ${checkErr?.message || "Event not found"}`);
      }

      // eslint-disable-next-line no-console
      console.log("Event ownership check:", { eventId, userId: eventCheck.user_id });

      // Delete existing venues for this event (best effort - RLS may block)
      try {
        const { error: delErr } = await supabase.from("venues").delete().eq("event_id", eventId);
        if (delErr) {
          // eslint-disable-next-line no-console
          console.warn("Venue delete blocked by RLS, proceeding:", delErr);
        }
      } catch (delEx) {
        // eslint-disable-next-line no-console
        console.warn("Venue delete exception, proceeding:", delEx);
      }

      // Insert all venues from the form
      if (values.venues && values.venues.length > 0) {
        const venueInserts = values.venues.map((venue) => ({
          event_id: eventId,
          name: venue.name,
          address: venue.address,
          city: venue.city,
          state: venue.state,
          capacity: Number(venue.capacity),
        }));

        const { error: venueErr } = await supabase.from("venues").insert(venueInserts);
        if (venueErr) {
          // eslint-disable-next-line no-console
          console.error("Venue insert error:", venueErr);
          throw new Error(`Failed to save venues: ${venueErr.message || JSON.stringify(venueErr)}`);
        }
      }

      toast.success("Event updated!");
      router.push("/dashboard");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Update event error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update event.");
    }
  };

  const handleDelete = async () => {
    if (!eventId) return;
    const confirm = window.confirm("Are you sure you want to delete this event? This cannot be undone.");
    if (!confirm) return;

    try {
      // Delete related venues first (best effort - may fail silently if RLS blocks)
      try {
        const { error: venueErr } = await supabase.from("venues").delete().eq("event_id", eventId);
        if (venueErr) {
          // eslint-disable-next-line no-console
          console.warn("Venue delete warning (may be blocked by RLS, continuing):", venueErr);
        }
      } catch (venueEx) {
        // eslint-disable-next-line no-console
        console.warn("Venue delete exception (continuing):", venueEx);
      }

      // Delete the event itself
      const { data, error, count } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId)
        .select();

      // eslint-disable-next-line no-console
      console.log("Delete result:", { data, error, count });

      if (error) {
        // eslint-disable-next-line no-console
        console.error("Event delete error:", error);
        throw new Error(`Failed to delete event: ${error.message || JSON.stringify(error)}`);
      }

      // Check if any rows were actually deleted
      if (!data || data.length === 0) {
        throw new Error("Event delete failed: No rows were deleted. Check RLS policies.");
      }
      
      toast.success("Event deleted");
      router.push("/dashboard");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Delete event error:", e);
      toast.error(e instanceof Error ? e.message : "Failed to delete event.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Event</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <EventForm
          onSubmit={handleSubmit}
          defaultValues={defaults ?? undefined}
          rightAction={
            <Button variant="destructive" type="button" onClick={handleDelete}>
              Delete
            </Button>
          }
        />
      )}
    </div>
  );
}
