"use client";

import type React from "react";

import { useEffect } from "react";
import { Trophy, Youtube, Loader2, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { SolutionSubmission } from "./SolutionSubmission";
import { useCompetitiveArenaStore } from "../../stores/competitiveArenaStore";

interface CompetitiveArenaProps {
  initialVideoId?: string;
}

export const CompetitiveArena: React.FC<CompetitiveArenaProps> = ({
  initialVideoId,
}) => {
  const {
    problems,
    currentProblem,
    loading,
    error,
    videoId,
    difficulty,
    transcript,
    setVideoId,
    setDifficulty,
    setCurrentProblem,
    fetchProblems,
    reset,
  } = useCompetitiveArenaStore();

  useEffect(() => {
    reset();
    if (initialVideoId && initialVideoId.trim()) {
      setVideoId(initialVideoId);
    }
  }, [reset, setVideoId, initialVideoId]);

  const handleVideoIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setVideoId(value);
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(e.target.value as "easy" | "medium" | "hard");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchProblems();
    }
  };

  const handleFetchProblems = () => {
    fetchProblems();
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <motion.div
        animate={{
          opacity: [0.04, 0.06, 0.04],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
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
            <linearGradient id="hex-gradient-comp" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#A855F7', stopOpacity: 0.3 }} />
              <stop offset="50%" style={{ stopColor: '#EC4899', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.3 }} />
            </linearGradient>
            <pattern
              id="hexagons-comp"
              x="0"
              y="0"
              width="20"
              height="17.32"
              patternUnits="userSpaceOnUse"
            >
              <polygon
                points="10,1 18.66,6 18.66,16 10,21 1.34,16 1.34,6"
                fill="none"
                stroke="url(#hex-gradient-comp)"
                strokeWidth="0.6"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons-comp)" />
        </svg>
      </motion.div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6 flex items-center justify-center gap-4">
            <Trophy className="h-12 w-12 text-yellow-400" />
            <span>
              Competitive
              <span className="bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text font-medium">
                {" "}
                Arena
              </span>
            </span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto font-light">
            Test your skills against challenging problems generated from YouTube
            videos
          </p>
        </motion.div>

        {/* Video Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 p-6 bg-white/[0.02] rounded-3xl backdrop-blur-sm border border-white/[0.05]"
        >
          <div className="flex items-center gap-3 mb-4">
            <Youtube className="h-6 w-6 text-red-400" />
            <h3 className="text-xl font-medium text-white">
              Generate Problems from YouTube Video
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/60 mb-2">
                YouTube Video ID
              </label>
              <input
                type="text"
                value={videoId}
                onChange={handleVideoIdChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter YouTube video ID (e.g., dQw4w9WgXcQ)"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-all"
              />
              <p className="text-xs text-white/40 mt-1">
                Extract the 11-character ID from the YouTube URL
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={handleDifficultyChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-white/20 transition-all"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <motion.button
              onClick={handleFetchProblems}
              disabled={loading || !videoId.trim()}
              className={`px-8 py-3 rounded-2xl font-medium flex items-center gap-3 transition-all duration-300 ${
                loading || !videoId.trim()
                  ? "bg-white/10 cursor-not-allowed text-white/40"
                  : "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl"
              }`}
              whileHover={!loading && videoId.trim() ? { scale: 1.02 } : {}}
              whileTap={!loading && videoId.trim() ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating Problems...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  Generate Problems
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Transcript Preview */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl"
          >
            <h3 className="text-blue-300 font-medium mb-2">
              📝 Transcript Preview
            </h3>
            <p className="text-blue-200 text-sm">
              {transcript.substring(0, 200)}...
            </p>
            <p className="text-blue-400 text-xs mt-2">
              Length: {transcript.length} characters
            </p>
          </motion.div>
        )}

        {/* Problems Display */}
        <div className="grid gap-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-red-400 font-medium">Error</span>
              </div>
              <p className="text-red-300 mt-2">{error}</p>
            </motion.div>
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="animate-pulse space-y-4 p-8 bg-white/[0.02] rounded-3xl"
            >
              <div className="h-8 bg-white/10 rounded w-3/4"></div>
              <div className="h-4 bg-white/10 rounded w-full"></div>
              <div className="h-4 bg-white/10 rounded w-5/6"></div>
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              </div>
            </motion.div>
          )}

          {/* Problems List */}
          {problems.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h3 className="text-xl font-medium text-white mb-4">
                Generated Problems ({problems.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {problems.map((problem, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentProblem(problem)}
                    className={`p-4 rounded-2xl border transition-all duration-300 text-left ${
                      currentProblem?.title === problem.title
                        ? "bg-purple-500/20 border-purple-500/30 shadow-lg"
                        : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <h4 className="font-medium text-white mb-2">
                      {problem.title}
                    </h4>
                    <p className="text-sm text-white/70 line-clamp-2">
                      {problem.description}
                    </p>
                    <div className="mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          problem.difficulty === "Easy"
                            ? "bg-green-500/20 text-green-400"
                            : problem.difficulty === "Medium"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Current Problem Display */}
          {currentProblem && (
            <motion.div
              key={currentProblem.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SolutionSubmission
                testCases={currentProblem.testCases || []}
                problemData={{
                  title: currentProblem.title,
                  description: currentProblem.description,
                  inputDescription: "Input as specified in the problem",
                  outputDescription: "Expected output format",
                  constraints: ["Follow the problem constraints"],
                  tips: [
                    "Consider edge cases",
                    "Think about time complexity",
                    "Based on video content",
                  ],
                  difficulty:
                    (currentProblem.difficulty?.toLowerCase() as
                      | "medium"
                      | "easy"
                      | "hard") || "medium",
                  functionName: "solution",
                  problemType: "generic",
                }}
                initialCode={
                  currentProblem.starterCode?.javascript ||
                  "function solution() {\n  // Your code here\n}"
                }
                language="javascript"
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};