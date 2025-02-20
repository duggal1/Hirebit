"use client";

import { deleteJobPost } from "@/app/actions";
import { GeneralSubmitButton } from "@/components/general/SubmitButtons";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2Icon, ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import React, { useState } from "react";

type Params = { jobId: string };

const DeleteJobPage = ({ params }: { params: Params }) => {
  const router = useRouter();
  const { jobId } = params;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!jobId) return;

    try {
      setIsDeleting(true);
      const result = await deleteJobPost(jobId);

      if (result.success) {
        toast.success(
          `Job post "${result.jobTitle}" in ${result.location} has been successfully deleted`
        );
        router.replace("/");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete job post");
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred while deleting the job post");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto w-full">
      <CardHeader>
        <CardTitle>Are you absolutely sure?</CardTitle>
        <CardDescription>
          This action cannot be undone. This will permanently delete your
          job post and remove all related data including metrics, applications,
          and saved references from our servers.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-end gap-4">
        <Link
          href="/my-jobs"
          className={buttonVariants({ variant: "outline" })}
        >
          <ArrowLeftIcon className="size-4" />
          Cancel
        </Link>
        <form action={handleDelete}>
          <GeneralSubmitButton
            text="Delete Job"
            variant="destructive"
            icon={<Trash2Icon className="size-4" />}
            disabled={isDeleting}
          />
        </form>
      </CardFooter>
    </Card>
  );
};

export default DeleteJobPage;