"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  LockKeyhole,
  Zap,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
  Users,
  Trophy,
  Code,
  Beaker,
  RefreshCw,
  ChevronDown,
  BookOpen,
  Star,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Editor from "@monaco-editor/react"
import * as monaco from "monaco-editor"

interface TestCase {
  input: string
  expected: string
  passed: boolean | null
  hidden: boolean
  actual?: string
}

interface LeaderboardEntry {
  rank: number
  name: string
  score: number
  solved: number
}

interface Achievement {
  icon: React.ReactNode
  title: string
  description: string
  progress?: number
  maxProgress?: number
  completed?: boolean
}

interface ProblemData {
  title: string
  description: string
  inputDescription: string
  outputDescription: string
  constraints: string[]
  tips: string[]
  difficulty: "easy" | "medium" | "hard"
  functionName?: string
  problemType?: "two-sum" | "lcs" | "generic"
}

interface UserStats {
  problemsSolved: number
  totalScore: number
  globalRank: number
  currentStreak: number
}

interface SolutionSubmissionProps {
  testCases: Array<{
    input: string
    output: string
    hidden?: boolean
  }>
  problemData?: ProblemData
  leaderboard?: LeaderboardEntry[]
  achievements?: Achievement[]
  userStats?: UserStats
  onSubmit?: (code: string) => Promise<{ success: boolean; results: TestCase[] }>
  initialCode?: string
  language?: string
}

