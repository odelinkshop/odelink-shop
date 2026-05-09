"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ScrollingTextProps {
  text: string;
  className?: string;
  speed?: number;
  reverse?: boolean;
}

export const ScrollingText = ({ 
  text, 
  className, 
  speed = 40,
  reverse = false 
}: ScrollingTextProps) => {
  return (
    <div className={cn(
      "w-full overflow-hidden border-y border-secondary/10 py-6 bg-secondary text-primary select-none",
      className
    )}>
      <div className={cn(
        "flex whitespace-nowrap",
        reverse ? "animate-marquee-reverse" : "animate-marquee"
      )}
      style={{ animationDuration: `${speed}s` }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <span 
            key={i} 
            className="text-4xl md:text-6xl lg:text-7xl font-serif font-extralight tracking-[0.2em] uppercase px-12"
          >
            {text} —
          </span>
        ))}
      </div>

      <style jsx>{`
        .animate-marquee {
          display: inline-flex;
          animation: marquee linear infinite;
        }
        .animate-marquee-reverse {
          display: inline-flex;
          animation: marquee-reverse linear infinite;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
