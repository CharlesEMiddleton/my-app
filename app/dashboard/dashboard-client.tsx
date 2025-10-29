"use client";

import { useActionState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// ✅ Zod Schema
const FilterSchema = z.object({
  name: z.string().optional(),
  sport: z
    .enum(["all", "Football", "Basketball", "Soccer", "Tennis"])
    .optional(),
});

type FilterFormValues = z.infer<typeof FilterSchema>;

export default function DashboardClient({
  fetchEvents,
}: {
  fetchEvents: (prevState: any, formData: FormData) => Promise<any>;
}) {
  const [state, formAction] = useActionState(fetchEvents, { events: [] });
  const [isPending, startTransition] = useTransition();

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(FilterSchema),
    defaultValues: {
      name: "",
      sport: "all",
    },
  });

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state?.error]);

  useEffect(() => {
    if (state?.events?.length) toast.success("Events updated successfully!");
  }, [state?.events]);

  function onSubmit(values: FilterFormValues) {
    const formData = new FormData();
    formData.append("name", values.name ?? "");
    formData.append("sport", values.sport ?? "all");

    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/events/create">
          <Button variant="default">+ Create Event</Button>
        </Link>
      </div>

      {/* ✅ Filter Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search by Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Search..."
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sport Type</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    <SelectItem value="Football">Football</SelectItem>
                    <SelectItem value="Basketball">Basketball</SelectItem>
                    <SelectItem value="Soccer">Soccer</SelectItem>
                    <SelectItem value="Tennis">Tennis</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <Button type="submit" className="self-end" disabled={isPending}>
            {isPending ? "Filtering..." : "Filter"}
          </Button>
        </form>
      </Form>

      {/* ✅ Events List */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {state?.events?.length > 0 ? (
          state.events.map((event: any) => (
            <div
              key={event.id}
              className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold">{event.name}</h2>
              <p className="text-gray-600">{event.sport_type}</p>
              <p className="text-gray-600">
                {new Date(event.event_date).toLocaleDateString()}
              </p>
              {event.Venues && (
                <p className="text-sm text-gray-500">
                  {event.Venues.name} – {event.Venues.city},{" "}
                  {event.Venues.state}
                </p>
              )}
              <Link href={`/events/edit/${event.id}`}>
                <Button variant="outline" size="sm" className="mt-3">
                  Edit
                </Button>
              </Link>
            </div>
          ))
        ) : (
          <p>No events found.</p>
        )}
      </div>
    </div>
  );
}
