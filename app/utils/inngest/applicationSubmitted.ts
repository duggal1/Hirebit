import { prisma } from "../db";
import { analyzeCandidateMatch } from "../jobAnalysis";


// Define your event payload type
type ApplicationSubmittedEvent = {
  data: {
    applicationId: string;
  };
};

// A simple handler that returns a Promise with an object containing analysis
const applicationSubmitted = async (
  event: ApplicationSubmittedEvent
): Promise<{ analysis: any }> => {
  const { applicationId } = event.data;

  // Retrieve the application record to get jobId, etc.
  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    select: { jobId: true },
  });
  if (!application) {
    throw new Error("Application not found for analysis.");
  }
  const jobId = application.jobId;

  // Run candidate match analysis
  const analysis = await analyzeCandidateMatch(jobId, applicationId);

  console.log("Candidate analysis completed:", analysis);

  return { analysis };
};

export default applicationSubmitted;
