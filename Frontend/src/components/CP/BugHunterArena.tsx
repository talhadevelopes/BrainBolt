"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import {
  Bug,
  Youtube,
  Loader2,
  Play,
  Send,
  RotateCcw,
  Lightbulb,
  CheckCircle,
  XCircle,
  Target,
  Timer,
  Award,
  ChevronDown,
  Eye,
  EyeOff,
  Code,
  Zap,
  TrendingUp,
  Clock,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Editor from "@monaco-editor/react"
import type * as monaco from "monaco-editor"
import { useBugHunterStore } from "../../stores/bugHunterStore"

interface BugHunterProps {
  initialVideoId?: string
}

export const BugHunter: React.FC<BugHunterProps> = ({ initialVideoId }) => {
  const [hasError, setHasError] = useState(false)
  const [activeTab, setActiveTab] = useState<"instructions" | "hints" | "tracker">("instructions")
  const {
    challenge,
    userCode,
    loading,
    error,
    videoId,
    transcript,
    testResults,
    isRunning,
    isSubmitting,
    showHints,
    currentHintIndex,
    stats,
    bugsFound,
    setVideoId,
    setUserCode,
    setShowHints,
    setCurrentHintIndex,
    addBugFound,
    removeBugFound,
    generateChallenge,
    runTests,
    submitSolution,
    resetChallenge,
    reset,
  } = useBugHunterStore()

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [theme] = useState("vs-dark")
  const [fontSize] = useState(14)
  const [showTestDetails, setShowTestDetails] = useState<{
    [key: number]: boolean
  }>({})

  useEffect(() => {
    reset()
    if (initialVideoId && initialVideoId.trim()) {
      setVideoId(initialVideoId)
    }
    return () => console.log("BugHunter unmounted")
  }, [reset, setVideoId, initialVideoId])

  useEffect(() => {
    if (error) {
      console.error("Store error:", error)
      setHasError(true)
    }
  }, [error])

  const handleVideoIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    setVideoId(value)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      generateChallenge()
    }
  }

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) => {
    editorRef.current = editor

    editor.updateOptions({
      automaticLayout: true,
      fontSize: fontSize,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: "on",
      lineNumbers: "on",
      renderLineHighlight: "all",
      cursorBlinking: "smooth",
      smoothScrolling: true,
      folding: true,
      bracketPairColorization: { enabled: true },
      autoClosingBrackets: "always",
      autoClosingQuotes: "always",
      tabSize: 2,
      insertSpaces: true,
    })

    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter, () => {
      runTests()
    })

    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS, () => {
      submitSolution()
    })
  }

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument")?.run()
    }
  }

  const toggleHint = (index: number) => {
    if (currentHintIndex === index && showHints) {
      setShowHints(false)
    } else {
      setCurrentHintIndex(index)
      setShowHints(true)
    }
  }

  const toggleTestDetails = (index: number) => {
    setShowTestDetails((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const handleBugToggle = (bug: string) => {
    if (bugsFound.includes(bug)) {
      removeBugFound(bug)
    } else {
      addBugFound(bug)
    }
  }

  const getSuccessRate = () => {
    if (testResults.length === 0) return 0
    return (testResults.filter((test) => test.passed).length / testResults.length) * 100
  }

  const getCommonBugs = (challenge: any): string[] => {
    if (!challenge) return []

    const bugComments = challenge?.flawedCode.match(/\/\/.*[Bb]ug.*$/gm) || []
    const extractedBugs = bugComments
      .map((comment: string) => comment.replace(/\/\/.*[Bb]ug\s*\d*:?\s*/i, "").trim())
      .filter((bug: string) => bug.length > 0)

    if (extractedBugs.length === 0) {
      return [
        "Logic error",
        "Syntax error",
        "Runtime error",
        "Edge case handling",
        "Variable scope issue",
        "Function parameter error",
        "Return value error",
        "Loop condition error",
      ]
    }

    return extractedBugs
  }

  const commonBugs = getCommonBugs(challenge)

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-3xl">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-medium text-red-400 mb-2">Error Loading Bug Hunter</h2>
          <p className="text-red-300">Please try again or check the console for details.</p>
        </div>
      </div>
    )
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 z-0">
        {/* Animated Grid */}
        <motion.div
          animate={{ opacity: [0.02, 0.05, 0.02] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Floating Orbs */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 blur-xl"
            style={{
              width: `${150 + i * 100}px`,
              height: `${150 + i * 100}px`,
              left: `${20 + i * 30}%`,
              top: `${10 + i * 20}%`,
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 3,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 py-8 relative z-10 max-w-7xl">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {/* Enhanced Header */}
          <motion.div variants={itemVariants} className="text-center relative">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-red-400/10 via-orange-400/10 to-yellow-400/10 rounded-3xl blur-3xl -z-10"
            />

            <motion.h1
              className="text-5xl lg:text-7xl font-light text-white mb-6 tracking-tight leading-[0.9] relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-6">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl"
                >
                  <Bug className="h-12 w-12 text-white" />
                </motion.div>
                <span>
                  Bug
                  <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 text-transparent bg-clip-text font-medium ml-4">
                    Hunter
                  </span>
                </span>
              </div>
            </motion.h1>

            <motion.p
              className="text-xl text-white/60 font-light max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Hunt down bugs, fix flawed code, and master debugging skills through interactive challenges
            </motion.p>
          </motion.div>

          {/* Video Input Section */}
          <motion.div
            variants={itemVariants}
            className="relative p-8 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <Youtube className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-white">Generate Bug Hunt Challenge</h3>
                <p className="text-white/60 text-sm">Create debugging challenges from YouTube video content</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={videoId}
                  onChange={handleVideoIdChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter YouTube video ID (e.g., dQw4w9WgXcQ)"
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-red-400/50 focus:bg-white/10 transition-all text-lg"
                />
              </div>

              <motion.button
                onClick={() => generateChallenge()}
                disabled={loading || !videoId.trim()}
                className={`px-8 py-4 rounded-2xl font-medium flex items-center gap-3 transition-all duration-300 ${
                  loading || !videoId.trim()
                    ? "bg-white/10 cursor-not-allowed text-white/40"
                    : "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl"
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
                    <Zap className="h-5 w-5" />
                    Generate Challenge
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Transcript Preview */}
          {transcript && (
            <motion.div variants={itemVariants} className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <h3 className="text-blue-300 font-medium">Transcript Loaded</h3>
              </div>
              <p className="text-blue-200 text-sm leading-relaxed">{transcript.substring(0, 200)}...</p>
              <div className="mt-3 text-xs text-blue-400">Length: {transcript.length} characters</div>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <motion.div variants={itemVariants} className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">Error</span>
              </div>
              <p className="text-red-300">{error}</p>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <motion.div variants={itemVariants} className="p-12 bg-white/[0.02] rounded-3xl border border-white/[0.05]">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center"
                >
                  <Bug className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-medium text-white mb-2">Generating Bug Hunt Challenge</h3>
                <p className="text-white/60">Analyzing video content and creating debugging scenarios...</p>
              </div>
            </motion.div>
          )}

          {/* Stats Dashboard */}
          {stats.totalChallenges > 0 && (
            <motion.div
              variants={itemVariants}
              className="p-6 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border border-red-500/20 rounded-3xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <Award className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white">Bug Hunter Statistics</h3>
                  <p className="text-white/60 text-sm">Your debugging performance overview</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    icon: Target,
                    label: "Challenges",
                    value: stats.totalChallenges,
                    color: "text-blue-400",
                  },
                  {
                    icon: CheckCircle,
                    label: "Solved",
                    value: stats.solvedChallenges,
                    color: "text-green-400",
                  },
                  {
                    icon: TrendingUp,
                    label: "Success Rate",
                    value: `${stats.successRate.toFixed(1)}%`,
                    color: "text-purple-400",
                  },
                  {
                    icon: Clock,
                    label: "Avg Time",
                    value: `${stats.averageTime.toFixed(1)}s`,
                    color: "text-orange-400",
                  },
                ].map(({ icon: Icon, label, value, color }, index) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-white/5 rounded-2xl text-center hover:bg-white/10 transition-all"
                  >
                    <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
                    <div className={`text-2xl font-bold ${color}`}>{value}</div>
                    <div className="text-xs text-white/60">{label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Main Challenge Interface */}
          {challenge && (
            <div className="space-y-8">
              {/* Instructions Section - Top */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Instructions */}
                <motion.div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-3xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-medium text-white">Instructions</h3>
                  </div>
                  <div className="prose prose-invert text-sm space-y-3">
                    {challenge.instructions.split("\n").map((line, index) => (
                      <p key={index} className="text-white/70 leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                </motion.div>

                {/* Hints */}
                <motion.div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    <h3 className="text-lg font-medium text-yellow-300">Hints</h3>
                  </div>
                  <div className="space-y-3">
                    {challenge.hints.map((hint, index) => (
                      <div key={index}>
                        <button
                          onClick={() => toggleHint(index)}
                          className="w-full flex items-center justify-between p-3 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl transition-all"
                        >
                          <span className="text-yellow-200 font-medium text-sm">Hint {index + 1}</span>
                          <ChevronDown
                            className={`h-4 w-4 text-yellow-400 transition-transform ${
                              showHints && currentHintIndex === index ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {showHints && currentHintIndex === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 p-3 bg-yellow-500/10 rounded-xl"
                            >
                              <p className="text-yellow-200 text-sm leading-relaxed">{hint}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Bug Tracker */}
                <motion.div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Bug className="h-5 w-5 text-red-400" />
                    <h3 className="text-lg font-medium text-red-300">Bug Tracker</h3>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {commonBugs.slice(0, 6).map((bug, index) => (
                      <motion.label
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-2 p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={bugsFound.includes(bug)}
                          onChange={() => handleBugToggle(bug)}
                          className="w-3 h-3 text-red-500 bg-white/10 border-white/20 rounded focus:ring-red-500"
                        />
                        <span
                          className={`text-xs transition-all ${
                            bugsFound.includes(bug) ? "text-green-400 line-through" : "text-white/70 hover:text-white"
                          }`}
                        >
                          {bug}
                        </span>
                      </motion.label>
                    ))}
                  </div>
                  <div className="mt-3 p-2 bg-white/5 rounded-lg">
                    <div className="text-xs text-white/60 mb-1">
                      Progress: {bugsFound.length} / {commonBugs.length}
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-red-500 to-green-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${(bugsFound.length / commonBugs.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Code Editor Section - Middle */}
              <motion.div
                variants={itemVariants}
                className="bg-black/50 rounded-3xl border border-white/10 overflow-hidden"
              >
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                  <div className="flex items-center gap-3">
                    <Code className="h-6 w-6 text-blue-400" />
                    <div>
                      <h3 className="text-xl font-medium text-white">Debug the Code</h3>
                      <p className="text-white/60 text-sm">Fix the bugs in the code below</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={formatCode}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-all flex items-center gap-2"
                    >
                      <Code className="h-4 w-4" />
                      Format
                    </button>
                    <button
                      onClick={resetChallenge}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-all flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </button>
                  </div>
                </div>

                <div className="h-[600px]">
                  <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    value={userCode}
                    onChange={(value) => setUserCode(value || "")}
                    onMount={handleEditorDidMount}
                    theme={theme}
                    options={{
                      lineNumbers: "on",
                      automaticLayout: true,
                      fontSize,
                      minimap: { enabled: true },
                      scrollBeyondLastLine: false,
                      autoIndent: "full",
                      formatOnType: true,
                      formatOnPaste: true,
                      bracketPairColorization: { enabled: true },
                      autoClosingBrackets: "always",
                      autoClosingQuotes: "always",
                      tabSize: 2,
                      renderLineHighlight: "all",
                      cursorBlinking: "smooth",
                      smoothScrolling: true,
                      folding: true,
                      wordWrap: "on",
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="p-6 border-t border-white/10 bg-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.button
                      onClick={runTests}
                      disabled={isRunning || !userCode.trim()}
                      className={`py-4 rounded-2xl font-medium flex items-center justify-center gap-3 transition-all duration-300 ${
                        isRunning || !userCode.trim()
                          ? "bg-white/10 cursor-not-allowed text-white/40"
                          : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
                      }`}
                      whileHover={!isRunning && userCode.trim() ? { scale: 1.02 } : {}}
                      whileTap={!isRunning && userCode.trim() ? { scale: 0.98 } : {}}
                    >
                      <Play className="h-5 w-5" />
                      {isRunning ? "Running Tests..." : "Run Tests"}
                      {!isRunning && <span className="text-xs opacity-70 hidden sm:inline">(Ctrl+Enter)</span>}
                    </motion.button>

                    <motion.button
                      onClick={submitSolution}
                      disabled={isSubmitting || !userCode.trim()}
                      className={`py-4 rounded-2xl font-medium flex items-center justify-center gap-3 transition-all duration-300 ${
                        isSubmitting || !userCode.trim()
                          ? "bg-white/10 cursor-not-allowed text-white/40"
                          : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                      }`}
                      whileHover={!isSubmitting && userCode.trim() ? { scale: 1.02 } : {}}
                      whileTap={!isSubmitting && userCode.trim() ? { scale: 0.98 } : {}}
                    >
                      <Send className="h-5 w-5" />
                      {isSubmitting ? "Submitting Solution..." : "Submit Solution"}
                      {!isSubmitting && <span className="text-xs opacity-70 hidden sm:inline">(Ctrl+S)</span>}
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Test Results Section - Bottom */}
              <div className="space-y-6">
                {/* Test Results Summary */}
                {testResults.length > 0 && (
                  <motion.div
                    variants={itemVariants}
                    className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-3xl"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Timer className="h-6 w-6 text-green-400" />
                      <div>
                        <h3 className="text-xl font-medium text-white">Test Results</h3>
                        <p className="text-white/60 text-sm">Your code performance overview</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-white/5 rounded-2xl">
                        <div className="text-3xl font-bold text-white mb-2">
                          {testResults.filter((test) => test.passed).length} / {testResults.length}
                        </div>
                        <div className="text-sm text-white/60">Tests Passing</div>
                      </div>

                      <div className="text-center p-4 bg-white/5 rounded-2xl">
                        <div
                          className={`text-3xl font-bold mb-2 ${getSuccessRate() === 100 ? "text-green-400" : "text-yellow-400"}`}
                        >
                          {getSuccessRate().toFixed(1)}%
                        </div>
                        <div className="text-sm text-white/60">Success Rate</div>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white/70 text-sm">Overall Progress</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-4">
                            <motion.div
                              className={`h-4 rounded-full transition-all duration-500 ${
                                getSuccessRate() === 100 ? "bg-green-500" : "bg-yellow-500"
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${getSuccessRate()}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Test Cases Grid */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-blue-400" />
                    <div>
                      <h3 className="text-xl font-medium text-white">Test Cases</h3>
                      <p className="text-white/60 text-sm">Detailed test case results and feedback</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {challenge.testCases.map((testCase, index) => {
                      const result = testResults[index]
                      const isExpanded = showTestDetails[index]

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                            result?.passed === true
                              ? "bg-green-500/10 border-green-500/20"
                              : result?.passed === false
                                ? "bg-red-500/10 border-red-500/20"
                                : "bg-white/[0.02] border-white/[0.05]"
                          }`}
                        >
                          <div
                            className="flex items-center justify-between p-4 cursor-pointer"
                            onClick={() => toggleTestDetails(index)}
                          >
                            <div className="flex items-center gap-3">
                              {result?.passed === true && <CheckCircle className="h-5 w-5 text-green-400" />}
                              {result?.passed === false && <XCircle className="h-5 w-5 text-red-400" />}
                              {result?.passed === undefined && (
                                <div className="h-5 w-5 rounded-full border-2 border-white/40" />
                              )}
                              <span className="font-medium text-white text-sm">{testCase.description}</span>
                            </div>
                            <button className="text-white/60 hover:text-white">
                              {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="px-4 pb-4 space-y-3 text-sm border-t border-white/10"
                              >
                                <div className="pt-3 space-y-2">
                                  <div>
                                    <span className="text-white/60">Input: </span>
                                    <code className="text-blue-300 bg-white/5 px-2 py-1 rounded text-xs">
                                      {testCase.input}
                                    </code>
                                  </div>
                                  <div>
                                    <span className="text-white/60">Expected: </span>
                                    <code className="text-green-300 bg-white/5 px-2 py-1 rounded text-xs">
                                      {testCase.expected}
                                    </code>
                                  </div>
                                  {result?.actual && (
                                    <div>
                                      <span className="text-white/60">Actual: </span>
                                      <code
                                        className={`px-2 py-1 rounded bg-white/5 text-xs ${
                                          result.passed ? "text-green-300" : "text-red-300"
                                        }`}
                                      >
                                        {result.actual}
                                      </code>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
