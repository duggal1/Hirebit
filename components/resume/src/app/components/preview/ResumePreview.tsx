"use client";

import {
  Education,
  PersonalInfo,
  ProfessionalSummary,
  Projects,
  Skills,
  WorkExperience,
} from "@/components/resume/src/app/schemas/resume";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSectionOrder } from "@/components/resume/src/context/SectionOrderContext";
// Removed useTemplate as custom colorScheme is no longer used.
import { loadFromLocalStorage } from "@/components/resume/src/lib/localStorage";
import { cn } from "@/src/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Updated custom styles: removed dynamic bg/text color logic and added modern heading colors.
const customStyles = {
  container: "max-w-4xl mx-auto p-8 font-['EB Garamond']",
  header: {
    title: "text-5xl font-extrabold tracking-tight mb-4 text-indigo-600", // Modern color added here
    subtitle: "flex items-center gap-6 text-base text-gray-600 mb-8",
  },
  section: {
    container: "py-6",
    title: "text-2xl uppercase tracking-wider font-extrabold mb-6 text-indigo-600", // Modern color added here
    content: "space-y-6",
  },
  text: {
    normal: "text-lg leading-relaxed",
    muted: "text-base",
  },
  badge: "px-3 py-1 bg-gray-50 text-base text-gray-600 rounded-full",
  separator: "my-6 bg-gray-100",
};

