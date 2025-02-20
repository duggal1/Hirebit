import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { CreateJobForm } from "@/components/forms/CreateJobForm";
import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { redirect } from "next/navigation";

const companies = [
  { id: 0, name: "Google", logo: "/google.png" },
  { id: 1, name: "Adobe", logo: "/adobe.png" },
  { id: 2, name: "Nvidia", logo: "/nvidia.png" },
  { id: 3, name: "Canva", logo: "/canva.png" }
];

const testimonials = [
  {
    quote: "We trust HireBit as the best tech recruiter platform for finding exceptional talent.",
    author: "Sundar Pichai",
    company: "Google",
    role: "CEO"
  },
  {
    quote: "HireBit revolutionized our hiring process with their cutting-edge platform.",
    author: "Jensen Huang",
    company: "Nvidia",
    role: "CEO"
  }
];

const stats = [
  { value: "50k+", label: "Active Candidates", icon: "👥" },
  { value: "24h", label: "Average Response", icon: "⚡" },
  { value: "98%", label: "Success Rate", icon: "🎯" },
  { value: "1000+", label: "Enterprise Clients", icon: "🏢" }
];

async function getCompany(userId: string) {
  const data = await prisma.company.findUnique({
    where: { userId: userId },
    select: {
      name: true,
      location: true,
      about: true,
      logo: true,
      xAccount: true,
      website: true,
    },
  });

  if (!data) return redirect("/");
  return data;
}

const PostJobPage = async () => {
  const session = await requireUser();
  const data = await getCompany(session.id as string);

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="gap-8 grid grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CreateJobForm
              companyAbout={data.about}
              companyLocation={data.location}
              companyLogo={data.logo}
              companyName={data.name}
              companyXAccount={data.xAccount}
              companyWebsite={data.website}
            />
          </div>

          <div className="lg:col-span-1">
            <Card className="relative overflow-hidden border border-zinc-800/50 bg-black/40 backdrop-blur-xl before:absolute before:inset-0 before:bg-gradient-to-b before:from-blue-500/10 before:to-purple-500/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity">
              <div className="absolute inset-0 bg-grid-white/[0.02]" />
              <div className="absolute inset-0 bg-black/40" />
              <CardHeader className="relative">
                <CardTitle className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Trusted by Giants
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-12">
                {/* Company Logos */}
                <div className="grid grid-cols-2 gap-6">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-800/50 via-zinc-900/50 to-black/50 p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                      <Image
                        src={company.logo}
                        alt={company.name}
                        height={300}
                        width={300 }
                        className="relative z-10 transition-transform group-hover:scale-110"
                      />
                    </div>
                  ))}
                </div>

                {/* Testimonials */}
                <div className="space-y-6">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-800/30 via-zinc-900/30 to-black/30 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                      <p className="relative text-sm italic text-zinc-300">
                        "{testimonial.quote}"
                      </p>
                      <div className="relative mt-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-bold">
                          {testimonial.author[0]}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {testimonial.author}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {testimonial.role}, {testimonial.company}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-800/30 via-zinc-900/30 to-black/30 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="relative">
                        <div className="text-2xl">{stat.icon}</div>
                        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-xl font-bold text-transparent">
                          {stat.value}
                        </div>
                        <div className="text-xs text-zinc-400">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJobPage;