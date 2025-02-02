"use client";

import { UploadDropzone } from "./UploadThingReExport";
import { toast } from "sonner";
import { XIcon, FileText } from "lucide-react";
import { Button } from "../ui/button";

interface FileUploadProps {
  onChange: (url: string) => void;
  value?: string;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({ onChange, value, disabled, className }: FileUploadProps) {
  return (
    <div className={className}>
      {value ? (
        <div className="flex items-center gap-4 p-4 border rounded-lg">
          <FileText className="w-8 h-8 text-primary" />
          <div className="flex-1">
            <p className="font-medium text-sm">Resume uploaded</p>
            <p className="text-muted-foreground text-xs">PDF file</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            disabled={disabled}
          >
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <UploadDropzone
          endpoint="resumeUploader"
          onClientUploadComplete={async (res) => {
            try {
              // Validate resume
              const response = await fetch('/api/validate-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeUrl: res[0].url }),
              });
              
              const analysis = await response.json();
              
              if (analysis.isValid) {
                onChange(res[0].url);
                toast.success("Resume uploaded successfully!");
                
                // Show feedback
                if (analysis.feedback.improvements.length > 0) {
                  toast.info(
                    <div>
                      <p className="mb-1 font-medium">Resume Feedback:</p>
                      <ul className="pl-4 text-sm list-disc">
                        {analysis.feedback.improvements.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>,
                    { duration: 5000 }
                  );
                }
              } else {
                toast.error(analysis.feedback.overallFeedback);
                onChange("");
              }
            } catch (error) {
              toast.error("Failed to process resume");
              onChange("");
            }
          }}
          onUploadError={(error: Error) => {
            toast.error(error.message || "Upload failed");
          }}
          className="ut-button:bg-primary ut-button:hover:bg-primary/90 ut-button:text-white ut-label:text-muted-foreground"
          disabled={disabled}
        />
      )}
    </div>
  );
} 