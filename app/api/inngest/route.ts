import { inngest } from "@/app/utils/inngest/client";
import { sendPaymentInvoiceEmail } from "@/app/utils/inngest/email";
import { serve } from "inngest/next";

console.log("Registering Inngest functions");

const functions = [sendPaymentInvoiceEmail];

console.log("Available functions:", functions.map(f => f.name));

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: functions,
  logLevel: "debug", // Add this for more detailed logging
});

console.log("Inngest functions registered");