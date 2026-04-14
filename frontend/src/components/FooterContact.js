import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Instagram, Linkedin } from 'lucide-react';

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
    {
      id: 'phone',
      icon: Phone,
      label: 'WhatsApp',
      value: phone,
      href: `https://wa.me/${phone.replace(/\D/g, '')}`,
      isExternal: true,
    },
  ], [email, phone]);

  const socialLinks = useMemo(() => [
    {
      id: 'instagram',
      icon: Instagram,
      label: 'Instagram',
      href: 'https://www.instagram.com/odelink.tr/',
    },
    {
      id: 'linkedin',
      icon: Linkedin,
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/murat-bayram-4a23083b5',
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
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{item.label}</span>
                  <span className="text-base font-medium text-gray-300 group-hover:text-white transition-colors break-all">{item.value}</span>
                </div>
              </a>
            </MotionDiv>
          );
        })}
      </div>

      {/* Social Links */}
      <div className="pt-4 border-t border-white/10">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4">Sosyal Medya</p>
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
                  className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                  aria-label={link.label}
                >
                  <Icon className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" />
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
