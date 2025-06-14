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
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Editor from "@monaco-editor/react"
import type * as monaco from "monaco-editor"
import { useBugHunterStore } from "../../stores/bugHunterStore"

export const BugHunter = () => {
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
  const [theme, _setTheme] = useState("vs-dark")
  const [fontSize, _setFontSize] = useState(14)
  const [showTestDetails, setShowTestDetails] = useState<{ [key: number]: boolean }>({})

  // Initialize on mount
  useEffect(() => {
    reset()
  }, [reset])

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

    // Add keyboard shortcuts
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

    // Extract potential bugs from the flawed code comments
    const bugComments = challenge?.flawedCode.match(/\/\/.*[Bb]ug.*$/gm) || []
    const extractedBugs = bugComments
      .map((comment: string) => comment.replace(/\/\/.*[Bb]ug\s*\d*:?\s*/i, "").trim())
      .filter((bug: string) => bug.length > 0)

    // If no bugs found in comments, provide generic categories
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

  return (
    <section className="relative py-12 overflow-hidden bg-slate-900">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 flex items-center justify-center gap-4">
            <Bug className="h-12 w-12 text-red-400" />
            <span>
              Bug
              <span className="bg-gradient-to-r from-red-400 to-orange-600 text-transparent bg-clip-text"> Hunter</span>
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Debug flawed code and fix programming challenges from YouTube videos
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
            <h3 className="text-xl font-semibold text-white">Generate Bug Hunt from YouTube Video</h3>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">YouTube Video ID</label>
              <input
                type="text"
                value={videoId}
                onChange={handleVideoIdChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter YouTube video ID (e.g., dQw4w9WgXcQ)"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">Generate a debugging challenge based on video content</p>
            </div>

            <div className="flex items-end">
              <motion.button
                onClick={generateChallenge}
                disabled={loading || !videoId.trim()}
                className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-3 transition-all duration-300 ${
                  loading || !videoId.trim()
                    ? "bg-slate-700/50 cursor-not-allowed text-gray-400"
                    : "bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl"
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
                    <Bug className="h-5 w-5" />
                    Generate Challenge
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
            className="mb-6 p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg"
          >
            <h3 className="text-blue-300 font-medium mb-2">📝 Transcript Preview</h3>
            <p className="text-blue-200 text-sm">{transcript.substring(0, 200)}...</p>
            <p className="text-blue-400 text-xs mt-2">Length: {transcript.length} characters</p>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-red-900/20 border border-red-800/30 rounded-2xl"
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
            className="mb-8 animate-pulse space-y-4 p-8 bg-white/10 rounded-2xl"
          >
            <div className="h-8 bg-slate-700 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-red-400" />
            </div>
          </motion.div>
        )}

        {/* Stats Dashboard */}
        {stats.totalChallenges > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-800/30 rounded-2xl"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-400" />
              Bug Hunter Statistics
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-white">{stats.totalChallenges}</div>
                <div className="text-xs text-gray-400">Challenges</div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">{stats.solvedChallenges}</div>
                <div className="text-xs text-gray-400">Solved</div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.successRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-400">Success Rate</div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.averageTime.toFixed(1)}s</div>
                <div className="text-xs text-gray-400">Avg Time</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Challenge Interface */}
        {challenge && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Instructions & Hints */}
            <div className="space-y-6">
              {/* Instructions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg"
              >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  Instructions
                </h3>
                <div className="text-gray-300 text-sm space-y-2">
                  {challenge.instructions.split("\n").map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </motion.div>

              {/* Hints */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 bg-yellow-900/20 border border-yellow-800/30 rounded-lg"
              >
                <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Hints
                </h3>
                <div className="space-y-3">
                  {challenge.hints.map((hint, index) => (
                    <div key={index}>
                      <button
                        onClick={() => toggleHint(index)}
                        className="w-full flex items-center justify-between p-3 bg-yellow-900/30 hover:bg-yellow-900/40 rounded-lg transition-colors"
                      >
                        <span className="text-yellow-200 font-medium">Hint {index + 1}</span>
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
                            className="mt-2 p-3 bg-yellow-900/20 rounded-lg"
                          >
                            <p className="text-yellow-200 text-sm">{hint}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Bug Tracker */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 bg-red-900/20 border border-red-800/30 rounded-lg"
              >
                <h3 className="text-xl font-semibold text-red-300 mb-4 flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Bug Tracker
                </h3>
                <div className="space-y-2">
                  {commonBugs.map((bug, index) => (
                    <label key={index} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bugsFound.includes(bug)}
                        onChange={() => handleBugToggle(bug)}
                        className="w-4 h-4 text-red-500 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
                      />
                      <span
                        className={`text-sm ${bugsFound.includes(bug) ? "text-green-400 line-through" : "text-gray-300"}`}
                      >
                        {bug}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="mt-4 text-xs text-gray-400">
                  Found: {bugsFound.length} / {commonBugs.length} potential bugs
                </div>
              </motion.div>
            </div>

            {/* Center Panel - Code Editor */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
                  <h3 className="text-lg font-semibold text-white">Debug the Code</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={formatCode}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
                    >
                      Format
                    </button>
                    <button
                      onClick={resetChallenge}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </button>
                  </div>
                </div>

                <div className="h-96">
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
                      minimap: { enabled: false },
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
              </motion.div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  onClick={runTests}
                  disabled={isRunning || !userCode.trim()}
                  className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all duration-300 ${
                    isRunning || !userCode.trim()
                      ? "bg-slate-700/50 cursor-not-allowed text-gray-400"
                      : "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg"
                  }`}
                  whileHover={!isRunning && userCode.trim() ? { scale: 1.02 } : {}}
                  whileTap={!isRunning && userCode.trim() ? { scale: 0.98 } : {}}
                >
                  <Play className="h-5 w-5" />
                  {isRunning ? "Running Tests..." : "Run Tests"}
                  {!isRunning && <span className="text-xs opacity-70">(Ctrl+Enter)</span>}
                </motion.button>

                <motion.button
                  onClick={submitSolution}
                  disabled={isSubmitting || !userCode.trim()}
                  className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all duration-300 ${
                    isSubmitting || !userCode.trim()
                      ? "bg-slate-700/50 cursor-not-allowed text-gray-400"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                  }`}
                  whileHover={!isSubmitting && userCode.trim() ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting && userCode.trim() ? { scale: 0.98 } : {}}
                >
                  <Send className="h-5 w-5" />
                  {isSubmitting ? "Submitting..." : "Submit Solution"}
                </motion.button>
              </div>
            </div>

            {/* Right Panel - Test Results */}
            <div className="space-y-6">
              {/* Test Results Summary */}
              {testResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg"
                >
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Timer className="h-5 w-5 text-green-400" />
                    Test Results
                  </h3>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">Success Rate</span>
                      <span className={`font-bold ${getSuccessRate() === 100 ? "text-green-400" : "text-yellow-400"}`}>
                        {getSuccessRate().toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          getSuccessRate() === 100 ? "bg-green-500" : "bg-yellow-500"
                        }`}
                        style={{ width: `${getSuccessRate()}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-400 mb-4">
                    {testResults.filter((test) => test.passed).length} / {testResults.length} tests passing
                  </div>
                </motion.div>
              )}

              {/* Individual Test Cases */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
              >
                <h3 className="text-lg font-semibold text-white">Test Cases</h3>

                {challenge.testCases.map((testCase, index) => {
                  const result = testResults[index]
                  const isExpanded = showTestDetails[index]

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        result?.passed === true
                          ? "bg-green-900/20 border-green-800/30"
                          : result?.passed === false
                            ? "bg-red-900/20 border-red-800/30"
                            : "bg-slate-800/50 border-slate-700"
                      }`}
                    >
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleTestDetails(index)}
                      >
                        <div className="flex items-center gap-3">
                          {result?.passed === true && <CheckCircle className="h-5 w-5 text-green-400" />}
                          {result?.passed === false && <XCircle className="h-5 w-5 text-red-400" />}
                          {result?.passed === undefined && (
                            <div className="h-5 w-5 rounded-full border-2 border-gray-400" />
                          )}
                          <span className="font-medium text-white">{testCase.description}</span>
                        </div>
                        <button className="text-gray-400 hover:text-white">
                          {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 space-y-2 text-sm"
                          >
                            <div>
                              <span className="text-gray-400">Input: </span>
                              <code className="text-blue-300 bg-slate-900/50 px-2 py-1 rounded">{testCase.input}</code>
                            </div>
                            <div>
                              <span className="text-gray-400">Expected: </span>
                              <code className="text-green-300 bg-slate-900/50 px-2 py-1 rounded">
                                {testCase.expected}
                              </code>
                            </div>
                            {result?.actual && (
                              <div>
                                <span className="text-gray-400">Actual: </span>
                                <code
                                  className={`px-2 py-1 rounded bg-slate-900/50 ${
                                    result.passed ? "text-green-300" : "text-red-300"
                                  }`}
                                >
                                  {result.actual}
                                </code>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
