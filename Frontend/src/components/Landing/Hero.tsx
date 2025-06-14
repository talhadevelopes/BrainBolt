import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { Brain, Target, TrendingUp, ArrowRight, ChevronDown } from 'lucide-react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const badgeVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const navigate = useNavigate();

  const handleGetStarted = () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      navigate('/input');
    } else {
      const nestedRedirect = encodeURIComponent('/login?redirect=/input');
      navigate(`/signup?redirect=${nestedRedirect}`);
    }
  };

  console.log('Hero component rendered');

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-black"
    >
      {/* Hexagonal Background Pattern */}
      <motion.div
        animate={{
          opacity: [0.04, 0.06, 0.04],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 opacity-[0.05] z-0"
      >
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="hex-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#A78BFA', stopOpacity: 0.3 }} /> {/* purple-400 */}
              <stop offset="50%" style={{ stopColor: '#3B82F6', stopOpacity: 0.3 }} /> {/* blue-400 */}
              <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.3 }} /> {/* white */}
            </linearGradient>
            <pattern id="hexagons" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon
                points="10,1 18.66,6 18.66,16 10,21 1.34,16 1.34,6"
                fill="none"
                stroke="url(#hex-gradient)"
                strokeWidth="0.6"
              />
              <polygon
                points="20,9.5 28.66,14.5 28.66,24.5 20,29.5 11.34,24.5 11.34,14.5"
                fill="none"
                stroke="url(#hex-gradient)"
                strokeWidth="0.4"
              />
            </pattern>
            <filter id="hex-glow">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" filter="url(#hex-glow)" />
        </svg>
      </motion.div>

      {/* Animated hexagonal elements */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
          opacity: [0.02, 0.03, 0.02],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute top-20 right-20 opacity-[0.02]"
      >
        <svg width="120" height="120" viewBox="0 0 120 120">
          <polygon
            points="60,10 95,32.5 95,77.5 60,100 25,77.5 25,32.5"
            fill="none"
            stroke="url(#hex-gradient)"
            strokeWidth="1"
          />
          <polygon
            points="60,25 80,37.5 80,62.5 60,75 40,62.5 40,37.5"
            fill="none"
            stroke="url(#hex-gradient)"
            strokeWidth="0.5"
          />
        </svg>
      </motion.div>

      <motion.div
        animate={{
          rotate: [360, 0],
          scale: [1.1, 1, 1.1],
          opacity: [0.015, 0.025, 0.015],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute bottom-32 left-16 opacity-[0.015]"
      >
        <svg width="80" height="80" viewBox="0 0 80 80">
          <polygon
            points="40,5 65,22.5 65,57.5 40,75 15,57.5 15,22.5"
            fill="none"
            stroke="url(#hex-gradient)"
            strokeWidth="0.8"
          />
        </svg>
      </motion.div>

      {/* Subtle gradient overlay */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 bg-gradient-to-b from-gray-900/10 via-transparent to-transparent"
      />

      {/* Minimal floating elements with hexagonal inspiration */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.02, 0.04, 0.02],
          rotate: [0, 60, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-[600px] h-[600px] -top-80 -right-80"
      >
        <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl transform rotate-45" />
      </motion.div>

      <motion.div
        animate={{
          scale: [1.05, 1, 1.05],
          opacity: [0.015, 0.03, 0.015],
          rotate: [0, -60, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-[500px] h-[500px] -bottom-80 -left-80"
      >
        <div className="w-full h-full bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl transform -rotate-45" />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Minimal badge with hexagonal accent */}
          <motion.div
            variants={badgeVariants}
            className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-white/3 border border-white/5 rounded-full text-white/60 text-xs font-medium mb-12 backdrop-blur-sm"
          >
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse-slow" />
            AI-Powered Learning
          </motion.div>

          {/* Hero headline - Apple style */}
          <motion.div variants={itemVariants} className="mb-6">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white mb-4 tracking-tight leading-[0.9]">
              Learning
            </h1>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white mb-4 tracking-tight leading-[0.9]">
              that
              <span className="relative ml-4">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text font-medium">
                  sticks
                </span>
                <motion.div
                  animate={{
                    scale: [1, 1.02, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute -inset-2 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-lg blur-xl -z-10"
                />
              </span>
            </h1>
          </motion.div>

          {/* Subtitle - Apple's clean approach */}
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-white/60 mb-4 max-w-3xl mx-auto font-light leading-relaxed"
          >
            Transform any content into engaging, personalized learning experiences
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="text-lg text-white/40 mb-12 max-w-2xl mx-auto font-light"
          >
            Powered by AI. Designed for retention.
          </motion.p>

          {/* CTA Button - Apple style */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-20"
          >
            <motion.button
              onClick={handleGetStarted}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-8 py-3 bg-white text-black rounded-full font-medium text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-white/20"
            >
              <span className="relative z-10 flex items-center gap-2 justify-center">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              </span>
            </motion.button>
          </motion.div>

          {/* Feature showcase - minimal cards with hexagonal accents */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-1 max-w-5xl mx-auto mb-12"
          >
            {[
              {
                icon: <Brain className="w-6 h-6" />,
                title: 'AI Generation',
                desc: 'Automatically create quizzes and flashcards from any content',
              },
              {
                icon: <Target className="w-6 h-6" />,
                title: 'Adaptive Learning',
                desc: 'Personalized difficulty that evolves with your progress',
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: 'Gamified Progress',
                desc: 'Earn achievements and track your learning journey',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  y: -2,
                  transition: { duration: 0.2, ease: 'easeOut' },
                }}
                className="group relative p-8 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 overflow-hidden"
              >
                {/* Subtle hexagonal pattern overlay */}
                <motion.div
                  animate={{
                    opacity: [0.03, 0.05, 0.03],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500"
                >
                  <svg
                    className="absolute inset-0 w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 60 60"
                  >
                    <defs>
                      <linearGradient id="hex-gradient-card" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#A78BFA', stopOpacity: 0.3 }} /> {/* purple-400 */}
                        <stop offset="50%" style={{ stopColor: '#3B82F6', stopOpacity: 0.3 }} /> {/* blue-400 */}
                        <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.3 }} /> {/* white */}
                      </linearGradient>
                    </defs>
                    <polygon
                      points="30,5 50,17.5 50,42.5 30,55 10,42.5 10,17.5"
                      fill="none"
                      stroke="url(#hex-gradient-card)"
                      strokeWidth="0.4"
                    />
                    <polygon
                      points="30,15 40,22.5 40,37.5 30,45 20,37.5 20,22.5"
                      fill="none"
                      stroke="url(#hex-gradient-card)"
                      strokeWidth="0.3"
                    />
                  </svg>
                </motion.div>

                <div className="relative z-10">
                  <div className="text-white/60 mb-4 group-hover:text-white/80 transition-colors duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2 group-hover:text-white transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed group-hover:text-white/70 transition-colors duration-300">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Minimal scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/30"
      >
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </section>
  );
};