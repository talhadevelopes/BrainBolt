import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { Code, BookOpen, Trophy, ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const Features = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.5, 1, 1, 0.5]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      navigate(path);
    } else {
      const nestedRedirect = encodeURIComponent(`/login?redirect=${path}`);
      navigate(`/signup?redirect=${nestedRedirect}`);
    }
  };

  console.log('Features component rendered');

  return (
    <section ref={containerRef} className="relative py-32 overflow-hidden bg-black">
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
          duration: 28,
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
            strokeWidth="0.8"
          />
          <polygon
            points="60,25 80,37.5 80,62.5 60,75 40,62.5 40,37.5"
            fill="none"
            stroke="url(#hex-gradient)"
            strokeWidth="0.4"
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
          duration: 35,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute bottom-32 left-16 opacity-[0.015]"
      >
        <svg width="100" height="100" viewBox="0 0 100 100">
          <polygon
            points="50,8 80,26 80,62 50,80 20,62 20,26"
            fill="none"
            stroke="url(#hex-gradient)"
            strokeWidth="1"
          />
        </svg>
      </motion.div>

      {/* Subtle gradient overlay */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 bg-gradient-to-b from-gray-900/5 via-transparent to-transparent"
      />

      {/* Floating elements with hexagonal inspiration */}
      <motion.div
        animate={{
          scale: [1, 1.03, 1],
          opacity: [0.01, 0.03, 0.01],
          rotate: [0, 45, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-[600px] h-[600px] -top-60 -right-60"
      >
        <div className="w-full h-full bg-gradient-to-br from-white/3 to-transparent rounded-full blur-3xl transform rotate-12" />
      </motion.div>

      <motion.div
        animate={{
          scale: [1.02, 1, 1.02],
          opacity: [0.008, 0.025, 0.008],
          rotate: [0, -30, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-[500px] h-[500px] -bottom-40 -left-40"
      >
        <div className="w-full h-full bg-gradient-to-tr from-blue-500/8 to-transparent rounded-full blur-3xl transform -rotate-12" />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-20"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-full text-white/70 text-sm font-medium mb-8 backdrop-blur-sm"
          >
            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse-slow" />
            Explore Features
          </motion.div>

          <motion.div variants={itemVariants} className="mb-6">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-4 tracking-tight leading-[0.9]">
              <span className="relative">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text font-medium">
                  BrainBolt
                </span>
                <motion.div
                  animate={{
                    scale: [1, 1.02, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute -inset-2 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-lg blur-xl -z-10"
                />
              </span>
            </h2>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-4 tracking-tight leading-[0.9]">
              Features
            </h2>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-white/60 mb-4 max-w-3xl mx-auto font-light leading-relaxed"
          >
            Discover the tools that make learning engaging and effective
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="text-lg text-white/40 mb-16 max-w-2xl mx-auto font-light"
          >
            Powered by AI, built for retention.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {[
            {
              icon: <Code className="w-6 h-6" />,
              title: 'Code Dojo',
              desc: 'Hone your coding skills with real-time feedback and interactive challenges tailored to your level.',
              path: '/code',
            },
            {
              icon: <BookOpen className="w-6 h-6" />,
              title: 'Knowledge Check',
              desc: 'Test your understanding with AI-generated quizzes and flashcards from any content.',
              path: '/kc',
            },
            {
              icon: <Trophy className="w-6 h-6" />,
              title: 'Competitive Arena',
              desc: 'Challenge peers in head-to-head coding battles and climb the leaderboards.',
              path: '/cp',
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
                <p className="text-white/50 text-sm leading-relaxed mb-6 group-hover:text-white/70 transition-colors duration-300">
                  {item.desc}
                </p>
                <motion.button
                  onClick={() => handleNavigate(item.path)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group/button flex items-center gap-2 text-white/60 text-sm font-medium hover:text-white transition-colors duration-300"
                >
                  Try Now
                  <ArrowRight className="w-4 h-4 group-hover/button:translate-x-0.5 transition-transform duration-200" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};