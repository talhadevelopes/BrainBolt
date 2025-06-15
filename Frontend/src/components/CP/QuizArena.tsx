"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Brain,
  Youtube,
  Loader2,
  Trophy,
  CheckCircle,
  XCircle,
  RotateCcw,
  Play,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuizStore } from "../../stores/quizStore";

interface QuizArenaProps {
  initialVideoId?: string;
}

export const QuizArena: React.FC<QuizArenaProps> = ({ initialVideoId }) => {
  const {
    questions,
    currentTab,
    loading,
    error,
    videoId,
    transcript,
    stats,
    currentQuestionIndex,
    quizStartTime,
    setVideoId,
    setCurrentTab,
    generateQuizzes,
    answerQuestion,
    setCurrentQuestionIndex,
    startQuiz,
    startQuestion,
    resetQuiz,
    reset,
  } = useQuizStore();

  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: number;
  }>({});
  const [showExplanation, setShowExplanation] = useState<{
    [key: string]: boolean;
  }>({});

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      generateQuizzes();
    }
  };

  const handleGenerateQuizzes = () => {
    generateQuizzes();
    if (!quizStartTime) {
      startQuiz();
    }
  };

  const handleAnswerSelect = (
    difficulty: "easy" | "medium" | "hard",
    questionIndex: number,
    answerIndex: number
  ) => {
    const key = `${difficulty}-${questionIndex}`;
    setSelectedAnswers((prev) => ({ ...prev, [key]: answerIndex }));

    startQuestion();
    answerQuestion(difficulty, questionIndex, answerIndex);

    setTimeout(() => {
      setShowExplanation((prev) => ({ ...prev, [key]: true }));
    }, 500);
  };

  const handleNextQuestion = (difficulty: "easy" | "medium" | "hard") => {
    const currentIndex = currentQuestionIndex[difficulty];
    const maxIndex = questions[difficulty].length - 1;

    if (currentIndex < maxIndex) {
      setCurrentQuestionIndex(difficulty, currentIndex + 1);
    }
  };

  const handlePrevQuestion = (difficulty: "easy" | "medium" | "hard") => {
    const currentIndex = currentQuestionIndex[difficulty];

    if (currentIndex > 0) {
      setCurrentQuestionIndex(difficulty, currentIndex - 1);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "hard":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      default:
        return "text-white/60 bg-white/10 border-white/20";
    }
  };

  const getTabCount = (difficulty: "easy" | "medium" | "hard") => {
    const total = questions[difficulty].length;
    const answered = questions[difficulty].filter(
      (q) => q.userAnswer !== undefined
    ).length;
    return `${answered}/${total}`;
  };

  const renderQuestion = (difficulty: "easy" | "medium" | "hard") => {
    const currentIndex = currentQuestionIndex[difficulty];
    const question = questions[difficulty][currentIndex];

    if (!question) {
      return (
        <div className="text-center py-12">
          <Brain className="h-16 w-16 mx-auto text-white/40 mb-4" />
          <p className="text-white/60 text-lg">
            No questions available for {difficulty} difficulty
          </p>
          <p className="text-white/40 text-sm mt-2">
            Generate quizzes from a YouTube video to get started
          </p>
        </div>
      );
    }

    const key = `${difficulty}-${currentIndex}`;
    const selectedAnswer = selectedAnswers[key];
    const showExp = showExplanation[key];
    const isAnswered = question.userAnswer !== undefined;

    return (
      <motion.div
        key={`${difficulty}-${currentIndex}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        {/* Question Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white/60">
              Question {currentIndex + 1} of {questions[difficulty].length}
            </span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(
                difficulty
              )}`}
            >
              {difficulty.toUpperCase()}
            </span>
          </div>

          {question.topic && (
            <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded">
              {question.topic}
            </span>
          )}
        </div>

        {/* Question */}
        <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-3xl">
          <h3 className="text-xl font-medium text-white mb-6">
            {question.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctAnswer;
              const showResult = isAnswered && showExp;

              let optionClass =
                "p-4 border rounded-2xl cursor-pointer transition-all duration-200 ";

              if (showResult) {
                if (isCorrect) {
                  optionClass +=
                    "bg-green-500/20 border-green-500/30 text-green-300";
                } else if (isSelected && !isCorrect) {
                  optionClass += "bg-red-500/20 border-red-500/30 text-red-300";
                } else {
                  optionClass +=
                    "bg-white/5 border-white/10 text-white/60";
                }
              } else if (isSelected) {
                optionClass +=
                  "bg-purple-500/20 border-purple-500/30 text-purple-300";
              } else {
                optionClass +=
                  "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20";
              }

              return (
                <motion.button
                  key={index}
                  onClick={() =>
                    !isAnswered &&
                    handleAnswerSelect(difficulty, currentIndex, index)
                  }
                  disabled={isAnswered}
                  className={optionClass}
                  whileHover={!isAnswered ? { scale: 1.01 } : {}}
                  whileTap={!isAnswered ? { scale: 0.99 } : {}}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {showResult && (
                      <div>
                        {isCorrect && (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        )}
                        {isSelected && !isCorrect && (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {showExp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl"
            >
              <div className="flex items-start gap-3">
                <div className="p-1 bg-blue-500/20 rounded">
                  <Brain className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-blue-300 font-medium mb-1">
                    Explanation
                  </h4>
                  <p className="text-blue-200 text-sm">
                    {question.explanation}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => handlePrevQuestion(difficulty)}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            Previous
          </button>

          <div className="text-sm text-white/60">
            {isAnswered ? (
              <span
                className={
                  question.isCorrect ? "text-green-400" : "text-red-400"
                }
              >
                {question.isCorrect ? "Correct!" : "Incorrect"}
              </span>
            ) : (
              "Select an answer"
            )}
          </div>

          <button
            onClick={() => handleNextQuestion(difficulty)}
            disabled={currentIndex === questions[difficulty].length - 1}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            Next
          </button>
        </div>
      </motion.div>
    );
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
            <linearGradient id="hex-gradient-quiz" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#A855F7', stopOpacity: 0.3 }} />
              <stop offset="50%" style={{ stopColor: '#EC4899', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.3 }} />
            </linearGradient>
            <pattern
              id="hexagons-quiz"
              x="0"
              y="0"
              width="20"
              height="17.32"
              patternUnits="userSpaceOnUse"
            >
              <polygon
                points="10,1 18.66,6 18.66,16 10,21 1.34,16 1.34,6"
                fill="none"
                stroke="url(#hex-gradient-quiz)"
                strokeWidth="0.6"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons-quiz)" />
        </svg>
      </motion.div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6 flex items-center justify-center gap-4">
            <Brain className="h-12 w-12 text-purple-400" />
            <span>
              Quiz
              <span className="bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text font-medium">
                {" "}
                Arena
              </span>
            </span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto font-light">
            Test your knowledge with AI-generated quizzes from YouTube videos
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
              Generate Quizzes from YouTube Video
            </h3>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
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
                This will generate 5 questions each for Easy, Medium, and Hard
                difficulty
              </p>
            </div>

            <div className="flex items-end">
              <motion.button
                onClick={handleGenerateQuizzes}
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
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Generate Quizzes
                  </>
                )}
              </motion.button>
            </div>
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

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-red-400 font-medium">Error</span>
            </div>
            <p className="text-red-300 mt-2">{error}</p>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 animate-pulse space-y-4 p-8 bg-white/[0.02] rounded-3xl"
          >
            <div className="h-8 bg-white/10 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-white/10 rounded w-full"></div>
            <div className="h-4 bg-white/10 rounded w-5/6"></div>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          </motion.div>
        )}

        {/* Stats Dashboard */}
        {stats.totalQuestions > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Quiz Statistics
              </h3>
              <button
                onClick={resetQuiz}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-3 bg-white/5 rounded-xl text-center">
                <div className="text-2xl font-bold text-white">
                  {stats.answeredQuestions}
                </div>
                <div className="text-xs text-white/60">Answered</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl text-center">
                <div className="text-2xl font-bold text-green-400">
                  {stats.correctAnswers}
                </div>
                <div className="text-xs text-white/60">Correct</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {stats.accuracy.toFixed(1)}%
                </div>
                <div className="text-xs text-white/60">Accuracy</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {stats.averageTime.toFixed(1)}s
                </div>
                <div className="text-xs text-white/60">Avg Time</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {stats.totalQuestions}
                </div>
                <div className="text-xs text-white/60">Total</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quiz Tabs */}
        <div className="bg-white/[0.02] rounded-3xl border border-white/[0.05] overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-white/10 bg-white/5">
            <div className="flex">
              {(["easy", "medium", "hard"] as const).map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setCurrentTab(difficulty)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                    currentTab === difficulty
                      ? getDifficultyColor(difficulty) + " border-b-2 border-current"
                      : "text-white/60 hover:text-white/80 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </span>
                    <span className="text-xs opacity-70">
                      ({getTabCount(difficulty)})
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {renderQuestion(currentTab)}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};