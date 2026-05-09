import React, { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable feature card component with advanced animations
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string} props.description - Card description
 * @param {React.ComponentType} props.icon - Icon component
 * @param {string} props.gradient - Gradient background classes
 * @param {string} props.border - Border color classes
 * @param {string} props.iconBg - Icon background classes
 * @param {string} props.iconColor - Icon color classes
 * @param {number} props.delay - Animation delay in seconds
 * @param {boolean} props.isMobile - Whether rendering on mobile
 * @returns {React.ReactElement}
 */
const FeatureCard = memo(({
  title,
  description,
  icon: Icon,
  gradient,
  border,
  iconBg,
  iconColor,
  delay = 0,
  isMobile = false,
}) => {
  const cardVariants = {
    hidden: { opacity: 0, x: isMobile ? -30 : 0, y: isMobile ? 0 : 20 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: 'easeOut',
      },
    },
    hover: isMobile ? {} : {
      y: -4,
      transition: { duration: 0.3 },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -20 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.4,
        delay: delay + 0.1,
        ease: 'backOut',
      },
    },
    hover: isMobile ? {} : {
      scale: 1.1,
      rotate: 5,
      transition: { duration: 0.3 },
    },
  };

  if (isMobile) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={`rounded-2xl border-2 ${border} bg-gradient-to-br ${gradient} backdrop-blur px-4 py-4 flex items-start gap-3 shadow-lg hover:shadow-xl transition-shadow duration-300`}
        role="article"
        aria-label={`${title}: ${description}`}
      >
        <motion.div
          variants={iconVariants}
          initial="hidden"
          animate="visible"
          className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}
          aria-hidden="true"
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </motion.div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black text-white leading-tight">{title}</h3>
          <p className="text-xs text-white/70 mt-1 font-semibold">{description}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`rounded-2xl border-2 ${border} bg-gradient-to-br ${gradient} backdrop-blur px-6 py-5 flex items-start gap-4 shadow-lg hover:shadow-xl transition-shadow duration-300`}
      role="article"
      aria-label={`${title}: ${description}`}
    >
      <motion.div
        variants={iconVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className={`w-14 h-14 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}
        aria-hidden="true"
      >
        <Icon className={`w-7 h-7 ${iconColor}`} />
      </motion.div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-black text-white leading-tight">{title}</h3>
        <p className="text-sm text-white/70 mt-1.5 font-semibold">{description}</p>
      </div>
    </motion.div>
  );
});

FeatureCard.displayName = 'FeatureCard';

export default FeatureCard;
