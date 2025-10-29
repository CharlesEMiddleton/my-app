// app/dashboard/page.tsx
import { fetchEventsServerAction } from "./actions";
import DashboardClient from "./dashboard-client";

// Force dynamic rendering - dashboard uses Supabase server actions
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return <DashboardClient fetchEvents={fetchEventsServerAction} />;
}
