import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Instagram, Linkedin, MessageCircle } from 'lucide-react';

const FooterContact = ({ email, phone, disableMotion = false }) => {
  const MotionDiv = disableMotion ? 'div' : motion.div;

  const contactItems = useMemo(() => [
    {
      id: 'email',
      icon: Mail,
      label: 'Email',
      value: email,
      href: `mailto:${email}`,
      isExternal: true,
    },
  ], [email]);

  const socialLinks = useMemo(() => [
    {
      id: 'instagram',
      icon: Instagram,
      label: 'Instagram',
      href: 'https://www.instagram.com/odelink.shop',
      color: '#E1306C'
    },
    {
      id: 'linkedin',
      icon: Linkedin,
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/%C3%B6delink',
      color: '#0A66C2'
    },
  ], []);

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Contact Items */}
      <div className="space-y-4">
        {contactItems.map((item) => {
          const Icon = item.icon;
          return (
            <MotionDiv
              key={item.id}
              {...(disableMotion ? {} : { variants: itemVariants })}
              className="group"
            >
              <a
                href={item.href}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'noreferrer' : undefined}
                className="flex items-center gap-4 text-gray-300 hover:text-white transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-white/10">
                  <Icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-200 group-hover:text-white break-all">{item.value}</span>
                </div>
              </a>
            </MotionDiv>
          );
        })}
      </div>

      {/* Social Links */}
      <div className="pt-6 border-t border-white/10">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-4">Sosyal Medya</p>
        <div className="flex items-center gap-3">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <MotionDiv
                key={link.id}
                {...(disableMotion ? {} : { variants: itemVariants })}
              >
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 hover:bg-white/10 group"
                  aria-label={link.label}
                >
                  <Icon className="w-5 h-5 transition-colors" style={{ color: link.color }} />
                </a>
              </MotionDiv>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FooterContact;