export const SolutionSubmission: React.FC<SolutionSubmissionProps> = ({
  testCases = [],
  problemData,
  leaderboard = [],
  achievements = [],
  userStats,
  onSubmit,
  initialCode = "",
  language = "javascript",
}) => {
  const [solution, setSolution] = useState(initialCode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<"success" | "error" | null>(null)
  const [solutionTestCases, setSolutionTestCases] = useState<TestCase[]>(
    testCases.map((tc) => ({
      input: tc.input,
      expected: tc.output,
      passed: null,
      hidden: tc.hidden || false,
    })),
  )
  const [runResult, setRunResult] = useState<{
    output: string
    error: string | null
    consoleOutput: string[]
    testResults: Array<{
      input: string
      expected: string
      actual: string
      passed: boolean
      error?: string
    }>
  } | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [theme, setTheme] = useState("vs-dark")
  const [fontSize, setFontSize] = useState(14)
  const [activeTab, setActiveTab] = useState("tests")

  // Default data
  const defaultProblemData: ProblemData = {
    title: "Longest Common Subsequence",
    description:
      "Given two strings, find the length of their longest common subsequence. A subsequence is a sequence of characters that can be derived by deleting some or no elements without changing the order of the remaining elements.",
    inputDescription: "Two strings",
    outputDescription: "Length of longest common subsequence",
    constraints: ["1 ≤ str1.length, str2.length ≤ 1000", "Strings contain only uppercase English letters"],
    tips: [
      "Use dynamic programming to solve this efficiently",
      "Create a 2D table to store subproblem results",
      "Consider the recurrence relation: if characters match, add 1 to diagonal; otherwise, take max of left and top",
    ],
    difficulty: "hard",
    functionName: "longestCommonSubsequence",
    problemType: "lcs",
  }

  const defaultLeaderboard: LeaderboardEntry[] = [
    { rank: 1, name: "AlgoMaster", score: 2850, solved: 42 },
    { rank: 2, name: "CodeNinja", score: 2720, solved: 38 },
    { rank: 3, name: "ByteWarrior", score: 2680, solved: 35 },
  ]

  const defaultAchievements: Achievement[] = [
    {
      icon: <Award className="h-5 w-5 text-yellow-400" />,
      title: "Problem Solver",
      description: "Solved 50+ problems",
      progress: 40,
      maxProgress: 50,
      completed: false,
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-green-400" />,
      title: "Streak Master",
      description: "7 days coding streak",
      progress: 7,
      maxProgress: 7,
      completed: true,
    },
    {
      icon: <Users className="h-5 w-5 text-blue-400" />,
      title: "Team Player",
      description: "Helped 10+ developers",
      progress: 8,
      maxProgress: 10,
      completed: false,
    },
  ]

  const defaultUserStats: UserStats = {
    problemsSolved: 24,
    totalScore: 1905,
    globalRank: 15,
    currentStreak: 3,
  }

  // Use provided data or defaults
  const currentProblemData = problemData || defaultProblemData
  const currentLeaderboard = leaderboard.length > 0 ? leaderboard : defaultLeaderboard
  const currentAchievements = achievements.length > 0 ? achievements : defaultAchievements
  const currentUserStats = userStats || defaultUserStats

  // Update test cases when props change
  useEffect(() => {
    setSolutionTestCases(
      testCases.map((tc) => ({
        input: tc.input,
        expected: tc.output,
        passed: null,
        hidden: tc.hidden || false,
      })),
    )
  }, [testCases])

  // Update solution when initialCode changes
  useEffect(() => {
    setSolution(initialCode)
  }, [initialCode])

  // Simple syntax validation for real-time error checking
  const validateCode = (code: string, model: monaco.editor.ITextModel) => {
    const errors: monaco.editor.IMarkerData[] = []

    if (language === "javascript") {
      const lines = code.split("\n")
      lines.forEach((line, index) => {
        // Check for common JavaScript syntax issues
        if (line.trim().match(/^[a-zA-Z0-9\s]*=[^;]*$/) && !line.includes("//")) {
          errors.push({
            severity: monaco.MarkerSeverity.Warning,
            message: "Consider adding a semicolon.",
            startLineNumber: index + 1,
            startColumn: 1,
            endLineNumber: index + 1,
            endColumn: line.length + 1,
          })
        }

        // Check for undefined function calls
        const functionMatch = line.match(/\b(\w+)\(/)
        if (functionMatch && !line.match(/\b(function|let|const|var|if|for|while|return)\b/)) {
          const funcName = functionMatch[1]
          if (
            !["console", "Math", "Array", "Object", "String", "Number", "parseInt", "parseFloat"].includes(funcName)
          ) {
            errors.push({
              severity: monaco.MarkerSeverity.Info,
              message: `Function '${funcName}' - make sure it's defined.`,
              startLineNumber: index + 1,
              startColumn: line.indexOf(funcName) + 1,
              endLineNumber: index + 1,
              endColumn: line.indexOf(funcName) + funcName.length + 1,
            })
          }
        }
      })
    }

    // Set markers for errors
    monaco.editor.setModelMarkers(model, "syntax-checker", errors)
  }

  const parseTestInput = (input: string, problemType: string) => {
    try {
      // Remove extra whitespace and normalize
      const cleanInput = input.trim()

      if (problemType === "lcs") {
        // Parse LCS input: ["ABCD", "ACDF"] -> ["ABCD", "ACDF"]
        const match = cleanInput.match(/\[([^\]]+)\]/)
        if (match) {
          const content = match[1]
          // Split by comma and clean up quotes
          const parts = content.split(",").map((part) => part.trim().replace(/^["']|["']$/g, ""))
          return parts
        }
      } else if (problemType === "two-sum") {
        // Parse Two Sum input: [2,7,11,15], target = 9
        const arrayMatch = cleanInput.match(/\[([^\]]+)\]/)
        const targetMatch = cleanInput.match(/target\s*=\s*(\d+)/)

        if (arrayMatch && targetMatch) {
          const nums = arrayMatch[1].split(",").map((n) => Number.parseInt(n.trim()))
          const target = Number.parseInt(targetMatch[1])
          return { nums, target }
        }
      }

      // For array problems, try to parse as array
      if (cleanInput.startsWith("[") && cleanInput.endsWith("]")) {
        try {
          const parsed = JSON.parse(cleanInput)
          return parsed
        } catch (e) {
          // If JSON parsing fails, try manual parsing
          const content = cleanInput.slice(1, -1) // Remove brackets
          if (content.trim() === "") {
            return [] // Empty array
          }
          const elements = content.split(",").map((item) => {
            const trimmed = item.trim()
            // Try to parse as number
            if (!isNaN(Number(trimmed))) {
              return Number(trimmed)
            }
            // Return as string (remove quotes if present)
            return trimmed.replace(/^["']|["']$/g, "")
          })
          return elements
        }
      }

      // Generic parsing - try to evaluate as JSON
      return JSON.parse(cleanInput)
    } catch (error) {
      console.error("Failed to parse input:", input, error)
      // Return the input as-is if parsing fails
      return input
    }
  }

  const executeCode = (code: string, testCase?: { input: string; expected: string }) => {
    const consoleOutput: string[] = []

    try {
      // Create a safe execution environment with proper console mock
      const safeExecute = new Function(
        "consoleOutput",
        `
        // Create a safe console object
        const console = {
          log: (...args) => {
            consoleOutput.push(args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' '));
          },
          error: (...args) => {
            consoleOutput.push('ERROR: ' + args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' '));
          },
          warn: (...args) => {
            consoleOutput.push('WARN: ' + args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' '));
          }
        };
        
        try {
          // Execute user code first
          ${code}
          
          // If this is a test case execution, try to call the function
          ${
            testCase
              ? `
          const input = ${JSON.stringify(testCase.input)};
          const expected = ${JSON.stringify(testCase.expected)};
          
          try {
            // Parse the input
            const parsedInput = ${JSON.stringify(parseTestInput(testCase.input, currentProblemData.problemType || "generic"))};
            
            // Try to detect function name from the code
            const functionNames = [
              'removeDuplicatesAndSort', 'sumArray', 'findMax', 'getStringLength', 
              'countWords', 'hasPattern', 'addNumbers', 'isPrime', 'generateFibonacci',
              'longestCommonSubsequence', 'twoSum', 'solution'
            ];
            
            let result;
            let functionFound = false;
            
            // First try to find functions by common names
            for (const funcName of functionNames) {
              try {
                if (typeof eval('typeof ' + funcName) !== 'undefined' && typeof eval(funcName) === 'function') {
                  if (parsedInput !== null && parsedInput !== undefined) {
                    if (Array.isArray(parsedInput)) {
                      result = eval(funcName)(...parsedInput);
                    } else if (typeof parsedInput === 'object' && parsedInput.nums && parsedInput.target !== undefined) {
                      result = eval(funcName)(parsedInput.nums, parsedInput.target);
                    } else {
                      result = eval(funcName)(parsedInput);
                    }
                    functionFound = true;
                    break;
                  }
                }
              } catch (e) {
                // Function doesn't exist or failed, continue
              }
            }
            
            // If no predefined function found, try to extract function name from code
            if (!functionFound) {
              const codeLines = \`${code}\`.split('\\n');
              for (const line of codeLines) {
                const functionMatch = line.match(/function\\s+(\\w+)\\s*\\(/);
                if (functionMatch) {
                  const detectedFuncName = functionMatch[1];
                  try {
                    if (typeof eval('typeof ' + detectedFuncName) !== 'undefined' && typeof eval(detectedFuncName) === 'function') {
                      if (parsedInput !== null && parsedInput !== undefined) {
                        if (Array.isArray(parsedInput)) {
                          result = eval(detectedFuncName)(...parsedInput);
                        } else if (typeof parsedInput === 'object' && parsedInput.nums && parsedInput.target !== undefined) {
                          result = eval(detectedFuncName)(parsedInput.nums, parsedInput.target);
                        } else {
                          result = eval(detectedFuncName)(parsedInput);
                        }
                        functionFound = true;
                        break;
                      }
                    }
                  } catch (e) {
                    // Function execution failed, continue
                  }
                }
              }
            }
            
            if (!functionFound) {
              return { result: "undefined", error: "No executable function found. Make sure your function is properly defined.", consoleOutput };
            }
            
            return { result: JSON.stringify(result), error: null, consoleOutput };
          } catch (err) {
            return { result: "undefined", error: err.message, consoleOutput };
          }
          `
              : `
          return { result: "Code executed successfully", error: null, consoleOutput };
          `
          }
          
        } catch (err) {
          return { result: "undefined", error: err.message, consoleOutput };
        }
        `,
      )

      // Execute the code
      const executionResult = safeExecute(consoleOutput)

      // Ensure we always return a proper object
      return {
        result: executionResult?.result || "undefined",
        error: executionResult?.error || null,
        consoleOutput: executionResult?.consoleOutput || consoleOutput,
      }
    } catch (error) {
      return {
        result: "undefined",
        error: error instanceof Error ? error.message : "Execution error",
        consoleOutput,
      }
    }
  }

  const handleRun = async () => {
    if (!solution.trim()) {
      return
    }

    setIsRunning(true)
    setRunResult(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      // If there are test cases, run them
      if (solutionTestCases.length > 0) {
        const testResults = solutionTestCases.slice(0, 3).map((testCase) => {
          const execution = executeCode(solution, testCase)
          const actual = execution.result || "undefined"
          const passed = actual === testCase.expected && !execution.error

          return {
            input: testCase.input,
            expected: testCase.expected,
            actual,
            passed,
            error: execution.error,
          }
        })

        const hasErrors = testResults.some((r) => r.error)
        const passedCount = testResults.filter((r) => r.passed).length
        const output = hasErrors
          ? `Execution completed with errors`
          : `Executed ${testResults.length} test cases - ${passedCount}/${testResults.length} passed`

        // Get console output from the first execution
        const firstExecution = executeCode(solution, solutionTestCases[0])

        setRunResult({
          output,
          error: hasErrors ? "Some test cases failed due to errors" : null,
          consoleOutput: firstExecution.consoleOutput || [],
          testResults,
        })
      } else {
        // Just run the code without test cases
        const execution = executeCode(solution)

        setRunResult({
          output: execution.result || "Code executed successfully",
          error: execution.error,
          consoleOutput: execution.consoleOutput || [],
          testResults: [],
        })
      }
    } catch (error) {
      setRunResult({
        output: "Execution failed",
        error: error instanceof Error ? error.message : "Unknown error",
        consoleOutput: [],
        testResults: [],
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) => {
    editorRef.current = editor

    // Configure editor
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

    // Validate code on change
    editor.onDidChangeModelContent(() => {
      const model = editor.getModel()
      if (model) {
        validateCode(editor.getValue(), model)
      }
    })

    // Initial validation
    const model = editor.getModel()
    if (model) {
      validateCode(editor.getValue(), model)
    }

    // Add custom commands
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS, () => {
      handleSubmit()
    })

    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter, () => {
      handleRun()
    })
  }

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument")?.run()
    }
  }

  const handleSubmit = async () => {
    if (!solution.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      let results: TestCase[]

      if (onSubmit) {
        // Use custom submit handler
        const response = await onSubmit(solution)
        results = response.results
        setResult(response.success ? "success" : "error")
      } else {
        // Default simulation using actual code execution
        await new Promise((resolve) => setTimeout(resolve, 1500))

        results = solutionTestCases.map((test) => {
          const execution = executeCode(solution, test)
          const actual = execution.result || "undefined"
          const passed = actual === test.expected && !execution.error

          return {
            ...test,
            passed,
            actual,
          }
        })

        setResult(results.every((test) => test.passed) ? "success" : "error")
      }

      setSolutionTestCases(results)
    } catch (error) {
      console.error("Submission error:", error)
      setResult("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400"
      case "medium":
        return "text-yellow-400"
      case "hard":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getProgressPercentage = (progress = 0, maxProgress = 100) => {
    return Math.min((progress / maxProgress) * 100, 100)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 backdrop-blur-lg border border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <LockKeyhole className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-semibold text-white">{currentProblemData.title}</h3>
            <span className={`text-sm font-medium ${getDifficultyColor(currentProblemData.difficulty)}`}>
              {currentProblemData.difficulty.charAt(0).toUpperCase() + currentProblemData.difficulty.slice(1)}
            </span>
          </div>
        </div>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-2 text-sm rounded-full px-3 py-1 ${
              result === "success" ? "text-green-400 bg-green-900/20" : "text-red-400 bg-red-900/20"
            }`}
          >
            {result === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <span className="font-medium">{result === "success" ? "All tests passed!" : "Some tests failed"}</span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Code Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Code className="h-4 w-4 text-indigo-400" />
                <h4 className="font-medium text-gray-200">Solution Code</h4>
              </div>
            </div>

            <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
              <div className="flex items-center justify-between p-2 border-b border-slate-700 bg-slate-800">
                <div className="flex items-center space-x-1">
                  <button
                    className="p-1.5 rounded hover:bg-slate-700 text-gray-300 text-xs transition-colors"
                    onClick={formatCode}
                    title="Format code (Ctrl+Shift+F)"
                  >
                    <div className="flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Format</span>
                    </div>
                  </button>

                  <button
                    className="p-1.5 rounded hover:bg-slate-700 text-gray-300 text-xs transition-colors"
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  >
                    <div className="flex items-center gap-1.5">
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${isSettingsOpen ? "rotate-180" : ""}`}
                      />
                      <span>Settings</span>
                    </div>
                  </button>

                  <button
                    className="p-1.5 rounded hover:bg-slate-700 text-gray-300 text-xs transition-colors"
                    title="Documentation"
                  >
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Docs</span>
                    </div>
                  </button>
                </div>

                <div className="text-xs text-gray-400 font-mono">{language}</div>
              </div>

              <AnimatePresence>
                {isSettingsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b border-slate-700 p-3 bg-slate-800/70"
                  >
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div>
                        <label className="block text-gray-400 mb-1">Theme</label>
                        <select
                          value={theme}
                          onChange={(e) => setTheme(e.target.value)}
                          className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="vs-dark">Dark</option>
                          <option value="light">Light</option>
                          <option value="hc-black">High Contrast</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-400 mb-1">Font Size</label>
                        <select
                          value={fontSize}
                          onChange={(e) => {
                            const newSize = Number(e.target.value)
                            setFontSize(newSize)
                            if (editorRef.current) {
                              editorRef.current.updateOptions({ fontSize: newSize })
                            }
                          }}
                          className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {[12, 14, 16, 18, 20].map((size) => (
                            <option key={size} value={size}>
                              {size}px
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="w-full h-64 md:h-80 overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage={language}
                  value={solution}
                  onChange={(value) => setSolution(value || "")}
                  onMount={handleEditorDidMount}
                  theme={theme}
                  options={{
                    lineNumbers: "on",
                    automaticLayout: true,
                    fontSize,
                    minimap: { enabled: window.innerWidth > 768 },
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
                    cursorSmoothCaretAnimation: "on",
                    smoothScrolling: true,
                    folding: true,
                    foldingHighlight: true,
                    lineDecorationsWidth: 10,
                    contextmenu: true,
                    wordWrap: "on",
                    wrappingIndent: "indent",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Test Cases */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Beaker className="h-4 w-4 text-indigo-400" />
                <h4 className="font-medium text-gray-200">Test Cases</h4>
              </div>

              {result && (
                <div className="text-sm text-gray-400">
                  {solutionTestCases.filter((tc) => tc.passed).length}/{solutionTestCases.length} passing
                </div>
              )}
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {solutionTestCases.map((test, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg border ${
                    test.passed === null
                      ? "bg-slate-800/60 border-slate-700"
                      : test.passed
                        ? "bg-green-900/10 border-green-800/30"
                        : "bg-red-900/10 border-red-800/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 text-sm flex-1">
                      <div>
                        <span className="text-gray-400 mr-2">Input:</span>
                        <code className="text-white font-mono bg-slate-700/50 px-1.5 py-0.5 rounded text-xs break-all">
                          {test.input}
                        </code>
                      </div>
                      <div>
                        <span className="text-gray-400 mr-2">Expected:</span>
                        <code className="text-white font-mono bg-slate-700/50 px-1.5 py-0.5 rounded text-xs break-all">
                          {test.expected}
                        </code>
                      </div>

                      {test.passed === false && test.actual && (
                        <div>
                          <span className="text-gray-400 mr-2">Actual:</span>
                          <code className="text-red-300 font-mono bg-red-900/30 px-1.5 py-0.5 rounded text-xs break-all">
                            {test.actual}
                          </code>
                        </div>
                      )}
                    </div>

                    {test.passed !== null && (
                      <div className={`p-1 rounded-full ml-2 ${test.passed ? "bg-green-900/20" : "bg-red-900/20"}`}>
                        {test.passed ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                    )}
                  </div>

                  {test.hidden && (
                    <div className="mt-2 text-xs text-amber-400 bg-amber-900/20 py-1 px-2 rounded inline-block">
                      Hidden test case
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Run Results */}
          {runResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="flex items-center space-x-2">
                <Code className="h-4 w-4 text-green-400" />
                <h4 className="font-medium text-gray-200">Run Results</h4>
              </div>

              {/* Console Output */}
              <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                <div className="p-2 border-b border-slate-700 bg-slate-800 text-xs text-gray-400">Console Output</div>
                <div className="p-3 font-mono text-sm max-h-32 overflow-y-auto">
                  {runResult.consoleOutput && runResult.consoleOutput.length > 0 ? (
                    runResult.consoleOutput.map((output, index) => (
                      <div key={index} className="text-green-400 mb-1">
                        {output}
                      </div>
                    ))
                  ) : runResult.error ? (
                    <div className="text-red-400">❌ {runResult.error}</div>
                  ) : (
                    <div className="text-green-400">✅ {runResult.output}</div>
                  )}
                </div>
              </div>

              {/* Test Results */}
              {runResult.testResults.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-300">Test Case Results:</h5>
                  {runResult.testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border text-sm ${
                        result.passed ? "bg-green-900/10 border-green-800/30" : "bg-red-900/10 border-red-800/30"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-gray-200">Test Case {index + 1}</div>
                        <div
                          className={`flex items-center gap-1 text-xs ${
                            result.passed ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {result.passed ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {result.passed ? "PASS" : "FAIL"}
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-gray-400">Input: </span>
                          <code className="text-white bg-slate-700/50 px-1 py-0.5 rounded">{result.input}</code>
                        </div>
                        <div>
                          <span className="text-gray-400">Expected: </span>
                          <code className="text-white bg-slate-700/50 px-1 py-0.5 rounded">{result.expected}</code>
                        </div>
                        <div>
                          <span className="text-gray-400">Actual: </span>
                          <code
                            className={`px-1 py-0.5 rounded ${
                              result.passed ? "text-green-300 bg-green-900/30" : "text-red-300 bg-red-900/30"
                            }`}
                          >
                            {result.actual}
                          </code>
                        </div>
                        {result.error && (
                          <div>
                            <span className="text-gray-400">Error: </span>
                            <code className="text-red-300 bg-red-900/30 px-1 py-0.5 rounded text-xs">
                              {result.error}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          <div className="flex gap-3">
            <motion.button
              onClick={handleRun}
              disabled={isRunning || !solution.trim()}
              className={`flex-1 py-3 md:py-4 rounded-xl flex items-center justify-center gap-3 text-lg font-semibold transition-all duration-300 ${
                isRunning || !solution.trim()
                  ? "bg-slate-700/50 cursor-not-allowed text-gray-400"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 shadow-lg shadow-green-900/30 text-white"
              }`}
              whileHover={!isRunning && solution.trim() ? { scale: 1.02 } : {}}
              whileTap={!isRunning && solution.trim() ? { scale: 0.98 } : {}}
            >
              <Code className="h-5 w-5" />
              {isRunning ? "Running..." : "Run Code"}
              {!isRunning && <span className="text-xs opacity-70 ml-2">(Ctrl+Enter)</span>}
            </motion.button>

            <motion.button
              onClick={handleSubmit}
              disabled={isSubmitting || !solution.trim()}
              className={`flex-1 py-3 md:py-4 rounded-xl flex items-center justify-center gap-3 text-lg font-semibold transition-all duration-300 ${
                isSubmitting || !solution.trim()
                  ? "bg-slate-700/50 cursor-not-allowed text-gray-400"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 shadow-lg shadow-indigo-900/30 text-white"
              }`}
              whileHover={!isSubmitting && solution.trim() ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting && solution.trim() ? { scale: 0.98 } : {}}
            >
              <Zap className="h-5 w-5" />
              {isSubmitting ? "Testing Solution..." : "Submit Solution"}
            </motion.button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Tab Navigation */}
          <div className="border-b border-slate-700">
            <div className="flex space-x-2">
              {[
                { id: "tests", label: "Tests" },
                { id: "leaderboard", label: "Leaderboard" },
                { id: "achievements", label: "Achievements" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "text-indigo-400 border-b-2 border-indigo-400"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "tests" && (
              <motion.div
                key="tests"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <h4 className="text-lg font-semibold text-white mb-3">Problem Description</h4>
                  <p className="text-gray-300 text-sm mb-4">{currentProblemData.description}</p>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-300">
                      <span className="text-indigo-400 font-medium">Input:</span> {currentProblemData.inputDescription}
                    </div>
                    <div className="text-sm text-gray-300">
                      <span className="text-indigo-400 font-medium">Output:</span>{" "}
                      {currentProblemData.outputDescription}
                    </div>
                    <div className="text-sm text-gray-300">
                      <span className="text-indigo-400 font-medium">Constraints:</span>
                      <ul className="list-disc list-inside ml-2 mt-1 space-y-1 text-xs text-gray-400">
                        {currentProblemData.constraints.map((constraint, index) => (
                          <li key={index}>{constraint}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-900/20 border border-indigo-800/30 rounded-lg">
                  <h4 className="text-indigo-300 font-medium flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4" />
                    Challenge Tips
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {currentProblemData.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="text-indigo-400 mt-0.5">•</div>
                        <div>{tip}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {activeTab === "leaderboard" && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  Top Performers
                </h4>

                <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                  <div className="grid grid-cols-[auto_1fr_auto] gap-3 p-3 text-xs font-medium text-gray-400 border-b border-slate-700 bg-slate-800">
                    <div>Rank</div>
                    <div>User</div>
                    <div>Score</div>
                  </div>

                  <div className="divide-y divide-slate-700/60">
                    {currentLeaderboard.map((user, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="grid grid-cols-[auto_1fr_auto] gap-3 p-3 items-center hover:bg-slate-800/40 transition-colors duration-200"
                      >
                        <div>
                          <div
                            className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                            ${
                              index === 0
                                ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900"
                                : index === 1
                                  ? "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900"
                                  : index === 2
                                    ? "bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100"
                                    : "bg-slate-700 text-slate-300"
                            }
                          `}
                          >
                            {user.rank}
                          </div>
                        </div>

                        <div>
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="text-xs text-gray-400">{user.solved} problems solved</div>
                        </div>

                        <div>
                          <div className="font-mono font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                            {user.score.toLocaleString()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50">
                  <h5 className="text-indigo-400 text-sm font-medium mb-3">Your Stats</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-slate-900/70 rounded-lg text-center">
                      <div className="text-2xl font-semibold text-white">{currentUserStats.problemsSolved}</div>
                      <div className="text-xs text-gray-400 mt-1">Problems Solved</div>
                    </div>
                    <div className="p-3 bg-slate-900/70 rounded-lg text-center">
                      <div className="text-2xl font-semibold text-white">
                        {currentUserStats.totalScore.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Total Score</div>
                    </div>
                    <div className="p-3 bg-slate-900/70 rounded-lg text-center">
                      <div className="text-2xl font-semibold text-white">{currentUserStats.globalRank}</div>
                      <div className="text-xs text-gray-400 mt-1">Global Rank</div>
                    </div>
                    <div className="p-3 bg-slate-900/70 rounded-lg text-center">
                      <div className="text-2xl font-semibold text-white">{currentUserStats.currentStreak}</div>
                      <div className="text-xs text-gray-400 mt-1">Day Streak</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "achievements" && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-indigo-400" />
                  Your Achievements
                </h4>

                <div className="space-y-3">
                  {currentAchievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors duration-200 ${
                        achievement.completed
                          ? "border-green-800/30 bg-green-900/10 hover:bg-green-900/20"
                          : "border-slate-700 bg-slate-800/50 hover:bg-slate-800/80"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${achievement.completed ? "bg-green-900/60" : "bg-slate-900/60"}`}
                      >
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h5 className="text-white font-medium">{achievement.title}</h5>
                        <div className="text-sm text-gray-400 mt-0.5">{achievement.description}</div>
                        {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 bg-slate-700/50 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                  achievement.completed
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                    : "bg-gradient-to-r from-indigo-500 to-purple-500"
                                }`}
                                style={{
                                  width: `${getProgressPercentage(achievement.progress, achievement.maxProgress)}%`,
                                }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-400">
                              {achievement.progress}/{achievement.maxProgress}
                            </div>
                          </div>
                        )}
                      </div>
                      {achievement.completed && <CheckCircle className="h-5 w-5 text-green-400" />}
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-indigo-800/30 bg-indigo-900/10"
                >
                  <h5 className="text-indigo-300 font-medium mb-3">Upcoming Achievement</h5>
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-slate-900/60 opacity-50">
                      <Star className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-white font-medium">Algorithm Master</h5>
                      <div className="text-sm text-gray-400 mt-0.5">Solve 15 hard difficulty problems</div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-slate-500 to-indigo-500/50"
                            style={{ width: "40%" }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-400">6/15</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }
      `}</style>
    </motion.div>
  )
}

// Example usage component for LCS problem
export default function ExampleUsage() {
  const exampleTestCases = [
    { input: '["ABCD", "ACDF"]', output: "3", hidden: false },
    { input: '["", "XYZ"]', output: "0", hidden: false },
    { input: '["AGGTAB", "GXTXAYB"]', output: "4", hidden: true },
    { input: '["ABC", "DEF"]', output: "0", hidden: true },
  ]

  const lcsInitialCode = `let a = 6;
console.log(a);

function longestCommonSubsequence(str1, str2) {
  // Your code here
  
}`

  const handleSubmit = async (_code: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock evaluation logic
    const results = exampleTestCases.map((tc) => ({
      input: tc.input,
      expected: tc.output,
      passed: Math.random() > 0.4,
      hidden: tc.hidden,
      actual: Math.random() > 0.5 ? tc.output : "undefined",
    }))

    return {
      success: results.every((r) => r.passed),
      results,
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <SolutionSubmission
        testCases={exampleTestCases}
        onSubmit={handleSubmit}
        initialCode={lcsInitialCode}
        language="javascript"
      />
    </div>
  )
}
