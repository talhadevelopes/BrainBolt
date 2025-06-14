import { create } from "zustand"
import axios from "axios"

interface Problem {
  title: string
  description: string
  difficulty: string
  timeLimit: string
  starterCode: {
    javascript: string
  }
  testCases: Array<{
    input: string
    output: string
    hidden: boolean
  }>
  example: {
    input: string
    output: string
    explanation: string
  }
  learningResources: Array<{
    title: string
    description: string
    url: string
  }>
  solution: string
  transcript?: string
}

interface CompetitiveArenaState {
  // State
  problems: Problem[]
  currentProblem: Problem | null
  loading: boolean
  error: string | null
  videoId: string
  difficulty: "easy" | "medium" | "hard"
  transcript: string

  // Actions
  setVideoId: (videoId: string) => void
  setDifficulty: (difficulty: "easy" | "medium" | "hard") => void
  setCurrentProblem: (problem: Problem) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  setTranscript: (transcript: string) => void
  fetchTranscript: (videoId: string) => Promise<string>
  generateProblemsFromTranscript: (transcript: string, difficulty: string) => Promise<Problem[]>
  fetchProblems: () => Promise<void>
  reset: () => void
}

const DEFAULT_PROBLEMS: Problem[] = [
  {
    title: "Sum of Array",
    description: "Given an array of integers, compute the sum of all elements. Return 0 if the array is empty.",
    difficulty: "Easy",
    timeLimit: "10 minutes",
    starterCode: {
      javascript: "function sumArray(arr) {\n  // Your code here\n}",
    },
    testCases: [
      { input: "[1, 2, 3, 4]", output: "10", hidden: false },
      { input: "[]", output: "0", hidden: false },
      { input: "[-1, -2, 3]", output: "0", hidden: true },
      { input: "[5]", output: "5", hidden: true },
    ],
    example: {
      input: "[1, 2, 3]",
      output: "6",
      explanation: "The sum of elements 1 + 2 + 3 = 6.",
    },
    learningResources: [
      {
        title: "Array Methods in JavaScript",
        description: "Learn about array methods like reduce for summing elements.",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
      },
    ],
    solution: "function sumArray(arr) {\n  return arr.reduce((sum, num) => sum + num, 0);\n}",
  },
]

