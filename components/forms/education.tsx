"use client";

import { useResume } from "@/app/context/resumecontext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent, 
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash } from "lucide-react";
import { useState } from "react";

interface EducationEntry {
  degree: string;
  institution: string;
  year: number;
  field: string;
}

export function EducationForm() {
  const { resumeData, updateSection, errors } = useResume();
  const [newEducation, setNewEducation] = useState<EducationEntry>({
    degree: "",
    institution: "",
    year: new Date().getFullYear(),
    field: "",
  });

  const addEducation = () => {
    if (!newEducation.degree || !newEducation.institution) return;

    const updatedEducation = [
      ...(resumeData.education || []),
      newEducation
    ];

    updateSection("education", updatedEducation);
    setNewEducation({
      degree: "",
      institution: "",
      year: new Date().getFullYear(),
      field: "",
    });
  };

  const removeEducation = (index: number) => {
    const updatedEducation = (resumeData.education || []).filter((_, i) => i !== index);
    updateSection("education", updatedEducation);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Add Education</h3>

        <div className="space-y-4">
          <Input
            placeholder="Degree (e.g., Bachelor of Science)"
            value={newEducation.degree}
            onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
          />

          <Input
            placeholder="Institution"
            value={newEducation.institution}
            onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
          />

          <Input
            placeholder="Field of Study"
            value={newEducation.field}
            onChange={(e) => setNewEducation(prev => ({ ...prev, field: e.target.value }))}
          />

          <Select
            value={newEducation.year.toString()}
            onValueChange={(value) => setNewEducation(prev => ({ ...prev, year: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Graduation Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={addEducation} className="w-full">
            Add Education
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Education History</h3>

        {resumeData.education?.map((edu, index) => (
          <div key={index} className="space-y-2 p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{edu.degree}</h4>
                <p className="text-muted-foreground text-sm">{edu.institution}</p>
                <p className="text-muted-foreground text-sm">
                  {edu.field} • {edu.year}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeEducation(index)}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {errors.education && (
        <p className="text-destructive text-sm">{errors.education.join(", ")}</p>
      )}
    </div>
  );
}
