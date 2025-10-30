/**
 * Generic error handler for server actions
 * Provides consistent error handling and type safety
 */

export type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Wraps an async action function with consistent error handling
 */
export async function withErrorHandling<T>(
  action: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "An unexpected error occurred";
    
    return { success: false, error: errorMessage };
  }
}

/**
 * Formats Supabase errors into user-friendly messages
 */
export function formatSupabaseError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: string }).message;
    
    // Handle common Supabase errors
    if (message.includes("row-level security")) {
      return "Permission denied. Please check your access rights.";
    }
    if (message.includes("duplicate key")) {
      return "This record already exists.";
    }
    if (message.includes("foreign key")) {
      return "Cannot perform this action due to related records.";
    }
    if (message.includes("not found")) {
      return "The requested resource was not found.";
    }
    
    return message;
  }
  
  return "An unexpected error occurred";
}

