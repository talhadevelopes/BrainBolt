import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { useRef } from 'react';

export const Footer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.5, 1, 1, 0.5]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const links = {
    company: ['About', 'Careers', 'Press'],
    resources: ['Blog', 'Help Center', 'Guidelines'],
    legal: ['Privacy', 'Terms', 'Security'],
    social: [
      { icon: <Github className="w-5 h-5" />, href: 'https://github.com/Mohfazam/BrainBolt', label: 'GitHub' },
      { icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter' },
      { icon: <Linkedin className="w-5 h-5" />, href: '#', label: 'LinkedIn' },
      { icon: <Mail className="w-5 h-5" />, href: '#', label: 'Email' }
    ]
  };

  return (
    <footer 
      ref={containerRef}
      className="relative py-20 overflow-hidden bg-black border-t border-white/[0.05]"
    >
      {/* Hexagonal Background Pattern - Same as Hero */}
      <div className="absolute inset-0 opacity-[0.008]">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="footer-hexagons"
              x="0"
              y="0"
              width="20"
              height="17.32"
              patternUnits="userSpaceOnUse"
            >
              <polygon
                points="10,1 18.66,6 18.66,16 10,21 1.34,16 1.34,6"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
              <polygon
                points="20,9.5 28.66,14.5 28.66,24.5 20,29.5 11.34,24.5 11.34,14.5"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-hexagons)" />
        </svg>
      </div>

      {/* Subtle gradient overlay */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 bg-gradient-to-t from-gray-900/5 via-transparent to-transparent"
      />

      {/* Floating elements */}
      <motion.div
        animate={{
          scale: [1, 1.02, 1],
          opacity: [0.005, 0.015, 0.005],
          rotate: [0, 20, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-[400px] h-[400px] -top-20 -right-20"
      >
        <div className="w-full h-full bg-gradient-to-br from-white/2 to-transparent rounded-full blur-3xl" />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16"
        >
          {/* Brand section */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2"
          >
            <div className="mb-6">
              <h3 className="text-2xl md:text-3xl font-light text-white mb-4 tracking-tight">
                <span className="relative">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text font-medium">
                    BrainBolt
                  </span>
                  <motion.div
                    animate={{
                      scale: [1, 1.01, 1],
                      opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute -inset-1 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 rounded-lg blur-lg -z-10"
                  />
                </span>
              </h3>
            </div>
            
            <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-md font-light">
              Making learning fun and engaging through gamification and interactive experiences. 
              Transform any content into personalized learning journeys.
            </p>

            {/* Social links */}
            <div className="flex gap-4">
              {links.social.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ 
                    y: -2,
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                  className="group p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
                  aria-label={social.label}
                >
                  <div className="text-white/40 group-hover:text-white/70 transition-colors duration-300">
                    {social.icon}
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links sections */}
          {['company', 'resources', 'legal'].map((section, sectionIndex) => (
            <motion.div
              key={section}
              variants={itemVariants}
              className="md:col-span-1"
            >
              <h4 className="text-white font-medium mb-6 capitalize text-sm tracking-wide">
                {section}
              </h4>
              <ul className="space-y-4">
                {/* @ts-ignore */}
                {links[section].map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href="#"
                      className="text-white/40 hover:text-white/70 transition-colors duration-300 text-sm font-light"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="pt-8 border-t border-white/[0.05]"
        >
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <p className="text-white/30 text-sm font-light">
              © {new Date().getFullYear()} BrainBolt. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6 text-white/30 text-sm font-light">
              <span>Built for retention.</span>
              <span className="w-1 h-1 bg-white/20 rounded-full"></span>
              <span>Designed for success.</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};