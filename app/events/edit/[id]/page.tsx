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

      const venue: any = Array.isArray(data.venues) ? data.venues[0] : (data.venues as any);

      setDefaults({
        name: data.name ?? "",
        sport_type: data.sport_type ?? "Football",
        description: data.description ?? "",
        event_date: data.event_date ? new Date(data.event_date).toISOString().slice(0, 10) : "",
        venue_name: venue?.name ?? "",
        venue_address: venue?.address ?? "",
        venue_city: venue?.city ?? "",
        venue_state: venue?.state ?? "",
        venue_capacity: venue?.capacity ?? 1,
      });
      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const handleSubmit = async (values: EventFormValues) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({
          name: values.name,
          sport_type: values.sport_type,
          description: values.description ?? null,
          event_date: values.event_date,
          // Venue updates can be wired here if your schema supports it
        })
        .eq("id", eventId);

      if (error) throw error;

      toast.success("Event updated!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to update event.");
    }
  };

  const handleDelete = async () => {
    if (!eventId) return;
    const confirm = window.confirm("Are you sure you want to delete this event? This cannot be undone.");
    if (!confirm) return;

    try {
      // Delete related venues first (if no cascade)
      await supabase.from("venues").delete().eq("event_id", eventId);
      const { error } = await supabase.from("events").delete().eq("id", eventId);
      if (error) throw error;
      toast.success("Event deleted");
      router.push("/dashboard");
    } catch (e) {
      toast.error("Failed to delete event.");
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
