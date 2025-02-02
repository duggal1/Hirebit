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
  children?: React.ReactNode;
  accept?: string;
}

export function FileUpload({ onChange, value, disabled, className, children }: FileUploadProps) {
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
        <div className="flex flex-col justify-center items-center w-full h-full">
          <UploadDropzone
            endpoint="resumeUploader"
            onClientUploadComplete={(res) => {
              onChange(res[0].url); // Just pass the URL to parent component
              toast.success("Resume uploaded successfully!");
            }}
            onUploadError={(error: Error) => {
              toast.error(error.message || "Upload failed");
            }}
            className="ut-button:bg-primary ut-button:hover:bg-primary/90 ut-button:text-white ut-label:text-muted-foreground"
            disabled={disabled}
          />
          {children}
        </div>
      )}
    </div>
  );
} 