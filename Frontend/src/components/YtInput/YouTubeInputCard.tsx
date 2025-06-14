import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  ArrowRight, 
  Loader, 
  CheckCircle2,  
  Search, 
  Clock, 
  Download, 
  Upload, 
  Trash2,
  User,
  Eye,
  Zap,
  Microscope,
  

} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

interface VideoMetadata {
  title: string;
  channel: string;
  duration: string;
  views: string;
  thumbnail: string;
  publishedAt: string;
}

interface HistoryItem {
  url: string;
  videoId: string;
  timestamp: number;
  metadata?: VideoMetadata;
  track?: 'Science' | 'Engineering';
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
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

const trackOptions = [
  {
    id: 'Science',
    name: 'Science',
    description: 'Explore natural phenomena and scientific principles',
    icon: <Microscope className="w-6 h-6" />,
    gradient: 'from-blue-400 via-purple-400 to-pink-400',
    subjects: ['Physics', 'Chemistry', 'Biology', 'Astronomy', 'Environmental Science']
  },
  {
    id: 'Engineering',
    name: 'Engineering',
    description: 'Apply science to design and build innovative solutions',
    icon: <Zap className="w-6 h-6" />,
    gradient: 'from-green-400 via-blue-400 to-purple-400',
    subjects: ['Mechanical', 'Electrical', 'Civil', 'Computer', 'Chemical']
  }
];

export const YouTubeLearningPortal = () => {
  const [url, setUrl] = useState('');
  const [] = useState(['']);
  const [videoId, setVideoId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [] = useState(false);
  const [showTrackSelection, setShowTrackSelection] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<'Science' | 'Engineering' | null>(null);
  const [greeting, setGreeting] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning! Ready to learn something new?');
    else if (hour < 18) setGreeting('Good afternoon! What shall we explore today?');
    else setGreeting('Good evening! Time for some evening learning!');

    // Load history from localStorage
    const savedHistory = localStorage.getItem('youtubeUrlHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error parsing history:', error);
      }
    }