export const useCompetitiveArenaStore = create<CompetitiveArenaState>((set, get) => ({
  // Initial State
  problems: DEFAULT_PROBLEMS,
  currentProblem: DEFAULT_PROBLEMS[0],
  loading: false,
  error: null,
  videoId: "",
  difficulty: "medium",
  transcript: "",

  // Actions
  setVideoId: (videoId) => {
    set({ videoId, error: null })
  },

  setDifficulty: (difficulty) => {
    set({ difficulty, error: null })
  },

  setCurrentProblem: (problem) => {
    set({ currentProblem: problem })
  },

  setError: (error) => {
    set({ error })
  },

  setLoading: (loading) => {
    set({ loading })
  },

  setTranscript: (transcript) => {
    set({ transcript })
  },

  fetchTranscript: async (videoId: string): Promise<string> => {
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/STEM/Transcript?videoId=${videoId}`, {
        timeout: 30000,
      })

      if (response.data.success && response.data.transcript) {
        return response.data.transcript
      } else {
        throw new Error("Failed to get transcript")
      }
    } catch (error) {
      console.error("Error fetching transcript:", error)
      throw error
    }
  },

  generateProblemsFromTranscript: async (transcript: string, difficulty: string): Promise<Problem[]> => {
    // Analyze transcript content to identify programming concepts
    const analyzeTranscript = (text: string) => {
      const lowerText = text.toLowerCase()

      const concepts = {
        arrays: lowerText.includes("array") || lowerText.includes("list"),
        loops: lowerText.includes("loop") || lowerText.includes("for") || lowerText.includes("while"),
        strings: lowerText.includes("string") || lowerText.includes("text"),
        sorting: lowerText.includes("sort") || lowerText.includes("order"),
        searching: lowerText.includes("search") || lowerText.includes("find"),
        recursion: lowerText.includes("recursion") || lowerText.includes("recursive"),
        dataStructures: lowerText.includes("stack") || lowerText.includes("queue") || lowerText.includes("tree"),
        algorithms: lowerText.includes("algorithm") || lowerText.includes("complexity"),
        math: lowerText.includes("math") || lowerText.includes("calculation") || lowerText.includes("sum"),
        objects: lowerText.includes("object") || lowerText.includes("class") || lowerText.includes("property"),
        functions: lowerText.includes("function") || lowerText.includes("method") || lowerText.includes("parameter"),
      }

      return concepts
    }

    const concepts = analyzeTranscript(transcript)

    // Generate problems based on identified concepts
    const generateProblemBasedOnConcepts = (): Problem => {
      if (concepts.arrays) {
        const problemData = {
          easy: {
            title: "Array Sum Calculator",
            description:
              "Given an array of integers, calculate and return the sum of all elements. This problem is inspired by the array concepts discussed in the video.",
            sampleInput: "[1, 2, 3, 4]",
            sampleOutput: "10",
            functionName: "sumArray",
            solution: "function sumArray(arr) {\n  return arr.reduce((sum, num) => sum + num, 0);\n}",
          },
          medium: {
            title: "Array Element Finder",
            description:
              "Given an array of integers, find and return the maximum element. Handle edge cases like empty arrays and negative numbers.",
            sampleInput: "[3, 1, 4, 1, 5, 9]",
            sampleOutput: "9",
            functionName: "findMax",
            solution:
              "function findMax(arr) {\n  if (arr.length === 0) return undefined;\n  return Math.max(...arr);\n}",
          },
          hard: {
            title: "Array Manipulation Challenge",
            description:
              "Given an array of integers, implement a function that removes duplicates and returns the array sorted in ascending order.",
            sampleInput: "[4, 2, 7, 2, 1, 9, 4]",
            sampleOutput: "[1, 2, 4, 7, 9]",
            functionName: "removeDuplicatesAndSort",
            solution: "function removeDuplicatesAndSort(arr) {\n  return [...new Set(arr)].sort((a, b) => a - b);\n}",
          },
        }

        const data = problemData[difficulty as keyof typeof problemData]
        return {
          title: data.title,
          description: data.description,
          difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
          timeLimit: difficulty === "easy" ? "10 minutes" : difficulty === "medium" ? "15 minutes" : "20 minutes",
          starterCode: {
            javascript: `function ${data.functionName}(arr) {\n  // Your code here\n}`,
          },
          testCases: [
            { input: data.sampleInput, output: data.sampleOutput, hidden: false },
            { input: "[]", output: "[]", hidden: true },
            { input: "[1]", output: "[1]", hidden: true },
          ],
          example: {
            input: data.sampleInput,
            output: data.sampleOutput,
            explanation: `Expected output: ${data.sampleOutput}`,
          },
          learningResources: [
            {
              title: `${data.title} - Solution Approach`,
              description: "Learn the optimal approach to solve this problem",
              url: "#",
            },
          ],
          solution: data.solution,
          transcript: transcript.substring(0, 200) + "...",
        }
      } else if (concepts.strings) {
        const problemData = {
          easy: {
            title: "String Length Counter",
            description:
              "Given a string, return its length. This relates to the string manipulation concepts from the video.",
            sampleInput: '"hello"',
            sampleOutput: "5",
            functionName: "getStringLength",
            solution: "function getStringLength(str) {\n  return str.length;\n}",
          },
          medium: {
            title: "Word Counter",
            description: "Given a sentence, count and return the number of words in it.",
            sampleInput: '"Hello world from JavaScript"',
            sampleOutput: "4",
            functionName: "countWords",
            solution: "function countWords(sentence) {\n  return sentence.trim().split(/\\s+/).length;\n}",
          },
          hard: {
            title: "String Pattern Matcher",
            description:
              "Given a string and a pattern, return true if the pattern exists in the string (case-insensitive).",
            sampleInput: '["Programming is fun", "gram"]',
            sampleOutput: "true",
            functionName: "hasPattern",
            solution:
              "function hasPattern(str, pattern) {\n  return str.toLowerCase().includes(pattern.toLowerCase());\n}",
          },
        }

        const data = problemData[difficulty as keyof typeof problemData]
        return {
          title: data.title,
          description: data.description,
          difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
          timeLimit: difficulty === "easy" ? "10 minutes" : difficulty === "medium" ? "15 minutes" : "20 minutes",
          starterCode: {
            javascript: `function ${data.functionName}(${difficulty === "hard" ? "str, pattern" : difficulty === "medium" ? "sentence" : "str"}) {\n  // Your code here\n}`,
          },
          testCases: [
            { input: data.sampleInput, output: data.sampleOutput, hidden: false },
            {
              input: difficulty === "easy" ? '""' : difficulty === "medium" ? '"a"' : '["test", "es"]',
              output: difficulty === "easy" ? "0" : difficulty === "medium" ? "1" : "true",
              hidden: true,
            },
          ],
          example: {
            input: data.sampleInput,
            output: data.sampleOutput,
            explanation: `Expected output: ${data.sampleOutput}`,
          },
          learningResources: [
            {
              title: `${data.title} - Solution Approach`,
              description: "Learn the optimal approach to solve this problem",
              url: "#",
            },
          ],
          solution: data.solution,
          transcript: transcript.substring(0, 200) + "...",
        }
      } else if (concepts.math || concepts.functions) {
        const problemData = {
          easy: {
            title: "Number Calculator",
            description:
              "Given two numbers, return their sum. This builds on the mathematical concepts discussed in the video.",
            sampleInput: "[5, 3]",
            sampleOutput: "8",
            functionName: "addNumbers",
            solution: "function addNumbers(a, b) {\n  return a + b;\n}",
          },
          medium: {
            title: "Prime Number Checker",
            description:
              "Given a positive integer, determine if it's a prime number. Return true if prime, false otherwise.",
            sampleInput: "17",
            sampleOutput: "true",
            functionName: "isPrime",
            solution:
              "function isPrime(n) {\n  if (n < 2) return false;\n  for (let i = 2; i <= Math.sqrt(n); i++) {\n    if (n % i === 0) return false;\n  }\n  return true;\n}",
          },
          hard: {
            title: "Fibonacci Generator",
            description: "Given a number n, generate and return the first n numbers in the Fibonacci sequence.",
            sampleInput: "6",
            sampleOutput: "[0, 1, 1, 2, 3, 5]",
            functionName: "generateFibonacci",
            solution:
              "function generateFibonacci(n) {\n  if (n <= 0) return [];\n  if (n === 1) return [0];\n  const fib = [0, 1];\n  for (let i = 2; i < n; i++) {\n    fib[i] = fib[i-1] + fib[i-2];\n  }\n  return fib;\n}",
          },
        }

        const data = problemData[difficulty as keyof typeof problemData]
        return {
          title: data.title,
          description: data.description,
          difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
          timeLimit: difficulty === "easy" ? "10 minutes" : difficulty === "medium" ? "15 minutes" : "20 minutes",
          starterCode: {
            javascript: `function ${data.functionName}(${difficulty === "easy" ? "a, b" : "n"}) {\n  // Your code here\n}`,
          },
          testCases: [
            { input: data.sampleInput, output: data.sampleOutput, hidden: false },
            {
              input: difficulty === "easy" ? "[0, 0]" : difficulty === "medium" ? "2" : "3",
              output: difficulty === "easy" ? "0" : difficulty === "medium" ? "true" : "[0, 1, 1]",
              hidden: true,
            },
          ],
          example: {
            input: data.sampleInput,
            output: data.sampleOutput,
            explanation: `Expected output: ${data.sampleOutput}`,
          },
          learningResources: [
            {
              title: `${data.title} - Solution Approach`,
              description: "Learn the optimal approach to solve this problem",
              url: "#",
            },
          ],
          solution: data.solution,
          transcript: transcript.substring(0, 200) + "...",
        }
      } else {
        // Default problem if no specific concepts detected
        return {
          title: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Programming Challenge`,
          description: `Solve this ${difficulty} programming challenge based on the programming concepts from the video. The video covers fundamental programming topics that will help you approach this problem.`,
          difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
          timeLimit: difficulty === "easy" ? "10 minutes" : difficulty === "medium" ? "15 minutes" : "20 minutes",
          starterCode: {
            javascript: "function solution(input) {\n  // Your code here\n  // Apply the concepts from the video\n}",
          },
          testCases: [
            {
              input:
                difficulty === "easy" ? "[1, 2, 3]" : difficulty === "medium" ? "[1, 2, 3, 4, 5]" : "[[1,2],[3,4]]",
              output: difficulty === "easy" ? "6" : difficulty === "medium" ? "15" : "10",
              hidden: false,
            },
          ],
          example: {
            input: difficulty === "easy" ? "[1, 2, 3]" : difficulty === "medium" ? "[1, 2, 3, 4, 5]" : "[[1,2],[3,4]]",
            output: difficulty === "easy" ? "6" : difficulty === "medium" ? "15" : "10",
            explanation: `Expected output: ${difficulty === "easy" ? "6" : difficulty === "medium" ? "15" : "10"}`,
          },
          learningResources: [
            {
              title: "Programming Fundamentals",
              description: "Learn the fundamental concepts covered in the video",
              url: "#",
            },
          ],
          solution: `function solution(input) {\n  // Implement your solution here\n  // Apply the concepts from the video\n  return result;\n}`,
          transcript: transcript.substring(0, 200) + "...",
        }
      }
    }

    const problem = generateProblemBasedOnConcepts()
    return [problem]
  },

  fetchProblems: async () => {
    const { videoId, difficulty, fetchTranscript, generateProblemsFromTranscript } = get()

    if (!videoId.trim()) {
      set({ error: "Please enter a YouTube video ID" })
      return
    }

    // Validate YouTube video ID format
    if (!videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
      set({ error: "Invalid YouTube video ID format. Example: dQw4w9WgXcQ" })
      return
    }

    set({ loading: true, error: null })

    try {
      console.log(`Step 1: Fetching transcript for video: ${videoId}`)

      // Step 1: Get transcript
      const transcriptText = await fetchTranscript(videoId)
      set({ transcript: transcriptText })

      console.log("Step 2: Transcript received, length:", transcriptText.length)

      // Step 2: Try to use CodeDojo endpoints (if they work with transcript)
      let generatedProblems: Problem[] = []

      try {
        console.log("Step 3: Attempting to generate problems...")

        // Try the original CodeDojo endpoint approach
        const endpoint = `CodeDojo${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`
        const response = await axios.post(
          `http://localhost:3000/${endpoint}`,
          { videoId },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 30000,
          },
        )

        if (response.data.success && response.data.problems) {
          // Format the response from CodeDojo endpoints
          generatedProblems = response.data.problems.map((problem: any) => ({
            title: problem.title,
            description: problem.description,
            difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
            timeLimit: difficulty === "easy" ? "10 minutes" : difficulty === "medium" ? "15 minutes" : "20 minutes",
            starterCode: {
              javascript: problem.solution
                ? extractStarterCode(problem.solution)
                : "function solution() {\n  // Your code here\n}",
            },
            testCases: [
              {
                input: problem.sampleInput,
                output: problem.sampleOutput,
                hidden: false,
              },
            ],
            example: {
              input: problem.sampleInput,
              output: problem.sampleOutput,
              explanation: `Expected output: ${problem.sampleOutput}`,
            },
            learningResources: [
              {
                title: `${problem.title} - Solution Approach`,
                description: "Learn the optimal approach to solve this problem",
                url: "#",
              },
            ],
            solution: problem.solution,
            transcript: transcriptText.substring(0, 200) + "...",
          }))
        }
      } catch (codeDojoError) {
        console.log("CodeDojo endpoint not available, generating mock problems...")
        // Fallback: Generate problems based on transcript
        generatedProblems = await generateProblemsFromTranscript(transcriptText, difficulty)
      }

      set({
        problems: generatedProblems,
        currentProblem: generatedProblems[0],
        loading: false,
        error: null,
      })

      console.log("Success! Generated", generatedProblems.length, "problems")
    } catch (err: any) {
      console.error("Error in fetchProblems:", err)

      let errorMessage = "Failed to fetch problems. "

      if (err.response?.status === 404) {
        errorMessage += "Video transcript not available."
      } else if (err.response?.status === 400) {
        errorMessage += "Invalid video ID format."
      } else if (err.code === "ECONNABORTED") {
        errorMessage += "Request timeout. Please try again."
      } else if (err.message.includes("transcript")) {
        errorMessage += "Could not extract transcript from video."
      } else {
        errorMessage += err.message || "Please check your connection and try again."
      }

      set({
        error: errorMessage,
        loading: false,
        problems: DEFAULT_PROBLEMS,
        currentProblem: DEFAULT_PROBLEMS[0],
      })
    }
  },

  reset: () => {
    set({
      problems: DEFAULT_PROBLEMS,
      currentProblem: DEFAULT_PROBLEMS[0],
      loading: false,
      error: null,
      videoId: "",
      difficulty: "medium",
      transcript: "",
    })
  },
}))

// Helper function to extract starter code from solution
const extractStarterCode = (solution: string, functionName?: string): string => {
  if (!solution) return ""

  // Use provided function name if available
  if (functionName) {
    // Extract parameters from solution if possible
    const paramMatch = solution.match(/function\s+\w+\s*$$([^)]*)$$/)
    const params = paramMatch ? paramMatch[1] : "input"
    return `function ${functionName}(${params}) {\n  // Your code here\n}`
  }

  // Try to extract function signature
  const functionMatch = solution.match(/function\s+(\w+)\s*$$[^)]*$$\s*{/)
  if (functionMatch) {
    const functionName = functionMatch[1]
    const params = solution.match(/function\s+\w+\s*$$([^)]*)$$/)?.[1] || ""
    return `function ${functionName}(${params}) {\n  // Your code here\n}`
  }

  // Try to extract class structure
  const classMatch = solution.match(/class\s+(\w+)\s*{/)
  if (classMatch) {
    const className = classMatch[1]
    return `class ${className} {\n  // Your code here\n}`
  }

  return "function solution(input) {\n  // Your code here\n}"
}
