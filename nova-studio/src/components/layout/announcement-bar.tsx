"use client";

import React from "react";

import { useStoreData } from "@/store/useStoreData";

const AnnouncementBar = () => {
  const { settings } = useStoreData();
  const text = settings.content.announcementBar || "FREE WORLDWIDE SHIPPING ON ORDERS OVER $500 • COMPLIMENTARY ITALIAN WRAPPING •";

  return (
    <div className="w-full bg-secondary text-primary py-2 overflow-hidden border-b border-primary/10">
      <div className="flex whitespace-nowrap animate-marquee">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="text-[10px] tracking-[0.4em] uppercase font-bold px-12">
            {text} •
          </span>
        ))}
      </div>
      
      <style jsx>{`
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default AnnouncementBar;
