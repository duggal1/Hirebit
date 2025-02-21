"use client"

import { useRouter, useParams } from "next/navigation";
import { JSX, useEffect, useState } from "react";
import { Education } from "@/components/resume/src/app/components/forms/Education";
import { PersonalInformation } from "@/components/resume/src/app/components/forms/PersonalInformation";
import { ProfessionalSummary } from "@/components/resume/src/app/components/forms/ProfessionalSummary";
import { Projects } from "@/components/resume/src/app/components/forms/Projects";
import { Skills } from "@/components/resume/src/app/components/forms/Skills";
import { WorkExperience } from "@/components/resume/src/app/components/forms/WorkExperience";
import { ResumePreview } from "@/components/resume/src/app/components/preview/ResumePreview";
import { SectionOrder } from "@/components/resume/src/app/components/template/SectionOrder";
import { TemplateSelector } from "@/components/resume/src/app/components/template/TemplateSelector";
import { TemplateProvider } from "@/components/resume/src/context/TemplateContext";
import {
  SectionOrderProvider,
  useSectionOrder,
} from "@/components/resume/src/context/SectionOrderContext";
import Navbar from "@/components/general/Navbar";
import { ThemeToggle } from "@/components/general/ThemeToggle";

// Utility function to validate UUID format
const isValidUUID = (uuid: string) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
};

function FormSections() {
  const { sections, isSectionVisible } = useSectionOrder();
  const sectionComponents: { [key: string]: JSX.Element } = {
    summary: <ProfessionalSummary />,
    skills: <Skills />,
    experience: <WorkExperience />,
    education: <Education />,
    projects: <Projects />,
  };

  return (
    <div className="space-y-6">
       <ThemeToggle />
      <TemplateSelector />
      <SectionOrder />
      <PersonalInformation />
      {sections.map((section) =>
        isSectionVisible(section.id) ? (
          <div key={section.id}>{sectionComponents[section.id]}</div>
        ) : null
      )}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { jobseekerid } = useParams();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (jobseekerid && typeof jobseekerid === "string") {
      const valid = isValidUUID(jobseekerid);
      setIsValid(valid);
      if (!valid) {
        router.push("/error"); // Redirect if invalid
      }
    }
  }, [jobseekerid, router]);

  if (!isValid) {
    return <div>Loading or Invalid JobSeeker ID...</div>;
  }

  return (
  
    

      
        <TemplateProvider>
          <SectionOrderProvider>
        
            <main className="container mx-auto py-8 px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSections />
                <div className="sticky top-8">
                  <ResumePreview />
                </div>
              </div>
            </main>
          </SectionOrderProvider>
        </TemplateProvider>
    
  
  );
}
