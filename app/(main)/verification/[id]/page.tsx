"use client"

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
  ArrowRight
} from "lucide-react";
import { GithubResults } from "@/components/verification/github";
import { PortfolioResults } from "@/components/verification/portfolio";
import { UrlInputs, urlSchema } from "@/lib/validation";
import { fetchGithubData } from "@/services/githubService";
import { fetchPortfolioData } from "@/services/portfolioService";
import { Badge } from "@/components/ui/badge";
import { useParams , useRouter } from "next/navigation";
import { LinkedInResults } from "@/components/verification/linkedin";
import VerificationStatus from "@/components/general/isVerificationButton";
//import VerificationStatus from '@/components/VerificationStatus';


const VerificationPage =() => {

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
const [applyUrl, setApplyUrl] = useState<string>('');
interface CompanyData {
  id: string;
  name: string;
  activeJobs: number;
}

const [companyData, setCompanyData] = useState<CompanyData | null>(null);

 useEffect(() => {
  if (!params?.id || params.id === 'undefined') {
    toast({
      variant: "destructive",
      title: "Invalid Verification ID",
      description: "Redirecting to home page...",
    });
    router.push('/');
    return;
  }
}, [params?.id, router, toast]);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!params?.id) return;
      
      try {
        console.log('Fetching company data for verification:', params.id);
        const response = await fetch(`/api/company?verificationId=${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch company data');
        }

        const data = await response.json();
        console.log('Received company data:', data);
        setCompanyData(data);
      } catch (error) {
        console.error('Error fetching company:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load company data",
        });
      }
    };

    fetchCompanyData();
  }, [params?.id, toast]);

  useEffect(() => {
    const fetchVerificationData = async () => {
      if (!params?.id || params.id === 'undefined') return;

      try {
        setIsLoading(true);
        console.log('Fetching verification data for ID:', params.id);
        const response = await fetch(`/api/verification/${params.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch verification data: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Received verification data:', data);

        if (!data) {
          throw new Error('No verification data found');
        }

        if (!data.company) {
          console.warn('No company data found in verification:', data);
        } else {
          console.log('Company data found:', data.company);
        }

        setVerificationData(data);
        
        // Pre-fill URLs if they exist
        if (data.urls) {
          console.log('Setting URLs from verification:', data.urls);
          setUrls(data.urls);
        }

        // Load existing analysis if available
        if (data.analysis) {
          console.log('Setting analysis data:', data.analysis);
          if (data.analysis.github) setGithubData(data.analysis.github);
          if (data.analysis.portfolio) setPortfolioData(data.analysis.portfolio);
          if (data.analysis.linkedin) setLinkedinData(data.analysis.linkedin);
        }

      } catch (error) {
        console.error('Error fetching verification:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load verification data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerificationData();
  }, [params?.id, toast]);
   // Add loading state UI
   if (!params?.id || params.id === 'undefined') {
    return null; // Will redirect in useEffect
  }

  const handleVerificationComplete = (isVerified: boolean) => {
    if (isVerified) {
      toast({
        title: "Verification Complete",
        description: "All profiles have been verified successfully!",
      });
    }
  };
  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    setIsLoading(true);

    // Validate URLs before proceeding
    let validatedUrls: UrlInputs;
    try {
      validatedUrls = await urlSchema.parseAsync(urls);
    } catch (validationError) {
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
      // Update verification data in database
      const updateResponse = await fetch(`/api/verification/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls: validatedUrls,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to update verification: ${updateResponse.statusText}`);
      }
  

      // Fetch and analyze data
      if (validatedUrls.github) {
        const data = await fetchGithubData(validatedUrls.github);
        setGithubData(data);
        toast({
          title: "Success",
          description: "GitHub data fetched successfully!",
        });
      }

      if (validatedUrls.portfolio) {
        toast({
          title: "Processing",
          description: "Analyzing portfolio data with Gemini AI...",
        });
        // Inside handleSubmit function, after the portfolio handling
if (validatedUrls.linkedin) {
  toast({
    title: "Processing",
    description: "Analyzing LinkedIn profile...",
  });

  try {
    const response = await fetch('/api/linkedin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: validatedUrls.linkedin }),
    });

    if (!response.ok) {
      throw new Error('LinkedIn analysis failed');
    }

    const data = await response.json();
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

        try {
          // Check for fresh cache (less than 24 hours old)
          const cachedData = localStorage.getItem(
            `portfolio_${validatedUrls.portfolio}`
          );
          const cachedAnalysis = localStorage.getItem(
            `portfolio_analysis_${validatedUrls.portfolio}`
          );
          const cacheTimestamp = localStorage.getItem(
            `portfolio_timestamp_${validatedUrls.portfolio}`
          );

          const isCacheValid =
            cacheTimestamp &&
            Date.now() - parseInt(cacheTimestamp) < 24 * 60 * 60 * 1000;

          if (cachedData && cachedAnalysis && isCacheValid) {
            setPortfolioData({
              data: JSON.parse(cachedData),
              analysis: JSON.parse(cachedAnalysis),
            });
            toast({
              title: "Success",
              description: "Portfolio data loaded from recent cache!",
            });
          } else {
            const data = await fetchPortfolioData(validatedUrls.portfolio);
            setPortfolioData(data);

            // Store cache timestamp
            localStorage.setItem(
              `portfolio_timestamp_${validatedUrls.portfolio}`,
              Date.now().toString()
            );

            toast({
              title: "Success",
              description:
                "Portfolio analyzed with Gemini AI successfully!",
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
      setIsLoading(false);
    }
  };

  const handleUrlChange = (type: keyof UrlInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrls((prev) => ({ ...prev, [type]: e.target.value }));
  };

  const renderIcon = (type: string): React.ReactNode => {
    const iconProps = { className: "h-5 w-5 text-zinc-400 group-hover:text-violet-400 transition-colors" };
    switch (type) {
      case "github": return <Github {...iconProps} />;
      case "linkedin": return <Linkedin {...iconProps} />;
      case "portfolio": return <Briefcase {...iconProps} />;
      default: return <SparkleIcon {...iconProps} />;
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
                    ${activeField === type ? 'ring-2 ring-violet-500/50 shadow-lg shadow-violet-500/10' : 'hover:bg-zinc-800/50'}
                  `}
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
                verification={portfolioData.verification || {
                isVerified: false,
                message: "Verification pending",
                score: 0
                }}
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
              console.log('Button clicked - Company data:', companyData);
              if (companyData?.name && companyData.activeJobs > 0) {
                const redirectUrl = `/apply/${params.id}/${companyData.name}/${params.id}`;
                console.log('Redirecting to:', redirectUrl);
                router.push(redirectUrl);
              } else {
                console.error('Company data missing or no active jobs');
                toast({
                title: "Error",
                description: companyData ? "No active jobs available" : "Company information not found",
                variant: "destructive"
                });
              }
              }}
              className="relative inline-flex items-center justify-center w-full px-8 py-4 font-bold text-white overflow-hidden rounded-lg group focus:outline-none shadow-md transition-shadow duration-500 ease-in-out group-hover:shadow-xl"
              disabled={!companyData?.name || companyData.activeJobs === 0 || !githubData || !portfolioData || !linkedinData}
            >
              <span
              className="absolute inset-0 transition-transform duration-700 ease-out transform group-hover:scale-110 group-hover:rotate-3"
              style={{
                background: 'linear-gradient(45deg, #7e22ce, #ec4899, #f97316)',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 5s ease infinite'
              }}
              ></span>
              <span className="absolute inset-0 rounded-lg bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-10"></span>
                <span className="relative z-10">
                  {!companyData?.name ? "Complete verification first" :
                   companyData.activeJobs === 0 ? "No active jobs available" :
                   "Continue to Application"}
                </span>
            </button>



                <div className="fixed top-4 right-4">
     <Badge variant="outline">
       Verification ID: {params.id}
     </Badge>
   </div>
          </div>
        </div>
      </div>
    </div>
 
  );
};

 export default VerificationPage;