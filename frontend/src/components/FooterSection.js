import React from 'react';
import { motion } from 'framer-motion';

const FooterSection = ({ 
  title, 
  links, 
  onLinkClick, 
  disableMotion = false,
  delay = 0,
  isContactSection = false,
  children 
}) => {
  const MotionDiv = disableMotion ? 'div' : motion.div;
  
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        staggerChildren: 0.05,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <MotionDiv
      className="flex flex-col"
      {...(disableMotion ? {} : { variants: containerVariants, initial: 'hidden', whileInView: 'visible', viewport: { once: true } })}
    >
      {title && (
        <h3 className="text-lg md:text-xl font-bold text-white mb-6 pb-3 border-b-2 border-gradient-to-r from-white/30 via-white/20 to-transparent">
          {title}
        </h3>
      )}

      {isContactSection ? (
        <div className="space-y-4">
          {children}
        </div>
      ) : (
        <ul className="space-y-3">
          {links?.map((link) => (
            <MotionDiv
              key={link.id}
              {...(disableMotion ? {} : { variants: itemVariants })}
              className="group"
            >
              <button
                type="button"
                onClick={() => onLinkClick?.(link)}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 text-base font-medium group-hover:translate-x-1"
                aria-label={link.label}
              >
                <span className="inline-block w-1 h-1 rounded-full bg-white/40 group-hover:bg-white/80 transition-colors"></span>
                {link.label}
              </button>
            </MotionDiv>
          ))}
        </ul>
      )}
    </MotionDiv>
  );
};

export default FooterSection;
