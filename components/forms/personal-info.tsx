// components/forms/personal-info.tsx
'use client';

import { useResume } from '@/app/context/resumecontext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResumeSchema } from '@/src/lib/resume-validator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AIAssistButton } from '@/components/ai-assist-button';

export function PersonalInfoForm() {
  const { updateSection, errors } = useResume();
  const { register, handleSubmit, setValue } = useForm({
    resolver: zodResolver(ResumeSchema.personalInfo)
  });

  const handleAIAssist = async (prompt: string) => {
    // AI integration logic
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-xl">Personal Information</h3>
        <AIAssistButton onGenerate={handleAIAssist} />
      </div>

      <div className="gap-4 grid grid-cols-2">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input {...register('fullName')} />
          {errors.personalInfo && errors.personalInfo.length > 0 && (
            <p className="text-red-500 text-sm">{errors.personalInfo[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <Input {...register('location')} placeholder="City, Country" />
        </div>

        <div className="space-y-2 col-span-2">
          <Label>Email</Label>
          <Input {...register('email')} type="email" />
        </div>

        <div className="space-y-2">
          <Label>Portfolio URL</Label>
          <Input {...register('portfolio')} placeholder="https://" />
        </div>

        <div className="space-y-2">
          <Label>GitHub URL</Label>
          <Input {...register('github')} placeholder="https://" />
        </div>

        <div className="space-y-2">
          <Label>LinkedIn URL</Label>
          <Input {...register('linkedin')} placeholder="https://" />
        </div>
      </div>

      <Button 
        onClick={handleSubmit(data => updateSection('personalInfo', data))}
        className="bg-emerald-600 hover:bg-emerald-700 w-full"
      >
        Save Information
      </Button>
    </div>
  );
}