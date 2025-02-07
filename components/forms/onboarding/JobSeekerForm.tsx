"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { jobSeekerSchema } from "@/app/utils/zodSchemas";
import { useState } from "react";
import { toast } from "@/app/_components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { PlusCircle, X, Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { createJobSeeker } from "@/app/actions";

export default function JobSeekerForm() {
  const form = useForm<z.infer<typeof jobSeekerSchema>>({
    resolver: zodResolver(jobSeekerSchema),
    defaultValues: {
      name: "",
      about: "",
      resume: "",
      location: "",
      expectedSalaryMin: null,
      expectedSalaryMax: null,
      preferredLocation: "",
      remotePreference: "Hybrid",
      yearsOfExperience: 0,
      skills: [],
      certifications: null,
      availabilityPeriod: 30,
      education: [{
        degree: "",
        institution: "",
        year: new Date().getFullYear()
      }],
      educationDetails: [{
        degree: "",
        institution: "",
        year: new Date().getFullYear(),
        fieldOfStudy: ""
      }],
      desiredEmployment: "Full-time",
      experience: 0,
      phoneNumber: "",
      linkedin: "",
      github: "",
      portfolio: ""
    },
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    name: "education",
    control: form.control,
  });

  const {
    fields: certFields,
    append: appendCert,
    remove: removeCert,
  } = useFieldArray({
    name: "certifications",
    control: form.control,
  });

  const [pending, setPending] = useState(false);
  const [currentSkill, setCurrentSkill] = useState("");

  async function onSubmit(values: z.infer<typeof jobSeekerSchema>) {
    try {
      setPending(true);
      await createJobSeeker(values);
      toast({
        title: "Success",
        description: "Your profile has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="font-semibold text-xl">Basic Information</h2>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="about"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="resume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resume URL</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input {...field} placeholder="https://..." />
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location & Preferences */}
        <div className="space-y-4">
          <h2 className="font-semibold text-xl">Location & Preferences</h2>
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Location</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="City, Country" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Work Location</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="City, Country" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="remotePreference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remote Flexibility</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work preference" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="On-site">On-site</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Key Skills & Certifications */}
        <div className="space-y-4">
          <h2 className="font-semibold text-xl">Key Skills & Certifications</h2>

          <FormField
            control={form.control}
            name="yearsOfExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of Experience / Career Level</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skills</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((skill, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md"
                        >
                          <span>{skill}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="hover:bg-transparent p-0 w-4 h-4"
                            onClick={() => {
                              const newSkills = [...field.value];
                              newSkills.splice(index, 1);
                              field.onChange(newSkills);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill"
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (currentSkill.trim()) {
                              field.onChange([...field.value, currentSkill.trim()]);
                              setCurrentSkill("");
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (currentSkill.trim()) {
                            field.onChange([...field.value, currentSkill.trim()]);
                            setCurrentSkill("");
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Certifications */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Certifications</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendCert({
                    name: "",
                    issuer: "",
                    year: new Date().getFullYear(),
                    url: "",
                  })
                }
              >
                <PlusCircle className="mr-2 w-4 h-4" />
                Add Certification
              </Button>
            </div>

            {certFields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-6">
                  <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`certifications.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certification Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="AWS Solutions Architect" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`certifications.${index}.issuer`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issuing Organization</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Amazon Web Services" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`certifications.${index}.year`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`certifications.${index}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certificate URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => removeCert(index)}
                  >
                    <X className="mr-2 w-4 h-4" />
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

       {/* Educational Background */}
<div className="space-y-4">
  <div className="flex justify-between items-center">
    <h2 className="font-semibold text-xl">Educational Background</h2>
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() =>
        appendEducation({
          degree: "",
          institution: "",
          year: new Date().getFullYear(),
          fieldOfStudy: "" // Add this, remove grade
        })
      }
    >
      <PlusCircle className="mr-2 w-4 h-4" />
      Add Education
    </Button>
  </div>

  {educationFields.map((field, index) => (
    <Card key={field.id}>
      <CardContent className="pt-6">
        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
          <FormField
            control={form.control}
            name={`education.${index}.degree`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Degree</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Bachelor's in..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`education.${index}.institution`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Institution</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="University name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`education.${index}.year`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`education.${index}.fieldOfStudy`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Field of Study</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Computer Science" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => removeEducation(index)}
        >
          <X className="mr-2 w-4 h-4" />
          Remove
        </Button>
      </CardContent>
    </Card>
  ))}
</div>

        {/* Employment Preferences */}
        <div className="space-y-4">
          <h2 className="font-semibold text-xl">Employment Preferences</h2>
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
          // Change expectedSalary.min and expectedSalary.max to:
<FormField
  control={form.control}
  name="expectedSalaryMin"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Expected Salary (Min)</FormLabel>
      <FormControl>
        <Input 
          type="number" 
          placeholder="Minimum Salary" 
          {...field}
          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} 
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="expectedSalaryMax"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Expected Salary (Max)</FormLabel>
      <FormControl>
        <Input 
          type="number" 
          placeholder="Maximum Salary" 
          {...field}
          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
              
            
          </div>
          <FormField
            control={form.control}
            name="availabilityPeriod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Availability / Notice Period (Days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Notice period in days"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="desiredEmployment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desired Employment Type / Work Arrangement</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
