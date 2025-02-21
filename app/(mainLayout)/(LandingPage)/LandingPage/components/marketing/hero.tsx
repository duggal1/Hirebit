import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { BlurText } from "../ui/blur-text";
import { Button } from "../ui/button";
import Image from "next/image";
import Container from "../global/container";
import { SplashCursor } from "@/components/ui/splash-cursor";

const Hero = () => {
    return (
        <div>
            <SplashCursor />
            <div className="flex flex-col items-center text-center w-full max-w-5xl my-24 mx-auto z-40 relative">
                <Container delay={0.0}>
                    <div className="pl-2 pr-1 py-1 rounded-full border border-foreground/10 hover:border-foreground/15 backdrop-blur-lg cursor-pointer flex items-center gap-2.5 select-none w-max mx-auto">
                        <div className="w-3.5 h-3.5 rounded-full bg-primary/40 flex items-center justify-center relative">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary/60 flex items-center justify-center animate-ping">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary/60 flex items-center justify-center animate-ping"></div>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            </div>
                        </div>
                        <span className="inline-flex items-center justify-center gap-2 animate-text-gradient animate-background-shine bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-[200%_auto] bg-clip-text text-xl font-black text-transparent">
                            Triple-verified candidates
                            <span className="text-xs text-secondary-foreground px-1.5 py-0.5 rounded-full bg-gradient-to-b from-foreground/20 to-foreground/10 flex items-center justify-center font-black">
                                No bots
                                <ArrowRightIcon className="w-3.5 h-3.5 ml-1 text-foreground/50" />
                            </span>
                        </span>
                    </div>
                </Container>
                <BlurText
                    word={"Find the right talent\n without the noise"}
                    className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent py-2 md:py-0 lg:!leading-snug font-medium tracking-[-0.0125em] mt-6 font-heading"
                />
                <Container delay={0.1}>
                    <p className="text-sm sm:text-base lg:text-lg mt-4 text-gray-400 max-w-2xl mx-auto">
                        Every candidate is ID-verified and skill-tested. Our AI matches candidates to your exact job requirements. <span className="hidden sm:inline">Get detailed skill assessments and video introductions before the first interview.</span>
                    </p>
                </Container>
                <Container delay={0.2}>
                    <div className="flex items-center justify-center gap-x-4 mt-8">
                        <Button asChild size="lg" className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg">
                            <Link href="/main">
                                Post a job
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="backdrop-blur-md border-foreground/20 hover:border-foreground/40">
                            <Link href="#">
                                View talent pool
                            </Link>
                        </Button>
                    </div>
                </Container>
                <Container delay={0.3}>
                    <div className="relative mx-auto max-w-7xl rounded-xl lg:rounded-[32px] border border-neutral-200/10 p-2 backdrop-blur-xl bg-transparent md:p-4 mt-12 shadow-2xl">
                        <div className="absolute top-1/4 left-1/2 -z-10 w-3/4 -translate-x-1/2 h-1/4 -translate-y-1/2 inset-0 blur-[10rem] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20"></div>

                        <div className="rounded-lg lg:rounded-[24px] border p-2 border-neutral-800 bg-black/90 overflow-hidden">
                            <Image
                                src="/images/dashboard.png"
                                alt="Recruiter dashboard showing candidate matches"
                                width={1920}
                                height={1080}
                                className="rounded-lg lg:rounded-[20px] opacity-90 hover:opacity-100 transition-opacity duration-300"
                            />
                        </div>
                    </div>
                </Container>
            </div>
        </div>
    );
};

export default Hero;