    // Auto-detect clipboard content
    navigator.clipboard.readText().then(text => {
      if (isValidYouTubeUrl(text)) {
        setUrl(text);
        toast.success('YouTube URL detected and pasted!', {
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }
        });
      }
    }).catch(() => {});

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            urlInputRef.current?.focus();
            break;
          case 'Enter':
            e.preventDefault();
            if (isValidUrl) handleAnalyze();
            break;
        }
      }
      if (e.key === 'Escape') {
        setUrl('');
        setVideoMetadata(null);
        setIsValidUrl(false);
        setShowTrackSelection(false);
        setSelectedTrack(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isValidUrl]);

  const isValidYouTubeUrl = (url: string): boolean => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return regex.test(url.trim());
  };

  const extractVideoId = (url: string): string | null => {
    const regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regex);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const fetchVideoMetadata = async (videoId: string): Promise<VideoMetadata | null> => {
    try {
      // Simulate API call - replace with actual YouTube API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        title: "Sample Video Title - Learn Advanced Concepts",
        channel: "Educational Channel",
        duration: "15:42",
        views: "1.2M views",
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        publishedAt: "2 days ago"
      };
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
  };

  const validateUrl = async (inputUrl: string) => {
    const trimmedUrl = inputUrl.trim();
    const isValid = isValidYouTubeUrl(trimmedUrl);
    setIsValidUrl(isValid);
    
    if (isValid) {
      const extractedId = extractVideoId(trimmedUrl);
      if (extractedId) {
        setVideoId(extractedId);
        const metadata = await fetchVideoMetadata(extractedId);
        setVideoMetadata(metadata);
      }
    } else {
      setVideoMetadata(null);
      setVideoId('');
    }
  };

  useEffect(() => {
    if (url) {
      const timeoutId = setTimeout(() => validateUrl(url), 300);
      return () => clearTimeout(timeoutId);
    } else {
      setIsValidUrl(false);
      setVideoMetadata(null);
      setVideoId('');
    }
  }, [url]);

  const updateHistory = (urlToSave: string, track: 'Science' | 'Engineering') => {
    const extractedId = extractVideoId(urlToSave);
    if (!extractedId) return;

    const newItem: HistoryItem = {
      url: urlToSave,
      videoId: extractedId,
      timestamp: Date.now(),
      metadata: videoMetadata || undefined,
      track
    };

    const existingIndex = history.findIndex(item => item.videoId === extractedId);
    let updatedHistory: HistoryItem[];
    
    if (existingIndex >= 0) {
      updatedHistory = [...history];
      updatedHistory[existingIndex] = newItem;
    } else {
      updatedHistory = [newItem, ...history].slice(0, 50);
    }
    
    setHistory(updatedHistory);
    localStorage.setItem('youtubeUrlHistory', JSON.stringify(updatedHistory));
  };

  const handleAnalyze = () => {
    if (!isValidUrl) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }
    setShowTrackSelection(true);
  };

  const handleTrackSelection = (track: 'Science' | 'Engineering') => {
    setSelectedTrack(track);
    setIsLoading(true);
    
    try {
      updateHistory(url, track);
      
      // Simulate processing
      setTimeout(() => {
        setIsLoading(false);
        toast.success(`Processing complete! Track: ${track}`, {
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }
        });
        
        // Store data for navigation
        localStorage.setItem('currentVideoId', videoId);
        localStorage.setItem('selectedTrack', track);

        // Reset UI to proceed forward
        setUrl('');
        setVideoMetadata(null);
        setIsValidUrl(false);
        setShowTrackSelection(false);
        setSelectedTrack(null);

        // Simulate navigation (uncomment if react-router-dom is available)
        // navigate('/content', { state: { videoId, track } });

        console.log(`Proceeding to content page with videoId: ${videoId}, track: ${track}`);
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      toast.error('Error processing video URL');
    }
  };

  const filteredHistory = history.filter(item =>
    item.metadata?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.metadata?.channel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `youtube-learning-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('History exported successfully!');
  };

  const handleImportHistory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedHistory = JSON.parse(e.target?.result as string);
        setHistory(importedHistory);
        localStorage.setItem('youtubeUrlHistory', JSON.stringify(importedHistory));
        toast.success('History imported successfully!');
      } catch (error) {
        toast.error('Error importing history file');
      }
    };
    reader.readAsText(file);
  };

  console.log('YouTubeLearningPortal component rendered');

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Hexagonal Background Pattern */}
        <motion.div
          animate={{
            opacity: [0.04, 0.06, 0.04],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
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
                <polygon
                  points="20,9.5 28.66,14.5 28.66,24.5 20,29.5 11.34,24.5 11.34,14.5"
                  fill="none"
                  stroke="url(#hex-gradient)"
                  strokeWidth="0.4"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
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
            ease: "linear"
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
          </svg>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.02, 0.04, 0.02],
            rotate: [0, 60, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-[600px] h-[600px] -top-80 -right-80"
        >
          <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl transform rotate-45" />
        </motion.div>

        <div className="container mx-auto px-6 py-12 relative z-10 max-w-7xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main Input Section */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 space-y-8"
            >
              {/* Header */}
              <div className="text-center lg:text-left">
                <motion.p
                  variants={itemVariants}
                  className="text-white/60 mb-4 font-light"
                >
                  👋 {greeting}
                </motion.p>
                <motion.h1 
                  variants={itemVariants}
                  className="text-4xl lg:text-6xl font-light text-white mb-4 tracking-tight leading-[0.9]"
                >
                  YouTube
                </motion.h1>
                <motion.h1 
                  variants={itemVariants}
                  className="text-4xl lg:text-6xl font-light text-white mb-4 tracking-tight leading-[0.9]"
                >
                  Learning
                  <span className="relative ml-4">
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text font-medium">
                      Portal
                    </span>
                    <motion.div
                      animate={{
                        scale: [1, 1.02, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute -inset-2 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-lg blur-xl -z-10"
                    />
                  </span>
                </motion.h1>
                <motion.p
                  variants={itemVariants}
                  className="text-xl text-white/40 font-light"
                >
                  Transform videos into personalized learning experiences
                </motion.p>
              </div>

              {/* URL Input Card */}
              <motion.div
                variants={itemVariants}
                className="relative p-8 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] overflow-hidden"
              >
                {/* URL Input */}
                <div className="space-y-6">
                  <div className="relative">
                    <input
                      ref={urlInputRef}
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Paste YouTube URL here..."
                      className="w-full bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 px-6 py-4 text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-all text-lg font-light"
                    />
                    {isValidUrl && (
                      <CheckCircle2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                    )}
                  </div>

                  {/* Video Preview */}
                  <AnimatePresence>
                    {videoMetadata && isValidUrl && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-6 bg-white/5 rounded-2xl border border-white/10"
                      >
                        <div className="flex gap-4">
                          <img
                            src={videoMetadata.thumbnail}
                            alt="Video thumbnail"
                            className="w-32 h-24 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white mb-2 line-clamp-2">
                              {videoMetadata.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-white/60">
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {videoMetadata.channel}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {videoMetadata.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {videoMetadata.views}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Button */}
                  <motion.button
                    onClick={handleAnalyze}
                    disabled={!isValidUrl || isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 rounded-2xl font-medium text-lg transition-all duration-300 ${
                      isValidUrl && !isLoading
                        ? 'bg-white text-black hover:shadow-2xl hover:shadow-white/20'
                        : 'bg-white/10 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader className="w-5 h-5 animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        Analyze Video
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </motion.button>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-sm text-white/40 mb-2 font-medium">Keyboard Shortcuts:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-white/30">
                    <span>⌘K: Focus input</span>
                    <span>⌘Enter: Analyze</span>
                    <span>Esc: Clear</span>
                    <span>⌘V: Paste URL</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* History Sidebar */}
            <motion.div
              variants={itemVariants}
              className="space-y-6"
            >
              {/* History Card */}
              <div className="p-6 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-light">Learning History</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-white/10 rounded-lg border border-white/10 hover:bg-white/20 transition-all"
                      title="Import history"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleExportHistory}
                      className="p-2 bg-white/10 rounded-lg border border-white/10 hover:bg-white/20 transition-all"
                      title="Export history"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setHistory([]);
                        localStorage.removeItem('youtubeUrlHistory');
                        toast.success('History cleared');
                      }}
                      className="p-2 bg-red-500/20 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-all"
                      title="Clear history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search history..."
                    className="w-full bg-white/5 rounded-lg border border-white/10 pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/20"
                  />
                </div>

                {/* History List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((item, index) => (
                      <motion.div
                        key={`${item.videoId}-${item.timestamp}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group cursor-pointer"
                        onClick={() => setUrl(item.url)}
                      >
                        <div className="bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 p-3 transition-all group-hover:border-white/20">
                          <div className="flex gap-3">
                            <img
                              src={item.metadata?.thumbnail || `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`}
                              alt="Thumbnail"
                              className="w-16 h-12 rounded object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-white line-clamp-2 mb-1">
                                {item.metadata?.title || 'YouTube Video'}
                              </h4>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs text-white/60">
                                  {item.metadata?.channel || 'Unknown Channel'}
                                </p>
                                {item.track && (
                                  <span className={`px-2 py-0.5 rounded text-xs bg-gradient-to-r ${
                                    item.track === 'Science' 
                                      ? 'from-blue-400/20 to-purple-400/20 text-blue-300' 
                                      : 'from-green-400/20 to-blue-400/20 text-green-300'
                                  }`}>
                                    {item.track}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-white/40">
                                {new Date(item.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-white/40">
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No learning history yet</p>
                      <p className="text-sm">Process your first video to get started!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Card */}
              <div className="p-6 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05]">
                <h3 className="text-lg font-light mb-4">Learning Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Videos Processed</span>
                    <span className="font-medium text-white">{history.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Science Track</span>
                    <span className="font-medium text-blue-400">
                      {history.filter(item => item.track === 'Science').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Engineering Track</span>
                    <span className="font-medium text-green-400">
                      {history.filter(item => item.track === 'Engineering').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">This Week</span>
                    <span className="font-medium text-purple-400">
                      {history.filter(item => 
                        Date.now() - item.timestamp < 7 * 24 * 60 * 60 * 1000
                      ).length}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Track Selection Modal */}
        <AnimatePresence>
          {showTrackSelection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => !isLoading && setShowTrackSelection(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/[0.05] p-8 max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-light text-white mb-2">Select Your Track</h2>
                  <p className="text-white/60 font-light">Choose the learning path that best fits your goals</p>
                </div>

                {!isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trackOptions.map((track) => (
                      <motion.button
                        key={track.id}
                        onClick={() => handleTrackSelection(track.id as 'Science' | 'Engineering')}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 text-left overflow-hidden"
                      >
                        {/* Gradient overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${track.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
                        
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${track.gradient} bg-opacity-20`}>
                              {track.icon}
                            </div>
                            <div>
                              <h3 className="text-xl font-medium text-white">{track.name}</h3>
                              <p className="text-sm text-white/60">{track.description}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm text-white/40 font-medium">Subjects:</p>
                            <div className="flex flex-wrap gap-2">
                              {track.subjects.map((subject, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/70"
                                >
                                  {subject}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 mx-auto mb-4"
                    >
                      <Loader className="w-full h-full text-white/60" />
                    </motion.div>
                    <h3 className="text-xl font-light text-white mb-2">
                      Processing for {selectedTrack} Track
                    </h3>
                    <p className="text-white/60">
                      Analyzing video content and generating personalized learning materials...
                    </p>
                  </div>
                )}

                {!isLoading && (
                  <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <button
                      onClick={() => setShowTrackSelection(false)}
                      className="text-white/60 hover:text-white/80 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportHistory}
          className="hidden"
        />
      </div>
    </>
  );
};