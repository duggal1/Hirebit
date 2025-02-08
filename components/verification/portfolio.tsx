import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";

// Add interfaces for data structure
interface BasicInfo {
  name: string;
  title: string;
  bio: string;
  location: string;
}

interface Contact {
  email: string;
  phone: string;
  website: string;
}

interface Experience {
  role: string;
  company: string;
  period: string;
  description: string;
  responsibilities: string[];
}

interface Education {
  institution: string;
  degree: string;
  period: string;
  field?: string;
  gpa?: string;
}

interface Project {
  title: string;
  description: string;
  technologies: string[];
  images: string[];
  url?: string;
  name?: string;
}

interface SocialLink {
  [key: string]: string;
}

interface PortfolioData {
  basics: BasicInfo;
  contacts: Contact;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  technologies: string[];
  socialLinks: SocialLink;
}

interface PortfolioResultsProps {
  data: PortfolioData;
  analysis: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    technicalScore: number;
    presentationScore: number;
    seoScore: number;
    contentScore: number;
    buzzwordScore: number;
    projectQualityScore: number;
    detailedAnalysis: {
      projectQuality: {
        score: number;
        details: string;
        improvements: string[];
      };
      skillPresentation: {
        score: number;
        details: string;
        improvements: string[];
      };
      professionalImage: {
        score: number;
        details: string;
        improvements: string[];
      };
      technicalDepth: {
        score: number;
        details: string;
        improvements: string[];
      };
      buzzwords: {
        score: number;
        found: string[];
        suggestions: string[];
      };
    };
  };
}

