'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface DashboardProps {
  params: {
    id: string;
    companyid: string;
  };
}

interface JobSeekerProfile {
  id: string;
  name: string;
  email: string;
  coverLetter?: string;
  skills: { name: string; proficiency: number }[];
  workExperience: {
    position: string;
    company: string;
    startDate: string;
    endDate?: string;
  }[];
  resumePdfId?: string;
  codingTestResults?: {
    questionId: string;
    score: number;
    completedAt: string;
  }[];
}

export default function RecruiterDashboard({ params }: DashboardProps) {
  const [selectedJobSeeker, setSelectedJobSeeker] = useState<string | null>(null);

  // Fetch dashboard metrics
  const { data: metrics } = useQuery({
    queryKey: ['dashboardMetrics', params.companyid],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/${params.companyid}/metrics`);
      return response.json();
    },
  });

  // Fetch job seekers
  const { data: jobSeekers } = useQuery({
    queryKey: ['jobSeekers', params.companyid],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/${params.companyid}/jobseekers`);
      return response.json();
    },
  });

  // Fetch selected job seeker profile
  const { data: selectedProfile } = useQuery<JobSeekerProfile>({
    queryKey: ['jobSeekerProfile', selectedJobSeeker],
    queryFn: async () => {
      if (!selectedJobSeeker) return null;
      const response = await fetch(`/api/dashboard/${params.companyid}/jobseekers/${selectedJobSeeker}`);
      return response.json();
    },
    enabled: !!selectedJobSeeker,
  });

  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            onClick={() => window.location.href = `${window.location.pathname}/logs`}
          >
            View Detailed Logs
          </Button>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">Total Applications</h3>
                <p className="text-3xl font-bold">{metrics?.totalApplications || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">Average Test Score</h3>
                <p className="text-3xl font-bold">{metrics?.averageTestScore || 0}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">Active Jobs</h3>
                <p className="text-3xl font-bold">{metrics?.activeJobs || 0}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 border rounded-lg">
              <ScrollArea className="h-[600px] w-full">
                {jobSeekers?.map((seeker: JobSeekerProfile) => (
                  <Button
                    key={seeker.id}
                    variant="ghost"
                    className="w-full justify-start p-4 hover:bg-gray-100"
                    onClick={() => setSelectedJobSeeker(seeker.id)}
                  >
                    <Avatar className="mr-2">
                      <AvatarImage src={`https://avatar.vercel.sh/${seeker.id}`} />
                      <AvatarFallback>{seeker.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-semibold">{seeker.name}</p>
                      <p className="text-sm text-gray-500">{seeker.email}</p>
                    </div>
                  </Button>
                ))}
              </ScrollArea>
            </div>

            <div className="col-span-2 border rounded-lg p-6">
              {selectedProfile ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={`https://avatar.vercel.sh/${selectedProfile.id}`} />
                      <AvatarFallback>{selectedProfile.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedProfile.name}</h2>
                      <p className="text-gray-500">{selectedProfile.email}</p>
                    </div>
                  </div>

                  {selectedProfile.coverLetter && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Cover Letter</h3>
                      <p className="text-gray-700">{selectedProfile.coverLetter}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.skills.map((skill) => (
                        <div key={skill.name} className="space-y-1">
                          <Badge variant="secondary">{skill.name}</Badge>
                          <Progress value={skill.proficiency * 10} className="w-24" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Work Experience</h3>
                    {selectedProfile.workExperience.map((exp, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p className="font-semibold">{exp.position}</p>
                          <p className="text-gray-500">{exp.company}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(exp.startDate).toLocaleDateString()} -{' '}
                            {exp.endDate
                              ? new Date(exp.endDate).toLocaleDateString()
                              : 'Present'}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {selectedProfile.codingTestResults && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Coding Test Results</h3>
                      {selectedProfile.codingTestResults.map((result) => (
                        <Card key={result.questionId}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <p>Question {result.questionId}</p>
                              <Badge
                                variant={result.score >= 70 ? 'default' : 'destructive'}
                              >
                                {result.score}%
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">
                              Completed: {new Date(result.completedAt).toLocaleString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Select a job seeker to view their profile
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          {/* Add your metrics visualization components here */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
