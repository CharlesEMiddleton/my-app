"use server";

import { createClient } from "@/lib/supabase/server";
import { withErrorHandling, type ActionResult } from "@/lib/actions/error-handler";
import { redirect } from "next/navigation";

/**
 * Sign in with email and password
 */
export async function signInAction(email: string, password: string): Promise<ActionResult<void>> {
  return withErrorHandling(async () => {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Redirect happens client-side after success
    return undefined;
  });
}

/**
 * Sign up with email and password
 */
export async function signUpAction(
  email: string,
  password: string,
  redirectTo?: string
): Promise<ActionResult<void>> {
  return withErrorHandling(async () => {
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return undefined;
  });
}

/**
 * Send password reset email
 */
export async function resetPasswordAction(
  email: string,
  redirectTo?: string
): Promise<ActionResult<void>> {
  return withErrorHandling(async () => {
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/update-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return undefined;
  });
}

/**
 * Update user password
 */
export async function updatePasswordAction(password: string): Promise<ActionResult<void>> {
  return withErrorHandling(async () => {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      throw new Error(error.message);
    }

    return undefined;
  });
}

