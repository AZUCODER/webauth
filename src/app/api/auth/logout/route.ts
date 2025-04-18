import { logoutHandler } from "@/actions/auth/logoutActions";
import { NextResponse } from "next/server";

/**
 * API route for handling logout requests from the client side
 * Uses the server-side logoutHandler for consistent logout behavior
 */
export async function POST() {
  try {
    // Call the shared logout handler
    const result = await logoutHandler();
    
    // Return the result as JSON
    return NextResponse.json(result);
  } catch (error) {
    console.error("API logout error:", error);
    
    // Return an error response
    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 