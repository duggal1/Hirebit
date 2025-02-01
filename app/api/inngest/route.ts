import { inngest } from "@/app/utils/inngest/client";
import { handleJobExpiration } from "@/app/utils/inngest/functions";
import { serve } from "inngest/next";

// Create an API that serves the functions with error handling
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [handleJobExpiration],
  // Add better error handling for the serve middleware
  onError: (error: { message: any; }) => {
    console.error("Inngest serve error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
