// app/dashboard/page.tsx
import { fetchEventsServerAction } from "./actions";
import DashboardClient from "./dashboard-client";

export default function DashboardPage() {
  return <DashboardClient fetchEvents={fetchEventsServerAction} />;
}
