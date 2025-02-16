import React from 'react';
import { UploadDropzone } from "./UploadThingReExport";
import { toast } from "sonner";
import { XIcon, FileText, Upload } from "lucide-react";
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
    <div className={`transition-all duration-500 ${className}`}>
      {value ? (
        <div className="group relative overflow-hidden bg-gradient-to-r from-slate-900/40 to-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-800/50 shadow-[0_0_15px_rgba(0,0,0,0.2)] dark:shadow-[0_0_25px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_35px_rgba(0,0,0,0.5)] transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/2 opacity-50" />
          <div className="flex items-center gap-8 p-7 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-pulse-slow" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl blur-sm" />
              <FileText className="w-12 h-12 text-primary/80 relative z-10" />
            </div>
            
            <div className="flex-1 space-y-2">
              <p className="font-medium text-base text-slate-100/90">
                Resume uploaded
              </p>
              <p className="text-slate-400/80 text-sm">
                PDF document ready
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange("")}
              disabled={disabled}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400 rounded-xl"
            >
              <XIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-primary/5 to-primary/3 rounded-2xl animate-gradient blur-xl" />
          
          <div className="relative border-[2.5px] border-dashed border-slate-700/50 dark:border-slate-700/30 rounded-2xl bg-slate-900/50 backdrop-blur-xl transition-all duration-500 group-hover:border-primary/30">
            <div className="flex flex-col justify-center items-center w-full min-h-[240px] p-10">
              <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-md" />
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse-slow" />
                <Upload className="w-14 h-14 text-primary/80 relative z-10" />
              </div>

              <UploadDropzone
                endpoint="resumeUploader"
                onClientUploadComplete={(res) => {
                  onChange(res[0].url);
                  toast.success("Resume uploaded successfully!");
                }}
                onUploadError={(error: Error) => {
                  toast.error(error.message || "Upload failed");
                }}
                className="ut-button:bg-gradient-to-r ut-button:from-primary/80 ut-button:to-primary/70 
                  ut-button:hover:from-primary/90 ut-button:hover:to-primary/80
                  ut-button:text-white/90 ut-label:text-slate-300
                  ut-button:shadow-[0_0_20px_rgba(0,0,0,0.3)] ut-button:hover:shadow-[0_0_30px_rgba(0,0,0,0.4)]
                  ut-button:transition-all ut-button:duration-500
                  ut-button:rounded-xl ut-button:font-medium ut-button:px-8 ut-button:py-4
                  ut-upload-icon:text-primary/80 ut-upload-icon:w-10 ut-upload-icon:h-10
                  ut-label:font-medium ut-label:text-base
                  ut-allowed-content:text-slate-400 dark:ut-allowed-content:text-slate-500
                  ut-container:border-none ut-container:bg-transparent
                  hover:ut-button:scale-[1.02] active:ut-button:scale-[0.98]"
                disabled={disabled}
              />
              
              <div className="mt-6 text-center space-y-3">
                {children}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add this to your global CSS
const styles = `
@keyframes gradient {
  0%, 100% { background-position: 0% 50%; opacity: 0.5; }
  50% { background-position: 100% 50%; opacity: 0.8; }
}

.animate-gradient {
  background-size: 400% 400%;
  animation: gradient 8s ease infinite;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.4; }
}

.animate-pulse-slow {
  animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
`;