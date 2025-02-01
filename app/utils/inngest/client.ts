import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ 
  id: "my-app",
  // Add better logging
  logger: {
    debug: console.debug,
    error: console.error,
    info: console.info,
    warn: console.warn,
  }
});
