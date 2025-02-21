'use client';

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { ResumeData } from "@/src/lib/resume-validator";
import { updateResumeSection } from "@/app/actions/resume";

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
}

export const useAutoSave = <T extends object>(
  data: T,
  section: keyof ResumeData,
  isEnabled: boolean = true
): AutoSaveState => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const previousDataRef = useRef<T | null>(null);

  // Helper function to check if data has changed
  const hasDataChanged = (newData: T) => {
    if (!previousDataRef.current) return true;
    return JSON.stringify(newData) !== JSON.stringify(previousDataRef.current);
  };

  // Debounced save function
  const debouncedSave = useDebouncedCallback(
    async (newData: T) => {
      if (!isEnabled || !Object.keys(newData).length) return;

      // Only save if data has actually changed
      if (!hasDataChanged(newData)) return;

      setIsSaving(true);
      try {
        const result = await updateResumeSection(section, newData);
        if (!result.success) {
          throw new Error(result.error);
        }
        setLastSaved(new Date());
        previousDataRef.current = newData;
        toast.success("Changes saved automatically");
      } catch (error) {
        toast.error("Failed to save changes");
        console.error("Auto-save error:", error);
      } finally {
        setIsSaving(false);
      }
    },
    1000 // 1 second delay
  );

  // Watch for data changes and trigger save
  useEffect(() => {
    if (isEnabled) {
      debouncedSave(data);
    }
  }, [data, debouncedSave, isEnabled]);

  return {
    isSaving,
    lastSaved,
  };
}; 