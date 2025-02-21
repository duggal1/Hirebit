import Container from "../global/container";
import Logo from "@/public/images/dashboard2.png";
import Image from "next/image";
import { Particles } from "../ui/particles";
import { SectionBadge } from "../ui/section-bade";

const Connect = () => {
    return (
        <div className="flex flex-col items-center justify-center py-8 md:py-12 w-full relative">
        <div className="absolute inset-0 bg-transparent" />
        <Container>
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto relative z-10">
                <SectionBadge title="Top Quality Jobs" />
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black  !leading-snug mt-6 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 bg-clip-text text-transparent">
                    Get the Most Highest Quality of Job by Our Top Company
                </h2>
                <p className="text-base md:text-lg text-center text-accent-foreground/80 mt-6">
                    Find the best job opportunities with top companies. Enjoy features like qualified candidates, triple verification, no bots, and personalized AI candidate matching tailored to your job posts.
                </p>
            </div>
        </Container>
        <Container>
            <div className="w-full relative mt-12">
                <Image src={Logo} alt="Logo" className="h-100 w-100" />
                <Particles
                    className="absolute inset-0"
                    quantity={150}
                    ease={80}
                    color="#e4e4e7"
                    refresh
                />
            </div>
        </Container>
    </div>
)
};
export default Connect;