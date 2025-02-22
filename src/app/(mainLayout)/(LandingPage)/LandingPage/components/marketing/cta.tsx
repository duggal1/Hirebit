"use client";

import Link from "next/link";
import Container from "../global/container";
import { Button } from "../ui/button";
import { Particles } from "../ui/particles";
import RetroGrid from "../ui/retro-grid";

const CTA = () => {
    return (
        <div className="flex flex-col items-center justify-center py-16 md:py-20 lg:py-32 w-full relative">
            <Container
            delay={0.0}
               
              // Longer duration for smoother animation
            reverse={false} // Animate from bottom to top
            simple={false} >
                <div className="flex flex-col items-center justify-center text-center w-full px-6 md:px-0 mx-auto min-h-[600px] bg-gradient-to-b from-background/80 to-background border border-foreground/10 rounded-[2.5rem] overflow-hidden relative backdrop-blur-xl">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-24 bg-violet-500/30 blur-[8rem]"></div>
                    <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-full h-24 bg-blue-500/30 blur-[8rem]"></div>
                    <div className="flex flex-col items-center justify-center w-full z-20 p-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-foreground/10 bg-foreground/5 backdrop-blur-sm mb-6">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-sm text-foreground/80">Trusted by 1000+ recruiters</span>
                        </div>
                        <h2 className="text-4xl md:text-7xl font-heading font-bold !leading-[1.1] mt-6 bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
                            Find Top Talent. <br className="hidden md:block" />
                            <span className="text-violet-500">Zero Noise.</span>
                        </h2>
                        <p className="text-lg md:text-xl text-center text-accent-foreground/80 max-w-2xl mx-auto mt-8 leading-relaxed">
                            Access pre-verified candidates who mean business. Every profile is triple-checked, 
                            bot-free, and ready to move. Stop wasting time on unqualified applications.
                        </p>
                        <div className="flex flex-col md:flex-row items-center justify-center w-full gap-6 mt-10">
                            <Button asChild size="lg" className="w-full md:w-max bg-violet-500 hover:bg-violet-600 text-white px-8 py-6 text-lg rounded-2xl shadow-lg shadow-violet-500/25 transition-all hover:scale-105">
                                <Link href="/signup">
                                    Start Hiring Now
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="secondary" className="w-full md:w-max px-8 py-6 text-lg rounded-2xl border border-foreground/10 hover:bg-foreground/5 transition-all">
                                <Link href="/features">
                                    View Features
                                </Link>
                            </Button>
                        </div>
                        <div className="flex items-center gap-4 mt-10 text-sm text-foreground/60">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Triple Verified
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                No Bots
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Qualified Only
                            </div>
                        </div>
                    </div>
                    <RetroGrid />
                    <Particles
                        refresh
                        ease={100}
                        color="#a855f7"
                        quantity={150}
                        className="size-full absolute inset-0 opacity-50"
                    />
                </div>
            </Container>
        </div>
    )
};

export default CTA;