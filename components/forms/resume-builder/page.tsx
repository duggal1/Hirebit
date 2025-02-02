// components/resume-preview.tsx (Enhanced)
'use client';

import { useResume } from '@/app/context/resumecontext';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, MapPin, Globe, Github, Linkedin,
  Building, Calendar, Code, Briefcase,
  GraduationCap, Wrench
} from 'lucide-react';
import { ResumeData } from '@/lib/resume-validator';

type WorkExperience = {
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  highlights: string[];
  technologies?: string[];
};

type Project = {
  name: string;
  description: string;
  url?: string;
  technologies?: string[];
  highlights?: string[];
};

type Skill = {
  name: string;
  category: 'technical' | 'soft' | 'tools';
};

type Education = {
  degree: string;
  institution: string;
  field?: string;
  year: number;
};

export function ResumePreview() {
  const { resumeData } = useResume();

  return (
    <ScrollArea className="h-full">
      <div className="space-y-8 p-8">
        {/* Personal Info */}
        {resumeData.personalInfo && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 font-bold text-3xl text-transparent">
              {resumeData.personalInfo.fullName}
            </h1>
            <div className="flex flex-wrap gap-4">
              {resumeData.personalInfo.email && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>{resumeData.personalInfo.email}</span>
                </div>
              )}
              {resumeData.personalInfo.location && (
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{resumeData.personalInfo.location}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              {resumeData.personalInfo.portfolio && (
                <a 
                  href={resumeData.personalInfo.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>Portfolio</span>
                </a>
              )}
              {resumeData.personalInfo.github && (
                <a 
                  href={resumeData.personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              )}
              {resumeData.personalInfo.linkedin && (
                <a 
                  href={resumeData.personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              )}
            </div>
          </motion.section>
        )}

        {/* Work Experience */}
        {resumeData.workExperience && resumeData.workExperience.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="flex items-center gap-2 font-semibold text-xl">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              Work Experience
            </h2>
            <div className="space-y-6">
              {(resumeData.workExperience as WorkExperience[]).map((exp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{exp.position}</h3>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Building className="w-4 h-4" />
                        <span>{exp.company}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{exp.startDate} - {exp.endDate || 'Present'}</span>
                    </div>
                  </div>
                  <ul className="space-y-2 ml-5 text-gray-300 list-disc">
                    {exp.highlights?.map((highlight, i) => (
                      <li key={i}>{highlight}</li>
                    ))}
                  </ul>
                  {exp.technologies && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {exp.technologies.map((tech, i) => (
                        <Badge key={i} variant="secondary" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Projects */}
        {resumeData.projects && resumeData.projects.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="flex items-center gap-2 font-semibold text-xl">
              <Code className="w-5 h-5 text-emerald-400" />
              Projects
            </h2>
            <div className="space-y-6">
              {(resumeData.projects as Project[]).map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-lg">{project.name}</h3>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-gray-400">{project.description}</p>
                  {project.highlights && (
                    <ul className="space-y-2 ml-5 text-gray-300 list-disc">
                      {project.highlights.map((highlight, i) => (
                        <li key={i}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                  {project.technologies && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, i) => (
                        <Badge key={i} variant="secondary" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Skills */}
        {resumeData.skills && resumeData.skills.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="flex items-center gap-2 font-semibold text-xl">
              <Wrench className="w-5 h-5 text-emerald-400" />
              Skills
            </h2>
            <div className="space-y-4">
              {['technical', 'soft', 'tools'].map((category) => {
                const skills = (resumeData.skills as Skill[]).filter(s => s.category === category);
                if (skills.length === 0) return null;

                return (
                  <div key={category} className="space-y-2">
                    <h3 className="text-gray-400 capitalize">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, i) => (
                        <Badge 
                          key={i}
                          variant="secondary"
                          className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        >
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Education */}
        {resumeData.education && resumeData.education.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="flex items-center gap-2 font-semibold text-xl">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
              Education
            </h2>
            <div className="space-y-4">
              {(resumeData.education as Education[]).map((edu, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between items-start"
                >
                  <div>
                    <h3 className="font-medium">{edu.degree}</h3>
                    <div className="text-gray-400">{edu.institution}</div>
                    {edu.field && (
                      <div className="text-gray-400">{edu.field}</div>
                    )}
                  </div>
                  <Badge variant="secondary" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                    {edu.year}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </ScrollArea>
  );
}