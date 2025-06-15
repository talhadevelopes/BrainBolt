import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { PCMTrack } from '../Data/hardcodedData';
import { pcmTracks } from '../Data/hardcodedData';
import { TimestampModule } from '../Data/moduleAssignment';
import { 
  Play, 
  BarChart3, 
  Clock, 
  BookOpen, 
  Target, 
  Pause,
  Volume2,
  VolumeX,
  Download,
  Search,
  TrendingUp,
  Award,
  Zap,
  Music
} from 'lucide-react';
import { toast } from 'react-toastify';

interface TrackModulesProps {
  timestampModules: TimestampModule[];
}

interface ModuleTypeStats {
  [key: string]: number;
}

interface Tab {
  id: 'modules' | 'tracks' | 'analytics';
  label: string;
  icon: React.ReactNode;
}

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

const TrackModules: React.FC<TrackModulesProps> = ({ timestampModules }) => {
  const [selectedTrack, setSelectedTrack] = useState<PCMTrack | null>(null);
  const [activeTab, setActiveTab] = useState<'modules' | 'tracks' | 'analytics'>('modules');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'time' | 'type' | 'title'>('time');

  const moduleTypeStats = timestampModules.reduce((acc, tm) => {
    acc[tm.module.type] = (acc[tm.module.type] || 0) + 1;
    return acc;
  }, {} as ModuleTypeStats);

  const getModuleTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'JEE Accelerator': 'from-blue-400 via-blue-500 to-blue-600',
      'Formula Fusion': 'from-purple-400 via-purple-500 to-purple-600',
      '3D Explorer': 'from-green-400 via-green-500 to-green-600',
      'Proof Builder': 'from-orange-400 via-orange-500 to-orange-600',
      'Numerical Navigator': 'from-cyan-400 via-cyan-500 to-cyan-600'
    };
    return colors[type] || 'from-gray-400 via-gray-500 to-gray-600';
  };

  const getModuleIcon = (type: string): React.ReactNode => {
    const icons: Record<string, React.ReactNode> = {
      'JEE Accelerator': <Zap className="w-5 h-5" />,
      'Formula Fusion': <Target className="w-5 h-5" />,
      '3D Explorer': <BookOpen className="w-5 h-5" />,
      'Proof Builder': <Award className="w-5 h-5" />,
      'Numerical Navigator': <TrendingUp className="w-5 h-5" />
    };
    return icons[type] || <BookOpen className="w-5 h-5" />;
  };

  const filteredModules = timestampModules
    .filter(tm => 
      (filterType === 'all' || tm.module.type === filterType) &&
      (tm.module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       tm.timestamp.title.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return a.timestamp.time - b.timestamp.time;
        case 'type':
          return a.module.type.localeCompare(b.module.type);
        case 'title':
          return a.module.title.localeCompare(b.module.title);
        default:
          return 0;
      }
    });

  const handleTrackSelect = (track: PCMTrack) => {
    setSelectedTrack(track);
    setIsPlaying(true);
    
    toast.success(
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <Music className="w-5 h-5 text-green-400" />
        <div>
          <p className="text-sm font-medium">Now Playing</p>
          <p className="text-xs text-gray-300">{track.title}</p>
        </div>
      </motion.div>,
      { autoClose: 3000 }
    );
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (selectedTrack) {
      toast.info(`Audio ${isPlaying ? 'paused' : 'resumed'}`);
    }
  };

  const exportModuleData = () => {
    const data = {
      modules: timestampModules,
      stats: moduleTypeStats,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `learning-modules-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Module data exported successfully!');
  };

  const tabs: Tab[] = [
    { id: 'modules', label: 'Learning Modules', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'tracks', label: 'Audio Tracks', icon: <Play className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Enhanced Tab Navigation */}
      <motion.div 
        variants={itemVariants}
        className="bg-white/[0.02] backdrop-blur-sm rounded-3xl overflow-hidden border border-white/[0.05] shadow-2xl"
      >
        <div className="flex border-b border-white/[0.05]">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 p-4 text-center font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'modules' && (
              <motion.div
                key="modules"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Search and Filter Controls */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search modules..."
                      className="w-full bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-all"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 px-4 py-2 text-white focus:outline-none focus:border-white/20"
                      >
                        <option value="all">All Types</option>
                        {Object.keys(moduleTypeStats).map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex-1">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'time' | 'type' | 'title')}
                        className="w-full bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 px-4 py-2 text-white focus:outline-none focus:border-white/20"
                      >
                        <option value="time">Sort by Time</option>
                        <option value="type">Sort by Type</option>
                        <option value="title">Sort by Title</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Module Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(moduleTypeStats).map(([type, count]) => (
                    <motion.div 
                      key={type}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/[0.03] backdrop-blur-sm p-4 rounded-2xl border border-white/[0.05]"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-xl bg-gradient-to-r ${getModuleTypeColor(type)}`}>
                          {getModuleIcon(type)}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{type}</p>
                          <p className="text-white/60 text-xs">{count} modules</p>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / timestampModules.length) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={`h-2 rounded-full bg-gradient-to-r ${getModuleTypeColor(type)}`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Assigned Modules */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-light text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-400" />
                      Learning Modules ({filteredModules.length})
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={exportModuleData}
                      className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </motion.button>
                  </div>
                  
                  {filteredModules.map((tm, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, y: -2 }}
                      className="bg-white/[0.03] backdrop-blur-sm p-4 rounded-2xl border border-white/[0.05] hover:border-white/10 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getModuleTypeColor(tm.module.type)} flex items-center justify-center text-xl flex-shrink-0`}>
                          {tm.module.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-white text-sm">{tm.module.title}</h4>
                            <div className="flex items-center gap-1 text-xs text-white/60">
                              <Clock className="w-3 h-3" />
                              <span>{Math.floor(tm.timestamp.time / 60)}:{String(Math.floor(tm.timestamp.time % 60)).padStart(2, '0')}</span>
                            </div>
                          </div>
                          <p className="text-white/70 text-xs mb-3 line-clamp-2 font-light">{tm.module.description}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`bg-gradient-to-r ${getModuleTypeColor(tm.module.type)} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                              {tm.module.type}
                            </span>
                            <span className="bg-white/10 text-white/70 px-3 py-1 rounded-full text-xs">
                              {tm.timestamp.title}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'tracks' && (
              <motion.div
                key="tracks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Audio Player Controls */}
                {selectedTrack && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-2xl backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-white">{selectedTrack.title}</h4>
                        <p className="text-white/60 text-sm">{selectedTrack.mood} • {selectedTrack.duration}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setIsMuted(!isMuted)}
                          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={togglePlayback}
                          className={`p-3 rounded-xl transition-colors ${
                            isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </motion.button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: isPlaying ? '45%' : '0%' }}
                          transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
                          className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                        />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Volume2 className="w-4 h-4 text-white/60" />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) => setVolume(parseInt(e.target.value))}
                          className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-purple-500"
                        />
                        <span className="text-white/60 text-sm">{volume}%</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {selectedTrack.tags.map((tag, i) => (
                          <span 
                            key={i}
                            className="text-xs bg-white/20 text-white/80 px-2 py-1 rounded-lg"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Track List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-light text-white flex items-center gap-2">
                    <Music className="w-5 h-5 text-blue-400" />
                    Background Audio Library
                  </h3>
                  
                  {pcmTracks.map(track => (
                    <motion.div 
                      key={track.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-2xl transition-all cursor-pointer border ${
                        selectedTrack?.id === track.id
                          ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/50 shadow-lg shadow-blue-500/20'
                          : 'bg-white/[0.03] hover:bg-white/[0.05] border-white/[0.05] hover:border-white/10'
                      }`}
                      onClick={() => handleTrackSelect(track)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-blue-600 to-purple-600 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Play className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white mb-1">{track.title}</h4>
                          <p className="text-white/60 text-sm mb-2">{track.duration} • {track.bpm} BPM • {track.key}</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="bg-white/10 text-white/70 px-2 py-1 rounded-lg text-xs">
                              {track.mood}
                            </span>
                            {track.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="bg-white/10 text-white/70 px-2 py-1 rounded-lg text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Learning Analytics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-6 rounded-2xl border border-blue-500/30"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="w-6 h-6 text-blue-400" />
                      <h3 className="text-lg font-medium text-white">Learning Progress</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Modules Assigned</span>
                        <span className="text-white font-medium">{timestampModules.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Module Types</span>
                        <span className="text-white font-medium">{Object.keys(moduleTypeStats).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Completion Rate</span>
                        <span className="text-green-400 font-medium">85%</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-green-900/30 to-teal-900/30 p-6 rounded-2xl border border-green-500/30"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Award className="w-6 h-6 text-green-400" />
                      <h3 className="text-lg font-medium text-white">Achievements</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Study Streak</span>
                        <span className="text-white font-medium">7 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Modules Completed</span>
                        <span className="text-white font-medium">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Time Spent</span>
                        <span className="text-yellow-400 font-medium">2h 45m</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Detailed Module Analytics */}
                <div className="bg-white/[0.03] backdrop-blur-sm p-6 rounded-2xl border border-white/[0.05]">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Module Type Distribution
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(moduleTypeStats).map(([type, count]) => (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white text-sm font-medium">{type}</span>
                          <span className="text-white/60 text-sm">{count} modules ({Math.round((count / timestampModules.length) * 100)}%)</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / timestampModules.length) * 100}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={`h-3 rounded-full bg-gradient-to-r ${getModuleTypeColor(type)}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Session Statistics */}
                <div className="bg-white/[0.03] backdrop-blur-sm p-6 rounded-2xl border border-white/[0.05]">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    Session Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{timestampModules.length}</p>
                      <p className="text-white/60 text-sm">Total Modules</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{pcmTracks.length}</p>
                      <p className="text-white/60 text-sm">Audio Tracks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">85%</p>
                      <p className="text-white/60 text-sm">Engagement</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">A+</p>
                      <p className="text-white/60 text-sm">Performance</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TrackModules;