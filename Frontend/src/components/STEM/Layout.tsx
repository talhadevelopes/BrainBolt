"use client";

import React, { useState, useRef, useEffect } from "react";
import { YouTubePlayer } from "./YoutubePlayer";
import { motion, AnimatePresence } from "framer-motion";
import { useSteamStore } from "../../stores/stem/steamStore";
import type { ModuleData } from "../../components/Linear/Data/moduleData";
import { useNavigate } from "react-router-dom";

// Simplified Module Component
interface LearningModuleDisplayProps {
  module: ModuleData;
}

const LearningModuleDisplay: React.FC<LearningModuleDisplayProps> = ({
  module,
}) => {
  const IconComponent = module.icon;

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#1a202c",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        color: "#fff",
      }}
    >
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {IconComponent && <IconComponent size={32} />} {module.name} -{" "}
        {module.type}
      </h2>
      <p style={{ color: "#a0aec0", marginBottom: "24px" }}>
        {module.description}
      </p>

      <div
        style={{
          backgroundColor: "#2d3748",
          padding: "16px",
          borderRadius: "8px",
          color: "#cbd5e0",
        }}
      >
        <p>
          This is a placeholder for the interactive content of the "
          {module.type}" module.
        </p>
        <p style={{ marginTop: "8px", fontSize: "14px" }}>
          You can integrate your specific module components here.
        </p>
      </div>
    </div>
  );
};

interface GeneratedModule {
  id: string;
  title: string;
  timestamp: number;
  completed: boolean;
}

