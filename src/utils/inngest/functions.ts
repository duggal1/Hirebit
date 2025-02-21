import { inngest } from "./client";
import { prisma } from "../db";

export const handleJobExpiration = inngest.createFunction(
  { id: "job-expiration" },
  { event: "job/created" },
  async ({ event, step }) => {
    try {
      const { jobId, expirationDays } = event.data;

      // Validate input
      if (!jobId || !expirationDays) {
        throw new Error("Missing required fields: jobId or expirationDays");
      }

      // Wait for the specified duration
      await step.sleep("wait-for-expiration", `${expirationDays}d`);

      // Update job status to expired
      const updatedJob = await step.run("update-job-status", async () => {
        return await prisma.jobPost.update({
          where: { id: jobId },
          data: { status: "EXPIRED" },
        });
      });

      return { 
        jobId, 
        message: "Job marked as expired",
        status: "success",
        updatedJob: updatedJob.id 
      };
    } catch (error) {
      console.error("Error in handleJobExpiration:", error);
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
);
