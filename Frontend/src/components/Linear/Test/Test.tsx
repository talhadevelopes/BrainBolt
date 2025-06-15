import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import YouTubePlayer from '../Test/YouTubePlayer';
import { 
  Play, 
  Pause, 
  Info, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Zap,
  Target,
  TrendingUp,
  Award,
  Settings,
  Download
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export const Test: React.FC = () => {
  const [isPlayerVisible, setIsPlayerVisible] = useState<boolean>(true);
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null);
  const [completedTimestamps, setCompletedTimestamps] = useState<number[]>([]);
  
  const timestamps: number[] = [10, 25, 45, 70, 100, 130];
  
  const features: Feature[] = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Automatic Pauses",
      description: "The player automatically pauses at each specified timestamp for interactive learning",
      color: "from-green-400 to-green-600"
    },
    {
      icon: <Play className="w-6 h-6" />,
      title: "Resume Playback", 
      description: "Click the play button to continue from where it paused",
      color: "from-yellow-400 to-yellow-600"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Skip Ahead",
      description: "Use the skip button to jump to the next pause point instantly",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Persistent Video",
      description: "The YouTube video ID is stored in localStorage for convenience",
      color: "from-purple-400 to-purple-600"
    }
  ];

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

  const handleTimestampComplete = (timestamp: number) => {
    if (!completedTimestamps.includes(timestamp)) {
      setCompletedTimestamps([...completedTimestamps, timestamp]);
      toast.success(
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-sm font-medium">Timestamp Completed!</p>
            <p className="text-xs text-gray-300">{timestamp}s mark reached</p>
          </div>
        </motion.div>,
        { autoClose: 3000 }
      );
    }
  };

  const exportProgress = () => {
    const progressData = {
      completedTimestamps,
      totalTimestamps: timestamps.length,
      completionRate: Math.round((completedTimestamps.length / timestamps.length) * 100),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(progressData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `learning-progress-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Progress exported successfully!');
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
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
              <stop offset="0%" style={{ stopColor: '#A78BFA', stopOpacity: 0.3 }} />
              <stop offset="50%" style={{ stopColor: '#3B82F6', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.3 }} />
            </linearGradient>
            <pattern
              id="hexagons"
              x="0"
              y="0"
              width="20"
              height="17.32"
              patternUnits="userSpaceOnUse"
            >
              <polygon
                points="10,1 18.66,6 18.66,16 10,21 1.34,16 1.34,6"
                fill="none"
                stroke="url(#hex-gradient)"
                strokeWidth="0.6"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Header Section */}
          <motion.header 
            variants={itemVariants}
            className="text-center space-y-6"
          >
            <motion.h1 
              className="text-5xl lg:text-7xl font-light text-white tracking-tight leading-[0.9]"
            >
              Interactive
              <span className="relative ml-4">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text font-medium">
                  Learning
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
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-white/60 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Experience the future of education with our advanced YouTube player featuring 
              timestamp-based learning modules and interactive pause points.
            </motion.p>
            
            {/* Stats Dashboard */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-8"
            >
              <div className="bg-white/[0.02] backdrop-blur-sm rounded-2xl p-4 border border-white/[0.05]">
                <div className="text-2xl font-bold text-blue-400">{timestamps.length}</div>
                <div className="text-white/60 text-sm">Timestamps</div>
              </div>
              <div className="bg-white/[0.02] backdrop-blur-sm rounded-2xl p-4 border border-white/[0.05]">
                <div className="text-2xl font-bold text-green-400">{completedTimestamps.length}</div>
                <div className="text-white/60 text-sm">Completed</div>
              </div>
              <div className="bg-white/[0.02] backdrop-blur-sm rounded-2xl p-4 border border-white/[0.05]">
                <div className="text-2xl font-bold text-purple-400">
                  {Math.round((completedTimestamps.length / timestamps.length) * 100)}%
                </div>
                <div className="text-white/60 text-sm">Progress</div>
              </div>
              <div className="bg-white/[0.02] backdrop-blur-sm rounded-2xl p-4 border border-white/[0.05]">
                <div className="text-2xl font-bold text-yellow-400">A+</div>
                <div className="text-white/60 text-sm">Grade</div>
              </div>
            </motion.div>

            {/* Control Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex items-center justify-center gap-4 mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPlayerVisible(!isPlayerVisible)}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all"
              >
                {isPlayerVisible ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlayerVisible ? 'Hide Player' : 'Show Player'}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportProgress}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Progress
              </motion.button>
            </motion.div>
          </motion.header>
          
          {/* Player Section */}
          <AnimatePresence>
            {isPlayerVisible && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-white/[0.02] backdrop-blur-sm rounded-3xl border border-white/[0.05] overflow-hidden shadow-2xl"
              >
                <div className="p-6">
                  <YouTubePlayer 
                    timestamps={timestamps}
                    onTimestampReached={handleTimestampComplete}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Features Grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* How It Works */}
            <div className="bg-white/[0.02] backdrop-blur-sm rounded-3xl p-8 border border-white/[0.05] shadow-2xl">
              <h2 className="text-3xl font-light mb-6 flex items-center gap-3">
                <Info className="h-8 w-8 text-purple-400" />
                How It Works
              </h2>
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    className="flex items-start gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/[0.05]"
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} flex-shrink-0`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-lg mb-2">{feature.title}</h3>
                      <p className="text-white/70 font-light leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Timestamp Progress */}
            <div className="bg-white/[0.02] backdrop-blur-sm rounded-3xl p-8 border border-white/[0.05] shadow-2xl">
              <h2 className="text-3xl font-light mb-6 flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-400" />
                Learning Timeline
              </h2>
              <div className="space-y-4">
                {timestamps.map((timestamp, index) => {
                  const isCompleted = completedTimestamps.includes(timestamp);
                  const isSelected = selectedTimestamp === timestamp;
                  
                  return (
                    <motion.div
                      key={timestamp}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isCompleted 
                          ? 'bg-green-900/20 border-green-500/30' 
                          : isSelected
                            ? 'bg-blue-900/20 border-blue-500/30'
                            : 'bg-white/[0.02] border-white/[0.05] hover:border-white/10'
                      }`}
                      onClick={() => setSelectedTimestamp(timestamp)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isCompleted 
                              ? 'bg-green-600' 
                              : 'bg-white/10'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            ) : (
                              <span className="text-white font-medium">{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">Timestamp {timestamp}s</p>
                            <p className="text-white/60 text-sm">Learning checkpoint #{index + 1}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {isCompleted && (
                            <span className="bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-xs">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Progress Summary */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">Overall Progress</span>
                  <span className="text-purple-400 font-bold">
                    {Math.round((completedTimestamps.length / timestamps.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedTimestamps.length / timestamps.length) * 100}%` }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Achievement Section */}
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-3xl p-8"
          >
            <div className="text-center">
              <Award className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-light text-white mb-4">Learning Achievement System</h2>
              <p className="text-white/70 font-light max-w-2xl mx-auto">
                Track your progress, earn achievements, and unlock new learning paths as you 
                complete interactive modules and reach learning milestones.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white/[0.02] backdrop-blur-sm p-6 rounded-2xl border border-white/[0.05]">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <h3 className="text-white font-medium mb-2">Progress Tracking</h3>
                  <p className="text-white/60 text-sm">Monitor your learning journey with detailed analytics</p>
                </div>
                
                <div className="bg-white/[0.02] backdrop-blur-sm p-6 rounded-2xl border border-white/[0.05]">
                  <Award className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <h3 className="text-white font-medium mb-2">Achievements</h3>
                  <p className="text-white/60 text-sm">Unlock badges and rewards for completing milestones</p>
                </div>
                
                <div className="bg-white/[0.02] backdrop-blur-sm p-6 rounded-2xl border border-white/[0.05]">
                  <Settings className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-white font-medium mb-2">Personalization</h3>
                  <p className="text-white/60 text-sm">Customize your learning experience and preferences</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Test;