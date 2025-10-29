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
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link href={eventId ? `/events/${eventId}` : "/dashboard"}>
          <Button variant="outline">← Back</Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Event</h1>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>
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
