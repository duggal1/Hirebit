 "use client";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="w-full"
    >
      {pending ? (
        <div className="flex items-center gap-2">
          <span className="animate-spin">↻</span>
          Submitting...
        </div>
      ) : "Submit Test"}
    </Button>
  );
}