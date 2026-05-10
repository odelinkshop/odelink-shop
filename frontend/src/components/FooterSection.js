import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FooterSection = ({ 
  title, 
  links, 
  onLinkClick, 
  disableMotion = false,
  delay = 0,
  isContactSection = false,
  children 
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
      className="flex flex-col border-b border-white/5 md:border-none last:border-none"
      {...(disableMotion ? {} : { variants: containerVariants, initial: 'hidden', whileInView: 'visible', viewport: { once: true } })}
    >
      {title && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-6 md:py-0 md:cursor-default outline-none"
        >
          <h3 className="text-[11px] md:text-sm font-serif text-white/40 md:text-white uppercase tracking-[0.2em] md:mb-6 md:pb-2 md:border-b md:border-white/10">
            {title}
          </h3>
          <span className="md:hidden text-white/20 transition-transform duration-300">
            {isOpen ? <Minus size={14} /> : <Plus size={14} />}
          </span>
        </button>
      )}

      <AnimatePresence>
        {(isOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
          <motion.div
            initial={typeof window !== 'undefined' && window.innerWidth < 768 ? { height: 0, opacity: 0 } : {}}
            animate={typeof window !== 'undefined' && window.innerWidth < 768 ? { height: 'auto', opacity: 1 } : {}}
            exit={typeof window !== 'undefined' && window.innerWidth < 768 ? { height: 0, opacity: 0 } : {}}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-6 md:pb-0">
              {isContactSection ? (
                <div className="space-y-4">
                  {children}
                </div>
              ) : (
                <ul className="space-y-3 md:space-y-4">
                  {links?.map((link) => (
                    <MotionDiv
                      key={link.id}
                      {...(disableMotion ? {} : { variants: itemVariants })}
                      className="group"
                    >
                      <button
                        type="button"
                        onClick={() => onLinkClick?.(link)}
                        className="text-white/30 md:text-gray-400 hover:text-[#C5A059] transition-all duration-300 text-[12px] md:text-sm font-medium uppercase tracking-widest md:tracking-normal md:capitalize"
                        aria-label={link.label}
                      >
                        {link.label}
                      </button>
                    </MotionDiv>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
};

export default FooterSection;