export function SteamLayout() {
  const navigate = useNavigate();

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
  const [generatedModules, setGeneratedModules] = useState<GeneratedModule[]>(
    []
  );
  const [loadingModules, setLoadingModules] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<GeneratedModule | null>(
    null
  );
  const [showModulePopup, setShowModulePopup] = useState(false);

  const moduleTriggeredRef = useRef<string | null>(null);

  useEffect(() => {
    setInputVideoId(videoId);
  }, [videoId]);

  const handlePlayerReady = (event: any) => {
    setPlayerInstance(event.target);
    const playerDuration = event.target.getDuration();
    console.log("Player duration:", playerDuration);
    setDuration(
      playerDuration > 0 && !isNaN(playerDuration) ? playerDuration : 2068
    ); // Fallback to 34:28
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
    setCurrentActiveModule(null);
    setShowTestModal(false);
    handleContinueLearning();

    let path = "";
    switch (type) {
      case "quiz":
        path = "/quiz";
        break;
      case "competitive":
        path = "/competitive";
        break;
      case "bugHunter":
        path = "/bughunter";
        break;
    }
    window.location.href = `${path}?videoId=${videoId}&timestamp=${
      currentActiveModule?.timestamp || 0
    }`;
  };

  const generateModules = async () => {
    setLoadingModules(true);
    try {
      let newModules: GeneratedModule[] = [];
      // Use fallback duration if invalid
      const validDuration = duration > 0 && !isNaN(duration) ? duration : 2068; // 34:28 fallback
      console.log(
        "Generating modules with duration:",
        validDuration,
        "Transcript length:",
        transcript.length
      );

      if (transcript && transcript.length > 50) {
        // Split transcript into sentences
        const sentences = transcript
          .split(/[.!?]+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        // Aim for 5-8 modules
        const numModules = Math.min(
          8,
          Math.max(5, Math.ceil(sentences.length / 8))
        );
        const sentencesPerModule = Math.ceil(sentences.length / numModules);

        const usedTitles = new Set<string>(); // Track unique titles

        for (let i = 0; i < numModules; i++) {
          const startIdx = i * sentencesPerModule;
          const endIdx = Math.min(
            startIdx + sentencesPerModule,
            sentences.length
          );
          const chunk = sentences.slice(startIdx, endIdx).join(" ");
          console.log(
            `Chunk ${i + 1}:`,
            chunk.substring(0, 100) + (chunk.length > 100 ? "..." : "")
          );

          // Generate title
          let title = "";
          const chunkSentences = chunk
            .split(/[.!?]+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

          // Try concept-based title
          const lowerChunk = chunk.toLowerCase();
          const concepts = [
            {
              name: "Kinematics",
              keywords: ["kinematics", "motion", "velocity"],
            },
            { name: "Newton's Laws", keywords: ["newton", "force", "law"] },
            { name: "Arrays", keywords: ["array", "list"] },
            { name: "Loops", keywords: ["loop", "for", "while"] },
            { name: "Sorting", keywords: ["sort", "order"] },
          ];
          let conceptMatch = false;
          for (const concept of concepts) {
            if (concept.keywords.some((kw) => lowerChunk.includes(kw))) {
              const candidateTitle = `Exploring ${concept.name}`;
              if (!usedTitles.has(candidateTitle)) {
                title = candidateTitle;
                conceptMatch = true;
                break;
              }
            }
          }

          // If no concept or title is duplicate, use a unique sentence
          if (!title && chunkSentences.length > 0) {
            let sentenceIndex = 0;
            let candidateSentence = chunkSentences[sentenceIndex];
            while (
              (usedTitles.has(candidateSentence) ||
                !candidateSentence ||
                candidateSentence.length < 10) &&
              sentenceIndex < chunkSentences.length
            ) {
              sentenceIndex++;
              candidateSentence = chunkSentences[sentenceIndex];
            }
            title = candidateSentence
              ? candidateSentence.length > 50
                ? candidateSentence.slice(0, 50) + "..."
                : candidateSentence
              : `Module ${i + 1}`;
          }

          // If still no title, generate a fallback
          if (!title) {
            title = `Module ${i + 1}`;
          }

          // Ensure title is unique
          let finalTitle = title;
          let suffix = 1;
          while (usedTitles.has(finalTitle)) {
            finalTitle = `${title} (${suffix})`;
            suffix++;
          }
          usedTitles.add(finalTitle);

          newModules.push({
            id: `${i + 1}`,
            title: finalTitle,
            timestamp: Math.floor((i + 1) * (validDuration / (numModules + 1))),
            completed: false,
          });
        }
      } else {
        // Fallback for short or empty transcript
        console.log("Using fallback modules due to short transcript");
        newModules = [
          {
            id: "1",
            title: "Introduction",
            timestamp: Math.floor(validDuration / 6),
            completed: false,
          },
          {
            id: "2",
            title: "Main Concepts",
            timestamp: Math.floor(validDuration / 3),
            completed: false,
          },
          {
            id: "3",
            title: "Applications",
            timestamp: Math.floor(validDuration / 2),
            completed: false,
          },
          {
            id: "4",
            title: "Advanced Topics",
            timestamp: Math.floor((2 * validDuration) / 3),
            completed: false,
          },
          {
            id: "5",
            title: "Conclusion",
            timestamp: Math.floor((5 * validDuration) / 6),
            completed: false,
          },
        ];
      }

      console.log("Generated modules:", newModules);
      setGeneratedModules(newModules);
    } catch (error) {
      console.error("Error generating modules:", error);
      // Ultimate fallback
      const validDuration = duration > 0 && !isNaN(duration) ? duration : 2068;
      const newModules: GeneratedModule[] = [
        {
          id: "1",
          title: "Introduction",
          timestamp: Math.floor(validDuration / 6),
          completed: false,
        },
        {
          id: "2",
          title: "Main Concepts",
          timestamp: Math.floor(validDuration / 3),
          completed: false,
        },
        {
          id: "3",
          title: "Applications",
          timestamp: Math.floor(validDuration / 2),
          completed: false,
        },
        {
          id: "4",
          title: "Advanced Topics",
          timestamp: Math.floor((2 * validDuration) / 3),
          completed: false,
        },
        {
          id: "5",
          title: "Conclusion",
          timestamp: Math.floor((5 * validDuration) / 6),
          completed: false,
        },
      ];
      console.log("Fallback modules:", newModules);
      setGeneratedModules(newModules);
    } finally {
      setLoadingModules(false);
    }
  };

  const handleTestModule = () => {
    setShowTestModal(true);
  };

  const handleModuleClick = (module: GeneratedModule) => {
    setSelectedModule(module);
    setShowModulePopup(true);
  };

  const handleSeekToTimestamp = (timestamp: number) => {
    if (playerInstance) {
      playerInstance.seekTo(timestamp);
      playerInstance.playVideo();
      setIsPlaying(true);
      setShowModulePopup(false);
    }
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
                          viewBox="0 0 24 24"
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
            <AnimatePresence>
              {currentActiveModule && !showTestModal && (
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
                      {currentActiveModule.name}
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
              {showTestModal && (
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
                      Select Test Type for {currentActiveModule?.name}
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
                <LearningModuleDisplay module={currentActiveModule} />
              </motion.div>
            )}
            <div className="flex w-full justify-between p-3">
              <div>
                <h1>
                  <button
                    className="bg-blue-600 px-6 py-2 rounded"
                    onClick={() => navigate("/steam")}
                  >
                    Take Quiz
                  </button>
                </h1>
              </div>
              <div>
                <h1>
                  <button
                    className="bg-blue-600 px-6 py-2 rounded"
                    onClick={() => navigate("/steam")}
                  >
                    Coding Challenge
                  </button>
                </h1>
              </div>
              <div>
                <h1>
                  <button
                    className="bg-blue-600 px-6 py-2 rounded"
                    onClick={() => navigate("/cp")}
                  >
                    Bug Hunt
                  </button>
                </h1>
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
                    {generatedModules.filter((m) => m.completed).length}
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
