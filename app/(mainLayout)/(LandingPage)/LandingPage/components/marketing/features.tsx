"use client";

import Container from "../global/container";
import MagicCard from "../ui/magic-card";
import { Ripple } from "../ui/ripple";

import { Shield,Sparkle, Target, Zap, BarChart2 } from "lucide-react";
import { SectionBadge } from "../ui/section-bade";


const Features = () => {
  return (
    <div className="relative">

  <div className="relative z-10">
    <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-32 w-full relative overflow-hidden">
      <div className="bg-transparent z-0" />
      <Container className="relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <SectionBadge title="Why Hirebit?" />
          <h2 className="text-5xl md:text-5xl lg:text-6xl font-heading font-black !leading-tight mt-6 bg-gradient-to-r from-foreground via-indigo-800 to-blue-600 bg-clip-text text-transparent">
            Recruit Smarter, <br /> Not Harder
          </h2>
          <p className="text-lg md:text-xl text-center text-accent-foreground/80 mt-8 leading-relaxed max-w-2xl">
            Skip the noise. Access only pre-verified, actively job-seeking professionals who match your requirements.
          </p>
        </div>
      </Container>
      <div className="mt-20 w-full">
        <div className="flex flex-col items-center gap-6 lg:gap-8 w-full">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_.65fr] w-full gap-6 lg:gap-8">
              <MagicCard
                particles={true}
                className="group hover:scale-[1.02] transition-all duration-300 flex flex-col items-start size-full bg-gradient-to-br from-violet-500/10 to-blue-500/10 backdrop-blur-xl"
              >
                <div className="bento-card flex items-center justify-center min-h-80">
                  <div className="flex flex-col gap-6 p-8">
                    <Shield className="w-16 h-16 text-violet-800" />
                    <h3 className="text-2xl font-bold">Triple Verification</h3>
                    <p className="text-accent-foreground/80">
                      Every candidate profile is thoroughly verified through resume checks, skill assessments, and video interviews.
                    </p>
                  </div>
         
                </div>
              </MagicCard>
              <MagicCard particles={true} className="hover:scale-[1.02] transition-all duration-300">
                <div className="bento-card p-8">
                  <Sparkle className="w-12 h-12 text-blue-800 mb-6" />
                  <h4 className="text-xl font-bold">Zero Spam, No Bots</h4>
                  <p className="text-base mt-4 text-accent-foreground/80">
                    Our AI-powered system eliminates fake profiles and automated applications.
                  </p>
                </div>
              </MagicCard>
            </div>
          </Container>
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-6 lg:gap-8">
              <MagicCard particles={true} className="hover:scale-[1.02] transition-all duration-300">
                <div className="bento-card p-8">
                  <Target className="w-12 h-12 text-green-800 mb-6" />
                  <h4 className="text-xl font-bold">Qualified Matches Only</h4>
                  <p className="text-base mt-4 text-accent-foreground/80">
                    Access candidates who specifically match your job requirements and industry standards.
                  </p>
                </div>
              </MagicCard>
              <MagicCard particles={true} className="hover:scale-[1.02] transition-all duration-300">
                <div className="bento-card p-8">
                  <Zap className="w-12 h-12 text-yellow-800 mb-6" />
                  <h4 className="text-xl font-bold">Quick Response Time</h4>
                  <p className="text-base mt-4 text-accent-foreground/80">
                    Connect with actively job-seeking candidates who respond within 24 hours.
                  </p>
                </div>
              </MagicCard>
              <MagicCard particles={true} className="hover:scale-[1.02] transition-all duration-300">
                <div className="bento-card p-8">
                  <BarChart2 className="w-12 h-12 text-rose-800 mb-6" />
                  <h4 className="text-xl font-bold">Hiring Analytics</h4>
                  <p className="text-base mt-4 text-accent-foreground/80">
                    Track your hiring pipeline with detailed insights and performance metrics.
                  </p>
                </div>
              </MagicCard>
            </div>
          </Container>
        </div>
      </div>
    </div>
    </div>
    </div>
  );

};

export default Features;