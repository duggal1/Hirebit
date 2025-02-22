"use client";
import { motion, useScroll, useSpring } from "framer-motion";
import { cn } from "../../functions";

interface Props {
  className?: string;
  children: React.ReactNode;
  delay?: number;
  reverse?: boolean;
  simple?: boolean;
  duration?: number;
}

const Container = ({ 
  children, 
  className, 
  delay = 0.05, // Even faster initial delay
  reverse, 
  simple,
  duration = 0.6 // Shorter duration for snappier feel
}: Props) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 35,     // Reduced for silky smoothness
    damping: 12,       // Optimized damping
    mass: 0.05,        // Ultra-light mass for instant response
    restDelta: 0.000001 // Extremely precise stopping
  });

  return (
    <motion.div
      className={cn("w-full h-full", className)}
      initial={{ 
        opacity: 0, 
        y: reverse ? -6 : 6, // Even smaller distance for ultra-subtle movement
        scale: 0.998 // Nearly imperceptible scale
      }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        scale: 1
      }}
      viewport={{ 
        once: false,
        margin: "-20%", // Earlier trigger for buttery smooth transitions
        amount: 0.05 // Ultra-responsive triggering
      }}
      transition={{
        delay,
        duration: simple ? 0.3 : duration,
        type: "spring",
        stiffness: simple ? 45 : 35,    // Reduced stiffness for smoother motion
        damping: simple ? 10 : 8,       // Lower damping for fluid movement
        mass: simple ? 0.1 : 0.05,      // Ultra-light mass
        restDelta: 0.000001,           // Ultra-precise stopping
        restSpeed: 0.000001,           // Ultra-precise resting
        bounce: 0.02                   // Minimal bounce for modern feel
      }}
      style={{
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
        WebkitFontSmoothing: "antialiased",
        perspective: 4000,
        transformStyle: "preserve-3d",
        touchAction: "pan-x pan-y",
        transform: "translate3d(0,0,0)", // Enhanced hardware acceleration
        filter: "blur(0)", // Force GPU rendering
        isolation: "isolate", // Optimize compositing
        contain: "paint layout", // Performance optimization
        contentVisibility: "auto", // Modern content optimization
       // fontDisplay: "optional", // Optimize font loading
      }}
    >
      {children}
    </motion.div>
  );
};

export default Container;