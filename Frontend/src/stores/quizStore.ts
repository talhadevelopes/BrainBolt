import { create } from "zustand"
import axios from "axios"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: "easy" | "medium" | "hard"
  topic: string
  userAnswer?: number
  isCorrect?: boolean
  timeSpent?: number
}

interface QuizStats {
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  accuracy: number
  averageTime: number
  easyCorrect: number
  mediumCorrect: number
  hardCorrect: number
}

interface QuizState {
  // State
  questions: {
    easy: QuizQuestion[]
    medium: QuizQuestion[]
    hard: QuizQuestion[]
  }
  currentTab: "easy" | "medium" | "hard"
  loading: boolean
  error: string | null
  videoId: string
  transcript: string
  stats: QuizStats
  currentQuestionIndex: {
    easy: number
    medium: number
    hard: number
  }
  quizStartTime: number | null
  questionStartTime: number | null

  // Actions
  setVideoId: (videoId: string) => void
  setCurrentTab: (tab: "easy" | "medium" | "hard") => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  setTranscript: (transcript: string) => void
  setCurrentQuestionIndex: (difficulty: "easy" | "medium" | "hard", index: number) => void
  answerQuestion: (difficulty: "easy" | "medium" | "hard", questionIndex: number, answer: number) => void
  startQuiz: () => void
  startQuestion: () => void
  fetchTranscript: (videoId: string) => Promise<string>
  generateQuizzes: () => Promise<void>
  calculateStats: () => void
  resetQuiz: () => void
  reset: () => void
}

const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    id: "default-easy-1",
    question: "What is the basic building block of all matter?",
    options: ["Atom", "Molecule", "Cell", "Electron"],
    correctAnswer: 0,
    explanation: "Atoms are the fundamental units of matter and the defining structure of elements.",
    difficulty: "easy",
    topic: "Chemistry Basics",
  },
  {
    id: "default-easy-2",
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 1,
    explanation: "Basic addition: 2 + 2 = 4",
    difficulty: "easy",
    topic: "Mathematics",
  },
]

const INITIAL_STATS: QuizStats = {
  totalQuestions: 0,
  answeredQuestions: 0,
  correctAnswers: 0,
  accuracy: 0,
  averageTime: 0,
  easyCorrect: 0,
  mediumCorrect: 0,
  hardCorrect: 0,
}

