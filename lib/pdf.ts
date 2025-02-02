import PDFDocument from 'pdfkit';
import { getFontPath, FONT_FAMILIES, type FontFamily } from './fonts';
import { type Prisma } from '@prisma/client';

type ResumeWithRelations = Prisma.ResumeGetPayload<{
  include: {
    personalInfo: true;
    workExperience: true;
    projects: true;
    education: true;
    skills: true;
  }
}>;

interface PDFOptions {
  font?: FontFamily;
  size?: 'A4' | 'Letter';
  margin?: number;
}

interface WorkExperience {
  position: string;
  company: string;
  startDate: Date;
  endDate?: Date | null;
  highlights: string[];
  location?: string | null;
}

interface Project {
  name: string;
  description: string;
  url?: string | null;
  technologies: string[];
  highlights: string[];
}

interface Education {
  degree: string;
  institution: string;
  year: number;
  location?: string | null;
}

interface Skill {
  name: string;
  category: string;
  proficiency?: number | null;
}

export async function generatePDF(
  resume: ResumeWithRelations, 
  options: PDFOptions = {}
): Promise<Buffer> {
  return new Promise<Buffer>(async (resolve, reject) => {
    try {
      let fontPath: string;
try {
  // Use the FontFamily type for default value
  fontPath = await getFontPath(options.font || 'HELVETICA');
} catch (fontError) {
  console.warn(`Primary font not found, using fallback: ${fontError}`);
  // Use the FontFamily key for fallback
  fontPath = await getFontPath('ROBOTO');
}
      const doc = new PDFDocument({
        size: options.size || 'A4',
        margin: options.margin || 50,
        font: fontPath,
        pdfVersion: '1.5',
        lang: 'en-US',
        tagged: true,
        displayTitle: true,
        info: {
          Title: `${resume.personalInfo?.fullName}'s Resume`,
          Author: resume.personalInfo?.fullName || '',
          Creator: 'Resume Builder App',
          Producer: 'Resume Builder (https://hirebit.dev)'
        }
      });

      // Collect chunks for the PDF
      const chunks: Uint8Array[] = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: Error) => reject(err));

      // Add content to the PDF
      try {
        // Personal Information
        if (resume.personalInfo) {
          doc.fontSize(24).font(fontPath).text(resume.personalInfo.fullName);
          doc.moveDown(0.5);
          
          doc.fontSize(12).font(fontPath);
          doc.text(resume.personalInfo.email);
          if (resume.personalInfo.location) {
            doc.text(resume.personalInfo.location);
          }
          
          // Links section
          const links = [
            resume.personalInfo.portfolio && { label: 'Portfolio', url: resume.personalInfo.portfolio },
            resume.personalInfo.github && { label: 'GitHub', url: resume.personalInfo.github },
            resume.personalInfo.linkedin && { label: 'LinkedIn', url: resume.personalInfo.linkedin }
          ].filter((link): link is { label: string; url: string } => Boolean(link && link.url));

          if (links.length > 0) {
            doc.moveDown();
            links.forEach(link => {
              doc.fontSize(10)
                 .fillColor('blue')
                 .text(link.label, { link: link.url, underline: true });
            });
          }
        }

        doc.moveDown(2);

        // Work Experience
        if (resume.workExperience.length > 0) {
          doc.fontSize(16).font(fontPath).text('Work Experience');
          doc.moveDown();

          resume.workExperience.forEach((exp: WorkExperience, index: number) => {
            doc.fontSize(14).text(exp.position);
            doc.fontSize(12).text(exp.company);
            
            const dateRange = [
              new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
              exp.endDate 
                ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : 'Present'
            ].join(' - ');
            
            doc.fontSize(10).text(dateRange);
            doc.moveDown(0.5);

            exp.highlights.forEach((highlight: string) => {
              doc.fontSize(10).text(`• ${highlight}`, { indent: 20 });
            });

            if (index < resume.workExperience.length - 1) {
              doc.moveDown();
            }
          });
        }

        doc.moveDown(2);

        // Projects
        if (resume.projects.length > 0) {
          doc.fontSize(16).font(fontPath).text('Projects');
          doc.moveDown();

          resume.projects.forEach((project: Project, index: number) => {
            doc.fontSize(14).text(project.name);
            doc.fontSize(12).text(project.description);
            
            if (project.url) {
              doc.fontSize(10)
                 .fillColor('blue')
                 .text(project.url, { link: project.url, underline: true });
            }

            if (project.technologies.length > 0) {
              doc.moveDown(0.5)
                 .fontSize(10)
                 .fillColor('black')
                 .text('Technologies: ' + project.technologies.join(', '));
            }

            doc.moveDown(0.5);
            project.highlights.forEach((highlight: string) => {
              doc.fontSize(10).text(`• ${highlight}`, { indent: 20 });
            });

            if (index < resume.projects.length - 1) {
              doc.moveDown();
            }
          });
        }

        // Education
        if (resume.education.length > 0) {
          doc.moveDown(2);
          doc.fontSize(16).font(fontPath).text('Education');
          doc.moveDown();

          resume.education.forEach((edu: Education, index: number) => {
            doc.fontSize(14).text(edu.degree);
            doc.fontSize(12).text(edu.institution);
            doc.fontSize(10).text(edu.year.toString());

            if (edu.location) {
              doc.fontSize(10).text(edu.location);
            }

            if (index < resume.education.length - 1) {
              doc.moveDown();
            }
          });
        }

        // Skills
        if (resume.skills.length > 0) {
          doc.moveDown(2);
          doc.fontSize(16).font(fontPath).text('Skills');
          doc.moveDown();

          const skillsByCategory = resume.skills.reduce<Record<string, string[]>>((acc, skill: Skill) => {
            acc[skill.category] = acc[skill.category] || [];
            acc[skill.category].push(skill.name);
            return acc;
          }, {});

          Object.entries(skillsByCategory).forEach(([category, skills]: [string, string[]]) => {
            doc.fontSize(12).text(category.charAt(0).toUpperCase() + category.slice(1));
            doc.fontSize(10).text(skills.join(', '));
            doc.moveDown(0.5);
          });
        }

        // Finalize the document
        doc.end();
      } catch (err) {
        const error = err as Error;
        reject(new Error('Failed to generate PDF content: ' + error.message));
      }
    } catch (err) {
      const error = err as Error;
      reject(new Error('Failed to initialize PDF document: ' + error.message));
    }
  });
} 