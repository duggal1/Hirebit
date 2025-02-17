"use client";


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

function FormSections() {
  const { sections, isSectionVisible } = useSectionOrder();

  const sectionComponents = {
    summary: <ProfessionalSummary />,
    skills: <Skills />,
    experience: <WorkExperience />,
    education: <Education />,
    projects: <Projects />,
  };

  return (
    <div className="space-y-6">
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