export const useQuizStore = create<QuizState>((set, get) => ({
  // Initial State
  questions: {
    easy: DEFAULT_QUESTIONS.filter((q) => q.difficulty === "easy"),
    medium: [],
    hard: [],
  },
  currentTab: "easy",
  loading: false,
  error: null,
  videoId: "",
  transcript: "",
  stats: INITIAL_STATS,
  currentQuestionIndex: {
    easy: 0,
    medium: 0,
    hard: 0,
  },
  quizStartTime: null,
  questionStartTime: null,

  // Actions
  setVideoId: (videoId) => {
    set({ videoId, error: null })
  },

  setCurrentTab: (tab) => {
    set({ currentTab: tab })
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

  setCurrentQuestionIndex: (difficulty, index) => {
    set((state) => ({
      currentQuestionIndex: {
        ...state.currentQuestionIndex,
        [difficulty]: index,
      },
    }))
  },

  answerQuestion: (difficulty, questionIndex, answer) => {
    const { questions, questionStartTime } = get()
    const timeSpent = questionStartTime ? Date.now() - questionStartTime : 0

    const updatedQuestions = { ...questions }
    const question = updatedQuestions[difficulty][questionIndex]

    if (question) {
      question.userAnswer = answer
      question.isCorrect = answer === question.correctAnswer
      question.timeSpent = timeSpent
    }

    set({ questions: updatedQuestions })
    get().calculateStats()
  },

  startQuiz: () => {
    set({ quizStartTime: Date.now() })
  },

  startQuestion: () => {
    set({ questionStartTime: Date.now() })
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

  generateQuizzes: async () => {
    const { videoId, fetchTranscript } = get()

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

      // Step 2: Generate quizzes for all difficulties
      const difficulties = ["easy", "medium", "hard"] as const
      const allQuestions: { easy: QuizQuestion[]; medium: QuizQuestion[]; hard: QuizQuestion[] } = {
        easy: [],
        medium: [],
        hard: [],
      }

      for (const difficulty of difficulties) {
        try {
          console.log(`Step 3: Generating ${difficulty} questions...`)

          const endpoint = `KnowledgeCheck${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`
          const response = await axios.post(
            `http://localhost:3000/api/v1/STEM/${endpoint}`,
            { videoId },
            {
              headers: { "Content-Type": "application/json" },
              timeout: 30000,
            },
          )

          if (response.data.success && response.data.questions) {
            // Format the response from API
            const formattedQuestions = response.data.questions.map((q: any, index: number) => ({
              id: `${difficulty}-${Date.now()}-${index}`,
              question: q.question,
              options: q.options || q.choices || [],
              correctAnswer: q.correctAnswer || q.correct || 0,
              explanation: q.explanation || `The correct answer is option ${(q.correctAnswer || 0) + 1}.`,
              difficulty,
              topic: q.topic || "General Knowledge",
            }))

            allQuestions[difficulty] = formattedQuestions.slice(0, 5) // Limit to 5 questions per difficulty
          } else {
            // Fallback: Generate mock questions based on transcript
            allQuestions[difficulty] = generateMockQuestions(transcriptText, difficulty, 5)
          }
        } catch (apiError) {
          console.log(`API endpoint for ${difficulty} not available, generating mock questions...`)
          // Fallback: Generate mock questions based on transcript
          allQuestions[difficulty] = generateMockQuestions(transcriptText, difficulty, 5)
        }
      }

      set({
        questions: allQuestions,
        loading: false,
        error: null,
        currentQuestionIndex: { easy: 0, medium: 0, hard: 0 },
      })

      get().calculateStats()
      console.log("Success! Generated quizzes for all difficulties")
    } catch (err: any) {
      console.error("Error in generateQuizzes:", err)

      let errorMessage = "Failed to generate quizzes. "

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
        questions: {
          easy: DEFAULT_QUESTIONS.filter((q) => q.difficulty === "easy"),
          medium: [],
          hard: [],
        },
      })
    }
  },

  calculateStats: () => {
    const { questions } = get()
    const allQuestions = [...questions.easy, ...questions.medium, ...questions.hard]

    const answeredQuestions = allQuestions.filter((q) => q.userAnswer !== undefined)
    const correctAnswers = answeredQuestions.filter((q) => q.isCorrect)

    const easyCorrect = questions.easy.filter((q) => q.isCorrect).length
    const mediumCorrect = questions.medium.filter((q) => q.isCorrect).length
    const hardCorrect = questions.hard.filter((q) => q.isCorrect).length

    const totalTime = answeredQuestions.reduce((sum, q) => sum + (q.timeSpent || 0), 0)
    const averageTime = answeredQuestions.length > 0 ? totalTime / answeredQuestions.length : 0

    const stats: QuizStats = {
      totalQuestions: allQuestions.length,
      answeredQuestions: answeredQuestions.length,
      correctAnswers: correctAnswers.length,
      accuracy: answeredQuestions.length > 0 ? (correctAnswers.length / answeredQuestions.length) * 100 : 0,
      averageTime: averageTime / 1000, // Convert to seconds
      easyCorrect,
      mediumCorrect,
      hardCorrect,
    }

    set({ stats })
  },

  resetQuiz: () => {
    const { questions } = get()
    const resetQuestions = {
      easy: questions.easy.map((q) => ({ ...q, userAnswer: undefined, isCorrect: undefined, timeSpent: undefined })),
      medium: questions.medium.map((q) => ({
        ...q,
        userAnswer: undefined,
        isCorrect: undefined,
        timeSpent: undefined,
      })),
      hard: questions.hard.map((q) => ({ ...q, userAnswer: undefined, isCorrect: undefined, timeSpent: undefined })),
    }

    set({
      questions: resetQuestions,
      currentQuestionIndex: { easy: 0, medium: 0, hard: 0 },
      stats: INITIAL_STATS,
      quizStartTime: null,
      questionStartTime: null,
    })
  },

  reset: () => {
    set({
      questions: {
        easy: DEFAULT_QUESTIONS.filter((q) => q.difficulty === "easy"),
        medium: [],
        hard: [],
      },
      currentTab: "easy",
      loading: false,
      error: null,
      videoId: "",
      transcript: "",
      stats: INITIAL_STATS,
      currentQuestionIndex: { easy: 0, medium: 0, hard: 0 },
      quizStartTime: null,
      questionStartTime: null,
    })
  },
}))

