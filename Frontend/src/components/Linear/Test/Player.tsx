import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Clock, BookOpen } from 'lucide-react';

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
}

const Player: React.FC<PlayerProps> = ({ onTimestampReached, timestampModules }) => {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [pausedAtTimestamp, setPausedAtTimestamp] = useState<number | null>(null);
  const [nextTimestampIndex, setNextTimestampIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [playerInitialized, setPlayerInitialized] = useState(false);

  // Initialize video data from localStorage
  useEffect(() => {
    const loadVideoData = () => {
      try {
        // Extract video ID from localStorage
        const videoId = localStorage.getItem("currentVideoId") || "dQw4w9WgXcQ";
        
        const videoData: VideoData = {
          id: videoId,
          title: 'Educational Physics Lecture - Mechanics and Thermodynamics',
          artist: 'Dr. Physics Professor',
          duration: 300,
          timestamps: [
            { time: 30, title: 'Introduction to Kinematics' },
            { time: 75, title: 'Newton\'s Laws of Motion' },
            { time: 120, title: 'Energy and Work' },
            { time: 165, title: 'Thermodynamic Processes' },
            { time: 210, title: 'Heat Transfer Mechanisms' },
            { time: 255, title: 'Electromagnetic Fields' },
            { time: 285, title: 'Quantum Mechanics Basics' }
          ]
        };

        setVideoData(videoData);
        setLoading(false);
        console.log("Loaded video ID from localStorage:", videoId);
      } catch (err) {
        console.error("Error loading video data:", err);
        setError('Failed to load video data');
        setLoading(false);
      }
    };

    loadVideoData();
  }, []);

  // Initialize YouTube player when videoData is ready
  useEffect(() => {
    if (!videoData || !videoData.id || playerInitialized) return;

    const loadPlayer = () => {
      // @ts-ignore
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '360',
        width: '640',
        videoId: videoData.id,
        playerVars: {
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          controls: 0
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
          'onError': onPlayerError
        }
      });
      setPlayerInitialized(true);
    };
//@ts-ignore
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
    //@ts-ignore
  const onPlayerReady = (event: any) => {
    console.log("YouTube player ready for video:", videoData?.id);
    // Set initial duration if available
    if (videoData) {
      //@ts-ignore
      setDuration(videoData.duration);
    }
  };

  const onPlayerStateChange = (event: any) => {
    // Video ended
    if (event.data === 0) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    // Playing
    else if (event.data === 1) {
      setIsPlaying(true);
      startProgressTracking();
    }
    // Paused
    else if (event.data === 2) {
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
        
        // Check if we've reached the next timestamp
        if (videoData && nextTimestampIndex < videoData.timestamps.length && 
            time >= videoData.timestamps[nextTimestampIndex].time) {
          playerRef.current.pauseVideo();
          setPausedAtTimestamp(videoData.timestamps[nextTimestampIndex].time);
          onTimestampReached(videoData.timestamps[nextTimestampIndex]);
          setNextTimestampIndex(nextTimestampIndex + 1);
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
      
      // Update next timestamp index based on new position
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
      
      // Find the index of this timestamp
      if (videoData) {
        const index = videoData.timestamps.findIndex(ts => ts.time === time);
        if (index !== -1) {
          setNextTimestampIndex(index + 1);
        }
      }
    }
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
      <div className="flex items-center justify-center min-h-[300px] bg-gray-800/50 rounded-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <p className="ml-4 text-purple-500">Loading player...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[300px] bg-gray-800/50 rounded-xl p-6">
        <div className="bg-red-500/20 p-6 rounded-xl max-w-md text-center">
          <h3 className="text-red-200 font-bold text-xl mb-3">Error</h3>
          <p className="text-red-100 mb-5">{error}</p>
          <button 
            className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition font-medium"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!videoData) {
    return (
      <div className="flex items-center justify-center min-h-[300px] bg-gray-800/50 rounded-xl p-6">
        <div className="bg-yellow-500/20 p-6 rounded-xl max-w-md text-center">
          <h3 className="text-yellow-200 font-bold text-xl mb-3">No Video Data</h3>
          <p className="text-yellow-100 mb-5">Could not load video information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Video Player */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl"
      >
        <div className="p-4">
          <div className="bg-black rounded-xl overflow-hidden shadow-lg relative">
            <div id="youtube-player" className="w-full aspect-video" />
            
            {/* Video Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 p-3 rounded-lg">
              <h2 className="text-lg font-bold truncate">{videoData.title}</h2>
              <p className="text-gray-400 text-sm">{videoData.artist}</p>
              <p className="text-gray-500 text-xs mt-1">Video ID: {videoData.id}</p>
            </div>
          </div>
        </div>
        
        {/* Player Controls */}
        <div className="p-4 bg-gray-900/50">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold truncate">{videoData.title}</h2>
              <p className="text-gray-400">{videoData.artist}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlayPause}
                className={`p-3 rounded-full ${
                  isPlaying 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } transition-colors shadow-lg`}
              >
                {isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white" />}
              </motion.button>
              
              <div className="flex items-center gap-2 text-gray-300">
                <Clock size={16} />
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(videoData.duration)}</span>
              </div>
            </div>
          </div>
          
          <input
            type="range"
            min="0"
            max={videoData.duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          
          <AnimatePresence>
            {pausedAtTimestamp !== null && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-700 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-full">
                      <BookOpen size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-purple-300 font-medium">Learning Module Activated!</p>
                      <p className="text-purple-200 text-sm">Paused at {formatTime(pausedAtTimestamp)}</p>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePlayPause}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    <Play size={16} />
                    Continue
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Enhanced Timestamps Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl"
      >
        <div className="p-4 bg-gray-900 border-b border-gray-700">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-400" />
            Learning Timestamps & Modules
          </h2>
          <p className="text-gray-400 text-sm mt-1">Each timestamp triggers a different educational module</p>
        </div>
        
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {videoData.timestamps.map((ts, index) => {
            const module = getModuleForTimestamp(ts.time);
            
            return (
              <motion.div 
                key={index}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  index === nextTimestampIndex
                    ? 'bg-purple-900/50 border-2 border-purple-500 shadow-lg'
                    : index < nextTimestampIndex
                      ? 'bg-green-900/20 border border-green-700/50'
                      : 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600/50'
                }`}
                onClick={() => jumpToTimestamp(ts.time)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className={`font-bold ${
                      index === nextTimestampIndex 
                        ? 'text-purple-300' 
                        : index < nextTimestampIndex 
                          ? 'text-green-300' 
                          : 'text-gray-300'
                    }`}>
                      {ts.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{formatTime(ts.time)}</p>
                  </div>
                  <div className="text-right">
                    {index === nextTimestampIndex ? (
                      <span className="bg-purple-700 text-purple-200 px-2 py-1 rounded-full text-xs">Next</span>
                    ) : index < nextTimestampIndex ? (
                      <span className="bg-green-700/50 text-green-300 px-2 py-1 rounded-full text-xs">Completed</span>
                    ) : null}
                  </div>
                </div>
                
                {module && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-600/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{module.icon}</span>
                      <div>
                        <p className="text-white font-medium text-sm">{module.title}</p>
                        <p className="text-gray-400 text-xs">{module.type}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-xs line-clamp-2">{module.description}</p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
      
      <div className="mt-4 text-center text-gray-500 text-sm">
        <p>Playing video from localStorage: {videoData.id}</p>
        <p className="text-gray-600 mt-1">
          To change the video, update the "videoId" in localStorage
        </p>
        <button
          className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          onClick={() => {
            const newVideoId = prompt("Enter new YouTube video ID:");
            if (newVideoId) {
              localStorage.setItem("videoId", newVideoId);
              window.location.reload();
            }
          }}
        >
          Change Video
        </button>
      </div>
    </div>
  );
};

export default Player;