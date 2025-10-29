import { getEventDetails } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";

// Force dynamic rendering - this page uses Supabase
export const dynamic = 'force-dynamic';

export default async function EventDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string }
}) {
  // Handle both awaited and non-awaited params for Next.js compatibility
  const resolvedParams = typeof params === 'object' && 'then' in params 
    ? await params 
    : params;
  
  if (!resolvedParams?.id) {
    notFound();
  }

  let event;
  try {
    event = await getEventDetails(resolvedParams.id);
  } catch (error) {
    console.error("Error loading event:", error);
    notFound();
  }

  if (!event) {
    notFound();
  }

  const eventDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard">
          <Button variant="outline">← Back to Dashboard</Button>
        </Link>
        <Link href={`/events/edit/${event.id}`}>
          <Button variant="default">Edit Event</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl mb-2">{event.name}</CardTitle>
          <CardDescription className="text-lg">
            {event.sport_type} • {eventDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {event.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold mb-2">Sport Type</h3>
              <p className="text-gray-700">{event.sport_type}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Event Date</h3>
              <p className="text-gray-700">{eventDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Venues ({event.venues?.length || 0})</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {event.venues && event.venues.length > 0 ? (
            event.venues.map((venue, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl">{venue.name || "Unnamed Venue"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {venue.address && (
                      <p className="text-gray-700">
                        <span className="font-medium">Address:</span> {venue.address}
                      </p>
                    )}
                    {(venue.city || venue.state) && (
                      <p className="text-gray-700">
                        <span className="font-medium">Location:</span>{" "}
                        {venue.city && venue.state
                          ? `${venue.city}, ${venue.state}`
                          : venue.city || venue.state}
                      </p>
                    )}
                    {venue.capacity > 0 && (
                      <p className="text-gray-700">
                        <span className="font-medium">Capacity:</span> {venue.capacity.toLocaleString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500">No venues assigned to this event.</p>
          )}
        </div>
      </div>
    </div>
  );
}