export function ResumePreview() {
  const targetRef = useRef<HTMLDivElement>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [professionalSummary, setProfessionalSummary] =
    useState<ProfessionalSummary | null>(null);
  const [workExperience, setWorkExperience] =
    useState<WorkExperience | null>(null);
  const [education, setEducation] = useState<Education | null>(null);
  const [skills, setSkills] = useState<Skills | null>(null);
  const [projects, setProjects] = useState<Projects | null>(null);

  // Removed template and colorScheme usage.
  const styles = customStyles;
  const { sections, isSectionVisible } = useSectionOrder();

  // The container always has a white background.
  const containerStyle: React.CSSProperties = {
    background: "white",
    fontFamily: "'EB Garamond', Garamond, serif",
  };

  useEffect(() => {
    // Load initial data from localStorage.
    const data = loadFromLocalStorage();
    if (data.personalInfo) setPersonalInfo(data.personalInfo);
    if (data.professionalSummary)
      setProfessionalSummary(data.professionalSummary);
    if (data.workExperience) setWorkExperience(data.workExperience);
    if (data.education) setEducation(data.education);
    if (data.skills) setSkills(data.skills);
    if (data.projects) setProjects(data.projects);

    // Listen for localStorage changes.
    const handleStorageChange = () => {
      const data = loadFromLocalStorage();
      if (data.personalInfo) setPersonalInfo(data.personalInfo);
      if (data.professionalSummary)
        setProfessionalSummary(data.professionalSummary);
      if (data.workExperience) setWorkExperience(data.workExperience);
      if (data.education) setEducation(data.education);
      if (data.skills) setSkills(data.skills);
      if (data.projects) setProjects(data.projects);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-blue-500";
      case "Intermediate":
        return "bg-green-500";
      case "Advanced":
        return "bg-purple-500";
      case "Expert":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleDownload = async () => {
    if (!targetRef.current) return;
    try {
      const content = targetRef.current;

      // Apply PDF-specific styles.
      content.style.background = "white";
      content.style.width = "210mm"; // A4 width
      content.style.padding = "20mm";
      content.style.position = "relative";

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: content.scrollWidth,
        windowHeight: content.scrollHeight,
      });

      // Reset styles.
      content.style.width = "";
      content.style.padding = "";
      content.style.position = "";

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page.
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add extra pages if needed.
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(
        `${personalInfo?.firstName}_${personalInfo?.lastName}_Resume.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  if (!personalInfo) {
    return (
      <Card className="h-full bg-white">
        <CardHeader>
          <CardTitle className="font-extrabold tracking-wide text-2xl">
            Resume Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-gray-500">
            Start filling out your information to see the preview.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group skills by category.
  const groupedSkills: Record<string, any[]> =
    skills && skills.skills && skills.skills.length > 0
      ? skills.skills.reduce((groups: Record<string, any[]>, skill: any) => {
          const category = skill.category || "Other";
          if (!groups[category]) groups[category] = [];
          groups[category].push(skill);
          return groups;
        }, {})
      : {};

  const sectionComponents = {
    summary:
      professionalSummary &&
      professionalSummary.summary && (
        <>
          <Separator className={styles.separator} />
          <div className={styles.section.container}>
            <h3 className={styles.section.title}>Professional Summary</h3>
            <p className={styles.text.normal}>{professionalSummary.summary}</p>
          </div>
        </>
      ),
    skills:
      skills &&
      skills.skills &&
      skills.skills.length > 0 && (
        <>
          <Separator className={styles.separator} />
          <div className={styles.section.container}>
            <h3 className={styles.section.title}>Skills</h3>
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(groupedSkills).map(([category, skillsInCategory]) => (
                <div key={category}>
                  <h4 className="text-xl font-extrabold text-gray-900 mb-3">
                    {category}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skillsInCategory.map((skill: any, index: number) => (
                      <span
                        key={typeof skill.name === "string" ? skill.name : index}
                        className={styles.badge}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ),
    experience:
      workExperience &&
      workExperience.experiences &&
      workExperience.experiences.length > 0 && (
        <>
          <Separator className={styles.separator} />
          <div className={styles.section.container}>
            <h3 className={styles.section.title}>Work Experience</h3>
            <div className={styles.section.content}>
              {workExperience.experiences.map((experience) => (
                <div key={experience.id} className="space-y-3">
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-2xl font-extrabold text-gray-900">
                        {experience.position}
                      </h4>
                      <span className={styles.text.muted}>
                        {experience.current
                          ? `${experience.startDate} - Present`
                          : `${experience.startDate} - ${experience.endDate}`}
                      </span>
                    </div>
                    <p className={styles.text.muted}>
                      {experience.company} • {experience.location}
                    </p>
                  </div>
                  <p className={styles.text.normal}>{experience.description}</p>
                  {experience.highlights &&
                    experience.highlights.length > 0 && (
                      <ul className={cn(styles.text.normal, "relative space-y-2 ml-4")}>
                        {experience.highlights.map((highlight: any, index: number) => (
                          <li key={index}>
                            <span className="absolute -left-4 top-2 w-1.5 h-1.5 bg-gray-300 rounded-full" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              ))}
            </div>
          </div>
        </>
      ),
    education:
      education &&
      education.education &&
      education.education.length > 0 && (
        <>
          <Separator className={styles.separator} />
          <div className={styles.section.container}>
            <h3 className={styles.section.title}>Education</h3>
            <div className={styles.section.content}>
              {education.education.map((edu) => (
                <div key={edu.id} className="space-y-3">
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-2xl font-extrabold text-gray-900">
                        {edu.school}
                      </h4>
                      <span className={styles.text.muted}>
                        {edu.current
                          ? `${edu.startDate} - Present`
                          : `${edu.startDate} - ${edu.endDate}`}
                      </span>
                    </div>
                    <p className={styles.text.muted}>
                      {edu.degree} in {edu.field} • {edu.location}
                      {edu.gpa && <span> • GPA: {edu.gpa}</span>}
                    </p>
                  </div>
                  {edu.description && (
                    <p className={styles.text.normal}>{edu.description}</p>
                  )}
                  {edu.achievements &&
                    edu.achievements.length > 0 && (
                      <ul className={cn(styles.text.normal, "relative space-y-2 ml-4")}>
                        {edu.achievements.map((achievement: any, index: number) => (
                          <li key={index}>
                            <span className="absolute -left-4 top-2 w-1.5 h-1.5 bg-gray-300 rounded-full" />
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              ))}
            </div>
          </div>
        </>
      ),
    projects:
      projects &&
      projects.projects &&
      projects.projects.length > 0 && (
        <>
          <Separator className={styles.separator} />
          <div className={styles.section.container}>
            <h3 className={styles.section.title}>Projects</h3>
            <div className={styles.section.content}>
              {projects.projects.map((project) => (
                <div key={project.id} className="space-y-3">
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-2xl font-extrabold text-gray-900">
                          {project.name}
                        </h4>
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-green-500 hover:text-green-600 transition-colors"
                          >
                            View Project ↗
                          </a>
                        )}
                      </div>
                      <span className={styles.text.muted}>
                        {project.current
                          ? `${project.startDate} - Present`
                          : `${project.startDate} - ${project.endDate}`}
                      </span>
                    </div>
                    <p className={styles.text.normal}>{project.description}</p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.technologies.map((tech: any, index: number) => (
                          <span key={index} className={styles.badge}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    {project.highlights && project.highlights.length > 0 && (
                      <ul className={cn(styles.text.normal, "relative space-y-2 ml-4")}>
                        {project.highlights.map((highlight: any, index: number) => (
                          <li key={index}>
                            <span className="absolute -left-4 top-2 w-1.5 h-1.5 bg-gray-300 rounded-full" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ),
  };

  return (
    <Card className="h-full bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-extrabold tracking-wide text-2xl">
          Resume Preview
        </CardTitle>
        {personalInfo && (
          <Button
            onClick={handleDownload}
            size="sm"
            variant="outline"
            className="hover:bg-gray-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div ref={targetRef} className={styles.container} style={containerStyle}>
          {/* Removed custom text color wrapper; headings now get their color from the styles */}
          <div>
            <h2 className={styles.header.title}>
              {personalInfo.firstName} {personalInfo.lastName}
            </h2>
            <div className={styles.header.subtitle}>
              <p>{personalInfo.email}</p>
              <span>•</span>
              <p>{personalInfo.phone}</p>
              <span>•</span>
              <p>{personalInfo.location}</p>
            </div>
          </div>
          {sections.map(
            (section) =>
              isSectionVisible(section.id) && (
                <div key={section.id}>{sectionComponents[section.id]}</div>
              )
          )}
        </div>
      </CardContent>
    </Card>
  );
}