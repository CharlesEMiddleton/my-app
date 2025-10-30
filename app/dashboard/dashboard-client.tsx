"use client";

import { useActionState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Removed direct Supabase client import - using server actions instead

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
import { Loader2 } from "lucide-react";

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
  const router = useRouter();

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(FilterSchema),
    defaultValues: {
      name: "",
      sport: "all",
    },
  });

  // Trigger initial fetch on mount with default filters
  useEffect(() => {
    const formData = new FormData();
    formData.append("name", "");
    formData.append("sport", "all");
    startTransition(() => {
      formAction(formData);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  async function handleLogout() {
    try {
      const { logoutAction } = await import("./actions");
      await logoutAction();
      toast.success("Logged out successfully.");
      router.push("/auth/login");
    } catch (error) {
      toast.error("Logout failed. Try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-cyan-950">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-center text-3xl sm:text-4xl font-extrabold tracking-tight text-cyan-400">
            Fastbreak Event Dashboard
          </h1>
        </div>

      {/* ✅ Filter Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cyan-300">Search by Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Search..."
                    {...field}
                    disabled={isPending}
                    className="bg-white/90"
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
                <FormLabel className="text-cyan-300">Sport Type</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white/90">
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    <SelectItem value="Football">Football</SelectItem>
                    <SelectItem value="Basketball">Basketball</SelectItem>
                    <SelectItem value="Baseball">Baseball</SelectItem>
                    <SelectItem value="Soccer">Soccer</SelectItem>
                    <SelectItem value="Tennis">Tennis</SelectItem>
                    <SelectItem value="Hockey">Hockey</SelectItem>
                    <SelectItem value="Golf">Golf</SelectItem>
                    <SelectItem value="Volleyball">Volleyball</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="self-end bg-cyan-500 hover:bg-cyan-400 text-black"
            disabled={isPending}
          >
            {isPending ? "Filtering..." : "Filter"}
          </Button>
        </form>
      </Form>
      {/* ✅ Events List Container */}
      <div className="rounded-xl border border-cyan-800/40 bg-black/30 backdrop-blur-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-cyan-300">Sport Events</h2>
          <span />
        </div>
        {isPending && (!state?.events || state.events.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-4" />
            <p className="text-cyan-200/80">Loading events...</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {state?.events?.length > 0 ? (
              state.events.map((event: any) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block group"
                >
                  <div
                    className="border border-cyan-800/40 p-4 rounded-lg shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer h-full"
                    style={{
                      backgroundColor: "var(--bright-aqua)",
                      backgroundImage: "linear-gradient(90deg, var(--bright-aqua), var(--electric-sky))",
                    }}
                    role="link"
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/events/${event.id}`);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/events/${event.id}`);
                      }
                    }}
                  >
                    <h3 className="text-xl font-semibold mb-2 text-black transition-colors">{event.name}</h3>
                    <div className="space-y-1 text-sm text-black/80">
                      <p><span className="font-medium">Date:</span> {event.event_date ? new Date(event.event_date).toLocaleDateString() : "N/A"}</p>
                      <p><span className="font-medium">Sport:</span> {event.sport_type ?? "N/A"}</p>
                      <p><span className="font-medium">Venues:</span> {
                        event.venues && Array.isArray(event.venues) && event.venues.length > 0
                          ? event.venues.map((v: any, idx: number) => (
                              <span key={idx}>
                                {v.name}{v.city ? ` (${v.city}, ${v.state})` : ""}
                                {idx < event.venues.length - 1 ? ", " : ""}
                              </span>
                            ))
                          : event.venues && !Array.isArray(event.venues)
                          ? `${event.venues.name}${event.venues.city ? ` (${event.venues.city}, ${event.venues.state})` : ""}`
                          : "N/A"
                      }</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="mt-3 w-full text-black"
                      style={{
                        backgroundColor: "var(--bright-aqua)",
                        backgroundImage: "linear-gradient(90deg, var(--bright-aqua), var(--electric-sky))",
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/events/edit/${event.id}`);
                      }}
                      type="button"
                    >
                      Edit
                    </Button>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-cyan-200/80 col-span-full text-center py-8">No events found.</p>
            )}
          </div>
        )}
      </div>

      {/* Fixed bottom-center Create Event */}
      <div className="fixed inset-x-0 bottom-6 flex justify-center">
        <Link href="/events/create">
          <Button className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 shadow-lg shadow-cyan-900/30">
            + Create Event
          </Button>
        </Link>
      </div>

      {/* Subtle Logout in corner */}
      <div className="fixed bottom-3 right-3 opacity-60 hover:opacity-100 transition-opacity">
        <Button
          variant="outline"
          className="border-cyan-700 text-cyan-300 hover:bg-cyan-900/30"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
      </div>
    </div>
  );
}
