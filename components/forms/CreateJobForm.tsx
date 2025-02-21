"use client";

import { countryList } from "@/app/utils/countriesList";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { XIcon } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import { toast } from "sonner";
import { UploadDropzone } from "../general/UploadThingReExport";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobSchema } from "@/app/utils/zodSchemas";
import { SalaryRangeSelector } from "../general/SalaryRangeSelector";
import JobDescriptionEditor from "../richTextEditor/JobDescriptionEditor";
import BenefitsSelector from "../general/BenefitsSelector";
import { JobListingDurationSelector } from "../general/JobListingDurationSelector";
import { createJob } from "@/app/actions";
import { PaymentModal } from "../stripe/payment-modal";

interface CreateJobFormProps {
  companyName: string;
  companyLocation: string;
  companyAbout: string;
  companyLogo: string;
  companyXAccount: string | null;
  companyWebsite: string;
}

export function CreateJobForm({
  companyAbout,
  companyLocation,
  companyLogo,
  companyXAccount,
  companyName,
  companyWebsite,
}: CreateJobFormProps) {
  // Local state to handle comma‑separated input for skills

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  // Add at the top with other state declarations
const [jobId, setJobId] = useState<string | null>(null);

  const [skillsInput, setSkillsInput] = useState("");
  // State to manage preview generation
  const [generatingPreview, setGeneratingPreview] = useState(false);

  // Initialize react-hook-form with Zod validation
  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      // Existing default fields
      benefits: [],
      companyDescription: companyAbout,
      companyLocation: companyLocation,
      companyName: companyName,
      companyWebsite: companyWebsite,
      companyXAccount: companyXAccount || "",
      employmentType: "",
      jobDescription: "",
      jobTitle: "",
      location: "",
      salaryFrom: 0,
      salaryTo: 0,
      companyLogo: companyLogo,
      listingDuration: 30,
      skillsRequired: [],
      positionRequirement: "Entry",
      requiredExperience: 0,
      jobCategory: "",
      interviewStages: 1,
      visaSponsorship: false,
      compensationDetails: "",
    },
  });

  const [pending, setPending] = useState(false);

  // Function to trigger Gemini preview generation.
  async function generatePreview() {
    try {
      setGeneratingPreview(true);
      // Get current validated form data
      const currentValues = form.getValues();
      // Call the API endpoint for Gemini content generation
      const res = await fetch("/api/ai-jobpost-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobData: currentValues }),
      });
      if (!res.ok) {
        throw new Error("Failed to generate preview");
      }
        const { generatedContent } = await res.json();
        // Convert the generated content into a TipTap-compatible JSON format
        const editorContent = {
        type: "doc",
        content: [
          {
          type: "paragraph",
          content: [
            {
            type: "text",
            text: generatedContent
            }
          ]
          }
        ]
        };
        // Update the jobDescription field with the JSON stringified content
        form.setValue("jobDescription", JSON.stringify(editorContent));
      toast.success("Preview generated successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error("Error generating preview: " + error.message);
    } finally {
      setGeneratingPreview(false);
    }
  }

  async function onSubmit(values: z.infer<typeof jobSchema>) {
    try {
      setPending(true);
      
      // Create job post first
      const { success, jobId: createdJobId } = await createJob(values);
      
      if (!success || !createdJobId) {
        throw new Error('Failed to create job post');
      }
  
      console.log('Job created with initial status:', {
        jobId: createdJobId,
        status: 'pending_payment' // Initial status
      });
  
      // Map duration to price ID
      const priceIdMap: Record<number, string> = {
        30: 'price_1QuYsyRw85cV5wwQ5dPUcH75',
        60: 'price_1QuYqlRw85cV5wwQsiwP2aFK',
        90: 'price_1QuYs7Rw85cV5wwQZfNT5mIg',
      };
      
      const priceId = priceIdMap[values.listingDuration];
      if (!priceId) {
        throw new Error('Invalid listing duration');
      }
  
      // Open payment modal with correct values
      setSelectedPriceId(priceId);
      setJobId(createdJobId);
      setIsPaymentModalOpen(true);
      
      // Add listener for payment success
      window.addEventListener('payment_success', async () => {
        try {
          // Fetch updated job status
          const response = await fetch(`/api/jobs/${createdJobId}`);
          const job = await response.json();
          console.log('Job status after payment:', {
            jobId: createdJobId,
            status: job.status,
            paymentStatus: job.paymentStatus,
            activatedAt: job.activatedAt
          });
        } catch (error) {
          console.error('Error checking job status:', error);
        }
      });
      
    } catch (error: any) {
      console.error('Job creation error:', error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }
  
  

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8 col-span-1 lg:col-span-2"
      >
        {/* Job Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Job Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="gap-6 grid md:grid-cols-2">
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Job Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Employment Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Employment Type</SelectLabel>
                          <SelectItem value="full-time">Full Time</SelectItem>
                          <SelectItem value="part-time">Part Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="gap-6 grid md:grid-cols-2">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Worldwide</SelectLabel>
                          <SelectItem value="worldwide">
                            <span>🌍</span>
                            <span className="pl-2">Worldwide / Remote</span>
                          </SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Location</SelectLabel>
                          {countryList.map((country) => (
                            <SelectItem
                              value={country.name}
                              key={country.code}
                            >
                              <span>{country.flagEmoji}</span>
                              <span className="pl-2">{country.name}</span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Salary Range</FormLabel>
                <FormControl>
                  <SalaryRangeSelector
                    control={form.control}
                    minSalary={30000}
                    maxSalary={1000000}
                  />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.salaryFrom?.message ||
                    form.formState.errors.salaryTo?.message}
                </FormMessage>
              </FormItem>
            </div>

            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <JobDescriptionEditor field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Generate Preview Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={generatePreview}
                disabled={generatingPreview}
              >
                {generatingPreview ? "Generating Preview..." : "Generate Preview"}
              </Button>
            </div>

            <FormField
              control={form.control}
              name="benefits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Benefits</FormLabel>
                  <FormControl>
                    <BenefitsSelector field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Job Requirements Card */}
        <Card>
          <CardHeader>
            <CardTitle>Job Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Skills Required */}
            <FormField
              control={form.control}
              name="skillsRequired"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills Required</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter skills separated by commas (e.g. JavaScript, React)"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      onBlur={() => {
                        field.onChange(
                          skillsInput
                            .split(",")
                            .map((skill) => skill.trim())
                            .filter((skill) => skill.length > 0)
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Position Requirement */}
            <FormField
              control={form.control}
              name="positionRequirement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position Requirement</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Position Requirement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Entry">Entry</SelectItem>
                      <SelectItem value="Mid">Mid</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

        <FormField
  control={form.control}
  name="requiredExperience"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Required Experience (years)</FormLabel>
      <FormControl>
        <Input
          type="number"
          placeholder="e.g. 3"
          value={field.value}
          onChange={(e) => field.onChange(Number(e.target.value))}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>


            {/* Job Category */}
            <FormField
              control={form.control}
              name="jobCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Software Development, Marketing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          <FormField
  control={form.control}
  name="interviewStages"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Number of Interview Stages</FormLabel>
      <FormControl>
        <Input
          type="number"
          placeholder="e.g. 3"
          value={field.value}
          onChange={(e) => field.onChange(Number(e.target.value))}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

            {/* Visa Sponsorship */}
            <FormField
              control={form.control}
              name="visaSponsorship"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  </FormControl>
                  <FormLabel className="flex-1">Visa Sponsorship Available</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Compensation Details */}
            <FormField
              control={form.control}
              name="compensationDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compensation Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter additional details in JSON format (e.g. {"bonus": 5000, "stockOptions": "0.05"})'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Company Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="gap-6 grid md:grid-cols-2">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Company Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Worldwide</SelectLabel>
                          <SelectItem value="worldwide">
                            <span>🌍</span>
                            <span className="pl-2">Worldwide</span>
                          </SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Location</SelectLabel>
                          {countryList.map((country) => (
                            <SelectItem value={country.name} key={country.name}>
                              <span>{country.flagEmoji}</span>
                              <span className="pl-2">{country.name}</span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="gap-6 grid md:grid-cols-2">
              <FormField
                control={form.control}
                name="companyWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Website</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="flex justify-center items-center border-input bg-muted px-3 border border-r-0 rounded-l-md text-muted-foreground text-sm">
                          https://
                        </span>
                        <Input
                          {...field}
                          placeholder="Company Website"
                          className="rounded-l-none"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyXAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company X Account</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="flex justify-center items-center border-input bg-muted px-3 border border-r-0 rounded-l-md text-muted-foreground text-sm">
                          @
                        </span>
                        <Input
                          {...field}
                          placeholder="Company X Account"
                          className="rounded-l-none"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="companyDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Company Description"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyLogo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Logo</FormLabel>
                  <FormControl>
                    <div>
                      {field.value ? (
                        <div className="relative w-fit">
                          <Image
                            src={field.value}
                            alt="Company Logo"
                            width={100}
                            height={100}
                            className="rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="-top-2 -right-2 absolute"
                            onClick={() => field.onChange("")}
                          >
                            <XIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <UploadDropzone
                          endpoint="imageUploader"
                          onClientUploadComplete={(res) => {
                            field.onChange(res[0].url);
                            toast.success("Logo uploaded successfully!");
                          }}
                          onUploadError={() => {
                            toast.error(
                              "Something went wrong. Please try again."
                            );
                          }}
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Job Listing Duration Card */}
       {/* In the Job Listing Duration Card */}
      
<Card>
  <CardHeader>
    <CardTitle>Job Listing Duration</CardTitle>
  </CardHeader>
  <CardContent>
    <FormField
      control={form.control}
      name="listingDuration"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <JobListingDurationSelector field={field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </CardContent>
  <PaymentModal 
    isOpen={isPaymentModalOpen}
    onClose={() => setIsPaymentModalOpen(false)}
    priceId={selectedPriceId}
    jobId={jobId} // Pass the jobId here
  />
</Card>


        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Submitting..." : "Continue"}
        </Button>
      </form>
    </Form>
  );
}
