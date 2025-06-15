import React, { useState, useEffect, useRef } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';

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

interface PCMTrack {
  id: string;
  title: string;
  duration: string;
  bpm: number;
  key: string;
  mood: string;
  tags: string[];
}

interface YouTubePlayerProps {
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

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ 
  timestamps = [], 
  onTimestampReached 
}) => {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [pcmTracks, setPcmTracks] = useState<PCMTrack[]>([]);
  const [player, setPlayer] = useState<YouTubePlayerInstance | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [backgroundTrack, setBackgroundTrack] = useState<PCMTrack | null>(null);
  const [bgAudioPlaying, setBgAudioPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [] = useState('auto');
  
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize data
  useEffect(() => {
    try {
      const videoId = localStorage.getItem("currentVideoId") || "dQw4w9WgXcQ";
      
      const videoData: VideoData = {
        id: videoId,
        title: 'Advanced Physics: Quantum Mechanics & Modern Applications',
        artist: 'Dr. Elena Rodriguez - Stanford Physics Department',
        duration: 300,
        timestamps: timestamps.map((time, index) => ({
          time,
          title: `Learning Module ${index + 1}: Concept at ${time}s`
        }))
      };

      const pcmTracks: PCMTrack[] = [
        {
          id: 'track-1',
          title: 'Deep Focus - Ambient Study',
          duration: '4:32',
          bpm: 72,
          key: 'C Major',
          mood: 'Focused',
          tags: ['ambient', 'study', 'concentration', 'peaceful']
        },
        {
          id: 'track-2',
          title: 'Classical Piano - Learning Flow',
          duration: '6:15',
          bpm: 60,
          key: 'D Minor',
          mood: 'Contemplative',
          tags: ['classical', 'piano', 'meditation', 'elegant']
        },
        {
          id: 'track-3',
          title: 'Nature Sounds - Forest Ambience',
          duration: '8:00',
          bpm: 0,
          key: 'Natural',
          mood: 'Serene',
          tags: ['nature', 'forest', 'birds', 'organic']
        },
        {
          id: 'track-4',
          title: 'Lo-Fi Study Beats - Productivity',
          duration: '3:45',
          bpm: 85,
          key: 'G Major',
          mood: 'Energetic',
          tags: ['lo-fi', 'beats', 'productivity', 'modern']
        },
        {
          id: 'track-5',
          title: 'White Noise - Rain & Thunder',
          duration: '10:00',
          bpm: 0,
          key: 'Natural',
          mood: 'Calming',
          tags: ['white-noise', 'rain', 'thunder', 'sleep']
        }
      ];

      setVideoData(videoData);
      setPcmTracks(pcmTracks);
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
    } catch (err) {
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
  }, [timestamps]);

  // Initialize YouTube player
  useEffect(() => {
    if (!videoData || !videoData.id) return;

    const loadPlayer = () => {
      // @ts-ignore - YouTube player API is loaded globally
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
    };

    // @ts-ignore - Checking for global YT object
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      // @ts-ignore - Assigning global callback
      window.onYouTubeIframeAPIReady = loadPlayer;
    } else {
      loadPlayer();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [videoData]);

  const onPlayerReady = (event: { target: YouTubePlayerInstance }) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration());
    event.target.setVolume(volume);
    if (isMuted) event.target.mute();
  };

  const onPlayerStateChange = (event: { data: number }) => {
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

  const onPlayerError = (event: { data: number }) => {
    console.error('YouTube Player Error:', event.data);
    setError(`Player error: ${getYouTubeError(event.data)}`);
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
      if (player && player.getCurrentTime) {
        const time = player.getCurrentTime();
        setCurrentTime(time);
        
        // Check for timestamp triggers
        timestamps.forEach(timestamp => {
          if (Math.abs(time - timestamp) < 0.5 && onTimestampReached) {
            onTimestampReached(timestamp);
          }
        });
        
        // Update active chapter
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

  const handleTrackSelect = (track: PCMTrack) => {
    setBackgroundTrack(track);
    setBgAudioPlaying(true);
    
    toast.success(
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3"
      >
        <Play className="w-5 h-5 text-green-400" />
        <div>
          <p className="text-sm font-medium">Background Track Selected</p>
          <p className="text-xs text-gray-300">{track.title}</p>
        </div>
      </motion.div>,
      { autoClose: 3000 }
    );
  };

  const toggleBackgroundAudio = () => {
    setBgAudioPlaying(!bgAudioPlaying);
    toast.info(`Background audio ${bgAudioPlaying ? 'paused' : 'playing'}`);
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
      });
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast.success('Video URL copied to clipboard!');
    }
  };

  const downloadTranscript = () => {
    const transcript = `Transcript for: ${videoData?.title}\n\nInteractive learning timestamps:\n${timestamps.map(t => `${formatTime(t)}: Learning checkpoint`).join('\n')}`;
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${videoData?.title || 'video'}-transcript.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Transcript downloaded!');
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
                  {timestamps.map((timestamp, index) => (
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
        
        {/* Enhanced Sidebar */}
        <motion.div 
          variants={itemVariants}
          className="lg:w-80 flex flex-col space-y-6"
        >
          {/* Background Audio Section */}
          <div className="bg-white/[0.02] backdrop-blur-sm rounded-3xl p-6 border border-white/[0.05] shadow-2xl">
            <h3 className="text-xl font-light mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-green-400" />
              Background Audio
            </h3>
            
            {backgroundTrack && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 p-4 rounded-2xl"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-white">{backgroundTrack.title}</h4>
                    <div className="text-sm text-white/60 mt-1">
                      {backgroundTrack.mood} • {backgroundTrack.duration}
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-2 rounded-lg ${
                      bgAudioPlaying ? 'bg-green-500/20' : 'bg-white/10'
                    }`}
                    onClick={toggleBackgroundAudio}
                  >
                    {bgAudioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </motion.button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {backgroundTrack.tags.map((tag, i) => (
                    <span 
                      key={i}
                      className="text-xs bg-white/20 text-white/80 px-2 py-1 rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {pcmTracks.map(track => (
                <motion.button
                  key={track.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    backgroundTrack?.id === track.id
                      ? 'bg-purple-600/20 border border-purple-500'
                      : 'bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.05]'
                  }`}
                  onClick={() => handleTrackSelect(track)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-white text-sm">{track.title}</h4>
                      <div className="text-xs text-white/60 mt-1">
                        {track.mood} • {track.duration} • {track.key}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {track.bpm > 0 && (
                        <span className="text-xs bg-white/10 px-2 py-1 rounded">
                          {track.bpm} BPM
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {track.tags.slice(0, 3).map((tag, i) => (
                      <span 
                        key={i}
                        className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
          
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
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Footer Info */}
      <motion.div 
        variants={itemVariants}
        className="text-center p-4 bg-white/[0.02] backdrop-blur-sm border-t border-white/[0.05]"
      >
        <p className="text-white/60 text-sm font-light">
          Enhanced Interactive Player • Video ID: <span className="text-white font-medium">{videoData.id}</span>
        </p>
        <p className="text-white/40 text-xs mt-1">
          Featuring {timestamps.length} interactive learning checkpoints
        </p>
      </motion.div>
    </motion.div>
  );
};

export default YouTubePlayer;