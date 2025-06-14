import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { Trophy, Rocket, Users, Brain, BarChart as ChartBar, Gift } from 'lucide-react';
import { useRef } from 'react';

export const Features = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const features = [
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Smart Learning Roadmap",
      description: "Engage with personalized learning paths tailored to your pace, strengths, and goals—making every step count.",
      items: ["Guided Roadmap", "Summarized Documentation", "Practice Problems", "Real-World Applications"],
      gradient: "from-blue-400 to-cyan-400"
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Gamification Mechanics",
      description: "Earn points, badges, and climb leaderboards as you learn. Complete challenges to level up your skills.",
      items: ["Points System", "Achievement Badges", "Global Leaderboards", "Level Progression"],
      gradient: "from-yellow-400 to-orange-400"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Interactive Learning",
      description: "Engage with AI-generated content and interactive exercises that adapt to your learning style.",
      items: ["AI Quizzes", "Role-Playing", "Simulations", "Adaptive Learning"],
      gradient: "from-purple-400 to-pink-400"
    },
    {
      icon: <Gift className="w-6 h-6" />,
      title: "Rewards & Incentives",
      description: "Unlock exclusive content and earn virtual currency as you progress through your learning journey.",
      items: ["Virtual Currency", "Premium Content", "Special Badges", "Learning Streaks"],
      gradient: "from-pink-400 to-rose-400"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Social Learning",
      description: "Connect with peers, participate in team challenges, and learn together in a collaborative environment.",
      items: ["Team Challenges", "Discussion Forums", "Peer Recognition", "Group Projects"],
      gradient: "from-green-400 to-emerald-400"
    },
    {
      icon: <ChartBar className="w-6 h-6" />,
      title: "Analytics",
      description: "Track your progress with detailed analytics and identify areas for improvement.",
      items: ["Progress Tracking", "Skill Analysis", "Performance Metrics", "Learning Insights"],
      gradient: "from-indigo-400 to-purple-400"
    }
  ];

  return (
    <section 
      ref={containerRef}
      className="relative py-32 overflow-hidden bg-black"
    >
      {/* Hexagonal Background Pattern - Same as Hero */}
      <div className="absolute inset-0 opacity-[0.01]">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="feature-hexagons"
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
          <rect width="100%" height="100%" fill="url(#feature-hexagons)" />
        </svg>
      </div>

      {/* Animated hexagonal elements */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-32 right-16 opacity-[0.02]"
      >
        <svg width="100" height="100" viewBox="0 0 100 100">
          <polygon
            points="50,8 80,26 80,62 50,80 20,62 20,26"
            fill="none"
            stroke="white"
            strokeWidth="0.8"
          />
          <polygon
            points="50,20 70,32 70,56 50,68 30,56 30,32"
            fill="none"
            stroke="white"
            strokeWidth="0.4"
          />
        </svg>
      </motion.div>

      <motion.div
        animate={{
          rotate: [360, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-20 left-20 opacity-[0.015]"
      >
        <svg width="140" height="140" viewBox="0 0 140 140">
          <polygon
            points="70,10 115,35 115,85 70,110 25,85 25,35"
            fill="none"
            stroke="white"
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
          rotate: [0, 30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-[500px] h-[500px] -top-60 -right-60"
      >
        <div className="w-full h-full bg-gradient-to-br from-white/3 to-transparent rounded-full blur-3xl transform rotate-12" />
      </motion.div>

      <motion.div
        animate={{
          scale: [1.02, 1, 1.02],
          opacity: [0.008, 0.025, 0.008],
          rotate: [0, -45, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-[400px] h-[400px] -bottom-40 -left-40"
      >
        <div className="w-full h-full bg-gradient-to-tr from-blue-500/8 to-transparent rounded-full blur-3xl transform -rotate-12" />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          {/* Section badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-full text-white/70 text-sm font-medium mb-8 backdrop-blur-sm"
          >
            <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse-slow" />
            Powerful Features
          </motion.div>

          {/* Section title - Apple style */}
          <motion.div variants={itemVariants} className="mb-6">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-4 tracking-tight leading-[0.9]">
              Enhanced
            </h2>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-4 tracking-tight leading-[0.9]">
              <span className="relative">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text font-medium">
                  Learning
                </span>
                <motion.div
                  animate={{
                    scale: [1, 1.02, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -inset-2 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-blue-400/10 rounded-lg blur-xl -z-10"
                />
              </span>
            </h2>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-white/60 mb-4 max-w-3xl mx-auto font-light leading-relaxed"
          >
            Discover all the tools and features that make learning engaging
          </motion.p>
          
          <motion.p
            variants={itemVariants}
            className="text-lg text-white/40 mb-16 max-w-2xl mx-auto font-light"
          >
            Built for retention. Designed for success.
          </motion.p>
        </motion.div>

        {/* Feature grid - matching hero card style */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                y: -4,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="group relative p-8 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 overflow-hidden"
            >
              {/* Subtle hexagonal pattern overlay - same as hero */}
              <div className="absolute inset-0 opacity-[0.015] group-hover:opacity-[0.03] transition-opacity duration-500">
                <svg
                  className="absolute inset-0 w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 60 60"
                >
                  <polygon
                    points="30,5 50,17.5 50,42.5 30,55 10,42.5 10,17.5"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.3"
                  />
                  <polygon
                    points="30,15 40,22.5 40,37.5 30,45 20,37.5 20,22.5"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.2"
                  />
                </svg>
              </div>

              <div className="relative z-10">
                {/* Icon with gradient background */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-2xl bg-gradient-to-r ${feature.gradient} bg-opacity-10 border border-white/10 group-hover:border-white/20 transition-all duration-300`}>
                    <div className={`text-white/70 group-hover:text-white transition-colors duration-300`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-medium text-white group-hover:text-white transition-colors duration-300">
                    {feature.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-white/50 text-sm leading-relaxed mb-6 group-hover:text-white/70 transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Feature items */}
                <div className="grid grid-cols-1 gap-3">
                  {feature.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center text-white/40 group-hover:text-white/60 transition-colors duration-300">
                      <div className={`w-1.5 h-1.5 bg-gradient-to-r ${feature.gradient} rounded-full mr-3 opacity-60 group-hover:opacity-80 transition-opacity duration-300`}></div>
                      <span className="text-sm font-light">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtle glow effect on hover */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-[0.02] transition-opacity duration-500 rounded-3xl blur-xl`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.02 }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom stats section - Apple style */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-32 text-center"
        >
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {[
              { stat: "6", label: "Core Features" },
              { stat: "∞", label: "Learning Paths" },
              { stat: "100%", label: "Engagement" },
              { stat: "24/7", label: "AI Support" }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                className="text-center group cursor-default"
              >
                <div className="text-2xl md:text-3xl font-light text-white mb-1 group-hover:text-white transition-colors">
                  {item.stat}
                </div>
                <div className="text-sm text-white/40 font-light">{item.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};