export function PortfolioResults({ data, analysis }: PortfolioResultsProps) {
  // Social links section with type safety
  const renderSocialLinks = () => {
    return Object.entries(data.socialLinks).map(([platform, url]) => {
      // Assign the dynamic icon component to a variable
      const IconComponent = Icons[platform as keyof typeof Icons];
      return (
        <a
          key={platform}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600"
        >
          {IconComponent && <IconComponent className="h-5 w-5" />}
        </a>
      );
    });
  };

  // Project image rendering with type safety
  const renderProjectImage = (project: Project) => {
    if (project.images && project.images.length > 0) {
      return (
        <div className="mt-4">
          <img
            src={project.images[0]}
            alt={project.title || "Project image"}
            className="rounded-md w-full h-48 object-cover"
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Basic Info Section */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{data.basics.name}</h2>
            <p className="text-gray-600">{data.basics.title}</p>
            <p className="text-sm text-gray-500 mt-2">{data.basics.bio}</p>
          </div>
          <div className="text-right">
            <p className="text-sm">{data.basics.location}</p>
            <div className="flex space-x-2 mt-2">{renderSocialLinks()}</div>
          </div>
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        <div className="grid grid-cols-2 gap-4">
          {data.contacts.email && (
            <div className="flex items-center space-x-2">
              <Icons.mail className="h-4 w-4 text-gray-500" />
              <span>{data.contacts.email}</span>
            </div>
          )}
          {data.contacts.phone && (
            <div className="flex items-center space-x-2">
              <Icons.phone className="h-4 w-4 text-gray-500" />
              <span>{data.contacts.phone}</span>
            </div>
          )}
          {data.contacts.website && (
            <div className="flex items-center space-x-2">
              <Icons.globe className="h-4 w-4 text-gray-500" />
              <a
                href={data.contacts.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {data.contacts.website}
              </a>
            </div>
          )}
        </div>
      </Card>

      {/* Experience Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Professional Experience
        </h3>
        <div className="space-y-4">
          {data.experience.map((exp: Experience, index: number) => (
            <div key={index} className="border-l-2 border-blue-500 pl-4">
              <h4 className="font-medium">{exp.role}</h4>
              <p className="text-sm text-gray-600">{exp.company}</p>
              <p className="text-sm text-gray-500">{exp.period}</p>
              <p className="text-sm mt-2">{exp.description}</p>
              {exp.responsibilities.length > 0 && (
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                  {exp.responsibilities.map((resp, idx: number) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Education Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Education</h3>
        <div className="space-y-4">
          {data.education.map((edu: Education, index: number) => (
            <div key={index}>
              <h4 className="font-medium">{edu.institution}</h4>
              <p className="text-sm text-gray-600">{edu.degree}</p>
              <p className="text-sm text-gray-500">{edu.period}</p>
              {edu.field && <p className="text-sm">Field: {edu.field}</p>}
              {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      </Card>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {data.projects.map((project: Project, index: number) => (
          <Card key={index} className="p-6">
            <h4 className="font-semibold">{project.title}</h4>
            <p className="text-sm text-gray-600 mt-2">
              {project.description}
            </p>
            {project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {project.technologies.map((tech, idx: number) => (
                  <Badge key={idx} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            )}
            {project.images.length > 0 && (
              <div className="mt-4">
                <img
                  src={project.images[0]}
                  alt={project.title}
                  className="rounded-md w-full h-48 object-cover"
                />
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Icons.barChart className="h-5 w-5" />
            Technical Analysis
          </h3>
          <Progress value={analysis.technicalScore} className="mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Score: {analysis.technicalScore}/100
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {analysis.detailedAnalysis.technicalDepth.details}
          </p>
          {analysis.detailedAnalysis.technicalDepth.improvements.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-2">
                Technical Improvements:
              </p>
              <ul className="space-y-1">
                {analysis.detailedAnalysis.technicalDepth.improvements.map(
                  (imp, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <Icons.arrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{imp}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Icons.layoutDashboard className="h-5 w-5" />
            Presentation Analysis
          </h3>
          <Progress value={analysis.presentationScore} className="mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Score: {analysis.presentationScore}/100
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {analysis.detailedAnalysis.professionalImage.details}
          </p>
          {analysis.detailedAnalysis.professionalImage.improvements.length >
            0 && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-2">
                Presentation Improvements:
              </p>
              <ul className="space-y-1">
                {analysis.detailedAnalysis.professionalImage.improvements.map(
                  (imp, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <Icons.arrowRight className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>{imp}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </Card>
      </div>

      {/* Buzzword Analysis */}
      <Card className="p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
          <Icons.alertCircle className="h-5 w-5 text-yellow-500" />
          Buzzword Analysis
        </h3>
        <Progress value={analysis.buzzwordScore} className="mb-4" />
        <p className="text-sm text-gray-600 mb-4">
          Buzzword Score: {analysis.buzzwordScore}/100
        </p>

        {analysis.detailedAnalysis.buzzwords.found.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">
              Detected Buzzwords:
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.detailedAnalysis.buzzwords.found.map(
                (word, i: number) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    {word}
                  </Badge>
                )
              )}
            </div>
          </div>
        )}

        {analysis.detailedAnalysis.buzzwords.suggestions.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">
              Improvement Suggestions:
            </p>
            <ul className="space-y-1">
              {analysis.detailedAnalysis.buzzwords.suggestions.map(
                (sugg, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <Icons.lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>{sugg}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Icons.trophy className="h-5 w-5 text-green-500" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, index: number) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Icons.check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Icons.alertTriangle className="h-5 w-5 text-yellow-500" />
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {analysis.weaknesses.map((weakness, index: number) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Icons.alertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Icons.lightbulb className="h-5 w-5 text-blue-500" />
            Suggestions
          </h3>
          <ul className="space-y-2">
            {analysis.suggestions.map((suggestion, index: number) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Icons.arrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Portfolio Details</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="font-medium mb-2">
              Technologies ({data.technologies.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.technologies.map((tech, index: number) => (
                <Badge key={index} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">
              Projects ({data.projects.length})
            </h4>
            <ul className="space-y-2">
              {data.projects.map((project: Project, index: number) => (
                <li key={index} className="text-sm flex items-center gap-2">
                  <Icons.arrowRight className="h-4 w-4 text-gray-400" />
                  {project.url ? (
                    <a
                      href={project.url}
                      className="text-blue-500 hover:underline"
                    >
                      {project.name}
                    </a>
                  ) : (
                    <span>{project.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
