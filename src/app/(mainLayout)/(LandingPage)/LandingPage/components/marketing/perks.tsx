"use client";

import { cn } from "@/src/app/(mainLayout)/(LandingPage)/LandingPage/functions";
import { LucideIcon, Shield, UserCheck, Brain, Clock, Target, ChartBar } from "lucide-react";
import Container from "../global/container";
import { SectionBadge } from "../ui/section-bade";

const RECRUITER_PERKS = [
    {
        title: "Triple-Checked Profiles",
        description: "Every candidate goes through resume verification, skill tests, and video interviews before reaching you.",
        icon: Shield
    },
    {
        title: "Real Candidates Only",
        description: "No fake profiles or bots. Access only active job seekers who are ready to interview.",
        icon: UserCheck
    },
    {
        title: "Smart Match",
        description: "Our AI finds candidates that perfectly match your job requirements and company culture.",
        icon: Brain
    },
    {
        title: "24-Hour Response",
        description: "Connect with candidates who respond within 24 hours of your message.",
        icon: Clock
    },
    {
        title: "Targeted Search",
        description: "Find candidates by exact skills, experience level, and location that you need.",
        icon: Target
    },
    {
        title: "Hiring Analytics",
        description: "Track your hiring pipeline with real-time data on candidate engagement and response rates.",
        icon: ChartBar
    }
];

const Perks = () => {
    return (
        <div className="flex flex-col items-center justify-center py-16 md:py-24 lg:py-32 w-full relative">
            <div className="bg-transparent" />
            <Container          
            delay={0.0}
           // Longer duration for smoother animation
            reverse={false} // Animate from bottom to top
            simple={false}  
            
            >
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
                    <SectionBadge title="Why Recruiters Choose Us" />
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black !leading-tight mt-8 bg-gradient-to-r from-foreground via-violet-600 to-blue-600 bg-clip-text text-transparent">
                        Hire Better, Faster, Smarter
                    </h2>
                    <p className="text-lg md:text-xl text-center text-accent-foreground/80 mt-6 max-w-2xl">
                        Stop wasting time on unqualified applications. Get access to pre-verified candidates who match your needs.
                    </p>
                </div>
            </Container>
            <Container>
                <div className="mt-20 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-6 relative">
                        {RECRUITER_PERKS.map((perk, index) => (
                            <Perk key={index} index={index} {...perk} />
                        ))}
                    </div>
                </div>
            </Container>
        </div>
    )
};

const Perk = ({
    title,
    description,
    icon: Icon,
    index,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    index: number;
}) => {
    return (
        <div
            className={cn(
                "group/perk flex flex-col p-8 rounded-2xl backdrop-blur-xl transition-all duration-500",
                "bg-gradient-to-br from-background/50 to-background/30",
                "border border-foreground/5 hover:border-violet-500/20",
                "hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.1)]"
            )}
        >
            <div className="group-hover/perk:-translate-y-1 transform-gpu transition-all duration-300 flex flex-col w-full">
                <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-violet-500/10 blur-2xl rounded-full" />
                    <div className="relative bg-gradient-to-br from-background/80 to-background/40 p-4 rounded-xl border border-foreground/5 backdrop-blur-md">
                        <Icon strokeWidth={1.5} className="w-8 h-8 text-violet-500 transition-all duration-300" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-medium bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
                        {title}
                    </h3>
                    <p className="text-base text-accent-foreground/70 leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Perks;