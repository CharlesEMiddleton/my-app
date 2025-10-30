import { getEventDetails } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";
import { logoutAction } from "@/app/dashboard/actions";

// Force dynamic rendering - this page uses Supabase
export const dynamic = 'force-dynamic';

export default async function EventDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string }
}) {
  async function logout() {
    "use server";
    await logoutAction();
  }
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
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-cyan-950 relative">

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard">
            <Button variant="outline" className="border-cyan-700 text-cyan-300 hover:bg-cyan-900/30">← Back to Dashboard</Button>
          </Link>
          <Link href={`/events/edit/${event.id}`}>
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-black">Edit Event</Button>
          </Link>
        </div>

        <Card className="mb-6 border-cyan-800/40 bg-black/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl mb-2 text-cyan-400 font-extrabold tracking-tight">{event.name}</CardTitle>
            <CardDescription className="text-lg text-cyan-200/80">
              {event.sport_type} • {eventDate}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {event.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-cyan-300">Description</h3>
                <p className="text-cyan-100/90 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-cyan-300">Sport Type</h3>
                <p className="text-cyan-100/90">{event.sport_type}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-cyan-300">Event Date</h3>
                <p className="text-cyan-100/90">{eventDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-cyan-300">Venues ({event.venues?.length || 0})</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {event.venues && event.venues.length > 0 ? (
              event.venues.map((venue, index) => (
                <Card key={index} className="border-cyan-800/40 bg-black/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl text-cyan-200">{venue.name || "Unnamed Venue"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {venue.address && (
                        <p className="text-cyan-100/90">
                          <span className="font-medium">Address:</span> {venue.address}
                        </p>
                      )}
                      {(venue.city || venue.state) && (
                        <p className="text-cyan-100/90">
                          <span className="font-medium">Location:</span>{" "}
                          {venue.city && venue.state
                            ? `${venue.city}, ${venue.state}`
                            : venue.city || venue.state}
                        </p>
                      )}
                      {venue.capacity > 0 && (
                        <p className="text-cyan-100/90">
                          <span className="font-medium">Capacity:</span> {venue.capacity.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-cyan-200/80">No venues assigned to this event.</p>
            )}
          </div>
        </div>
      </div>

      {/* Subtle Logout in corner */}
      <div className="fixed bottom-3 right-3 opacity-60 hover:opacity-100 transition-opacity">
        <form action={logout}>
          <Button variant="outline" className="border-cyan-700 text-cyan-300 hover:bg-cyan-900/30">Logout</Button>
        </form>
      </div>
    </div>
  );
}
