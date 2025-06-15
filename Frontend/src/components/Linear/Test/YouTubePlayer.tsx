import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Maximize,
  Minimize,
  Settings,
  Download,
  Share2,
  Clock,
  BookOpen,
  Loader,
  AlertCircle,
  CheckCircle2,
  Brain,
} from 'lucide-react';
import { toast } from 'react-toastify';

// Extend the Window interface to include onYouTubeIframeAPIReady
declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

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

interface YouTubePlayerProps {
  videoId?: string;
  onReady?: (videoData: VideoData) => void;
  onStateChange?: (state: number) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  timestamps?: number[];
  onTimestampReached?: (timestamp: number) => void;
}

interface YouTubePlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setPlaybackRate: (rate: number) => void;
  destroy: () => void;
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

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ 
  videoId: propVideoId,
  timestamps = [], 
  onTimestampReached,
  onReady,
  onStateChange,
  onTimeUpdate
}) => {
  const stableTimestamps = useMemo(() => timestamps, [timestamps]);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [player, setPlayer] = useState<YouTubePlayerInstance | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isYouTubeApiLoaded, setIsYouTubeApiLoaded] = useState(false);
  const [showTestModules, setShowTestModules] = useState(false);
  
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const apiLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize data
  useEffect(() => {
    const defaultVideoId = "M7lc1UVf-VE"; // Known embeddable video
    const selectedVideoId = propVideoId || localStorage.getItem("currentVideoId") || defaultVideoId;

    // Validate videoId format
    if (!/^[0-9A-Za-z_-]{10}[0-9A-Za-z_-]$/.test(selectedVideoId)) {
      console.error(`Invalid video ID format: ${selectedVideoId}`);
      setError('Invalid video ID format');
      setLoading(false);
      toast.error(
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-sm font-light">Invalid video ID</span>
        </motion.div>,
        { autoClose: 3000 }
      );
      return;
    }

    try {
      const newVideoData: VideoData = {
        id: selectedVideoId,
        title: 'Advanced Physics: Quantum Mechanics & Modern Applications',
        artist: 'Dr. Elena Rodriguez - Stanford Physics Department',
        duration: 300,
        timestamps: stableTimestamps.map((time, index) => ({
          time,
          title: `Learning Module ${index + 1}: Concept at ${time}s`
        }))
      };

      setVideoData(newVideoData);
      setLoading(false);
      
      toast.success(
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-sm font-light">Enhanced player loaded successfully!</span>
        </motion.div>,
        { autoClose: 3000 }
      );

      if (onReady) {
        onReady(newVideoData);
      }
    } catch (err) {
      console.error('Failed to initialize video data:', err);
      setError('Failed to load video data');
      setLoading(false);
      
      toast.error(
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-sm font-light">Failed to load player</span>
        </motion.div>,
        { autoClose: 3000 }
      );
    }
  }, [stableTimestamps, propVideoId, onReady]);

  // Initialize YouTube API
  useEffect(() => {
    if (!videoData || !videoData.id) return;

    const loadYouTubeApi = () => {
      if (window.YT && window.YT.Player) {
        setIsYouTubeApiLoaded(true);
        return;
      }

      console.log('Loading YouTube IFrame API...');
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube IFrame API loaded');
        setIsYouTubeApiLoaded(true);
        if (apiLoadTimeoutRef.current) {
          clearTimeout(apiLoadTimeoutRef.current);
        }
      };

      apiLoadTimeoutRef.current = setTimeout(() => {
        console.error('YouTube API failed to load within 10 seconds');
        setError('Failed to load YouTube API');
        setLoading(false);
        toast.error(
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm font-light">Failed to load YouTube API</span>
          </motion.div>,
          { autoClose: 3000 }
        );
      }, 10000);
    };

    loadYouTubeApi();

    return () => {
      if (apiLoadTimeoutRef.current) {
        clearTimeout(apiLoadTimeoutRef.current);
      }
      delete window.onYouTubeIframeAPIReady;
    };
  }, [videoData]);

  // Initialize player
  useEffect(() => {
    if (!isYouTubeApiLoaded || !videoData || !videoData.id) return;

    const loadPlayer = () => {
      try {
        console.log(`Initializing YouTube player with video ID: ${videoData.id}`);
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
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: onPlayerError
          }
        });
      } catch (err) {
        console.error('Error initializing YouTube player:', err);
        setError('Failed to initialize YouTube player');
        setLoading(false);
        toast.error(
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm font-light">Failed to initialize player</span>
          </motion.div>,
          { autoClose: 3000 }
        );
      }
    };

    loadPlayer();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) {
        try {
          console.log('Destroying YouTube player');
          playerRef.current.destroy();
        } catch (err) {
          console.error('Error destroying player:', err);
        }
      }
    };
  }, [isYouTubeApiLoaded, videoData]);

  const onPlayerReady = (event: { target: YouTubePlayerInstance }) => {
    console.log('YouTube player ready');
    setPlayer(event.target);
    setDuration(event.target.getDuration());
    event.target.setVolume(volume);
    if (isMuted) event.target.mute();
  };

  const onPlayerStateChange = (event: { data: number }) => {
    console.log(`Player state changed: ${event.data}`);
    if (event.data === 0) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else if (event.data === 1) {
      setIsPlaying(true);
      startProgressTracking();
      if (onStateChange) onStateChange(1);
    } else if (event.data === 2) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (onStateChange) onStateChange(2);
    }
  };

  const onPlayerError = (event: { data: number }) => {
    console.error(`YouTube Player Error: Code ${event.data}`);
    const errorMessage = getYouTubeError(event.data);
    setError(errorMessage);
    setLoading(false);
    toast.error(
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <AlertCircle className="w-5 h-5 text-red-400" />
        <span className="text-sm font-light">{errorMessage}</span>
      </motion.div>,
      { autoClose: 3000 }
    );
  };

  const getYouTubeError = (errorCode: number): string => {
    switch (errorCode) {
      case 2: return 'Invalid video ID';
      case 5: return 'HTML5 player error';
      case 100: return 'Video not found';
      case 101: case 150: return 'Video not embeddable';
      default: return `Player error code: ${errorCode}`;
    }
  };

  const startProgressTracking = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      if (player && player.getCurrentTime) {
        const time = player.getCurrentTime();
        setCurrentTime(time);
        if (onTimeUpdate) onTimeUpdate(time, duration);
        
        stableTimestamps.forEach(timestamp => {
          if (Math.abs(time - timestamp) < 0.5 && onTimestampReached) {
            onTimestampReached(timestamp);
          }
        });
        
        const chapterIndex = videoData?.timestamps.findIndex(
          (ts, index, arr) => 
            time >= ts.time && 
            (index === arr.length - 1 || time < arr[index + 1].time)
        ) ?? 0;
        
        if (chapterIndex !== -1 && chapterIndex !== activeChapter) {
          setActiveChapter(chapterIndex);
        }
      }
    }, 500);
  };

  const togglePlayPause = () => {
    if (!player) return;
    
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    
    if (player) {
      player.seekTo(newTime, true);
    }
  };

  const toggleMute = () => {
    if (!player) return;
    
    if (isMuted) {
      player.unMute();
      setVolume(80);
    } else {
      player.mute();
      setVolume(0);
    }
    setIsMuted(!isMuted);
  };

  const skipToNextChapter = () => {
    if (!videoData) return;
    
    const nextChapter = activeChapter + 1;
    if (nextChapter < videoData.timestamps.length) {
      const nextTime = videoData.timestamps[nextChapter].time;
      player?.seekTo(nextTime, true);
      setCurrentTime(nextTime);
      setActiveChapter(nextChapter);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const shareVideo = () => {
    const shareData = {
      title: videoData?.title || 'Educational Video',
      text: 'Check out this interactive learning video!',
      url: `https://youtube.com/watch?v=${videoData?.id}`
    };

    if (navigator.share) {
      navigator.share(shareData).catch(err => {
        console.error('Error sharing:', err);
        toast.error('Failed to share video');
      });
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast.success('Video URL copied to clipboard!');
    }
  };

  const downloadTranscript = () => {
    const transcript = `Transcript for: ${videoData?.title}\n\nInteractive learning timestamps:\n${stableTimestamps.map(t => `${formatTime(t)}: Learning checkpoint`).join('\n')}`;
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${videoData?.title || 'video'}-transcript.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Transcript downloaded!');
  };

  const retryWithFallback = () => {
    setError(null);
    setLoading(true);
    setVideoData(null);
    localStorage.setItem("currentVideoId", "M7lc1UVf-VE");
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
          <p className="text-purple-400 font-light">Loading enhanced player...</p>
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
          <div className="flex gap-4 justify-center">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl transition font-medium"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition font-medium"
              onClick={retryWithFallback}
            >
              Try Fallback Video
            </motion.button>
          </div>
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
      className={`flex flex-col min-h-screen bg-black text-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      <div className="flex flex-col lg:flex-row gap-6 p-6 flex-1">
        {/* Video Player Section */}
        <motion.div 
          variants={itemVariants}
          className="flex-1 space-y-6"
        >
          {/* Video Container */}
          <div className="bg-white/[0.02] backdrop-blur-sm rounded-3xl overflow-hidden border border-white/[0.05] shadow-2xl">
            <div className="relative bg-black rounded-3xl overflow-hidden">
              <div id="youtube-player" className="w-full aspect-video" />
              
              {/* Video Overlay Controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-end justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-white truncate">{videoData.title}</h2>
                      <p className="text-gray-300 text-sm font-light">{videoData.artist}</p>
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
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                      >
                        {isFullscreen ? <Minimize className="w-4 h-4 text-white" /> : <Maximize className="w-4 h-4 text-white" />}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Controls */}
            <div className="p-6 bg-white/[0.02] backdrop-blur-sm border-t border-white/[0.05]">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-white/60 mb-2 font-light">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
                  />
                  {/* Timestamp markers */}
                  {stableTimestamps.map((timestamp, index) => (
                    <div
                      key={index}
                      className="absolute top-0 w-1 h-2 bg-yellow-400 rounded-full transform -translate-x-1/2"
                      style={{ left: `${(timestamp / duration) * 100}%` }}
                      title={`Timestamp: ${formatTime(timestamp)}`}
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
                    onClick={() => player?.seekTo(Math.max(0, currentTime - 10), true)}
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
                    onClick={skipToNextChapter}
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
                      onChange={(e) => {
                        const newVolume = parseInt(e.target.value);
                        setVolume(newVolume);
                        player?.setVolume(newVolume);
                        setIsMuted(newVolume === 0);
                      }}
                      className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                  
                  {/* Settings */}
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
                              <div className="grid grid-cols-3 gap-1">
                                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                  <button
                                    key={rate}
                                    onClick={() => {
                                      setPlaybackRate(rate);
                                      player?.setPlaybackRate(rate);
                                    }}
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
            </div>
          </div>
          
          {/* Chapter Navigation */}
          {videoData.timestamps.length > 0 && (
            <motion.div 
              variants={itemVariants}
              className="bg-white/[0.02] backdrop-blur-sm rounded-3xl p-6 border border-white/[0.05] shadow-2xl"
            >
              <h3 className="text-xl font-light mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Learning Chapters
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {videoData.timestamps.map((chapter, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 rounded-xl text-left transition-all ${
                      index === activeChapter
                        ? 'bg-purple-600/30 border border-purple-500'
                        : 'bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.05]'
                    }`}
                    onClick={() => {
                      player?.seekTo(chapter.time, true);
                      setCurrentTime(chapter.time);
                    }}
                  >
                    <div className="text-xs text-white/60 mb-1">
                      {formatTime(chapter.time)}
                    </div>
                    <div className="font-medium text-white text-sm truncate">{chapter.title}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Sidebar */}
        <motion.div 
          variants={itemVariants}
          className="lg:w-80 flex flex-col space-y-6"
        >
          {/* Current Chapter Info */}
          <div className="bg-white/[0.02] backdrop-blur-sm rounded-3xl p-6 border border-white/[0.05] shadow-2xl flex-1">
            <h3 className="text-xl font-light mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Current Chapter
            </h3>
            {videoData.timestamps[activeChapter] && (
              <div>
                <h4 className="font-medium text-xl text-white mb-3">
                  {videoData.timestamps[activeChapter].title}
                </h4>
                <p className="text-white/70 font-light leading-relaxed mb-4">
                  This interactive learning module covers fundamental concepts and provides 
                  hands-on experience with the material. Engage with the content through 
                  guided exercises and real-world applications.
                </p>
                <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.05]">
                  <h5 className="font-medium text-purple-400 mb-3">Learning Objectives</h5>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      Understand core concepts and principles
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      Apply knowledge through practical examples
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      Develop critical thinking skills
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      Connect theory to real-world applications
                    </li>
                  </ul>
                </div>
                {/* Test Modules Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTestModules(true)}
                  className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium flex items-center justify-center gap-2"
                >
                  <Brain className="w-5 h-5" />
                  Test Modules
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Test Modules Modal */}
      <AnimatePresence>
        {showTestModules && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[99]"
              onClick={() => setShowTestModules(false)}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/[0.02] backdrop-blur-sm rounded-3xl border border-white/[0.05] shadow-2xl p-6 z-[100] w-full max-w-md"
            >
              <h3 className="text-xl font-medium text-white mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Test Modules
              </h3>
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium text-left"
                  onClick={() => console.log('Quiz selected')}
                >
                  Quiz
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl text-white font-medium text-left"
                  onClick={() => console.log('Competitive Arena selected')}
                >
                  Competitive Arena
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-white font-medium text-left"
                  onClick={() => console.log('Bug Hunter selected')}
                >
                  Bug Hunter
                </motion.button>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTestModules(false)}
                className="mt-6 w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-xl text-white font-medium"
              >
                Close
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Footer Info */}
      <motion.div 
        variants={itemVariants}
        className="text-center p-4 bg-white/[0.02] backdrop-blur-sm border-t border-white/[0.05]"
      >
        <p className="text-white/60 text-sm font-light">
          Enhanced Interactive Player • Video ID: <span className="text-white font-medium">{videoData.id}</span>
        </p>
        <p className="text-white/40 text-xs mt-1">
          Featuring {stableTimestamps.length} interactive learning checkpoints
        </p>
      </motion.div>
    </motion.div>
  );
};

export default YouTubePlayer;