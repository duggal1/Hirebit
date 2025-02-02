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
import { Plus, X } from "lucide-react";
import { useState } from "react";

export function SkillsForm() {
  const { resumeData, updateSection, errors } = useResume();
  const [newSkill, setNewSkill] = useState("");
  const [category, setCategory] = useState<"technical" | "soft" | "tools">("technical");

  const addSkill = () => {
    if (!newSkill.trim()) return;

    const updatedSkills = [
      ...(resumeData.skills || []),
      { name: newSkill.trim(), category }
    ];

    updateSection("skills", updatedSkills);
    setNewSkill("");
  };

  const removeSkill = (index: number) => {
    const updatedSkills = (resumeData.skills || []).filter((_, i) => i !== index);
    updateSection("skills", updatedSkills);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Skills</h3>

      <div className="flex gap-2">
        <Select value={category} onValueChange={(value: "technical" | "soft" | "tools") => setCategory(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="soft">Soft Skills</SelectItem>
            <SelectItem value="tools">Tools</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Add a skill..."
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addSkill()}
        />
        <Button onClick={addSkill} size="icon">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {resumeData.skills?.map((skill, index) => (
          <div
            key={index}
            className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md text-primary"
          >
            <span className="text-sm">{skill.name}</span>
            <button
              onClick={() => removeSkill(index)}
              className="hover:text-primary/80"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {errors.skills && (
        <p className="text-destructive text-sm">{errors.skills.join(", ")}</p>
      )}
    </div>
  );
}
