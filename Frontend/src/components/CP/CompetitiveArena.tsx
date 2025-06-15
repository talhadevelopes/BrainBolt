"use client";

import type React from "react";

import { useEffect } from "react";
import { Trophy, Sword, Youtube, Loader2, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { SolutionSubmission } from "./SolutionSubmission";
import { useCompetitiveArenaStore } from "../../stores/competitiveArenaStore";

interface CompetitiveArenaProps {
  initialVideoId?: string; // New prop for pre-filling videoId
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

  // Initialize with default problem and videoId on mount
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
    <section className="relative py-12 overflow-hidden bg-slate-900">
      <div className="container mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 flex items-center justify-center gap-4">
            <Trophy className="h-12 w-12 text-yellow-400" />
            <span>
              Competitive
              <span className="bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
                {" "}
                Arena
              </span>
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Test your skills against challenging problems generated from YouTube
            videos
          </p>
        </motion.div>

        {/* Video Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 p-6 bg-white/10 rounded-2xl backdrop-blur-lg border border-white/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <Youtube className="h-6 w-6 text-red-400" />
            <h3 className="text-xl font-semibold text-white">
              Generate Problems from YouTube Video
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                YouTube Video ID
              </label>
              <input
                type="text"
                value={videoId}
                onChange={handleVideoIdChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter YouTube video ID (e.g., dQw4w9WgXcQ)"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                Extract the 11-character ID from the YouTube URL
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={handleDifficultyChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-3 transition-all duration-300 ${
                loading || !videoId.trim()
                  ? "bg-slate-700/50 cursor-not-allowed text-gray-400"
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
            className="mb-6 p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg"
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
              className="p-6 bg-red-900/20 border border-red-800/30 rounded-2xl"
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
              className="animate-pulse space-y-4 p-8 bg-white/10 rounded-2xl"
            >
              <div className="h-8 bg-slate-700 rounded w-3/4"></div>
              <div className="h-4 bg-slate-700 rounded w-full"></div>
              <div className="h-4 bg-slate-700 rounded w-5/6"></div>
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
              <h3 className="text-xl font-semibold text-white mb-4">
                Generated Problems ({problems.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {problems.map((problem, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentProblem(problem)}
                    className={`p-4 rounded-lg border transition-all duration-300 text-left ${
                      currentProblem?.title === problem.title
                        ? "bg-purple-900/30 border-purple-500 shadow-lg"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <h4 className="font-semibold text-white mb-2">
                      {problem.title}
                    </h4>
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {problem.description}
                    </p>
                    <div className="mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          problem.difficulty === "Easy"
                            ? "bg-green-900/30 text-green-400"
                            : problem.difficulty === "Medium"
                            ? "bg-yellow-900/30 text-yellow-400"
                            : "bg-red-900/30 text-red-400"
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
    </section>
  );
};
