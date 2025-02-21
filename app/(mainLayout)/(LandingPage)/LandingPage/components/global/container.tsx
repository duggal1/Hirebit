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
  delay = 0.15, // Reduced delay for smoother start
  reverse, 
  simple,
  duration = 1.2 // Increased duration for smoother animation
}: Props) => {
  // Enhanced spring settings for scrolling
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 70,    // Reduced stiffness for smoother movement
    damping: 20,      // Balanced damping for natural feel
    restDelta: 0.0001 // Smaller restDelta for more precise stopping
  });

  return (
    <motion.div
      className={cn("w-full h-full", className)}
      initial={{ 
        opacity: 0, 
        y: reverse ? -15 : 15, // Reduced distance for smoother entrance
        scale: 0.98 // Closer to 1 for subtler scale effect
      }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        scale: 1
      }}
      viewport={{ 
        once: false,
        margin: "-10%", // Adjusted margin for earlier animation trigger
        amount: 0.2 // Reduced amount for earlier triggering
      }}
      transition={{
        delay,
        duration: simple ? 0.6 : duration,
        type: "spring",
        stiffness: simple ? 80 : 50,     // Reduced stiffness for smoother motion
        damping: simple ? 15 : 12,       // Reduced damping for smoother flow
        mass: simple ? 0.8 : 1,          // Reduced mass for lighter feel
        restDelta: 0.0001,               // More precise stopping point
        restSpeed: 0.0001,               // More precise resting speed
        bounce: 0.1                      // Added slight bounce for natural feel
      }}
      style={{
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
        WebkitFontSmoothing: "subpixel-antialiased", // Enhanced text rendering
        perspective: 2000,                           // Increased perspective
        transformStyle: "preserve-3d",               // Better 3D rendering
        touchAction: "pan-x pan-y",                 // Improved touch handling
      }}
    >
      {children}
    </motion.div>
  );
};

export default Container;