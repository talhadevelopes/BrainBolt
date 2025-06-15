"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { YouTubePlayer } from "../components/STEM/YoutubePlayer" // Use the working component from old version
import { motion, AnimatePresence } from "framer-motion"
import { useSteamStore } from "../stores/STEMstore"
import ModuleStem from "../components/STEM/ModuleSTEM"
import { QuizArena } from "../components/CP/QuizArena"
import { CompetitiveArena } from "../components/CP/CompetitiveArena"
import { BugHunter } from "../components/CP/BugHunterArena"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Search,
  Target,
  Zap,
  Brain,
  SkipForward,
  SkipBack,
  Bookmark,
  FileText,
  BarChart3,
  Lightbulb,
  AlertCircle,
} from "lucide-react"
import { toast } from "react-toastify"

// Define YouTube player instance type (matching old implementation)
interface YouTubePlayerInstance {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void
  setVolume: (volume: number) => void
  mute: () => void
  unMute: () => void
  getCurrentTime: () => number
  getDuration: () => number
  setPlaybackRate: (rate: number) => void
  destroy: () => void
}

interface BookmarkItem {
  timestamp: number
  title: string
  note: string
  id: string
}

interface NoteItem {
  timestamp: number
  content: string
  id: string
  type: "note" | "question" | "insight"
}

// Define modal types to consolidate modal state
type ActiveModal =
  | { type: "none" }
  | { type: "testSelection" }
  | { type: "quizArena" }
  | { type: "competitiveArena" }
  | { type: "bugHunter" }

