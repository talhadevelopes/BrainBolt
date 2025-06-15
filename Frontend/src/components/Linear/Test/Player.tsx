import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Clock, 
  BookOpen, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Settings,
  Maximize,
  Minimize,
  Download,
  Share2,
  AlertCircle,
  CheckCircle2,
  Loader
} from 'lucide-react';
import { toast } from 'react-toastify';

// Types
interface Timestamp {
  time: number;
  title: string;
}

interface VideoData {
  id: string;
  title: string;
  artist: string;
  duration: number;
  timestamps: Timestamp[];
}

interface Module {
  id: string;
  title: string;
  type: string;
  icon: string;
  description: string;
}

interface TimestampModule {
  timestamp: Timestamp;
  module: Module;
}

interface PlayerProps {
  onTimestampReached: (timestamp: Timestamp) => void;
  timestampModules: TimestampModule[];
  videoData?: VideoData; // Optional prop for initial video data
  setVideoData?: (data: VideoData) => void; // Optional setter for video data
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

const Player: React.FC<PlayerProps> = ({ onTimestampReached, timestampModules }) => {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [pausedAtTimestamp, setPausedAtTimestamp] = useState<number | null>(null);
  const [nextTimestampIndex, setNextTimestampIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [playerInitialized, setPlayerInitialized] = useState(false);

  // Initialize video data from localStorage
  useEffect(() => {
    const loadVideoData = () => {
      try {
        const videoId = localStorage.getItem("currentVideoId") || "dQw4w9WgXcQ";
        
        const videoData: VideoData = {
          id: videoId,
          title: 'Advanced Physics: Quantum Mechanics & Thermodynamics',
          artist: 'Dr. Sarah Chen - MIT Physics Department',
          duration: 300,
          timestamps: [
            { time: 30, title: 'Introduction to Quantum States' },
            { time: 75, title: 'Wave-Particle Duality' },
            { time: 120, title: 'Heisenberg Uncertainty Principle' },
            { time: 165, title: 'Thermodynamic Laws' },
            { time: 210, title: 'Statistical Mechanics' },
            { time: 255, title: 'Quantum Entanglement' },
            { time: 285, title: 'Applications in Modern Technology' }
          ]
        };

        setVideoData(videoData);
        setLoading(false);
        
        toast.success(
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-sm font-light">Video loaded successfully!</span>
          </motion.div>,
          { autoClose: 3000 }
        );
      } catch (err) {
        console.error("Error loading video data:", err);
        setError('Failed to load video data');
        setLoading(false);
        
        toast.error(
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm font-light">Failed to load video</span>
          </motion.div>,
          { autoClose: 3000 }
        );
      }
    };

    loadVideoData();
  }, []);

  // Initialize YouTube player
  useEffect(() => {
    if (!videoData || !videoData.id || playerInitialized) return;

    const loadPlayer = () => {
      // @ts-ignore
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoData.id,
        playerVars: {
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          controls: 0,
          modestbranding: 1,
          rel: 0
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
          'onError': onPlayerError
        }
      });
      setPlayerInitialized(true);
    };

    // @ts-ignore
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      // @ts-ignore
      window.onYouTubeIframeAPIReady = loadPlayer;
    } else {
      loadPlayer();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) playerRef.current.destroy();
      setPlayerInitialized(false);
    };
  }, [videoData]);

  const onPlayerReady = (event: any) => {
    console.log("YouTube player ready for video:", videoData?.id);
    event.target.setVolume(volume);
    if (isMuted) event.target.mute();
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === 0) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else if (event.data === 1) {
      setIsPlaying(true);
      startProgressTracking();
    } else if (event.data === 2) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const onPlayerError = (event: any) => {
    console.error('YouTube Player Error:', event.data);
    setError(`Failed to play video: ${getYouTubeError(event.data)}`);
  };

  const getYouTubeError = (errorCode: number): string => {
    switch (errorCode) {
      case 2: return 'Invalid video ID';
      case 5: return 'HTML5 player error';
      case 100: return 'Video not found';
      case 101: case 150: return 'Embedding not allowed';
      default: return `Error code: ${errorCode}`;
    }
  };

  const startProgressTracking = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
        
        if (videoData && nextTimestampIndex < videoData.timestamps.length && 
            time >= videoData.timestamps[nextTimestampIndex].time) {
          playerRef.current.pauseVideo();
          setPausedAtTimestamp(videoData.timestamps[nextTimestampIndex].time);
          onTimestampReached(videoData.timestamps[nextTimestampIndex]);
          setNextTimestampIndex(nextTimestampIndex + 1);
          
          toast.info(
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3"
            >
              <BookOpen className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm font-medium">Learning Module Activated!</p>
                <p className="text-xs text-gray-300">{videoData.timestamps[nextTimestampIndex - 1].title}</p>
              </div>
            </motion.div>,
            { autoClose: 5000 }
          );
        }
      }
    }, 500);
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      if (pausedAtTimestamp !== null) {
        playerRef.current.seekTo(pausedAtTimestamp, true);
        setPausedAtTimestamp(null);
      }
      playerRef.current.playVideo();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    
    if (playerRef.current) {
      playerRef.current.seekTo(newTime, true);
      
      let newIndex = 0;
      if (videoData) {
        for (let i = 0; i < videoData.timestamps.length; i++) {
          if (newTime < videoData.timestamps[i].time) {
            newIndex = i;
            break;
          }
        }
      }
      setNextTimestampIndex(newIndex);
      setPausedAtTimestamp(null);
    }
  };

  const jumpToTimestamp = (time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
      setCurrentTime(time);
      setPausedAtTimestamp(time);
      playerRef.current.pauseVideo();
      
      if (videoData) {
        const index = videoData.timestamps.findIndex(ts => ts.time === time);
        if (index !== -1) {
          setNextTimestampIndex(index + 1);
        }
      }
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    
    if (isMuted) {
      playerRef.current.unMute();
      setVolume(80);
    } else {
      playerRef.current.mute();
      setVolume(0);
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // In a real implementation, you'd handle fullscreen API here
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(rate);
    }
  };

  const shareVideo = () => {
    const shareData = {
      title: videoData?.title || 'Educational Video',
      text: 'Check out this educational video!',
      url: `https://youtube.com/watch?v=${videoData?.id}`
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast.success('Video URL copied to clipboard!');
    }
  };

  const downloadTranscript = () => {
    // Mock transcript download
    const transcript = `Transcript for: ${videoData?.title}\n\nGenerated transcript content would go here...`;
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${videoData?.title || 'video'}-transcript.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Transcript downloaded!');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getModuleForTimestamp = (time: number) => {
    return timestampModules.find(tm => tm.timestamp.time === time)?.module;
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[400px] bg-white/[0.02] backdrop-blur-sm rounded-3xl border border-white/[0.05]"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 mx-auto mb-4"
          >
            <Loader className="w-full h-full text-purple-400" />
          </motion.div>
          <p className="text-purple-400 font-light">Loading advanced player...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-[400px] bg-white/[0.02] backdrop-blur-sm rounded-3xl border border-red-500/20 p-8"
      >
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-red-200 font-bold text-xl mb-3">Player Error</h3>
          <p className="text-red-100 mb-6 font-light">{error}</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl transition font-medium"
            onClick={() => window.location.reload()}
          >
            Retry Loading
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (!videoData) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-[400px] bg-white/[0.02] backdrop-blur-sm rounded-3xl border border-yellow-500/20 p-8"
      >
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-yellow-200 font-bold text-xl mb-3">No Video Data</h3>
          <p className="text-yellow-100 mb-6 font-light">Could not load video information</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-6"
    >
      {/* Video Player Container */}
      <motion.div 
        variants={itemVariants}
        className={`relative bg-white/[0.02] backdrop-blur-sm rounded-3xl overflow-hidden border border-white/[0.05] shadow-2xl ${
          isFullscreen ? 'fixed inset-4 z-50' : ''
        }`}
      >
        {/* Video Player */}
        <div className="relative bg-black rounded-3xl overflow-hidden">
          <div id="youtube-player" className="w-full aspect-video" />
          
          {/* Video Overlay Controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-end justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white truncate">{videoData.title}</h2>
                  <p className="text-gray-300 text-sm font-light">{videoData.artist}</p>
                  <p className="text-gray-400 text-xs mt-1">Video ID: {videoData.id}</p>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={shareVideo}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-white" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={downloadTranscript}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <Download className="w-4 h-4 text-white" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleFullscreen}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4 text-white" /> : <Maximize className="w-4 h-4 text-white" />}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Player Controls */}
        <div className="p-6 bg-white/[0.02] backdrop-blur-sm border-t border-white/[0.05]">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-white/60 mb-2 font-light">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(videoData.duration)}</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max={videoData.duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-colors"
              />
              {/* Progress indicators for timestamps */}
              {videoData.timestamps.map((ts, index) => (
                <div
                  key={index}
                  className="absolute top-0 w-1 h-2 bg-yellow-400 rounded-full transform -translate-x-1/2"
                  style={{ left: `${(ts.time / videoData.duration) * 100}%` }}
                  title={ts.title}
                />
              ))}
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => playerRef.current?.seekTo(Math.max(0, currentTime - 10), true)}
                className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                <SkipForward className="h-5 w-5 text-white transform rotate-180" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlayPause}
                className={`p-4 rounded-xl transition-all shadow-lg ${
                  isPlaying 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white" />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => playerRef.current?.seekTo(Math.min(videoData.duration, currentTime + 10), true)}
                className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                <SkipForward className="h-5 w-5 text-white" />
              </motion.button>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMute}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  {isMuted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
                </motion.button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-purple-500"
                />
              </div>
              
              {/* Playback Rate */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Settings className="h-4 w-4 text-white" />
                </motion.button>
                
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute bottom-full right-0 mb-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 min-w-[200px]"
                    >
                      <h4 className="text-white font-medium mb-3">Playback Settings</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-white/70 text-sm block mb-1">Speed</label>
                          <div className="grid grid-cols-4 gap-1">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                              <button
                                key={rate}
                                onClick={() => handlePlaybackRateChange(rate)}
                                className={`px-2 py-1 text-xs rounded transition-colors ${
                                  playbackRate === rate 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                }`}
                              >
                                {rate}x
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          {/* Timestamp Pause Notification */}
          <AnimatePresence>
            {pausedAtTimestamp !== null && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-2xl backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-xl">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-purple-300 font-medium">Learning Module Activated!</p>
                      <p className="text-purple-200 text-sm font-light">Paused at {formatTime(pausedAtTimestamp)}</p>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePlayPause}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Continue Learning
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Enhanced Timestamps Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-white/[0.02] backdrop-blur-sm rounded-3xl overflow-hidden border border-white/[0.05] shadow-2xl"
      >
        <div className="p-6 bg-white/[0.02] border-b border-white/[0.05]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-light text-white flex items-center gap-3">
                <Clock className="h-6 w-6 text-purple-400" />
                Learning Timeline
              </h2>
              <p className="text-white/60 text-sm mt-1 font-light">Interactive modules triggered at specific timestamps</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-sm">Progress</p>
              <p className="text-white font-medium">{nextTimestampIndex}/{videoData.timestamps.length}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videoData.timestamps.map((ts, index) => {
              const module = getModuleForTimestamp(ts.time);
              const isNext = index === nextTimestampIndex;
              const isCompleted = index < nextTimestampIndex;
              
              return (
                <motion.div 
                  key={index}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden ${
                    isNext
                      ? 'bg-purple-900/30 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20'
                      : isCompleted
                        ? 'bg-green-900/20 border border-green-500/30'
                        : 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05]'
                  }`}
                  onClick={() => jumpToTimestamp(ts.time)}
                >
                  {/* Background gradient */}
                  <div className={`absolute inset-0 opacity-10 ${
                    isNext ? 'bg-gradient-to-br from-purple-400 to-pink-400' :
                    isCompleted ? 'bg-gradient-to-br from-green-400 to-blue-400' :
                    'bg-gradient-to-br from-gray-400 to-gray-600'
                  }`} />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className={`font-medium text-lg ${
                          isNext ? 'text-purple-300' : 
                          isCompleted ? 'text-green-300' : 
                          'text-white'
                        }`}>
                          {ts.title}
                        </h3>
                        <p className="text-white/60 text-sm font-light">{formatTime(ts.time)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isNext && (
                          <span className="bg-purple-600 text-purple-200 px-3 py-1 rounded-full text-xs font-medium">
                            Next
                          </span>
                        )}
                        {isCompleted && (
                          <span className="bg-green-600/50 text-green-300 px-3 py-1 rounded-full text-xs font-medium">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {module && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-3 bg-white/[0.05] backdrop-blur-sm rounded-xl border border-white/[0.1]"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{module.icon}</span>
                          <div>
                            <p className="text-white font-medium text-sm">{module.title}</p>
                            <p className="text-white/60 text-xs">{module.type}</p>
                          </div>
                        </div>
                        <p className="text-white/70 text-xs line-clamp-2 font-light">{module.description}</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
      
      {/* Video Info Footer */}
      <motion.div 
        variants={itemVariants}
        className="text-center p-4 bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/[0.05]"
      >
        <p className="text-white/60 text-sm font-light">
          Currently playing: <span className="text-white font-medium">{videoData.id}</span>
        </p>
        <p className="text-white/40 text-xs mt-1">
          Video loaded from localStorage • Enhanced with interactive learning modules
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
          onClick={() => {
            const newVideoId = prompt("Enter new YouTube video ID:");
            if (newVideoId) {
              localStorage.setItem("currentVideoId", newVideoId);
              window.location.reload();
            }
          }}
        >
          Change Video
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Player;