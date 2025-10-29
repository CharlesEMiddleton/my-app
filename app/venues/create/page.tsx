"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  selectedVenueId: z.string().optional(),
  name: z.string().min(1, "Venue name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
});

type VenueFormValues = z.infer<typeof schema>;

type Venue = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  capacity: number;
};

export default function CreateVenuePage() {
  const router = useRouter();
  // Create Supabase client lazily - only when actually needed
  const getSupabase = () => createClient();
  const [isPending, startTransition] = useTransition();
  const [existingVenues, setExistingVenues] = useState<Venue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);

  const form = useForm<VenueFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      selectedVenueId: "",
      name: "",
      address: "",
      city: "",
      state: "",
      capacity: 100,
    },
  });

  useEffect(() => {
    const loadVenues = async () => {
      // Only load template venues (event_id IS NULL)
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("venues")
        .select("id, name, address, city, state, capacity")
        .is("event_id", null)
        .order("name", { ascending: true });

      if (error) {
        // eslint-disable-next-line no-console
        console.warn("Failed to load venues:", error);
      } else if (data) {
        setExistingVenues(data as Venue[]);
      }
    };
    loadVenues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVenueSelect = (venueId: string) => {
    if (venueId === "new") {
      setSelectedVenueId(null);
      setEditingVenueId(null);
      form.reset({
        selectedVenueId: "",
        name: "",
        address: "",
        city: "",
        state: "",
        capacity: 100,
      });
      return;
    }

    const venue = existingVenues.find((v) => v.id === venueId);
    if (venue) {
      setSelectedVenueId(venueId);
      setEditingVenueId(venueId);
      form.reset({
        selectedVenueId: venueId,
        name: venue.name,
        address: venue.address,
        city: venue.city,
        state: venue.state,
        capacity: venue.capacity,
      });
    }
  };

  const onSubmit = (values: VenueFormValues) => {
    startTransition(async () => {
      try {
        const supabase = getSupabase();
        if (editingVenueId) {
          // Update existing venue
          const { error } = await supabase
            .from("venues")
            .update({
              name: values.name,
              address: values.address,
              city: values.city,
              state: values.state,
              capacity: Number(values.capacity),
            })
            .eq("id", editingVenueId)
            .is("event_id", null); // Only update template venues

          if (error) throw error;
          toast.success("Venue updated!");
        } else {
          // Create new venue
          const { error } = await supabase.from("venues").insert([
            {
              // event_id intentionally omitted to act as a reusable template
              name: values.name,
              address: values.address,
              city: values.city,
              state: values.state,
              capacity: Number(values.capacity),
            },
          ]);

          if (error) throw error;
          toast.success("Venue created!");
        }

        // Reload venues and reset form
        const { data } = await supabase
          .from("venues")
          .select("id, name, address, city, state, capacity")
          .is("event_id", null)
          .order("name", { ascending: true });
        if (data) setExistingVenues(data as Venue[]);

        setSelectedVenueId(null);
        setEditingVenueId(null);
        form.reset({
          selectedVenueId: "",
          name: "",
          address: "",
          city: "",
          state: "",
          capacity: 100,
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Save venue error:", e);
        toast.error(
          e instanceof Error ? e.message : "Failed to save venue. Check RLS policies."
        );
      }
    });
  };

  const handleDelete = async (venueId: string) => {
    if (!window.confirm("Are you sure you want to delete this venue? This cannot be undone.")) {
      return;
    }

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("venues")
        .delete()
        .eq("id", venueId)
        .is("event_id", null); // Only delete template venues

      if (error) throw error;

      toast.success("Venue deleted!");
      
      // Reload venues
      const { data } = await supabase
        .from("venues")
        .select("id, name, address, city, state, capacity")
        .is("event_id", null)
        .order("name", { ascending: true });
      if (data) setExistingVenues(data as Venue[]);

      // If we deleted the venue we were editing, reset the form
      if (editingVenueId === venueId) {
        setSelectedVenueId(null);
        setEditingVenueId(null);
        form.reset({
          selectedVenueId: "",
          name: "",
          address: "",
          city: "",
          state: "",
          capacity: 100,
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Delete venue error:", e);
      toast.error(
        e instanceof Error ? e.message : "Failed to delete venue."
      );
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {editingVenueId ? "Edit Venue" : "Add Venue"}
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          <FormField
            control={form.control}
            name="selectedVenueId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Venue to Edit (or Create New)</FormLabel>
                <FormControl>
                  <Select
                    value={field.value || "new"}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleVenueSelect(value);
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a venue or create new" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">+ Create New Venue</SelectItem>
                      {existingVenues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name} — {venue.city}, {venue.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          {selectedVenueId && (
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(selectedVenueId)}
                disabled={isPending}
              >
                Delete Venue
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Venue Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage>{fieldState.error.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage>{fieldState.error.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage>{fieldState.error.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage>{fieldState.error.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="capacity"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Capacity</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={isPending} />
                </FormControl>
                {fieldState.error && (
                  <FormMessage>{fieldState.error.message}</FormMessage>
                )}
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Saving..."
              : editingVenueId
                ? "Update Venue"
                : "Create Venue"}
          </Button>
        </form>
      </Form>
    </div>
  );
}


