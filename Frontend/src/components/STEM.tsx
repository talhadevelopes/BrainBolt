"use client";

import { useState, useRef, useEffect } from "react";
import { YouTubePlayer } from "../components/STEM/YoutubePlayer";
import { motion, AnimatePresence } from "framer-motion";
import { useSteamStore } from "../stores/STEMstore";
import ModuleStem from "../components/STEM/ModuleSTEM";
import { QuizArena } from "../components/CP/QuizArena"; // Adjust path as needed
// import { ModuleData } from "./Linear/Data/moduleData";
import { CompetitiveArena } from "./CP/CompetitiveArena";
import { BugHunter } from "./CP/BugHunterArena";

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
  } = useSteamStore();

  const [inputVideoId, setInputVideoId] = useState("");
  const [playerInstance, setPlayerInstance] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showQuizArena, setShowQuizArena] = useState(false);
  const [showCompetitiveArena, setShowCompetitiveArena] = useState(false);
  const [showBugHunter, setShowBugHunter] = useState(false); // New state for BugHunter
  const moduleTriggeredRef = useRef<string | null>(null);

  useEffect(() => {
    setInputVideoId(videoId);
  }, [videoId]);

  useEffect(() => {
    console.log("STEM modules:", modules);
  }, [modules]);

  useEffect(() => {
    console.log("showBugHunter:", showBugHunter); // Debug modal state
  }, [showBugHunter]);

  const handlePlayerReady = (event: any) => {
    setPlayerInstance(event.target);
    const playerDuration = event.target.getDuration();
    console.log("Player duration:", playerDuration);
    setDuration(
      playerDuration > 0 && !isNaN(playerDuration) ? playerDuration : 2068
    );
    event.target.playVideo();
    setIsPlaying(true);
  };

  const handlePlayerStateChange = (event: any) => {
    if (event.data === 1) {
      setIsPlaying(true);
    } else if (event.data === 2 || event.data === 0) {
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
    checkModuleTriggers(time);
  };

  const checkModuleTriggers = (time: number) => {
    if (currentActiveModule || !isPlaying) return;
    const nextModule = modules.find(
      (module) =>
        time >= module.timestamp &&
        time < module.timestamp + 5 &&
        moduleTriggeredRef.current !== module.id
    );
    if (nextModule) {
      console.log("Triggering module:", nextModule);
      setCurrentActiveModule(nextModule);
      moduleTriggeredRef.current = nextModule.id;
      if (playerInstance) {
        playerInstance.pauseVideo();
        setIsPlaying(false);
      }
    }
  };

  const handleLoadVideo = async () => {
    if (inputVideoId) {
      console.log("Loading video with ID:", inputVideoId);
      setVideoId(inputVideoId);
      try {
        await fetchModulesAndTranscript();
        console.log("Successfully loaded transcript and modules");
      } catch (error) {
        console.error("Failed to load video data:", error);
      }
      setCurrentActiveModule(null);
      moduleTriggeredRef.current = null;
    }
  };

  const handlePlayPause = () => {
    if (playerInstance) {
      if (isPlaying) {
        playerInstance.pauseVideo();
      } else {
        playerInstance.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    if (playerInstance) {
      playerInstance.seekTo(0);
      playerInstance.pauseVideo();
      setCurrentTime(0);
      setIsPlaying(false);
      setCurrentActiveModule(null);
      moduleTriggeredRef.current = null;
    }
  };

  const handleContinueLearning = () => {
    setCurrentActiveModule(null);
    setShowTestModal(false);
    if (playerInstance) {
      playerInstance.playVideo();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const toggleMute = () => {
    if (playerInstance) {
      if (isMuted) {
        playerInstance.unMute();
      } else {
        playerInstance.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const handleSelectTestType = (type: "quiz" | "competitive" | "bugHunter") => {
    console.log("Selected test type:", type); // Debug test type
    setCurrentActiveModule(null);
    setShowTestModal(false);
    handleContinueLearning();
    if (type === "quiz") {
      setShowQuizArena(true);
    } else if (type === "competitive") {
      setShowCompetitiveArena(true);
    } else if (type === "bugHunter") {
      setShowBugHunter(true); // Show BugHunter popup
    }
  };

  const handleModuleClick = (module: {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: number;
    topic: string;
    icon?: any;
  }) => {
    if (playerInstance) {
      console.log("Seeking to module timestamp:", module.timestamp);
      playerInstance.seekTo(module.timestamp);
      playerInstance.playVideo();
      setIsPlaying(true);
    }
  };

  const handleTestModule = () => {
    setShowTestModal(true);
  };

  const handleCloseQuizArena = () => {
    setShowQuizArena(false);
  };

  const handleCloseCompetitiveArena = () => {
    console.log("Closing CompetitiveArena"); // Debug close
    setShowCompetitiveArena(false);
  };

  const handleCloseBugHunter = () => {
    console.log("Closing BugHunter"); // Debug close
    setShowBugHunter(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#fff",
        padding: "32px",
      }}
    >
      <h1
        style={{
          fontSize: "36px",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "32px",
          color: "#60a5fa",
        }}
      >
        EduStream Player
      </h1>
      <p
        style={{ textAlign: "center", color: "#cbd5e0", marginBottom: "32px" }}
      >
        Interactive learning platform with educational modules that appear at
        specific video timestamps. Each module provides hands-on learning
        experiences across different subjects.
      </p>

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          backgroundColor: "#1e293b",
          borderRadius: "12px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <input
            type="text"
            placeholder="Enter YouTube Video ID (e.g., dQw4w9WgXcQ)"
            value={inputVideoId}
            onChange={(e) => setInputVideoId(e.target.value)}
            style={{
              flexGrow: 1,
              backgroundColor: "#334155",
              border: "1px solid #475569",
              borderRadius: "8px",
              padding: "12px",
              color: "#fff",
              outline: "none",
            }}
          />
          <button
            onClick={handleLoadVideo}
            disabled={loading}
            style={{
              backgroundColor: "#3b82f6",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              border: "none",
              transition: "background-color 0.2s",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Loading..." : "Load Video"}
          </button>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#ef4444",
              color: "#fff",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "24px",
            }}
          >
            {error}
          </div>
        )}

        {videoId && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "24px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  aspectRatio: "16 / 9",
                  backgroundColor: "#000",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <YouTubePlayer
                  videoId={videoId}
                  onReady={handlePlayerReady}
                  onStateChange={handlePlayerStateChange}
                  onTimeUpdate={handleTimeUpdate}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "16px",
                    left: "16px",
                    right: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    padding: "8px",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={handlePlayPause}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#fff",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                    >
                      {isPlaying ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={handleReset}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#fff",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
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
                      style={{
                        background: "none",
                        border: "none",
                        color: "#fff",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                    >
                      {isMuted ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <line x1="22" y1="9" x2="16" y2="15" />
                          <line x1="16" y1="9" x2="22" y2="15" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 23"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                        </svg>
                      )}
                    </button>
                    <span style={{ fontSize: "14px", fontFamily: "monospace" }}>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#1a202c",
                  border: "1px solid #2d3748",
                  borderRadius: "8px",
                  color: "#fff",
                  padding: "16px",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#90cdf4",
                    marginBottom: "16px",
                  }}
                >
                  Video Transcript / Summary
                </h2>
                <div
                  style={{
                    height: "390px",
                    overflowY: "auto",
                    paddingRight: "8px",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#4a5568 #2d3748",
                  }}
                >
                  <p style={{ color: "#cbd5e0", lineHeight: "1.6" }}>
                    {transcript ||
                      "No transcript available. Load a video to see its transcript."}
                  </p>
                </div>
              </div>
            </div>

            {videoId && (
              <ModuleStem
                onModuleClick={handleModuleClick}
                onTestModule={handleTestModule}
              />
            )}

            <AnimatePresence>
              {currentActiveModule &&
                !showTestModal &&
                !showQuizArena &&
                !showCompetitiveArena &&
                !showBugHunter && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    style={{
                      position: "fixed",
                      inset: 0,
                      backgroundColor: "rgba(0,0,0,0.8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 50,
                      padding: "16px",
                    }}
                  >
                    <div
                      style={{
                        background:
                          "linear-gradient(to bottom right, #1e3a8a, #4c1d95)",
                        border: "1px solid #2563eb",
                        color: "#fff",
                        maxWidth: "600px",
                        width: "100%",
                        padding: "32px",
                        textAlign: "center",
                        borderRadius: "12px",
                        boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: "36px",
                          fontWeight: "800",
                          color: "#fcd34d",
                          marginBottom: "16px",
                        }}
                      >
                        Learning Module Activated!
                      </h2>
                      <p style={{ fontSize: "20px", marginBottom: "16px" }}>
                        Paused at {formatTime(currentActiveModule.timestamp)}
                      </p>
                      <h3
                        style={{
                          fontSize: "28px",
                          fontWeight: "bold",
                          marginBottom: "16px",
                        }}
                      >
                        {currentActiveModule.title}
                      </h3>
                      <p
                        style={{
                          fontSize: "18px",
                          color: "#e2e8f0",
                          marginBottom: "32px",
                        }}
                      >
                        {currentActiveModule.description}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "16px",
                        }}
                      >
                        <button
                          onClick={handleContinueLearning}
                          style={{
                            backgroundColor: "#10b981",
                            color: "#fff",
                            fontSize: "18px",
                            padding: "12px 32px",
                            borderRadius: "9999px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            border: "none",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                            transition: "background-color 0.2s",
                          }}
                        >
                          Continue Video
                        </button>
                        <button
                          onClick={handleTestModule}
                          style={{
                            backgroundColor: "#f97316",
                            color: "#fff",
                            fontSize: "18px",
                            padding: "12px 32px",
                            borderRadius: "9999px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            border: "none",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                            transition: "background-color 0.2s",
                          }}
                        >
                          Test Module
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
              {showTestModal &&
                !showQuizArena &&
                !showCompetitiveArena &&
                !showBugHunter && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: "fixed",
                      inset: 0,
                      backgroundColor: "rgba(0,0,0,0.7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 60,
                      padding: "16px",
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      style={{
                        backgroundColor: "#1e293b",
                        color: "#fff",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                        padding: "24px",
                        maxWidth: "500px",
                        width: "100%",
                        boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#60a5fa",
                          marginBottom: "24px",
                        }}
                      >
                        Select Test Type for {currentActiveModule?.title}
                      </h3>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr",
                          gap: "16px",
                        }}
                      >
                        <button
                          onClick={() => handleSelectTestType("quiz")}
                          style={{
                            backgroundColor: "#9333ea",
                            color: "#fff",
                            padding: "16px",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            border: "none",
                            transition: "background-color 0.2s",
                          }}
                        >
                          Quiz
                        </button>
                        <button
                          onClick={() => handleSelectTestType("competitive")}
                          style={{
                            backgroundColor: "#ef4444",
                            color: "#fff",
                            padding: "16px",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            border: "none",
                            transition: "background-color 0.2s",
                          }}
                        >
                          Competitive Arena
                        </button>
                        <button
                          onClick={() => handleSelectTestType("bugHunter")}
                          style={{
                            backgroundColor: "#f59e0b",
                            color: "#fff",
                            padding: "16px",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            border: "none",
                            transition: "background-color 0.2s",
                          }}
                        >
                          Bug Hunter
                        </button>
                      </div>
                      <button
                        onClick={() => setShowTestModal(false)}
                        style={{
                          marginTop: "24px",
                          backgroundColor: "#475569",
                          color: "#fff",
                          padding: "10px 20px",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          border: "none",
                          transition: "background-color 0.2s",
                        }}
                      >
                        Close
                      </button>
                    </motion.div>
                  </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
              {showQuizArena && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 70,
                    padding: "16px",
                    overflowY: "auto",
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    style={{
                      backgroundColor: "#1e293b",
                      color: "#fff",
                      border: "1px solid #475569",
                      borderRadius: "12px",
                      padding: "24px",
                      maxWidth: "1000px",
                      width: "90%",
                      maxHeight: "90vh",
                      overflowY: "auto",
                      boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                      position: "relative",
                    }}
                  >
                    <button
                      onClick={handleCloseQuizArena}
                      style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        backgroundColor: "#ef4444",
                        color: "#fff",
                        padding: "8px",
                        borderRadius: "50%",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                    <QuizArena initialVideoId={videoId} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showCompetitiveArena && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 70,
                    padding: "16px",
                    overflowY: "auto",
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    style={{
                      backgroundColor: "#1e293b",
                      color: "#fff",
                      border: "1px solid #475569",
                      borderRadius: "12px",
                      padding: "24px",
                      maxWidth: "1000px",
                      width: "90%",
                      maxHeight: "90vh",
                      overflowY: "auto",
                      boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                      position: "relative",
                    }}
                  >
                    <button
                      onClick={handleCloseCompetitiveArena}
                      style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        backgroundColor: "#ef4444",
                        color: "#fff",
                        padding: "8px",
                        borderRadius: "50%",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                    <div>
                      <CompetitiveArena initialVideoId={videoId} />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showBugHunter && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 70,
                    padding: "16px",
                    overflowY: "auto",
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    style={{
                      backgroundColor: "#1e293b",
                      color: "#fff",
                      border: "1px solid #475569",
                      borderRadius: "12px",
                      padding: "24px",
                      maxWidth: "1000px",
                      width: "90%",
                      maxHeight: "90vh",
                      overflowY: "auto",
                      boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                      position: "relative",
                    }}
                  >
                    <button
                      onClick={handleCloseBugHunter}
                      style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        backgroundColor: "#ef4444",
                        color: "#fff",
                        padding: "8px",
                        borderRadius: "50%",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                    <div>
                      <BugHunter initialVideoId={videoId} />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {currentActiveModule && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: "48px" }}
              >
                <h2
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    marginBottom: "24px",
                    color: "#60a5fa",
                  }}
                >
                  Active Learning Module
                </h2>
              </motion.div>
            )}

            <div className="flex w-full justify-between p-3">
              <div>
                <button
                  className="bg-blue-600 px-6 py-2 rounded"
                  onClick={() => setShowQuizArena(true)}
                >
                  Take Quiz
                </button>
              </div>
              <div>
                <button
                  className="bg-blue-600 px-6 py-2 rounded"
                  onClick={() => {
                    console.log("Opening CompetitiveArena"); // Debug button click
                    setShowCompetitiveArena(true);
                  }}
                >
                  Coding Challenge
                </button>
              </div>
              <div>
                <button
                  className="bg-blue-600 px-6 py-2 rounded"
                  onClick={() => {
                    console.log("Opening BugHunter"); // Debug button click
                    setShowBugHunter(true); // Open BugHunter popup
                  }}
                >
                  Bug Hunt
                </button>
              </div>
            </div>

            <div style={{ marginTop: "48px" }}>
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  marginBottom: "24px",
                  color: "#60a5fa",
                }}
              >
                Session Stats
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "24px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#1a202c",
                    border: "1px solid #2d3748",
                    borderRadius: "8px",
                    color: "#fff",
                    padding: "16px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "48px",
                      fontWeight: "bold",
                      color: "#34d399",
                    }}
                  >
                    {modules.length}
                  </div>
                  <p style={{ color: "#cbd5e0" }}>Modules Assigned</p>
                </div>
                <div
                  style={{
                    backgroundColor: "#1a202c",
                    border: "1px solid #2d3748",
                    borderRadius: "8px",
                    color: "#fff",
                    padding: "16px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "48px",
                      fontWeight: "bold",
                      color: "#a78bfa",
                    }}
                  >
                    {new Set(modules.map((m) => m.type)).size}
                  </div>
                  <p style={{ color: "#cbd5e0" }}>Module Types</p>
                </div>
                <div
                  style={{
                    backgroundColor: "#1a202c",
                    border: "1px solid #2d3748",
                    borderRadius: "8px",
                    color: "#fff",
                    padding: "16px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "48px",
                      fontWeight: "bold",
                      color: "#fbbf24",
                    }}
                  >
                    {modules.filter((m) => m.content.completed).length}
                  </div>
                  <p style={{ color: "#cbd5e0" }}>Modules Completed</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