// Helper function to generate mock questions based on transcript
const generateMockQuestions = (
  transcript: string,
  difficulty: "easy" | "medium" | "hard",
  count: number,
): QuizQuestion[] => {
  const questions: QuizQuestion[] = []

  // Analyze transcript for key concepts
  const lowerTranscript = transcript.toLowerCase()
  const concepts = {
    math:
      lowerTranscript.includes("math") || lowerTranscript.includes("calculation") || lowerTranscript.includes("number"),
    science:
      lowerTranscript.includes("science") ||
      lowerTranscript.includes("experiment") ||
      lowerTranscript.includes("theory"),
    programming:
      lowerTranscript.includes("code") || lowerTranscript.includes("program") || lowerTranscript.includes("algorithm"),
    physics:
      lowerTranscript.includes("physics") || lowerTranscript.includes("force") || lowerTranscript.includes("energy"),
    chemistry:
      lowerTranscript.includes("chemistry") ||
      lowerTranscript.includes("element") ||
      lowerTranscript.includes("reaction"),
    biology:
      lowerTranscript.includes("biology") || lowerTranscript.includes("cell") || lowerTranscript.includes("organism"),
  }

  // Generate questions based on detected concepts and difficulty
  for (let i = 0; i < count; i++) {
    let question: QuizQuestion

    if (concepts.math) {
      question = generateMathQuestion(difficulty, i, transcript)
    } else if (concepts.programming) {
      question = generateProgrammingQuestion(difficulty, i, transcript)
    } else if (concepts.science) {
      question = generateScienceQuestion(difficulty, i, transcript)
    } else {
      question = generateGeneralQuestion(difficulty, i, transcript)
    }

    questions.push(question)
  }

  return questions
}

const generateMathQuestion = (
  difficulty: "easy" | "medium" | "hard",
  index: number,
  _transcript: string,
): QuizQuestion => {
  const mathQuestions = {
    easy: [
      {
        question: "What is the result of 15 + 27?",
        options: ["40", "42", "44", "46"],
        correctAnswer: 1,
        explanation: "15 + 27 = 42",
        topic: "Basic Arithmetic",
      },
      {
        question: "What is 8 × 7?",
        options: ["54", "56", "58", "60"],
        correctAnswer: 1,
        explanation: "8 × 7 = 56",
        topic: "Multiplication",
      },
    ],
    medium: [
      {
        question: "What is the square root of 144?",
        options: ["10", "11", "12", "13"],
        correctAnswer: 2,
        explanation: "√144 = 12 because 12² = 144",
        topic: "Square Roots",
      },
      {
        question: "If x + 5 = 12, what is x?",
        options: ["5", "6", "7", "8"],
        correctAnswer: 2,
        explanation: "x + 5 = 12, so x = 12 - 5 = 7",
        topic: "Basic Algebra",
      },
    ],
    hard: [
      {
        question: "What is the derivative of x³ + 2x²?",
        options: ["3x² + 4x", "3x² + 2x", "x² + 4x", "3x + 4"],
        correctAnswer: 0,
        explanation: "d/dx(x³ + 2x²) = 3x² + 4x using the power rule",
        topic: "Calculus",
      },
      {
        question: "What is the solution to the quadratic equation x² - 5x + 6 = 0?",
        options: ["x = 1, 6", "x = 2, 3", "x = 1, 5", "x = 2, 4"],
        correctAnswer: 1,
        explanation: "Factoring: (x-2)(x-3) = 0, so x = 2 or x = 3",
        topic: "Quadratic Equations",
      },
    ],
  }

  const questionData = mathQuestions[difficulty][index % mathQuestions[difficulty].length]

  return {
    id: `math-${difficulty}-${Date.now()}-${index}`,
    question: questionData.question,
    options: questionData.options,
    correctAnswer: questionData.correctAnswer,
    explanation: questionData.explanation,
    difficulty,
    topic: questionData.topic,
  }
}

const generateProgrammingQuestion = (
  difficulty: "easy" | "medium" | "hard",
  index: number,
  _transcript: string,
): QuizQuestion => {
  const programmingQuestions = {
    easy: [
      {
        question: "What does HTML stand for?",
        options: [
          "Hyper Text Markup Language",
          "High Tech Modern Language",
          "Home Tool Markup Language",
          "Hyperlink and Text Markup Language",
        ],
        correctAnswer: 0,
        explanation: "HTML stands for Hyper Text Markup Language, used for creating web pages",
        topic: "Web Development",
      },
      {
        question: "Which symbol is used for comments in JavaScript?",
        options: ["#", "//", "/*", "Both // and /*"],
        correctAnswer: 3,
        explanation: "JavaScript supports both // for single-line and /* */ for multi-line comments",
        topic: "JavaScript Basics",
      },
    ],
    medium: [
      {
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correctAnswer: 1,
        explanation: "Binary search has O(log n) time complexity as it halves the search space each iteration",
        topic: "Algorithms",
      },
      {
        question: "Which data structure uses LIFO principle?",
        options: ["Queue", "Stack", "Array", "Linked List"],
        correctAnswer: 1,
        explanation: "Stack follows Last In First Out (LIFO) principle",
        topic: "Data Structures",
      },
    ],
    hard: [
      {
        question: "What is the space complexity of merge sort?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctAnswer: 2,
        explanation: "Merge sort requires O(n) additional space for the temporary arrays during merging",
        topic: "Advanced Algorithms",
      },
      {
        question: "In dynamic programming, what is memoization?",
        options: [
          "Storing results of expensive function calls",
          "A sorting technique",
          "A graph traversal method",
          "A memory allocation strategy",
        ],
        correctAnswer: 0,
        explanation: "Memoization stores results of expensive function calls to avoid redundant calculations",
        topic: "Dynamic Programming",
      },
    ],
  }

  const questionData = programmingQuestions[difficulty][index % programmingQuestions[difficulty].length]

  return {
    id: `programming-${difficulty}-${Date.now()}-${index}`,
    question: questionData.question,
    options: questionData.options,
    correctAnswer: questionData.correctAnswer,
    explanation: questionData.explanation,
    difficulty,
    topic: questionData.topic,
  }
}

