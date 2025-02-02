// components/forms/work-experience.tsx
'use client';

import { useResume } from '@/app/context/resumecontext';
import { useForm } from 'react-hook-form';
//import { WorkExperienceSchema } from '@/lib/schemas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash } from 'lucide-react';
import { Button } from '../ui/button';

export function WorkExperienceForm() {
  const { resumeData, updateSection, errors } = useResume();
  const { register, handleSubmit, setValue } = useForm();

  const addExperience = (data: any) => {
    const newExperience = [...(resumeData.workExperience || []), data];
    updateSection('workExperience', newExperience);
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-xl">Work Experience</h3>

      {(resumeData.workExperience || []).map((exp, index) => (
        <div key={index} className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-medium">{exp.position}</h4>
              <p className="text-gray-400 text-sm">{exp.company}</p>
            </div>
            <Button variant="ghost" size="sm" className="hover:bg-red-500/10 text-red-500">
              <Trash className="w-4 h-4" />
            </Button>
          </div>

          <div className="gap-4 grid grid-cols-2">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input {...register(`startDate`)} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input {...register(`endDate`)} placeholder="Present" />
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <Label>Achievements</Label>
            {exp.highlights.map((highlight, hIndex) => (
              <div key={hIndex} className="flex items-center gap-2">
                <Input {...register(`highlights.${hIndex}`)} />
                <Button variant="ghost" size="sm" className="text-red-500">
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setValue(`highlights.${exp.highlights.length}`, '')}
            >
              <Plus className="mr-2 w-4 h-4" />
              Add Highlight
            </Button>
          </div>
        </div>
      ))}

      <Button 
        onClick={handleSubmit(addExperience)}
        className="bg-emerald-600 hover:bg-emerald-700 w-full"
      >
        <Plus className="mr-2 w-4 h-4" />
        Add Experience
      </Button>

      {errors.workExperience && (
        <div className="text-red-500 text-sm">
          {errors.workExperience.join(', ')}
        </div>
      )}
    </div>
  );
}