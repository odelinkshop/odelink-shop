"use client";

import React from "react";
import { useStoreData } from "@/store/useStoreData";

const AnnouncementBar = () => {
  const { settings } = useStoreData();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Use a stable default or server-provided value until mounted to prevent hydration mismatch
  const text = mounted ? (settings.content.announcementBar || "FREE WORLDWIDE SHIPPING ON ORDERS OVER $500 • COMPLIMENTARY ITALIAN WRAPPING •") : "LÜKS MAĞAZA DENEYİMİ — ODELINK ENTERPRISE STUDIO —";

  return (
    <div className="w-full bg-secondary text-primary py-2.5 overflow-hidden border-b border-primary/5 relative z-50">
      <div className="flex whitespace-nowrap animate-marquee">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <span key={i} className="text-[9px] tracking-[0.8em] uppercase font-light px-20">
            {text} •
          </span>
        ))}
      </div>
      
      <style jsx>{`
        .animate-marquee {
          display: inline-flex;
          animation: marquee 60s linear infinite;
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
