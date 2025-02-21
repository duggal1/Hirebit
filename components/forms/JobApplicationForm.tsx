"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitJobApplication } from "@/src/app/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


const formSchema = z.object({
  coverLetter: z.string().min(100, "Cover letter must be at least 100 characters"),
});

interface JobApplicationFormProps {
  jobSeeker: {
    id: string;
    resume: string;
  };
  jobId: string;
  job: {
    jobTitle: string;
    company: {
      name: string;
      logo: string;
    };
  };
}

export function JobApplicationForm({ jobSeeker, jobId, job }: JobApplicationFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const formData = new FormData();
      formData.append("coverLetter", values.coverLetter);
      await submitJobApplication(jobId, formData);
      toast.success("Application submitted successfully!");
      router.push("/applications");
    } catch (error) {
      toast.error("Failed to submit application");
    }
  }

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Apply for {job.jobTitle}</CardTitle>
        <p className="text-muted-foreground">
          Your application will be sent to {job.company.name}
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="coverLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Letter</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us why you're a great fit for this role..."
                      className="min-h-[200px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" size="lg">
                Submit Application
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 