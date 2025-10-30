"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  // Use the dashboard logout server action via a dynamic import to avoid client Supabase usage
  const logout = async () => {
    try {
      const { logoutAction } = await import("@/app/dashboard/actions");
      await logoutAction();
      router.push("/auth/login");
    } catch {
      router.push("/auth/login");
    }
  };

  return <Button onClick={logout}>Logout</Button>;
}
