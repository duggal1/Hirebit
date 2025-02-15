"use client";

import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  SparkleIcon,
  Github,
  Linkedin,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { GithubResults } from "@/components/verification/github";
import { PortfolioResults } from "@/components/verification/portfolio";
import { UrlInputs, urlSchema } from "@/lib/validation";
import { fetchGithubData } from "@/services/githubService";
import { fetchPortfolioData } from "@/services/portfolioService";
import { Badge } from "@/components/ui/badge";
import { useParams, useRouter } from "next/navigation";
import { LinkedInResults } from "@/components/verification/linkedin";
// import VerificationStatus from '@/components/VerificationStatus';
import VerificationStatus from "@/components/general/isVerificationButton";

const VerificationPage = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [urls, setUrls] = useState<Partial<UrlInputs>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [githubData, setGithubData] = useState<any>(null);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [linkedinData, setLinkedinData] = useState<any>(null);
  const [applyUrl, setApplyUrl] = useState<string>("");

  interface CompanyData {
    id: string;
    name: string;
    activeJobs: number;
  }

  const [companyData, setCompanyData] = useState<CompanyData | null>(null);

  console.log("Rendering VerificationPage with params:", params);

  // Check for a valid verification ID
  useEffect(() => {
    console.log("Checking verification id...", params?.id);
    if (!params?.id || params.id === "undefined") {
      console.error("Invalid verification ID detected:", params?.id);
      toast({
        variant: "destructive",
        title: "Invalid Verification ID",
        description: "Redirecting to home page...",
      });
      router.push("/");
      return;
    }
  }, [params?.id, router, toast]);

  // Fetch or assign company data
  useEffect(() => {
    const fetchCompanyData = async () => {
      console.log("Fetching company data for id:", params?.id);
      if (!params?.id) return;

      try {
        // First get the verification data to check if there's a company assigned
        const verificationResponse = await fetch(`/api/verification/${params.id}`);
        console.log("Fetched verification data, status:", verificationResponse.status);
        if (!verificationResponse.ok) {
          throw new Error("Failed to fetch verification data");
        }

        const verificationData = await verificationResponse.json();
        console.log("Verification data received:", verificationData);

        // If there's no company assigned yet, find an available company
        if (!verificationData.companyId) {
          console.log("No company assigned. Fetching available companies...");
          const companiesResponse = await fetch("/api/companies/available");
          console.log("Fetched companies, status:", companiesResponse.status);
          if (!companiesResponse.ok) {
            throw new Error("Failed to fetch available companies");
          }

          const companies = await companiesResponse.json();
          console.log("Available companies:", companies);
          if (companies.length > 0) {
            console.log("Assigning company:", companies[0]);
            // Assign the first available company to this verification
            const updateResponse = await fetch(`/api/verification/${params.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                companyId: companies[0].id,
                urls: verificationData.urls || {},
              }),
            });
            console.log("Update response status:", updateResponse.status);
            if (updateResponse.ok) {
              setCompanyData(companies[0]);
              console.log("Company assigned successfully:", companies[0]);
            }
          }
        } else if (verificationData.company) {
          // Use the already assigned company
          console.log("Using already assigned company:", verificationData.company);
          setCompanyData({
            id: verificationData.company.id,
            name: verificationData.company.name,
            activeJobs: verificationData.company.JobPost?.length || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching company:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load company data",
        });
      }
    };

    fetchCompanyData();
  }, [params?.id, toast]);

  // Fetch or create verification data
  useEffect(() => {
    const fetchVerificationData = async () => {
      console.log("Fetching verification data for id:", params?.id);
      if (!params?.id || params.id === "undefined") return;

      try {
        setIsLoading(true);

        // First check if the ID is a valid JobSeeker ID
        const jobSeekerResponse = await fetch(`/api/job-seeker/${params.id}`);
        console.log("Fetched JobSeeker data, status:", jobSeekerResponse.status);
        if (!jobSeekerResponse.ok) {
          throw new Error("Invalid JobSeeker ID");
        }

        // Then get/create verification for this JobSeeker
        const response = await fetch(`/api/verification/${params.id}`);
        console.log("Fetched verification data, status:", response.status);
        if (!response.ok) {
          throw new Error(`Failed to fetch verification data: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Received verification data:", data);

        setVerificationData(data);

        // Pre-fill URLs if they exist
        if (data.urls) {
          console.log("Pre-filling URLs:", data.urls);
          setUrls(data.urls);
        }

        // Load existing analysis if available
        if (data.analysis) {
          console.log("Existing analysis found:", data.analysis);
          if (data.analysis.github) setGithubData(data.analysis.github);
          if (data.analysis.portfolio) setPortfolioData(data.analysis.portfolio);
          if (data.analysis.linkedin) setLinkedinData(data.analysis.linkedin);
        }
      } catch (error) {
        console.error("Error fetching verification:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load verification data",
        });
        // Redirect to home if invalid JobSeeker ID
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerificationData();
  }, [params?.id, toast, router]);

  if (!params?.id || params.id === "undefined") {
    return null; // Will redirect in useEffect
  }

  const handleVerificationComplete = (isVerified: boolean) => {
    console.log("Verification complete callback, isVerified:", isVerified);
    if (isVerified) {
      toast({
        title: "Verification Complete",
        description: "All profiles have been verified successfully!",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Analyze button clicked, starting handleSubmit...");
    try {
      setIsLoading(true);
      console.log("Validating URLs:", urls);

      // Validate URLs before proceeding
      let validatedUrls: UrlInputs;
      try {
        validatedUrls = await urlSchema.parseAsync(urls);
        console.log("Validated URLs:", validatedUrls);
      } catch (validationError) {
        console.error("Validation error:", validationError);
        if (validationError instanceof z.ZodError) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: validationError.errors[0].message,
          });
          return;
        }
        throw validationError;
      }

      // Update verification data in the database
      console.log("Updating verification data with URLs:", validatedUrls);
      const updateResponse = await fetch(`/api/verification/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          urls: validatedUrls,
        }),
      });

      console.log("Update response status:", updateResponse.status);
      if (!updateResponse.ok) {
        throw new Error(`Failed to update verification: ${updateResponse.statusText}`);
      }

      // Process each URL type independently

      // GitHub analysis
      if (validatedUrls.github) {
        console.log("Starting GitHub analysis for URL:", validatedUrls.github);
        try {
          const data = await fetchGithubData(validatedUrls.github);
          console.log("GitHub data received:", data);
          setGithubData(data);
          toast({
            title: "Success",
            description: "GitHub data fetched successfully!",
          });
        } catch (error) {
          console.error("GitHub analysis error:", error);
          toast({
            variant: "destructive",
            title: "GitHub Error",
            description: "Failed to analyze GitHub data. Please try again.",
          });
        }
      }

      // LinkedIn analysis
      if (validatedUrls.linkedin) {
        console.log("Starting LinkedIn analysis for URL:", validatedUrls.linkedin);
        toast({
          title: "Processing",
          description: "Analyzing LinkedIn profile...",
        });
        try {
          const response = await fetch("/api/linkedin", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: validatedUrls.linkedin }),
          });
          console.log("LinkedIn response status:", response.status);
          if (!response.ok) {
            throw new Error("LinkedIn analysis failed");
          }
          const data = await response.json();
          console.log("LinkedIn data received:", data);
          setLinkedinData(data);
          toast({
            title: "Success",
            description: "LinkedIn profile analyzed successfully!",
          });
        } catch (error) {
          console.error("LinkedIn analysis error:", error);
          toast({
            variant: "destructive",
            title: "Analysis Error",
            description: "Failed to analyze LinkedIn profile. Please try again.",
          });
        }
      }

      // Portfolio analysis
      if (validatedUrls.portfolio) {
        console.log("Starting portfolio analysis for URL:", validatedUrls.portfolio);
        toast({
          title: "Processing",
          description: "Analyzing portfolio data with Gemini AI...",
        });
        try {
          // Check for fresh cache (less than 24 hours old)
          const cachedData = localStorage.getItem(`portfolio_${validatedUrls.portfolio}`);
          const cachedAnalysis = localStorage.getItem(`portfolio_analysis_${validatedUrls.portfolio}`);
          const cacheTimestamp = localStorage.getItem(`portfolio_timestamp_${validatedUrls.portfolio}`);
          console.log("Cached portfolio data:", { cachedData, cachedAnalysis, cacheTimestamp });

          const isCacheValid =
            cacheTimestamp &&
            Date.now() - parseInt(cacheTimestamp) < 24 * 60 * 60 * 1000;

          if (cachedData && cachedAnalysis && isCacheValid) {
            console.log("Using cached portfolio data.");
            setPortfolioData({
              data: JSON.parse(cachedData),
              analysis: JSON.parse(cachedAnalysis),
            });
            toast({
              title: "Success",
              description: "Portfolio data loaded from recent cache!",
            });
          } else {
            console.log("Fetching fresh portfolio data...");
            const data = await fetchPortfolioData(validatedUrls.portfolio);
            console.log("Fresh portfolio data received:", data);
            setPortfolioData(data);
            // Store cache timestamp
            localStorage.setItem(
              `portfolio_timestamp_${validatedUrls.portfolio}`,
              Date.now().toString()
            );
            toast({
              title: "Success",
              description: "Portfolio analyzed with Gemini AI successfully!",
            });
          }
        } catch (error) {
          console.error("Portfolio analysis error:", error);
          toast({
            variant: "destructive",
            title: "Analysis Error",
            description: "Failed to analyze portfolio. Please try again.",
          });
        }
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.errors[0].message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch data. Please try again.",
        });
      }
    } finally {
      console.log("handleSubmit completed, setting isLoading to false.");
      setIsLoading(false);
    }
  };

  const handleUrlChange = (type: keyof UrlInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`URL changed for ${type}:`, e.target.value);
    setUrls((prev) => ({ ...prev, [type]: e.target.value }));
  };

  const renderIcon = (type: string): React.ReactNode => {
    const iconProps = {
      className: "h-5 w-5 text-zinc-400 group-hover:text-violet-400 transition-colors",
    };
    switch (type) {
      case "github":
        return <Github {...iconProps} />;
      case "linkedin":
        return <Linkedin {...iconProps} />;
      case "portfolio":
        return <Briefcase {...iconProps} />;
      default:
        return <SparkleIcon {...iconProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-500/5 via-zinc-900/25 to-black pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Web Analysis
            </h1>
            <p className="text-lg text-zinc-400">
              Analyze your digital presence with AI-powered insights
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-6">
              {(["github", "linkedin", "portfolio"] as const).map((type) => (
                <Card
                  key={type}
                  className={`group relative overflow-hidden border-0 bg-zinc-900/50 backdrop-blur-xl transition-all duration-300
                    ${
                      activeField === type
                        ? "ring-2 ring-violet-500/50 shadow-lg shadow-violet-500/10"
                        : "hover:bg-zinc-800/50"
                    }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      {renderIcon(type)}
                      <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400 group-hover:text-zinc-200">
                        {type}
                      </h2>
                    </div>
                    <div className="relative">
                      <Input
                        type="url"
                        placeholder={`Enter ${type} URL`}
                        value={urls[type] || ""}
                        onChange={handleUrlChange(type)}
                        onFocus={() => setActiveField(type)}
                        onBlur={() => setActiveField(null)}
                        className="w-full bg-black/20 border-zinc-800 text-zinc-100 placeholder-zinc-500
                          focus:border-violet-500/50 focus:ring-violet-500/20 transition-all duration-300"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full group relative overflow-hidden rounded-lg bg-violet-500 px-8 py-4 transition-all
                hover:bg-violet-600 disabled:opacity-50 disabled:hover:bg-violet-500"
            >
              <div className="relative flex items-center justify-center space-x-2">
                {isLoading ? (
                  <>
                    <SparkleIcon className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </Button>
          </form>

          {/* Results */}
          <div className="space-y-8">
            {githubData && (
              <div className="transform transition-all duration-500 hover:scale-[1.01]">
                <GithubResults data={githubData} />
              </div>
            )}
            {portfolioData && (
              <div className="transform transition-all duration-500 hover:scale-[1.01]">
                <PortfolioResults
                  data={portfolioData.data}
                  analysis={portfolioData.analysis}
                  verification={
                    portfolioData.verification || {
                      isVerified: false,
                      message: "Verification pending",
                      score: 0,
                    }
                  }
                />
              </div>
            )}
            {linkedinData && (
              <div className="transform transition-all duration-500 hover:scale-[1.01]">
                <LinkedInResults data={linkedinData} />
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                console.log("Continue to Application button clicked.");
                if (companyData?.id && companyData.name) {
                  const redirectUrl = `/apply/${companyData.id}/${companyData.name}/${params.id}`;
                  console.log("Redirecting to:", redirectUrl);
                  router.push(redirectUrl);
                } else {
                  console.error("Company data missing:", companyData);
                  toast({
                    title: "Error",
                    description: "Please complete verification first",
                    variant: "destructive",
                  });
                }
              }}
              className="relative inline-flex items-center justify-center w-full px-8 py-4 font-bold text-white overflow-hidden rounded-lg group focus:outline-none shadow-md transition-shadow duration-500 ease-in-out group-hover:shadow-xl"
              disabled={!companyData?.id || !githubData || !portfolioData || !linkedinData}
            >
              <span
                className="absolute inset-0 transition-transform duration-700 ease-out transform group-hover:scale-110 group-hover:rotate-3"
                style={{
                  background: "linear-gradient(45deg, #7e22ce, #ec4899, #f97316)",
                  backgroundSize: "200% 200%",
                  animation: "gradientShift 5s ease infinite",
                }}
              ></span>
              <span className="absolute inset-0 rounded-lg bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-10"></span>
              <span className="relative z-10">
                {!companyData?.id ? "Complete verification first" : "Continue to Application"}
              </span>
            </button>

            <div className="fixed top-4 right-4">
              <Badge variant="outline">Verification ID: {params.id}</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