export function STEM() {
  const {
    videoId,
    transcript,
    modules,
    loading,
    error,
    currentActiveModule,
    duration,
    setVideoId,
    fetchModulesAndTranscript,
    setCurrentActiveModule,
    setDuration,
  } = useSteamStore()

  const [inputVideoId, setInputVideoId] = useState("")
  const [playerInstance, setPlayerInstance] = useState<YouTubePlayerInstance | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [volume, setVolume] = useState(100)
  const [showSettings, setShowSettings] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [newNote, setNewNote] = useState("")
  const [noteType, setNoteType] = useState<"note" | "question" | "insight">("note")
  const [watchTime, setWatchTime] = useState(0)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [activeModal, setActiveModal] = useState<ActiveModal>({ type: "none" })
  const moduleTriggeredRef = useRef<string | null>(null)

  // Initialize with videoId from store or localStorage
  useEffect(() => {
    setInputVideoId(videoId)
  }, [videoId])

  // Auto-load video from localStorage when component mounts (matching old implementation)
  useEffect(() => {
    const storedVideoId = localStorage.getItem("currentVideoId")
    const selectedTrack = localStorage.getItem("selectedTrack")

    console.log("Auto-loading video:", { storedVideoId, selectedTrack, currentVideoId: videoId })

    if (storedVideoId && selectedTrack === "Engineering" && !videoId) {
      console.log("Loading video from localStorage:", storedVideoId)
      setVideoId(storedVideoId)
      setInputVideoId(storedVideoId)
      fetchModulesAndTranscript().catch((err) => {
        console.error("Failed to fetch modules/transcript:", err)
        toast?.error?.("Failed to load video data")
      })
    }
  }, [setVideoId, fetchModulesAndTranscript, videoId])

  // Load saved data
  useEffect(() => {
    if (!videoId) return
    const savedBookmarks = localStorage.getItem(`bookmarks_${videoId}`)
    const savedNotes = localStorage.getItem(`notes_${videoId}`)
    const savedWatchTime = localStorage.getItem(`watchTime_${videoId}`)

    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks))
    if (savedNotes) setNotes(JSON.parse(savedNotes))
    if (savedWatchTime) setWatchTime(Number.parseInt(savedWatchTime))
  }, [videoId])

  // Save data
  useEffect(() => {
    if (videoId) {
      localStorage.setItem(`bookmarks_${videoId}`, JSON.stringify(bookmarks))
      localStorage.setItem(`notes_${videoId}`, JSON.stringify(notes))
      localStorage.setItem(`watchTime_${videoId}`, watchTime.toString())
    }
  }, [bookmarks, notes, watchTime, videoId])

  // Update completion percentage
  useEffect(() => {
    if (duration > 0) {
      setCompletionPercentage((currentTime / duration) * 100)
    }
  }, [currentTime, duration])

  // Player event handlers (matching old implementation)
  const handlePlayerReady = useCallback(
    (event: { target: YouTubePlayerInstance }) => {
      console.log("Player ready with video ID:", videoId)
      setPlayerInstance(event.target)
      const playerDuration = event.target.getDuration()
      console.log("Player duration:", playerDuration)
      setDuration(playerDuration > 0 && !isNaN(playerDuration) ? playerDuration : 2068)
      try {
        event.target.playVideo()
        setIsPlaying(true)
      } catch (err) {
        console.error("Error playing video:", err)
        toast?.error?.("Failed to play video")
      }
    },
    [setDuration, videoId],
  )

  const handlePlayerStateChange = useCallback((event: { data: number }) => {
    console.log("Player state changed:", event.data)
    if (event.data === 1) {
      setIsPlaying(true)
    } else if (event.data === 2 || event.data === 0) {
      setIsPlaying(false)
    }
  }, [])

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time)
    setWatchTime((prev) => prev + 1)
    checkModuleTriggers(time)
  }, [])

  const checkModuleTriggers = useCallback(
    (time: number) => {
      if (currentActiveModule || !isPlaying) return
      const nextModule = modules.find(
        (module) => time >= module.timestamp && time < module.timestamp + 5 && moduleTriggeredRef.current !== module.id,
      )
      if (nextModule) {
        console.log("Module triggered:", nextModule)
        setCurrentActiveModule(nextModule)
        moduleTriggeredRef.current = nextModule.id
        if (playerInstance) {
          playerInstance.pauseVideo()
          setIsPlaying(false)
        }
      }
    },
    [currentActiveModule, isPlaying, modules, playerInstance, setCurrentActiveModule],
  )

  const handleLoadVideo = useCallback(async () => {
    if (inputVideoId) {
      console.log("Loading video with ID:", inputVideoId)
      setVideoId(inputVideoId)
      try {
        await fetchModulesAndTranscript()
        console.log("Successfully loaded transcript and modules")
      } catch (err) {
        console.error("Failed to load video data:", err)
        toast?.error?.("Failed to load video data")
      }
      setCurrentActiveModule(null)
      moduleTriggeredRef.current = null
    }
  }, [inputVideoId, setVideoId, fetchModulesAndTranscript, setCurrentActiveModule])

  const handlePlayPause = useCallback(() => {
    if (playerInstance) {
      if (isPlaying) {
        playerInstance.pauseVideo()
      } else {
        playerInstance.playVideo()
      }
      setIsPlaying(!isPlaying)
    }
  }, [playerInstance, isPlaying])

  const handleReset = useCallback(() => {
    if (playerInstance) {
      playerInstance.seekTo(0)
      playerInstance.pauseVideo()
      setCurrentTime(0)
      setIsPlaying(false)
      setCurrentActiveModule(null)
      moduleTriggeredRef.current = null
    }
  }, [playerInstance, setCurrentActiveModule])

  const handleSpeedChange = useCallback(
    (speed: number) => {
      if (playerInstance) {
        playerInstance.setPlaybackRate(speed)
        setPlaybackRate(speed)
      }
    },
    [playerInstance],
  )

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      if (playerInstance) {
        playerInstance.setVolume(newVolume)
        setVolume(newVolume)
        setIsMuted(newVolume === 0)
      }
    },
    [playerInstance],
  )

  const handleSeek = useCallback(
    (seconds: number) => {
      if (playerInstance) {
        const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
        playerInstance.seekTo(newTime)
      }
    },
    [playerInstance, currentTime, duration],
  )

  const toggleMute = useCallback(() => {
    if (playerInstance) {
      if (isMuted) {
        playerInstance.unMute()
      } else {
        playerInstance.mute()
      }
      setIsMuted(!isMuted)
    }
  }, [playerInstance, isMuted])

  const addBookmark = useCallback(() => {
    const newBookmark: BookmarkItem = {
      id: Date.now().toString(),
      timestamp: currentTime,
      title: `Bookmark at ${formatTime(currentTime)}`,
      note: "",
    }
    setBookmarks((prev) => [...prev, newBookmark])
  }, [currentTime])

  const addNote = useCallback(() => {
    if (newNote.trim()) {
      const note: NoteItem = {
        id: Date.now().toString(),
        timestamp: currentTime,
        content: newNote,
        type: noteType,
      }
      setNotes((prev) => [...prev, note])
      setNewNote("")
    }
  }, [newNote, currentTime, noteType])

  const jumpToBookmark = useCallback(
    (timestamp: number) => {
      if (playerInstance) {
        playerInstance.seekTo(timestamp)
      }
    },
    [playerInstance],
  )

  const handleModuleClick = useCallback(
    (module: any) => {
      if (playerInstance) {
        console.log("Seeking to module timestamp:", module.timestamp)
        playerInstance.seekTo(module.timestamp)
        playerInstance.playVideo()
        setIsPlaying(true)
      }
    },
    [playerInstance],
  )

  const handleContinueLearning = useCallback(() => {
    setCurrentActiveModule(null)
    setActiveModal({ type: "none" })
    if (playerInstance) {
      playerInstance.playVideo()
      setIsPlaying(true)
    }
  }, [playerInstance, setCurrentActiveModule])

  const handleTestModule = useCallback(() => {
    setActiveModal({ type: "testSelection" })
  }, [])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  const filteredTranscript = transcript?.toLowerCase().includes(searchQuery.toLowerCase()) ? transcript : ""

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Enhanced Background Pattern with Multiple Layers */}
      <div className="absolute inset-0 z-0">
        {/* Primary Hexagon Pattern */}
        <motion.div
          animate={{ opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="absolute inset-0 opacity-[0.05]"
        >
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="hex-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#A78BFA", stopOpacity: 0.4 }} />
                <stop offset="50%" style={{ stopColor: "#3B82F6", stopOpacity: 0.4 }} />
                <stop offset="100%" style={{ stopColor: "#10B981", stopOpacity: 0.4 }} />
              </linearGradient>
              <pattern id="hexagons" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
                <polygon
                  points="10,1 18.66,6 18.66,16 10,21 1.34,16 1.34,6"
                  fill="none"
                  stroke="url(#hex-gradient)"
                  strokeWidth="0.8"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </motion.div>

        {/* Floating Orbs */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              left: `${10 + i * 20}%`,
              top: `${10 + i * 15}%`,
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 2,
            }}
          />
        ))}

        {/* Grid Lines */}
        <motion.div
          animate={{ opacity: [0.02, 0.05, 0.02] }}
          transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="container mx-auto px-6 py-8 relative z-10 max-w-7xl">
        {/* Enhanced Header */}
        <motion.div variants={itemVariants} className="text-center relative">
          {/* Glowing Background */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-blue-400/10 to-purple-400/10 rounded-3xl blur-3xl -z-10"
          />

          <motion.h1
            className="text-4xl lg:text-6xl font-light text-white mb-4 tracking-tight leading-[0.9] relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Engineering
            <span className="relative ml-4">
              <motion.span
                className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 text-transparent bg-clip-text font-medium"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Learning Hub
              </motion.span>
              <motion.div
                animate={{
                  scale: [1, 1.02, 1],
                  opacity: [0.3, 0.6, 0.3],
                  rotate: [0, 1, 0],
                }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="absolute -inset-4 bg-gradient-to-r from-green-400/10 via-blue-400/10 to-purple-400/10 rounded-2xl blur-xl -z-10"
              />
            </span>
          </motion.h1>

          <motion.p
            className="text-xl text-white/40 font-light relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Interactive learning experience with real-time modules and advanced features
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
              className="inline-block ml-2 w-2 h-5 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"
            />
          </motion.p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {/* Video Input Section */}
          {!videoId && (
            <motion.div
              variants={itemVariants}
              className="relative p-8 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] overflow-hidden max-w-2xl mx-auto"
            >
              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    value={inputVideoId}
                    onChange={(e) => setInputVideoId(e.target.value)}
                    placeholder="Enter YouTube Video ID or URL..."
                    className="w-full bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 px-6 py-4 pr-12 text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-all text-lg font-light"
                  />
                </div>
                <motion.button
                  onClick={handleLoadVideo}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-2xl font-medium text-lg transition-all duration-300 bg-white text-black hover:shadow-2xl hover:shadow-white/20 disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Load Video"}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <motion.div
              variants={itemVariants}
              className="max-w-2xl mx-auto p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-200"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            </motion.div>
          )}

          {videoId && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Main Video Section */}
              <div className="xl:col-span-3 space-y-6">
                {/* Video Player */}
                <motion.div
                  variants={itemVariants}
                  className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-white/10"
                >
                  <YouTubePlayer
                    videoId={videoId}
                    onReady={handlePlayerReady}
                    onStateChange={handlePlayerStateChange}
                    onTimeUpdate={handleTimeUpdate}
                  />

                  {/* Custom Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handlePlayPause}
                          className="p-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/30 transition-all"
                        >
                          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </button>

                        <button
                          onClick={() => handleSeek(-10)}
                          className="p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/20 transition-all"
                        >
                          <SkipBack className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleSeek(10)}
                          className="p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/20 transition-all"
                        >
                          <SkipForward className="w-5 h-5" />
                        </button>

                        <button
                          onClick={handleReset}
                          className="p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/20 transition-all"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1.04 6.7 2.8l-3.7 3.7M21 3v5h-5" />
                          </svg>
                        </button>

                        <button
                          onClick={toggleMute}
                          className="p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/20 transition-all"
                        >
                          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>

                        <span className="text-sm font-mono text-white/80">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={addBookmark}
                          className="p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/20 transition-all"
                          title="Add Bookmark"
                        >
                          <Bookmark className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => setShowSettings(!showSettings)}
                          className="p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/20 transition-all"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Settings Panel */}
                  <AnimatePresence>
                    {showSettings && (
                      <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="absolute top-4 right-4 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6 min-w-64 z-20"
                      >
                        <h3 className="text-lg font-medium mb-4">Video Settings</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm text-white/60 mb-2">Playback Speed</label>
                            <div className="grid grid-cols-4 gap-2">
                              {[0.5, 1, 1.5, 2].map((speed) => (
                                <button
                                  key={speed}
                                  onClick={() => handleSpeedChange(speed)}
                                  className={`p-2 rounded-lg text-sm transition-all ${
                                    playbackRate === speed
                                      ? "bg-blue-500 text-white"
                                      : "bg-white/10 text-white/60 hover:bg-white/20"
                                  }`}
                                >
                                  {speed}x
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-white/60 mb-2">Volume: {volume}%</label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={volume}
                              onChange={(e) => handleVolumeChange(Number.parseInt(e.target.value))}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Enhanced Quick Actions */}
                <motion.div variants={itemVariants} className="flex flex-wrap gap-6 justify-center">
                  {[
                    {
                      action: () => setActiveModal({ type: "quizArena" }),
                      icon: Brain,
                      label: "Take Quiz",
                      color: "from-purple-500 to-pink-500",
                      description: "Test Knowledge",
                    },
                    {
                      action: () => setActiveModal({ type: "competitiveArena" }),
                      icon: Target,
                      label: "Coding Challenge",
                      color: "from-red-500 to-orange-500",
                      description: "Solve Problems",
                    },
                    {
                      action: () => setActiveModal({ type: "bugHunter" }),
                      icon: Zap,
                      label: "Bug Hunt",
                      color: "from-orange-500 to-yellow-500",
                      description: "Find & Fix",
                    },
                  ].map(({ action, icon: Icon, label, color, description }, index) => (
                    <motion.button
                      key={label}
                      onClick={action}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{
                        scale: 1.05,
                        y: -5,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      className={`group relative px-8 py-4 bg-gradient-to-r ${color} rounded-2xl transition-all duration-300 overflow-hidden min-w-[180px]`}
                    >
                      {/* Animated Background */}
                      <motion.div
                        className="absolute inset-0 bg-white/10"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />

                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                          <Icon className="w-6 h-6 text-white" />
                        </motion.div>
                        <div className="text-center">
                          <div className="font-medium text-white">{label}</div>
                          <div className="text-xs text-white/70">{description}</div>
                        </div>
                      </div>

                      {/* Glow Effect */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        style={{
                          background: `linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)`,
                          filter: "blur(1px)",
                        }}
                      />
                    </motion.button>
                  ))}
                </motion.div>

                {/* Modules */}
                {videoId && (
                  <motion.div variants={itemVariants}>
                    <ModuleStem onModuleClick={handleModuleClick} onTestModule={handleTestModule} />
                  </motion.div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Learning Analytics */}
                <motion.div
                  variants={itemVariants}
                  className="p-6 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05]"
                >
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    Learning Progress
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-3">
                        <span className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full"
                          />
                          Completion
                        </span>
                        <motion.span
                          key={Math.round(completionPercentage)}
                          initial={{ scale: 1.2, color: "#60A5FA" }}
                          animate={{ scale: 1, color: "#FFFFFF" }}
                          transition={{ duration: 0.3 }}
                          className="font-mono"
                        >
                          {Math.round(completionPercentage)}%
                        </motion.span>
                      </div>
                      <div className="relative w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full relative overflow-hidden"
                          style={{
                            background: `linear-gradient(90deg, #10B981, #3B82F6, #A78BFA)`,
                            width: `${completionPercentage}%`,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${completionPercentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-white/20"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          />
                        </motion.div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white/5 rounded-xl">
                        <div className="text-2xl font-bold text-green-400">{Math.floor(watchTime / 60)}</div>
                        <div className="text-xs text-white/60">Minutes Watched</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-xl">
                        <div className="text-2xl font-bold text-purple-400">{modules.length}</div>
                        <div className="text-xs text-white/60">Modules</div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Bookmarks */}
                <motion.div
                  variants={itemVariants}
                  className="p-6 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05]"
                >
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-yellow-400" />
                    Bookmarks ({bookmarks.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {bookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id}
                        onClick={() => jumpToBookmark(bookmark.timestamp)}
                        className="p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
                      >
                        <div className="text-sm font-medium">{bookmark.title}</div>
                        <div className="text-xs text-white/60">{formatTime(bookmark.timestamp)}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Notes */}
                <motion.div
                  variants={itemVariants}
                  className="p-6 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05]"
                >
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    Notes
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <select
                        value={noteType}
                        onChange={(e) => setNoteType(e.target.value as "note" | "question" | "insight")}
                        className="w-full p-2 bg-white/10 rounded-lg border border-white/10 text-white text-sm mb-2"
                      >
                        <option value="note">💡 Note</option>
                        <option value="question">❓ Question</option>
                        <option value="insight">🎯 Insight</option>
                      </select>
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note at current timestamp..."
                        className="w-full p-3 bg-white/10 rounded-lg border border-white/10 text-white placeholder-white/40 text-sm resize-none"
                        rows={3}
                      />
                      <button
                        onClick={addNote}
                        disabled={!newNote.trim()}
                        className="w-full mt-2 p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all disabled:opacity-50"
                      >
                        Add Note
                      </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {notes.map((note) => (
                        <div key={note.id} className="p-3 bg-white/5 rounded-xl">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs">
                              {note.type === "note" && "💡"}
                              {note.type === "question" && "❓"}
                              {note.type === "insight" && "🎯"}
                            </span>
                            <span className="text-xs text-white/60">{formatTime(note.timestamp)}</span>
                          </div>
                          <div className="text-sm">{note.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Transcript Search */}
                <motion.div
                  variants={itemVariants}
                  className="p-6 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05]"
                >
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-green-400" />
                    Transcript Search
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search in transcript..."
                      className="w-full p-3 bg-white/10 rounded-lg border border-white/10 text-white placeholder-white/40 text-sm"
                    />
                    <div className="max-h-48 overflow-y-auto">
                      <p className="text-sm text-white/70 leading-relaxed">
                        {searchQuery ? (
                          filteredTranscript ? (
                            transcript.split(new RegExp(`(${searchQuery})`, "gi")).map((part, index) =>
                              part.toLowerCase() === searchQuery.toLowerCase() ? (
                                <mark key={index} className="bg-yellow-400/30 text-yellow-200 rounded px-1">
                                  {part}
                                </mark>
                              ) : (
                                part
                              ),
                            )
                          ) : (
                            <span className="text-white/40">No matches found</span>
                          )
                        ) : (
                          transcript?.slice(0, 200) + (transcript && transcript.length > 200 ? "..." : "") ||
                          "No transcript available. Load a video to see its transcript."
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Current Active Module Modal */}
      <AnimatePresence>
        {currentActiveModule && activeModal.type === "none" && (
          <motion.div
            key="currentActiveModule"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/[0.05] p-8 max-w-2xl w-full"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center"
                >
                  <Lightbulb className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-light text-white mb-4">Learning Module Activated!</h2>
                <p className="text-lg text-white/60 mb-2">Paused at {formatTime(currentActiveModule.timestamp)}</p>
                <h3 className="text-2xl font-medium text-white mb-4">{currentActiveModule.title}</h3>
                <p className="text-white/70 mb-8">{currentActiveModule.description}</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleContinueLearning}
                    className="px-8 py-3 bg-green-500/20 border border-green-500/30 rounded-2xl hover:bg-green-500/30 transition-all"
                  >
                    Continue Video
                  </button>
                  <button
                    onClick={handleTestModule}
                    className="px-8 py-3 bg-orange-500/20 border border-orange-500/30 rounded-2xl hover:bg-orange-500/30 transition-all"
                  >
                    Test Module
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Interactive Test Selection Modal */}
      <AnimatePresence>
        {activeModal.type === "testSelection" && (
          <motion.div
            key="testSelection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 p-8 max-w-2xl w-full z-[101] relative overflow-hidden"
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <motion.div
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="w-full h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500"
                  style={{
                    backgroundSize: "400% 400%",
                  }}
                />
              </div>

              {/* Floating Particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/20 rounded-full"
                  animate={{
                    x: [0, 100, 0],
                    y: [0, -100, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.5,
                  }}
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + i * 10}%`,
                  }}
                />
              ))}

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="text-center mb-8"
                >
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 rounded-full flex items-center justify-center relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="absolute inset-2 border-2 border-white/30 rounded-full border-dashed"
                    />
                    <Lightbulb className="w-10 h-10 text-white relative z-10" />
                  </div>
                  <h3 className="text-3xl font-light text-white mb-2">Choose Your Challenge</h3>
                  <p className="text-white/60">
                    {currentActiveModule?.title && `Test your knowledge of: ${currentActiveModule.title}`}
                  </p>
                </motion.div>

                <div className="grid gap-4">
                  {[
                    {
                      type: "quiz",
                      label: "Interactive Quiz",
                      description: "Test your understanding with smart questions",
                      color: "from-purple-500 to-pink-500",
                      icon: Brain,
                      delay: 0.1,
                    },
                    {
                      type: "competitive",
                      label: "Coding Arena",
                      description: "Solve programming challenges and compete",
                      color: "from-red-500 to-orange-500",
                      icon: Target,
                      delay: 0.2,
                    },
                    {
                      type: "bugHunter",
                      label: "Bug Hunter",
                      description: "Find and fix code issues like a pro",
                      color: "from-orange-500 to-yellow-500",
                      icon: Zap,
                      delay: 0.3,
                    },
                  ].map(({ type, label, description, color, icon: Icon, delay }) => (
                    <motion.button
                      key={type}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay, type: "spring", stiffness: 100 }}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setCurrentActiveModule(null)
                        setActiveModal({
                          type:
                            type === "quiz" ? "quizArena" : type === "competitive" ? "competitiveArena" : "bugHunter",
                        })
                        handleContinueLearning()
                      }}
                      className={`group relative p-6 bg-gradient-to-r ${color} rounded-2xl transition-all duration-300 overflow-hidden`}
                    >
                      {/* Button Background Animation */}
                      <motion.div
                        className="absolute inset-0 bg-white/10"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />

                      <div className="relative z-10 flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h4 className="text-xl font-semibold text-white mb-1">{label}</h4>
                          <p className="text-white/80 text-sm">{description}</p>
                        </div>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          className="text-white/60"
                        >
                          →
                        </motion.div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => setActiveModal({ type: "none" })}
                  className="w-full mt-8 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-white/60 hover:text-white"
                >
                  Maybe Later
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Arena Modal */}
      <AnimatePresence>
        {activeModal.type === "quizArena" && (
          <motion.div
            key="quizArena"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/[0.05] p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative z-[111]"
            >
              <button
                onClick={() => setActiveModal({ type: "none" })}
                className="absolute top-4 right-4 z-[112] p-2 bg-red-500/20 border border-red-500/30 rounded-full hover:bg-red-500/30 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <QuizArena initialVideoId={videoId} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Competitive Arena Modal */}
      <AnimatePresence>
        {activeModal.type === "competitiveArena" && (
          <motion.div
            key="competitiveArena"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/[0.05] p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative z-[111]"
            >
              <button
                onClick={() => setActiveModal({ type: "none" })}
                className="absolute top-4 right-4 z-[112] p-2 bg-red-500/20 border border-red-500/30 rounded-full hover:bg-red-500/30 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <CompetitiveArena initialVideoId={videoId} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bug Hunter Modal */}
      <AnimatePresence>
        {activeModal.type === "bugHunter" && (
          <motion.div
            key="bugHunter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/[0.05] p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative z-[111]"
            >
              <button
                onClick={() => setActiveModal({ type: "none" })}
                className="absolute top-4 right-4 z-[112] p-2 bg-red-500/20 border border-red-500/30 rounded-full hover:bg-red-500/30 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <BugHunter initialVideoId={videoId} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
