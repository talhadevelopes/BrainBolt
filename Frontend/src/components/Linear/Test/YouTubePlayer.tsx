// src/components/YouTubePlayer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Volume2, VolumeX } from 'lucide-react';

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

// YouTubePlayer component
const YouTubePlayer: React.FC = () => {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [pcmTracks, setPcmTracks] = useState<PCMTrack[]>([]);
  const [player, setPlayer] = useState<any>(null);
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
  
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize data
  useEffect(() => {
    try {
      const videoId = localStorage.getItem("videoId") || "dQw4w9WgXcQ";
      
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

      const pcmTracks: PCMTrack[] = [
        {
          id: 'track-1',
          title: 'Ambient Study Focus',
          duration: '4:32',
          bpm: 72,
          key: 'C Major',
          mood: 'Calm',
          tags: ['ambient', 'study', 'focus', 'peaceful']
        },
        {
          id: 'track-2',
          title: 'Classical Piano Meditation',
          duration: '6:15',
          bpm: 60,
          key: 'D Minor',
          mood: 'Relaxing',
          tags: ['classical', 'piano', 'meditation', 'soft']
        },
        {
          id: 'track-3',
          title: 'Nature Sounds - Forest',
          duration: '8:00',
          bpm: 0,
          key: 'Natural',
          mood: 'Peaceful',
          tags: ['nature', 'forest', 'birds', 'ambient']
        },
        {
          id: 'track-4',
          title: 'Lo-Fi Study Beats',
          duration: '3:45',
          bpm: 85,
          key: 'G Major',
          mood: 'Chill',
          tags: ['lo-fi', 'beats', 'study', 'hip-hop']
        },
        {
          id: 'track-5',
          title: 'White Noise - Rain',
          duration: '10:00',
          bpm: 0,
          key: 'Natural',
          mood: 'Soothing',
          tags: ['white-noise', 'rain', 'sleep', 'focus']
        }
      ];

      setVideoData(videoData);
      setPcmTracks(pcmTracks);
      setLoading(false);
    } catch (err) {
      setError('Failed to load video data');
      setLoading(false);
    }
  }, []);

  

  // Initialize YouTube player
  useEffect(() => {
    if (!videoData || !videoData.id) return;

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
          controls: 0
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
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
    };
  }, [videoData]);

  const onPlayerReady = (event: any) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration());
    event.target.setVolume(volume);
    if (isMuted) event.target.mute();
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

  const startProgressTracking = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      if (player && player.getCurrentTime) {
        const time = player.getCurrentTime();
        setCurrentTime(time);
        
        // Update active chapter
        const chapterIndex = videoData?.timestamps.findIndex(
          (ts, index, arr) => 
            time >= ts.time && 
            (index === arr.length - 1 || time < arr[index + 1].time)
        ) || 0;
        
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
      player.seekTo(nextTime, true);
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
    console.log(`Now playing background track: ${track.title}`);
  };

  const toggleBackgroundAudio = () => {
    setBgAudioPlaying(!bgAudioPlaying);
    console.log(`Background audio ${bgAudioPlaying ? 'paused' : 'playing'}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <p className="ml-4 text-purple-500">Loading player...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 p-6">
        <div className="bg-red-500/20 p-6 rounded-xl max-w-md text-center">
          <h3 className="text-red-200 font-bold text-2xl mb-3">Error</h3>
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
      <div className="flex items-center justify-center min-h-screen bg-gray-900 p-6">
        <div className="bg-yellow-500/20 p-6 rounded-xl max-w-md text-center">
          <h3 className="text-yellow-200 font-bold text-2xl mb-3">No Video Data</h3>
          <p className="text-yellow-100 mb-5">Could not load video information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Video Player Section */}
        <div className="flex-1">
          <div className="bg-black rounded-xl overflow-hidden aspect-video relative">
            <div id="youtube-player" className="w-full h-full" />
            
            {/* Video Overlay Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 p-4 rounded-lg">
              <h2 className="text-xl font-bold truncate">{videoData.title}</h2>
              <p className="text-gray-300">{videoData.artist}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
          
          {/* Control Buttons */}
          <div className="flex justify-center items-center gap-6 mt-4">
            <button 
              className="p-2 rounded-full hover:bg-gray-800"
              onClick={() => player.seekTo(Math.max(0, currentTime - 10), true)}
            >
              <SkipForward size={24} className="transform rotate-180" />
            </button>
            
            <button 
              className="p-4 bg-purple-600 rounded-full hover:bg-purple-700"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} fill="white" />}
            </button>
            
            <button 
              className="p-2 rounded-full hover:bg-gray-800"
              onClick={skipToNextChapter}
            >
              <SkipForward size={24} />
            </button>
            
            <div className="flex items-center gap-2">
              <button 
                className="p-2 rounded-full hover:bg-gray-800"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => {
                  const newVolume = parseInt(e.target.value);
                  setVolume(newVolume);
                  player.setVolume(newVolume);
                  setIsMuted(newVolume === 0);
                }}
                className="w-24 accent-purple-500"
              />
            </div>
          </div>
          
          {/* Chapter Navigation */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-3">Lecture Chapters</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {videoData.timestamps.map((chapter, index) => (
                <button
                  key={index}
                  className={`p-3 rounded-lg text-left transition-all ${
                    index === activeChapter
                      ? 'bg-purple-600/30 border border-purple-500'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    player.seekTo(chapter.time, true);
                    setCurrentTime(chapter.time);
                  }}
                >
                  <div className="text-xs text-gray-400 mb-1">
                    {formatTime(chapter.time)}
                  </div>
                  <div className="font-medium truncate">{chapter.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* PCM Tracks Section */}
        <div className="lg:w-80 flex flex-col">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-lg font-bold mb-3">Background Tracks</h3>
            
            {backgroundTrack && (
              <div className="mb-4 bg-purple-900/20 p-4 rounded-lg border border-purple-700/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold">{backgroundTrack.title}</h4>
                    <div className="text-sm text-gray-400 mt-1">
                      {backgroundTrack.mood} • {backgroundTrack.duration}
                    </div>
                  </div>
                  <button 
                    className={`p-2 rounded-full ${
                      bgAudioPlaying ? 'bg-green-500/20' : 'bg-gray-700'
                    }`}
                    onClick={toggleBackgroundAudio}
                  >
                    {bgAudioPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {backgroundTrack.tags.map((tag, i) => (
                    <span 
                      key={i}
                      className="text-xs bg-gray-700/50 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {pcmTracks.map(track => (
                <button
                  key={track.id}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    backgroundTrack?.id === track.id
                      ? 'bg-purple-600/20 border border-purple-500'
                      : 'bg-gray-700/30 hover:bg-gray-600/40'
                  }`}
                  onClick={() => handleTrackSelect(track)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{track.title}</h4>
                      <div className="text-xs text-gray-400 mt-1">
                        {track.mood} • {track.duration} • {track.key}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {track.bpm > 0 && (
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                          {track.bpm} BPM
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {track.tags.slice(0, 3).map((tag, i) => (
                      <span 
                        key={i}
                        className="text-xs bg-gray-700/50 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Current Chapter Info */}
          <div className="mt-4 bg-gray-800/50 rounded-xl p-4 flex-1">
            <h3 className="text-lg font-bold mb-3">Current Chapter</h3>
            {videoData.timestamps[activeChapter] && (
              <div>
                <h4 className="font-bold text-xl mb-2">
                  {videoData.timestamps[activeChapter].title}
                </h4>
                <p className="text-gray-300">
                  This chapter covers fundamental concepts in {videoData.timestamps[activeChapter].title.toLowerCase()}.
                  You'll learn key principles and see practical examples of how these concepts
                  apply in real-world physics scenarios.
                </p>
                <div className="mt-4 p-3 bg-gray-900/30 rounded-lg">
                  <h5 className="font-bold text-purple-400 mb-2">Key Concepts</h5>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      Core definitions and terminology
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      Mathematical formulations
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      Practical applications and examples
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      Common misconceptions to avoid
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center text-gray-500 text-sm">
        <p>Playing video: {videoData.id} (from localStorage)</p>
      </div>
    </div>
  );
};

export default YouTubePlayer;