"use client";

import { Switch } from "@/src/app/_components/ui/switch";
import { Label } from "@/components/ui/label";

import { Loader2 } from "lucide-react";

interface AutoSaveHeaderProps {
  isAutoSaveEnabled: boolean;
  onAutoSaveChange: (enabled: boolean) => void;
  isSaving: boolean;
  lastSaved: Date | null;
}

export function AutoSaveHeader({
  isAutoSaveEnabled,
  onAutoSaveChange,
  isSaving,
  lastSaved,
}: AutoSaveHeaderProps) {
  return (
    <div className="">
      <div className="">
        <div className="">
          <h1 className="text-3xl font-bold"></h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
            
              <Label htmlFor="auto-save" className="text-sm">
               
              </Label>
            </div>
            {isSaving ? (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </div>
            ) : lastSaved ? (
              <p className="text-sm text-muted-foreground">
                Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
