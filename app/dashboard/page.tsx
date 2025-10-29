// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Welcome to your Dashboard</h1>
      <p className="mt-4">Only authenticated users can see this.</p>
    </div>
  );
}
