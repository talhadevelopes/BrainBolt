import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  Shuffle,
  BookOpen,
  Search,
  Download,
  Upload,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  TrendingUp,
  Target,
  Award,
  Maximize,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Player from './Player';
import TrackModules from './TrackModules';
import ModuleContainer from '../Module/ModuleContainer';
import { videoData } from '../Data/hardcodedData';
import { moduleAssigner, TimestampModule } from '../Data/moduleAssignment';
import { ModuleData } from '../Data/moduleData';

// Define interfaces for data structures
interface Timestamp {
  time: number;
  title: string;
}


interface LearningSession {
  id: string;
  videoTitle: string;
  startTime: number;
  endTime?: number;
  modulesCompleted: number;
  totalModules: number;
  timestamp: number;
}

interface LearningStats {
  totalSessions: number;
  totalWatchTime: number;
  modulesCompleted: number;
  averageCompletion: number;
  streakDays: number;
}


// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
            <h2 className="text-2xl font-light text-red-400 mb-4">Something went wrong</h2>
            <p className="text-white/60 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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

const toastVariants: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

export const Layout: React.FC = () => {
  const [currentTimestamp, setCurrentTimestamp] = useState<Timestamp | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleData | null>(null);
  const [showModule, setShowModule] = useState(false);
  const [timestampModules, setTimestampModules] = useState<TimestampModule[]>(
    moduleAssigner.assignModulesToTimestamps(videoData.timestamps)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [learningStats, setLearningStats] = useState<LearningStats>({
    totalSessions: 0,
    totalWatchTime: 0,
    modulesCompleted: 0,
    averageCompletion: 0,
    streakDays: 0,
  });
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [greeting, setGreeting] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning! Ready to learn?');
    else if (hour < 18) setGreeting("Good afternoon! Let's continue learning!");
    else setGreeting('Good evening! Perfect time for some learning!');

    // Load saved learning data
    const savedStats = localStorage.getItem('learningStats');
    const savedCompleted = localStorage.getItem('completedModules');

    if (savedStats) {
      try {
        setLearningStats(JSON.parse(savedStats));
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    }

    if (savedCompleted) {
      try {
        setCompletedModules(new Set(JSON.parse(savedCompleted)));
      } catch (error) {
        console.error('Error loading completed modules:', error);
      }
    }

    // Start new learning session
    const newSession: LearningSession = {
      id: Date.now().toString(),
      videoTitle: videoData.title || 'Educational Video',
      startTime: Date.now(),
      modulesCompleted: 0,
      totalModules: timestampModules.length,
      timestamp: Date.now(),
    };
    setCurrentSession(newSession);
  }, [timestampModules.length]);

  useEffect(() => {
    // Save learning data
    localStorage.setItem('learningStats', JSON.stringify(learningStats));
    localStorage.setItem('completedModules', JSON.stringify([...completedModules]));
  }, [learningStats, completedModules]);

  const handleTimestampReached = (timestamp: Timestamp) => {
    setCurrentTimestamp(timestamp);
    const module = moduleAssigner.getModuleForTimestamp(timestamp.time);
    if (module) {
      setActiveModule(module);
      setShowModule(true);

      toast.info(
        <motion.div
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex items-center gap-3 p-3 bg-gray-900/90 rounded-xl shadow-lg"
        >
          <Info className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-light text-white">New learning module available!</span>
        </motion.div>,
        { autoClose: 3000 }
      );
    }
  };

  const handleCloseModule = () => {
    setShowModule(false);
    if (activeModule && !completedModules.has(activeModule.id)) {
      const newCompleted = new Set(completedModules);
      newCompleted.add(activeModule.id);
      setCompletedModules(newCompleted);

      // Update session and stats
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          modulesCompleted: currentSession.modulesCompleted + 1,
        };
        setCurrentSession(updatedSession);
      }

      const newStats = {
        ...learningStats,
        modulesCompleted: learningStats.modulesCompleted + 1,
        averageCompletion: Math.round(
          ((learningStats.modulesCompleted + 1) / timestampModules.length) * 100
        ),
      };
      setLearningStats(newStats);

      toast.success(
        <motion.div
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex items-center gap-3 p-3 bg-gray-900/90 rounded-xl shadow-lg"
        >
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-sm font-light text-white">Module completed! Great job!</span>
        </motion.div>,
        { autoClose: 3000 }
      );
    }
    setActiveModule(null);
  };

  const shuffleModules = () => {
    const newAssignments = moduleAssigner.assignModulesToTimestamps(videoData.timestamps);
    setTimestampModules(newAssignments);

    toast.success(
      <motion.div
        variants={toastVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex items-center gap-3 p-3 bg-gray-900/90 rounded-xl shadow-lg"
      >
        <Shuffle className="w-5 h-5 text-purple-400" />
        <span className="text-sm font-light text-white">Modules shuffled successfully!</span>
      </motion.div>,
      { autoClose: 3000 }
    );
  };

  const filteredModules = timestampModules.filter((module) =>
    module.module?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.module?.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportLearningData = () => {
    const dataToExport = {
      stats: learningStats,
      completedModules: [...completedModules],
      session: currentSession,
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `learning-progress-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(
      <motion.div
        variants={toastVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex items-center gap-3 p-3 bg-gray-900/90 rounded-xl shadow-lg"
      >
        <Download className="w-5 h-5 text-green-400" />
        <span className="text-sm font-light text-white">Learning data exported successfully!</span>
      </motion.div>,
      { autoClose: 3000 }
    );
  };

  const handleImportLearningData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (importedData.stats) setLearningStats(importedData.stats);
        if (importedData.completedModules) {
          setCompletedModules(new Set(importedData.completedModules));
        }

        toast.success(
          <motion.div
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center gap-3 p-3 bg-gray-900/90 rounded-xl shadow-lg"
          >
            <Upload className="w-5 h-5 text-green-400" />
            <span className="text-sm font-light text-white">Learning data imported successfully!</span>
          </motion.div>,
          { autoClose: 3000 }
        );
      } catch (error) {
        toast.error(
          <motion.div
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center gap-3 p-3 bg-gray-900/90 rounded-xl shadow-lg"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm font-light text-white">Error importing learning data</span>
          </motion.div>,
          { autoClose: 3000 }
        );
      }
    };
    reader.readAsText(file);
  };

  const resetProgress = () => {
    setLearningStats({
      totalSessions: 0,
      totalWatchTime: 0,
      modulesCompleted: 0,
      averageCompletion: 0,
      streakDays: 0,
    });
    setCompletedModules(new Set());
    localStorage.removeItem('learningStats');
    localStorage.removeItem('completedModules');

    toast.success(
      <motion.div
        variants={toastVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex items-center gap-3 p-3 bg-gray-900/90 rounded-xl shadow-lg"
      >
        <CheckCircle2 className="w-5 h-5 text-green-400" />
        <span className="text-sm font-light text-white">Learning progress reset successfully!</span>
      </motion.div>,
      { autoClose: 3000 }
    );
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="mt-4 mr-4"
        />

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

        {/* Floating Geometric Elements */}
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

        <div className="container mx-auto px-6 py-8 relative z-10 max-w-7xl">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-12">
              <motion.p variants={itemVariants} className="text-white/60 mb-4 font-light">
                👋 {greeting}
              </motion.p>
              <motion.h1
                variants={itemVariants}
                className="text-4xl lg:text-6xl font-light text-white mb-4 tracking-tight leading-[0.9]"
              >
                EduStream
                <span className="relative ml-4">
                  <span className="bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 text-transparent bg-clip-text font-medium">
                    Player
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
                    className="absolute -inset-2 bg-gradient-to-r from-red-400/10 via-purple-400/10 to-blue-400/10 rounded-lg blur-xl -z-10"
                  />
                </span>
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-xl text-white/40 font-light max-w-3xl mx-auto leading-relaxed"
              >
                Interactive learning platform with educational modules that appear at specific video timestamps
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="mt-8 flex flex-wrap items-center justify-center gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={shuffleModules}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/20 font-medium transition-all"
                >
                  <Shuffle size={16} />
                  Shuffle Modules
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsPlayerExpanded(!isPlayerExpanded)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 font-medium transition-all"
                >
                  <Maximize size={16} />
                  {isPlayerExpanded ? 'Collapse' : 'Expand'} Player
                </motion.button>

                <div className="flex items-center gap-2 text-white/60 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
                  <BookOpen size={16} />
                  <span className="text-sm font-light">
                    {timestampModules.length} modules • {completedModules.size} completed
                  </span>
                </div>
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Main Content Area */}
              <motion.div
                variants={itemVariants}
                className={`${isPlayerExpanded ? 'xl:col-span-4' : 'xl:col-span-3'} space-y-8`}
              >
                {/* Player */}
                <motion.div
                  variants={itemVariants}
                  className="relative p-6 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
                  <div className="relative z-10">
                    <Player
                      videoData={videoData}
                      onTimestampReached={handleTimestampReached}
                      timestampModules={timestampModules}
                    />
                  </div>
                </motion.div>

                {/* Current Session Info */}
                {currentSession && (
                  <motion.div
                    variants={itemVariants}
                    className="p-6 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05]"
                  >
                    <h3 className="text-xl font-light text-white mb-4">Current Learning Session</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-light text-blue-400 mb-1">
                          {currentSession.modulesCompleted}
                        </div>
                        <div className="text-sm text-white/60">Modules Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-light text-green-400 mb-1">
                          {Math.round(
                            (currentSession.modulesCompleted / currentSession.totalModules) * 100
                          )}
                          %
                        </div>
                        <div className="text-sm text-white/60">Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-light text-purple-400 mb-1">
                          {Math.floor((Date.now() - currentSession.startTime) / 60000)}m
                        </div>
                        <div className="text-sm text-white/60">Session Time</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Sidebar */}
              {!isPlayerExpanded && (
                <motion.div variants={itemVariants} className="xl:col-span-1 space-y-6">
                  {/* Learning Statistics */}
                  <div className="p-6 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05]">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-light text-white">Learning Stats</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 bg-white/10 rounded-lg border border-white/10 hover:bg-white/20 transition-all"
                          title="Import progress"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleExportLearningData}
                          className="p-2 bg-white/10 rounded-lg border border-white/10 hover:bg-white/20 transition-all"
                          title="Export progress"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={resetProgress}
                          className="p-2 bg-red-500/20 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-all"
                          title="Reset progress"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                          <span className="text-white/60 text-sm">Modules Completed</span>
                        </div>
                        <span className="font-medium text-blue-400">{learningStats.modulesCompleted}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-green-400" />
                          <span className="text-white/60 text-sm">Completion Rate</span>
                        </div>
                        <span className="font-medium text-green-400">{learningStats.averageCompletion}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-purple-400" />
                          <span className="text-white/60 text-sm">Learning Streak</span>
                        </div>
                        <span className="font-medium text-purple-400">{learningStats.streakDays} days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-400" />
                          <span className="text-white/60 text-sm">Total Sessions</span>
                        </div>
                        <span className="font-medium text-orange-400">{learningStats.totalSessions}</span>
                      </div>
                    </div>
                  </div>

                  {/* Module Search and List */}
                  <div className="p-6 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05]">
                    <h3 className="text-xl font-light text-white mb-4">Learning Modules</h3>

                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search modules..."
                        className="w-full bg-white/5 rounded-lg border border-white/10 pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/20 text-sm"
                      />
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {filteredModules.map((module, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-3 rounded-lg border transition-all cursor-pointer ${
                            completedModules.has(module.module.id)
                              ? 'bg-green-500/10 border-green-500/30'
                              : 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.05]'
                          }`}
                          onClick={() => {
                            setActiveModule(module.module);
                            setShowModule(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white font-medium truncate">
                                {module.module.title}
                              </p>
                              <p className="text-xs text-white/60 mt-1">{module.module.subject}</p>
                              <div className="flex items-center mt-1 text-xs text-white/40">
                                <Clock className="w-3 h-3 mr-1" />
                                {module.timestamp.time}s
                              </div>
                            </div>
                            {completedModules.has(module.module.id) && (
                              <CheckCircle2 className="w-4 h-4 text-green-400 ml-2" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Track Modules Component */}
                  <TrackModules timestampModules={filteredModules} />
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Educational Module Modal */}
        <ModuleContainer
          module={activeModule}
          isVisible={showModule}
          onClose={handleCloseModule}
          timestamp={currentTimestamp?.time || 0}
        />

        {/* Hidden file input for importing */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportLearningData}
          className="hidden"
        />
      </div>
    </ErrorBoundary>
  );
};

export default Layout;