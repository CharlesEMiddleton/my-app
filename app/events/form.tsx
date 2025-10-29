"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// Loosen local typing to avoid generic mismatches from Controller types
const AnyFormField: any = FormField as any;

const schema = z
  .object({
    name: z.string().min(1, "Event name is required"),
    sport_type: z.enum(["Football", "Basketball", "Soccer", "Tennis"]),
    description: z.string().optional(),
    event_date: z.string().min(1, "Event date is required"),
    venueMode: z.enum(["existing", "new"]).default("new"),
    existingVenueId: z.string().optional(),
    venue_name: z.string().optional(),
    venue_address: z.string().optional(),
    venue_city: z.string().optional(),
    venue_state: z.string().optional(),
    venue_capacity: z.coerce.number().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.venueMode === "existing") {
      if (!val.existingVenueId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select an existing venue",
          path: ["existingVenueId"],
        });
      }
    } else {
      if (!val.venue_name)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Venue name is required", path: ["venue_name"] });
      if (!val.venue_address)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Address is required", path: ["venue_address"] });
      if (!val.venue_city)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "City is required", path: ["venue_city"] });
      if (!val.venue_state)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "State is required", path: ["venue_state"] });
      if (!val.venue_capacity || Number(val.venue_capacity) < 1)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Capacity must be at least 1", path: ["venue_capacity"] });
    }
  });

export type EventFormValues = z.infer<typeof schema>;

export function EventForm({
  onSubmit,
  defaultValues,
  rightAction,
  existingVenues = [],
}: {
  onSubmit: (values: EventFormValues) => void;
  defaultValues?: Partial<EventFormValues>;
  rightAction?: React.ReactNode;
  existingVenues?: Array<{ id: string; name: string; address: string; city: string; state: string; capacity: number }>;
}) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: defaultValues?.name ?? "",
      sport_type: defaultValues?.sport_type ?? "Football",
      description: defaultValues?.description ?? "",
      event_date: defaultValues?.event_date ?? "",
      venueMode: defaultValues?.venueMode ?? "new",
      existingVenueId: defaultValues?.existingVenueId ?? undefined,
      venue_name: defaultValues?.venue_name ?? "",
      venue_address: defaultValues?.venue_address ?? "",
      venue_city: defaultValues?.venue_city ?? "",
      venue_state: defaultValues?.venue_state ?? "",
      venue_capacity: defaultValues?.venue_capacity ?? 1,
    },
  });

  const [isPending, startTransition] = useTransition();
  const venueMode = form.watch("venueMode");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          startTransition(() => onSubmit(values))
        )}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnyFormField
            control={form.control}
            name="name"
            render={({ field, fieldState }: any) => (
              <FormItem>
                <FormLabel>Event Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
                </FormControl>
                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
              </FormItem>
            )}
          />

          <AnyFormField
            control={form.control}
            name="sport_type"
            render={({ field, fieldState }: any) => (
              <FormItem>
                <FormLabel>Sport Type</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Football">Football</SelectItem>
                      <SelectItem value="Basketball">Basketball</SelectItem>
                      <SelectItem value="Soccer">Soccer</SelectItem>
                      <SelectItem value="Tennis">Tennis</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnyFormField
            control={form.control}
            name="venueMode"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Venue Mode</FormLabel>
                <FormControl>
                  <Select value={String(field.value ?? "")} onValueChange={field.onChange} disabled={isPending}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose venue mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Add new venue</SelectItem>
                      <SelectItem value="existing">Use existing venue</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          {venueMode === "existing" && (
            <AnyFormField
              control={form.control}
              name="existingVenueId"
              render={({ field, fieldState }: any) => (
                <FormItem>
                  <FormLabel>Select Venue</FormLabel>
                  <FormControl>
                    <Select value={String(field.value ?? "")} onValueChange={field.onChange} disabled={isPending}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a venue" />
                      </SelectTrigger>
                      <SelectContent>
                        {existingVenues.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name} — {v.city}, {v.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                </FormItem>
              )}
            />
          )}
        </div>

        <AnyFormField
          control={form.control}
          name="description"
          render={({ field, fieldState }: any) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isPending} />
              </FormControl>
              {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
            </FormItem>
          )}
        />

        <AnyFormField
          control={form.control}
          name="event_date"
          render={({ field, fieldState }: any) => (
            <FormItem>
              <FormLabel>Event Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isPending} />
              </FormControl>
              {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
            </FormItem>
          )}
        />

        {venueMode === "new" && (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnyFormField
            control={form.control}
            name="venue_name"
            render={({ field, fieldState }: any) => (
              <FormItem>
                <FormLabel>Venue Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
                </FormControl>
                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
              </FormItem>
            )}
          />
          <AnyFormField
            control={form.control}
            name="venue_address"
            render={({ field, fieldState }: any) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
                </FormControl>
                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnyFormField
            control={form.control}
            name="venue_city"
            render={({ field, fieldState }: any) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
                </FormControl>
                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
              </FormItem>
            )}
          />
          <AnyFormField
            control={form.control}
            name="venue_state"
            render={({ field, fieldState }: any) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
                </FormControl>
                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
              </FormItem>
            )}
          />
        </div>

        <AnyFormField
          control={form.control}
          name="venue_capacity"
          render={({ field, fieldState }: any) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input type="number" {...field} disabled={isPending} />
              </FormControl>
              {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
            </FormItem>
          )}
        />
        </>
        )}

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Event"}
          </Button>
          {rightAction}
        </div>
      </form>
    </Form>
  );
}
