import React, { CSSProperties } from "react";

interface RippleProps {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
}

export const Ripple = React.memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
}: RippleProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_bottom,#007BFF,transparent)]">
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = Math.max(0, mainCircleOpacity - i * 0.03);
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = i === numCircles - 1 ? "dashed" : "solid";
        // Use the same dynamic opacity for the border color
        const borderAlpha = opacity;

        return (
          <div
            key={i}
            className={`absolute animate-ripple rounded-full shadow-xl border [--i:${i}] bg-blue-500/15`}
            style={
              {
                width: `${size}px`,
                height: `${size}px`,
                opacity,
                animationDelay,
                borderStyle,
                borderWidth: "2px",
                borderColor: `rgba(0, 123, 255, ${borderAlpha})`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) scale(1)",
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
});

Ripple.displayName = "Ripple";
