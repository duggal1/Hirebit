'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LogsProps {
  params: {
    id: string;
    companyid: string;
  };
}

interface JobSeekerLog {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  appliedDate: string;
  jobTitle: string;
  coverLetter?: string;
  experience: string;
  education: string;
  skills: string[];
  testScores?: {
    questionId: string;
    score: number;
    submittedAt: string;
  }[];
}

export default function LogsPage({ params }: LogsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch logs data
  const { data: logs, isLoading } = useQuery<JobSeekerLog[]>({
    queryKey: ['jobSeekerLogs', params.companyid],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/${params.companyid}/logs`);
      return response.json();
    },
  });

  // Filter logs based on search term and status
  const filteredLogs = logs?.filter((log) => {
    const matchesSearch =
      searchTerm === '' ||
      log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || log.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Application Logs</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search by name, email, or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Test Scores</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs?.map((log) => (
                  <TableRow
                    key={log.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      // Add detailed view logic here
                    }}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{log.name}</p>
                        <p className="text-sm text-gray-500">{log.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{log.jobTitle}</TableCell>
                    <TableCell>
                      {new Date(log.appliedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.experience}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {log.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                        {log.skills.length > 3 && (
                          <Badge variant="secondary">
                            +{log.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.testScores ? (
                        <div className="space-y-1">
                          {log.testScores.map((score, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm">Q{index + 1}:</span>
                              <Badge
                                variant={score.score >= 70 ? 'default' : 'destructive'}
                              >
                                {score.score}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">No tests taken</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