const generateScienceQuestion = (
  difficulty: "easy" | "medium" | "hard",
  index: number,
  _transcript: string,
): QuizQuestion => {
  const scienceQuestions = {
    easy: [
      {
        question: "What is the chemical symbol for water?",
        options: ["H2O", "CO2", "NaCl", "O2"],
        correctAnswer: 0,
        explanation: "Water is composed of two hydrogen atoms and one oxygen atom: H2O",
        topic: "Chemistry",
      },
      {
        question: "How many bones are in the adult human body?",
        options: ["196", "206", "216", "226"],
        correctAnswer: 1,
        explanation: "The adult human body has 206 bones",
        topic: "Biology",
      },
    ],
    medium: [
      {
        question: "What is Newton's second law of motion?",
        options: ["F = ma", "E = mc²", "V = IR", "PV = nRT"],
        correctAnswer: 0,
        explanation: "Newton's second law states that Force equals mass times acceleration (F = ma)",
        topic: "Physics",
      },
      {
        question: "What is the pH of pure water?",
        options: ["6", "7", "8", "9"],
        correctAnswer: 1,
        explanation: "Pure water has a pH of 7, which is neutral",
        topic: "Chemistry",
      },
    ],
    hard: [
      {
        question: "What is the Heisenberg Uncertainty Principle?",
        options: [
          "Energy cannot be created or destroyed",
          "You cannot simultaneously know position and momentum precisely",
          "Matter and energy are equivalent",
          "Entropy always increases",
        ],
        correctAnswer: 1,
        explanation:
          "The Heisenberg Uncertainty Principle states that you cannot simultaneously determine both position and momentum of a particle with perfect precision",
        topic: "Quantum Physics",
      },
      {
        question: "What is the process by which plants convert light energy into chemical energy?",
        options: ["Respiration", "Photosynthesis", "Transpiration", "Osmosis"],
        correctAnswer: 1,
        explanation: "Photosynthesis is the process where plants convert light energy into chemical energy (glucose)",
        topic: "Biology",
      },
    ],
  }

  const questionData = scienceQuestions[difficulty][index % scienceQuestions[difficulty].length]

  return {
    id: `science-${difficulty}-${Date.now()}-${index}`,
    question: questionData.question,
    options: questionData.options,
    correctAnswer: questionData.correctAnswer,
    explanation: questionData.explanation,
    difficulty,
    topic: questionData.topic,
  }
}

const generateGeneralQuestion = (
  difficulty: "easy" | "medium" | "hard",
  index: number,
  _transcript: string,
): QuizQuestion => {
  const generalQuestions = {
    easy: [
      {
        question: "Based on the video content, what is the main topic discussed?",
        options: ["Technology", "Science", "Mathematics", "General Knowledge"],
        correctAnswer: 1,
        explanation: "The video appears to cover scientific concepts based on the transcript analysis",
        topic: "Video Content",
      },
    ],
    medium: [
      {
        question: "What key concept was emphasized in the video?",
        options: ["Problem solving", "Critical thinking", "Data analysis", "All of the above"],
        correctAnswer: 3,
        explanation: "Educational videos typically emphasize multiple learning skills",
        topic: "Learning Concepts",
      },
    ],
    hard: [
      {
        question: "How does the video content relate to real-world applications?",
        options: [
          "It provides theoretical knowledge only",
          "It connects theory with practical examples",
          "It focuses on historical context",
          "It emphasizes memorization",
        ],
        correctAnswer: 1,
        explanation: "Quality educational content typically bridges theory and practice",
        topic: "Application",
      },
    ],
  }

  const questionData = generalQuestions[difficulty][index % generalQuestions[difficulty].length]

  return {
    id: `general-${difficulty}-${Date.now()}-${index}`,
    question: questionData.question,
    options: questionData.options,
    correctAnswer: questionData.correctAnswer,
    explanation: questionData.explanation,
    difficulty,
    topic: questionData.topic,
  }
}
