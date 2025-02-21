"use client";

import Link from "next/link";
import { Card, CardHeader } from "../ui/card";
import { MapPin, User2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { formatCurrency } from "@/src/utils/formatCurrency";
import Image from "next/image";
import { formatRelativeTime } from "@/src/utils/formatRelativeTime";

interface iAppProps {
  job: {
    id: string;
    jobTitle: string;
    salaryFrom: number;
    salaryTo: number;
    employmentType: string;
    location: string;
    createdAt: Date;
    company: {
      logo: string;
      name: string;
      about: string;
      location: string;
    };
  };
}

export function JobCard({ job }: iAppProps) {
  return (
    <Link href={`/job/${job.id}`}>
      <Card className="relative hover:border-primary hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <div className="flex md:flex-row flex-col gap-4">
            {job.company.logo ? (
              <Image
                src={job.company.logo}
                alt={job.company.name}
                width={48}
                height={48}
                className="rounded-lg size-12"
              />
            ) : (
              <div className="flex justify-center items-center bg-red-500 rounded-lg size-12">
                <User2 className="text-white size-6" />
              </div>
            )}
            <div className="flex flex-col flex-grow">
              <h1 className="font-bold text-xl md:text-2xl">{job.jobTitle}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-muted-foreground text-sm">
                  {job.company.name}
                </p>
                <span className="md:inline hidden text-muted-foreground">
                  •
                </span>
                <Badge className="rounded-full" variant="secondary">
                  {job.employmentType}
                </Badge>
                <span className="md:inline hidden text-muted-foreground">
                  •
                </span>
                <Badge className="rounded-full">{job.location}</Badge>
                <span className="md:inline hidden text-muted-foreground">
                  •
                </span>
                <p className="text-muted-foreground text-sm">
                  {formatCurrency(job.salaryFrom)} -
                  {formatCurrency(job.salaryTo)}
                </p>
              </div>
            </div>

            <div className="md:ml-auto">
              <div className="flex items-center gap-2">
                <MapPin className="size-4" />
                <h1 className="font-semibold text-base md:text-lg whitespace-nowrap">
                  {job.location}
                </h1>
              </div>
              <p className="md:text-right text-muted-foreground text-sm">
                {formatRelativeTime(job.createdAt)}
              </p>
            </div>
          </div>
          <div className="!mt-5">
            <p className="line-clamp-2 text-base text-muted-foreground">
              {job.company.about}
            </p>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
