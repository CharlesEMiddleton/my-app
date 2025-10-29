"use client";

import { useForm, useFieldArray } from "react-hook-form";
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

const venueSchema = z.object({
  name: z.string().min(1, "Venue name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
});

const schema = z.object({
  name: z.string().min(1, "Event name is required"),
  sport_type: z.enum(["Football", "Basketball", "Baseball", "Soccer", "Tennis", "Hockey", "Golf", "Volleyball"]),
  description: z.string().optional(),
  event_date: z.string().min(1, "Event date is required"),
  venues: z.array(venueSchema).min(1, "At least one venue is required"),
});

export type EventFormValues = z.infer<typeof schema>;
export type VenueFormValues = z.infer<typeof venueSchema>;

export function EventForm({
  onSubmit,
  defaultValues,
  rightAction,
}: {
  onSubmit: (values: EventFormValues) => void;
  defaultValues?: Partial<EventFormValues>;
  rightAction?: React.ReactNode;
}) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: defaultValues?.name ?? "",
      sport_type: defaultValues?.sport_type ?? "Football",
      description: defaultValues?.description ?? "",
      event_date: defaultValues?.event_date ?? "",
      venues: defaultValues?.venues && defaultValues.venues.length > 0 
        ? defaultValues.venues 
        : [
            {
              name: "",
              address: "",
              city: "",
              state: "",
              capacity: 100,
            },
          ],
    },
  });

  const [isPending, startTransition] = useTransition();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "venues",
  });

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
                      <SelectItem value="Baseball">Baseball</SelectItem>
                      <SelectItem value="Soccer">Soccer</SelectItem>
                      <SelectItem value="Tennis">Tennis</SelectItem>
                      <SelectItem value="Hockey">Hockey</SelectItem>
                      <SelectItem value="Golf">Golf</SelectItem>
                      <SelectItem value="Volleyball">Volleyball</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
              </FormItem>
            )}
          />
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

        {/* Venues Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Venues</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  name: "",
                  address: "",
                  city: "",
                  state: "",
                  capacity: 100,
                })
              }
              disabled={isPending}
            >
              + Add Venue
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="border p-4 rounded-lg space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Venue {index + 1}</h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={isPending}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnyFormField
                  control={form.control}
                  name={`venues.${index}.name`}
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
                  name={`venues.${index}.address`}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AnyFormField
                  control={form.control}
                  name={`venues.${index}.city`}
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
                  name={`venues.${index}.state`}
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
                <AnyFormField
                  control={form.control}
                  name={`venues.${index}.capacity`}
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
              </div>
            </div>
          ))}
        </div>

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
