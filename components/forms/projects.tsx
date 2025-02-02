 "use client";

import { useResume } from "@/app/context/resumecontext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export function ProjectsForm() {
  const { resumeData, updateSection, errors } = useResume();
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    url: "",
    technologies: [] as string[],
    highlights: [] as string[]
  });
  const [newTech, setNewTech] = useState("");
  const [newHighlight, setNewHighlight] = useState("");

  const addProject = () => {
    if (!newProject.name || !newProject.description) return;

    const updatedProjects = [
      ...(resumeData.projects || []),
      newProject
    ];

    updateSection("projects", updatedProjects);
    setNewProject({
      name: "",
      description: "",
      url: "",
      technologies: [],
      highlights: []
    });
  };

  const removeProject = (index: number) => {
    const updatedProjects = (resumeData.projects || []).filter((_, i) => i !== index);
    updateSection("projects", updatedProjects);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Add Project</h3>

        <div className="space-y-4">
          <Input
            placeholder="Project Name"
            value={newProject.name}
            onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
          />

          <Input
            placeholder="Project URL"
            value={newProject.url}
            onChange={(e) => setNewProject(prev => ({ ...prev, url: e.target.value }))}
          />

          <Textarea
            placeholder="Project Description"
            value={newProject.description}
            onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
          />

          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Add Technology"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && newTech) {
                    setNewProject(prev => ({
                      ...prev,
                      technologies: [...prev.technologies, newTech]
                    }));
                    setNewTech("");
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                onClick={() => {
                  if (newTech) {
                    setNewProject(prev => ({
                      ...prev,
                      technologies: [...prev.technologies, newTech]
                    }));
                    setNewTech("");
                  }
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {newProject.technologies.map((tech, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => {
                    setNewProject(prev => ({
                      ...prev,
                      technologies: prev.technologies.filter((_, i) => i !== index)
                    }));
                  }}
                >
                  {tech}
                  <Trash className="ml-2 w-3 h-3" />
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={addProject} className="w-full">
            Add Project
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Projects</h3>

        {resumeData.projects?.map((project, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{project.name}</h4>
                <a href={project.url} className="text-primary text-sm hover:underline">
                  {project.url}
                </a>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeProject(index)}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-muted-foreground text-sm">{project.description}</p>

            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, techIndex) => (
                <Badge key={techIndex} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>

      {errors.projects && (
        <p className="text-destructive text-sm">{errors.projects.join(", ")}</p>
      )}
    </div>
  );
}