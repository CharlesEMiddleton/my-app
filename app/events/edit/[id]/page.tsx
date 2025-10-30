"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { EventForm, type EventFormValues } from "@/app/events/form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getEventForEdit, updateEventAction, deleteEventAction } from "./actions";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [defaults, setDefaults] = useState<Partial<EventFormValues> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!eventId) return;

    const load = async () => {
      setLoading(true);
      try {
        const eventData = await getEventForEdit(eventId);
        setDefaults(eventData);
      } catch (error) {
        toast.error("Failed to load event.");
        // eslint-disable-next-line no-console
        console.error("Load event error:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const handleSubmit = async (values: EventFormValues) => {
    if (!eventId) return;

    try {
      await updateEventAction(eventId, values);
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
      await deleteEventAction(eventId);
      toast.success("Event deleted");
      router.push("/dashboard");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Delete event error:", e);
      toast.error(e instanceof Error ? e.message : "Failed to delete event.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-cyan-950">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href={eventId ? `/events/${eventId}` : "/dashboard"}>
            <Button variant="outline" className="border-cyan-700 text-cyan-300 hover:bg-cyan-900/30">← Back</Button>
          </Link>
          <h1 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-cyan-400">Edit Event</h1>
          <div className="w-24" />
        </div>

        <div className="rounded-xl border border-cyan-800/40 bg-black/30 backdrop-blur-sm p-5">
          {loading ? (
            <p className="text-cyan-200/80">Loading...</p>
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
      </div>
    </div>
  );
}
