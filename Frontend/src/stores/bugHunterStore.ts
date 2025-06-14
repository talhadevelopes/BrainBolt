import { create } from "zustand"
import axios from "axios"

interface TestCase {
  description: string
  input: string
  expected: string
  actual?: string
  passed?: boolean
}

interface BugHunterChallenge {
  flawedCode: string
  instructions: string
  hints: string[]
  testCases: TestCase[]
  videoId?: string
  transcriptLength?: number
}

interface BugHunterStats {
  totalChallenges: number
  solvedChallenges: number
  bugsFound: number
  averageTime: number
  successRate: number
}

interface BugHunterState {
  // State
  challenge: BugHunterChallenge | null
  userCode: string
  loading: boolean
  error: string | null
  videoId: string
  transcript: string
  testResults: TestCase[]
  isRunning: boolean
  isSubmitting: boolean
  showHints: boolean
  currentHintIndex: number
  stats: BugHunterStats
  challengeStartTime: number | null
  bugsFound: string[]

  // Actions
  setVideoId: (videoId: string) => void
  setUserCode: (code: string) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  setTranscript: (transcript: string) => void
  setShowHints: (show: boolean) => void
  setCurrentHintIndex: (index: number) => void
  addBugFound: (bug: string) => void
  removeBugFound: (bug: string) => void
  startChallenge: () => void
  runTests: () => Promise<void>
  submitSolution: () => Promise<void>
  fetchTranscript: (videoId: string) => Promise<string>
  generateChallenge: () => Promise<void>
  resetChallenge: () => void
  reset: () => void
}

const DEFAULT_CHALLENGE: BugHunterChallenge = {
  flawedCode: `// Sample debugging challenge
function calculateSum(numbers) {
  let sum = 0;
  for (let i = 0; i <= numbers.length; i++) { // Bug: off-by-one error
    sum += numbers[i];
  }
  return sum; // Bug: may return NaN due to undefined access
}

// Test the function
const testArray = [1, 2, 3, 4, 5];
console.log("Sum:", calculateSum(testArray));`,
  instructions: `Fix the bugs in the calculateSum function:
1. The function should correctly sum all numbers in an array
2. Handle edge cases like empty arrays
3. Ensure no runtime errors occur`,
  hints: [
    "Check the loop condition - are you accessing array elements correctly?",
    "Consider what happens when you access an array index that doesn't exist",
    "Think about the difference between array.length and the last valid index",
  ],
  testCases: [
    {
      description: "Sum of positive numbers",
      input: "[1, 2, 3, 4, 5]",
      expected: "15",
    },
    {
      description: "Empty array",
      input: "[]",
      expected: "0",
    },
    {
      description: "Single element",
      input: "[42]",
      expected: "42",
    },
  ],
}

const INITIAL_STATS: BugHunterStats = {
  totalChallenges: 0,
  solvedChallenges: 0,
  bugsFound: 0,
  averageTime: 0,
  successRate: 0,
}

export const useBugHunterStore = create<BugHunterState>((set, get) => ({
  // Initial State
  challenge: DEFAULT_CHALLENGE,
  userCode: DEFAULT_CHALLENGE.flawedCode,
  loading: false,
  error: null,
  videoId: "",
  transcript: "",
  testResults: [],
  isRunning: false,
  isSubmitting: false,
  showHints: false,
  currentHintIndex: 0,
  stats: INITIAL_STATS,
  challengeStartTime: null,
  bugsFound: [],

  // Actions
  setVideoId: (videoId) => {
    set({ videoId, error: null })
  },

  setUserCode: (code) => {
    set({ userCode: code })
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

  setShowHints: (show) => {
    set({ showHints: show })
  },

  setCurrentHintIndex: (index) => {
    set({ currentHintIndex: index })
  },

  addBugFound: (bug) => {
    const { bugsFound } = get()
    if (!bugsFound.includes(bug)) {
      set({ bugsFound: [...bugsFound, bug] })
    }
  },

  removeBugFound: (bug) => {
    const { bugsFound } = get()
    set({ bugsFound: bugsFound.filter((b) => b !== bug) })
  },

  startChallenge: () => {
    set({ challengeStartTime: Date.now() })
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

  runTests: async () => {
    const { userCode, challenge } = get()

    if (!challenge || !userCode.trim()) {
      return
    }

    set({ isRunning: true, testResults: [] })

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const testResults = await executeTestCases(userCode, challenge.testCases)
      set({ testResults, isRunning: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to run tests",
        isRunning: false,
      })
    }
  },

  submitSolution: async () => {
    const { userCode, challenge, challengeStartTime } = get()

    if (!challenge || !userCode.trim()) {
      return
    }

    set({ isSubmitting: true })

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const testResults = await executeTestCases(userCode, challenge.testCases)
      const allPassed = testResults.every((test) => test.passed)

      const timeSpent = challengeStartTime ? (Date.now() - challengeStartTime) / 1000 : 0

      // Update stats
      const { stats } = get()
      const newStats = {
        ...stats,
        totalChallenges: stats.totalChallenges + 1,
        solvedChallenges: allPassed ? stats.solvedChallenges + 1 : stats.solvedChallenges,
        averageTime: (stats.averageTime * stats.totalChallenges + timeSpent) / (stats.totalChallenges + 1),
        successRate:
          ((allPassed ? stats.solvedChallenges + 1 : stats.solvedChallenges) / (stats.totalChallenges + 1)) * 100,
      }

      set({
        testResults,
        isSubmitting: false,
        stats: newStats,
        error: allPassed ? null : "Some tests are still failing. Keep debugging!",
      })

      if (allPassed) {
        console.log("🎉 All tests passed! Challenge completed!")
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to submit solution",
        isSubmitting: false,
      })
    }
  },

  generateChallenge: async () => {
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

      // Step 2: Try to get challenge from API
      try {
        console.log("Step 3: Generating bug hunter challenge...")

        const response = await axios.post(
          `http://localhost:3000/api/v1/STEM/BugHunter`,
          { videoId },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 30000,
          },
        )

        if (response.data.success && response.data.challenge) {
          const challenge = response.data.challenge

          set({
            challenge: {
              flawedCode: challenge.flawedCode,
              instructions: challenge.instructions,
              hints: challenge.hints || [],
              testCases: challenge.testCases || [],
              videoId: response.data.videoId,
              transcriptLength: response.data.transcriptLength,
            },
            userCode: challenge.flawedCode,
            loading: false,
            error: null,
            bugsFound: [],
            currentHintIndex: 0,
            showHints: false,
          })
        } else {
          throw new Error("Invalid response format")
        }
      } catch (apiError) {
        console.log("API endpoint not available, generating dynamic challenge from transcript...")

        // Fallback: Generate dynamic challenge based on transcript content
        const dynamicChallenge = generateDynamicChallenge(transcriptText, videoId)

        set({
          challenge: dynamicChallenge,
          userCode: dynamicChallenge.flawedCode,
          loading: false,
          error: null,
          bugsFound: [],
          currentHintIndex: 0,
          showHints: false,
        })
      }

      get().startChallenge()
      console.log("Success! Challenge loaded")
    } catch (err: any) {
      console.error("Error in generateChallenge:", err)

      let errorMessage = "Failed to generate challenge. "

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

      // Even on error, generate a dynamic challenge from transcript if available
      const { transcript } = get()
      if (transcript) {
        const dynamicChallenge = generateDynamicChallenge(transcript, videoId)
        set({
          challenge: dynamicChallenge,
          userCode: dynamicChallenge.flawedCode,
          loading: false,
          error: null,
          bugsFound: [],
          currentHintIndex: 0,
          showHints: false,
        })
      } else {
        set({
          error: errorMessage,
          loading: false,
          challenge: DEFAULT_CHALLENGE,
          userCode: DEFAULT_CHALLENGE.flawedCode,
        })
      }
    }
  },

  resetChallenge: () => {
    const { challenge } = get()
    if (challenge) {
      set({
        userCode: challenge.flawedCode,
        testResults: [],
        bugsFound: [],
        currentHintIndex: 0,
        showHints: false,
        challengeStartTime: null,
        error: null,
      })
    }
  },

  reset: () => {
    set({
      challenge: DEFAULT_CHALLENGE,
      userCode: DEFAULT_CHALLENGE.flawedCode,
      loading: false,
      error: null,
      videoId: "",
      transcript: "",
      testResults: [],
      isRunning: false,
      isSubmitting: false,
      showHints: false,
      currentHintIndex: 0,
      stats: INITIAL_STATS,
      challengeStartTime: null,
      bugsFound: [],
    })
  },
}))

// Dynamic challenge generator based on transcript content
const generateDynamicChallenge = (transcript: string, videoId: string): BugHunterChallenge => {
  const lowerTranscript = transcript.toLowerCase()

  // Analyze transcript for programming concepts
  const concepts = {
    sorting:
      lowerTranscript.includes("sort") ||
      lowerTranscript.includes("quicksort") ||
      lowerTranscript.includes("mergesort") ||
      lowerTranscript.includes("bubblesort"),
    arrays:
      lowerTranscript.includes("array") || lowerTranscript.includes("list") || lowerTranscript.includes("element"),
    loops:
      lowerTranscript.includes("loop") ||
      lowerTranscript.includes("for") ||
      lowerTranscript.includes("while") ||
      lowerTranscript.includes("iteration"),
    recursion:
      lowerTranscript.includes("recursion") ||
      lowerTranscript.includes("recursive") ||
      lowerTranscript.includes("call itself"),
    searching:
      lowerTranscript.includes("search") ||
      lowerTranscript.includes("find") ||
      lowerTranscript.includes("binary search"),
    dataStructures:
      lowerTranscript.includes("stack") ||
      lowerTranscript.includes("queue") ||
      lowerTranscript.includes("tree") ||
      lowerTranscript.includes("linked list"),
    algorithms:
      lowerTranscript.includes("algorithm") ||
      lowerTranscript.includes("complexity") ||
      lowerTranscript.includes("time complexity"),
    strings:
      lowerTranscript.includes("string") || lowerTranscript.includes("text") || lowerTranscript.includes("character"),
    math:
      lowerTranscript.includes("math") ||
      lowerTranscript.includes("calculation") ||
      lowerTranscript.includes("sum") ||
      lowerTranscript.includes("average"),
  }

  // Generate challenge based on detected 
  if (concepts.sorting) {
    return generateSortingChallenge(transcript, videoId)
  } else if (concepts.recursion) {
    return generateRecursionChallenge(transcript, videoId)
  } else if (concepts.searching) {
    return generateSearchingChallenge(transcript, videoId)
  } else if (concepts.arrays) {
    return generateArrayChallenge(transcript, videoId)
  } else if (concepts.strings) {
    return generateStringChallenge(transcript, videoId)
  } else if (concepts.math) {
    return generateMathChallenge(transcript, videoId)
  } else {
    return generateGenericChallenge(transcript, videoId)
  }
}

const generateSortingChallenge = (transcript: string, videoId: string): BugHunterChallenge => {
  const isQuickSort = transcript.toLowerCase().includes("quicksort") || transcript.toLowerCase().includes("quick sort")

  if (isQuickSort) {
    return {
      flawedCode: `// Flawed QuickSort implementation based on video content
function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    // Bug 1: Incorrect partition call
    let pi = partition(arr, low, high + 1); // Off-by-one error
    
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  let pivot = arr[high]; // Bug 2: May access undefined when high is out of bounds
  let i = low - 1;
  
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      // Bug 3: Missing swap operation
      let temp = arr[i];
      arr[i] = arr[j];
      // arr[j] = temp; // This line is commented out - missing swap completion
    }
  }
  
  // Bug 4: Incorrect final swap
  arr[i + 1] = arr[high];
  arr[high] = arr[i]; // Should be arr[i + 1]
  
  return i + 1;
}

// Test the sorting function
const testArray = [64, 34, 25, 12, 22, 11, 90];
console.log("Original:", testArray);
console.log("Sorted:", quickSort([...testArray]));`,

      instructions: `Fix the bugs in this QuickSort implementation based on the video content:

1. The partition function has boundary issues that cause incorrect sorting
2. There are incomplete swap operations in the partitioning logic  
3. The recursive calls may access array elements out of bounds
4. The final pivot placement is incorrect

Your goal is to make the QuickSort algorithm work correctly for all test cases.`,

      hints: [
        "Check the partition function call - are you passing the correct high index?",
        "Look at the swap operations in the partition function - is the swap complete?",
        "Verify the final pivot placement in the partition function",
        "Make sure array bounds are respected in all operations",
      ],

      testCases: [
        {
          description: "Sort array of positive numbers",
          input: "[64, 34, 25, 12, 22, 11, 90]",
          expected: "[11,12,22,25,34,64,90]",
        },
        {
          description: "Sort array with duplicates",
          input: "[5, 2, 8, 2, 9, 1, 5]",
          expected: "[1,2,2,5,5,8,9]",
        },
        {
          description: "Sort single element",
          input: "[42]",
          expected: "[42]",
        },
        {
          description: "Sort empty array",
          input: "[]",
          expected: "[]",
        },
      ],

      videoId,
      transcriptLength: transcript.length,
    }
  } else {
    // Generic sorting challenge
    return {
      flawedCode: `// Flawed sorting implementation
function bubbleSort(arr) {
  let n = arr.length;
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i; j++) { // Bug: should be n - i - 1
      if (arr[j] > arr[j + 1]) { // Bug: may access undefined
        // Bug: incomplete swap
        let temp = arr[j];
        arr[j] = arr[j + 1];
        // arr[j + 1] = temp; // Missing line
      }
    }
  }
  return arr;
}

const testArray = [64, 34, 25, 12, 22, 11, 90];
console.log("Sorted:", bubbleSort([...testArray]));`,

      instructions: `Fix the bugs in this sorting algorithm based on the video content:

1. The inner loop has incorrect bounds causing array access errors
2. The swap operation is incomplete
3. Edge cases are not handled properly

Make the sorting algorithm work correctly for all inputs.`,

      hints: [
        "Check the inner loop condition - what should n - i be?",
        "Complete the swap operation in the inner loop",
        "Consider what happens when accessing arr[j + 1]",
      ],

      testCases: [
        {
          description: "Sort positive numbers",
          input: "[64, 34, 25, 12, 22, 11, 90]",
          expected: "[11,12,22,25,34,64,90]",
        },
        {
          description: "Sort with duplicates",
          input: "[3, 1, 4, 1, 5]",
          expected: "[1,1,3,4,5]",
        },
        {
          description: "Single element",
          input: "[1]",
          expected: "[1]",
        },
      ],

      videoId,
      transcriptLength: transcript.length,
    }
  }
}

const generateRecursionChallenge = (transcript: string, videoId: string): BugHunterChallenge => {
  return {
    flawedCode: `// Flawed recursive function based on video content
function factorial(n) {
  // Bug 1: Missing base case check
  if (n == 1) { // Bug 2: Should handle n <= 1, and use === for comparison
    return 1;
  }
  
  // Bug 3: Incorrect recursive call
  return n * factorial(n); // Should be factorial(n - 1)
}

function fibonacci(n) {
  if (n <= 1) {
    return n;
  }
  
  // Bug 4: Inefficient and potentially incorrect
  return fibonacci(n - 1) + fibonacci(n - 2) + 1; // Extra +1 is wrong
}

// Test functions
console.log("Factorial of 5:", factorial(5));
console.log("Fibonacci of 6:", fibonacci(6));`,

    instructions: `Fix the bugs in these recursive functions based on the video content:

1. The factorial function has an infinite recursion issue
2. Base cases are not properly handled
3. The fibonacci function has incorrect calculation
4. Edge cases like n = 0 need proper handling

Make both recursive functions work correctly.`,

    hints: [
      "Check the recursive call in factorial - what should change in each call?",
      "Look at the base case conditions - are they comprehensive enough?",
      "The fibonacci calculation has an extra operation that shouldn't be there",
      "Consider what happens when n = 0 in factorial",
    ],

    testCases: [
      {
        description: "Factorial of 5",
        input: "5",
        expected: "120",
      },
      {
        description: "Factorial of 0",
        input: "0",
        expected: "1",
      },
      {
        description: "Fibonacci of 6",
        input: "6",
        expected: "8",
      },
    ],

    videoId,
    transcriptLength: transcript.length,
  }
}

const generateSearchingChallenge = (transcript: string, videoId: string): BugHunterChallenge => {
  return {
    flawedCode: `// Flawed binary search implementation
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length; // Bug 1: Should be arr.length - 1
  
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid; // Bug 2: Should be mid + 1
    } else {
      right = mid; // Bug 3: Should be mid - 1  
    }
  }
  
  return -1; // Not found
}

// Linear search with bugs
function linearSearch(arr, target) {
  for (let i = 0; i <= arr.length; i++) { // Bug 4: Should be < arr.length
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}

const sortedArray = [1, 3, 5, 7, 9, 11, 13, 15];
console.log("Binary search for 7:", binarySearch(sortedArray, 7));
console.log("Linear search for 9:", linearSearch(sortedArray, 9));`,

    instructions: `Fix the bugs in these search algorithms based on the video content:

1. Binary search has incorrect boundary conditions causing infinite loops
2. The search space is not being reduced properly in each iteration
3. Linear search has array bounds issues
4. Edge cases are not handled correctly

Make both search algorithms work correctly.`,

    hints: [
      "Check the initial value of 'right' in binary search",
      "Look at how left and right are updated - are you reducing the search space?",
      "The loop condition in linear search may cause array access errors",
      "Consider what happens when the target is not in the array",
    ],

    testCases: [
      {
        description: "Binary search - find existing element",
        input: "[[1,3,5,7,9,11,13,15], 7]",
        expected: "3",
      },
      {
        description: "Binary search - element not found",
        input: "[[1,3,5,7,9,11,13,15], 6]",
        expected: "-1",
      },
      {
        description: "Linear search - find element",
        input: "[[1,3,5,7,9,11,13,15], 9]",
        expected: "4",
      },
    ],

    videoId,
    transcriptLength: transcript.length,
  }
}

const generateArrayChallenge = (transcript: string, videoId: string): BugHunterChallenge => {
  return {
    flawedCode: `// Flawed array manipulation functions
function findMaxElement(arr) {
  if (arr.length === 0) {
    return null;
  }
  
  let max = arr[0];
  for (let i = 1; i <= arr.length; i++) { // Bug 1: Should be < arr.length
    if (arr[i] > max) { // Bug 2: May access undefined
      max = arr[i];
    }
  }
  return max;
}

function reverseArray(arr) {
  let left = 0;
  let right = arr.length; // Bug 3: Should be arr.length - 1
  
  while (left < right) {
    // Bug 4: Incomplete swap
    let temp = arr[left];
    arr[left] = arr[right];
    // arr[right] = temp; // Missing line
    
    left++;
    right--;
  }
  return arr;
}

function removeDuplicates(arr) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    // Bug 5: Inefficient and incorrect logic
    if (result.indexOf(arr[i]) === -1) {
      result.push(arr[i]);
    }
  }
  return result;
}

const testArray = [3, 1, 4, 1, 5, 9, 2, 6, 5];
console.log("Max element:", findMaxElement(testArray));
console.log("Reversed:", reverseArray([...testArray]));
console.log("No duplicates:", removeDuplicates(testArray));`,

    instructions: `Fix the bugs in these array manipulation functions based on the video content:

1. Array bounds are not properly checked causing undefined access
2. Swap operations are incomplete
3. Loop conditions have off-by-one errors
4. Edge cases like empty arrays need proper handling

Make all array functions work correctly.`,

    hints: [
      "Check loop bounds - when do you access arr[i]?",
      "Complete all swap operations with proper temporary variable usage",
      "Verify the initial values of left and right pointers",
      "Consider what happens with empty or single-element arrays",
    ],

    testCases: [
      {
        description: "Find max in array",
        input: "[3, 1, 4, 1, 5, 9, 2, 6, 5]",
        expected: "9",
      },
      {
        description: "Reverse array",
        input: "[1, 2, 3, 4, 5]",
        expected: "[5,4,3,2,1]",
      },
      {
        description: "Remove duplicates",
        input: "[1, 2, 2, 3, 3, 3, 4]",
        expected: "[1,2,3,4]",
      },
    ],

    videoId,
    transcriptLength: transcript.length,
  }
}

const generateStringChallenge = (transcript: string, videoId: string): BugHunterChallenge => {
  return {
    flawedCode: `// Flawed string manipulation functions
function isPalindrome(str) {
  let left = 0;
  let right = str.length; // Bug 1: Should be str.length - 1
  
  while (left < right) {
    if (str[left] !== str[right]) {
      return false;
    }
    left++;
    right--; // Bug 2: This will cause incorrect comparison
  }
  return true;
}

function reverseString(str) {
  let result = "";
  for (let i = str.length; i >= 0; i--) { // Bug 3: Should start from str.length - 1
    result += str[i]; // Bug 4: May access undefined
  }
  return result;
}

function countVowels(str) {
  let count = 0;
  let vowels = "aeiou";
  
  for (let i = 0; i < str.length; i++) {
    // Bug 5: Case sensitivity not handled
    if (vowels.includes(str[i])) {
      count++;
    }
  }
  return count;
}

const testString = "racecar";
console.log("Is palindrome:", isPalindrome(testString));
console.log("Reversed:", reverseString("hello"));
console.log("Vowel count:", countVowels("Hello World"));`,

    instructions: `Fix the bugs in these string manipulation functions based on the video content:

1. String indexing has off-by-one errors
2. Palindrome checking logic is incorrect
3. Case sensitivity is not properly handled
4. Boundary conditions cause undefined access

Make all string functions work correctly.`,

    hints: [
      "Check string indexing - what's the last valid index?",
      "In palindrome check, make sure you're comparing the right characters",
      "Consider case sensitivity when comparing characters",
      "Verify loop bounds to avoid accessing undefined characters",
    ],

    testCases: [
      {
        description: "Check palindrome",
        input: '"racecar"',
        expected: "true",
      },
      {
        description: "Reverse string",
        input: '"hello"',
        expected: '"olleh"',
      },
      {
        description: "Count vowels",
        input: '"Hello World"',
        expected: "3",
      },
    ],

    videoId,
    transcriptLength: transcript.length,
  }
}

const generateMathChallenge = (transcript: string, videoId: string): BugHunterChallenge => {
  return {
    flawedCode: `// Flawed mathematical functions
function calculateAverage(numbers) {
  if (numbers.length === 0) {
    return 0;
  }
  
  let sum = 0;
  for (let i = 0; i <= numbers.length; i++) { // Bug 1: Should be < numbers.length
    sum += numbers[i]; // Bug 2: May add undefined
  }
  
  return sum / numbers.length;
}

function isPrime(n) {
  if (n <= 1) {
    return false;
  }
  
  for (let i = 2; i < n; i++) { // Bug 3: Inefficient, should be i * i <= n
    if (n % i === 0) {
      return false;
    }
  }
  return true;
}

function gcd(a, b) {
  while (b !== 0) {
    let temp = b;
    b = a % b;
    a = temp;
  }
  return a; // Bug 4: Should handle negative numbers
}

const numbers = [10, 20, 30, 40, 50];
console.log("Average:", calculateAverage(numbers));
console.log("Is 17 prime:", isPrime(17));
console.log("GCD of 48 and 18:", gcd(48, 18));`,

    instructions: `Fix the bugs in these mathematical functions based on the video content:

1. Array iteration has boundary issues causing undefined operations
2. Prime checking algorithm is inefficient and may have edge cases
3. Mathematical operations don't handle edge cases properly
4. Some algorithms can be optimized for better performance

Make all mathematical functions work correctly and efficiently.`,

    hints: [
      "Check array bounds in the average calculation",
      "Optimize the prime checking algorithm - you don't need to check all numbers",
      "Consider edge cases like negative numbers in GCD",
      "Make sure you're not adding undefined values to sums",
    ],

    testCases: [
      {
        description: "Calculate average",
        input: "[10, 20, 30, 40, 50]",
        expected: "30",
      },
      {
        description: "Check if prime",
        input: "17",
        expected: "true",
      },
      {
        description: "Find GCD",
        input: "[48, 18]",
        expected: "6",
      },
    ],

    videoId,
    transcriptLength: transcript.length,
  }
}

const generateGenericChallenge = (transcript: string, videoId: string): BugHunterChallenge => {
  return {
    flawedCode: `// Generic programming challenge based on video content
function processData(data) {
  if (!data || data.length === 0) {
    return [];
  }
  
  let result = [];
  for (let i = 0; i <= data.length; i++) { // Bug 1: Off-by-one error
    if (data[i] !== undefined) { // Bug 2: This check doesn't prevent the error
      result.push(data[i] * 2); // Bug 3: May push undefined * 2 = NaN
    }
  }
  
  return result;
}

function validateInput(input) {
  // Bug 4: Incomplete validation
  if (input === null) {
    return false;
  }
  
  return true; // Bug 5: Should check for undefined, empty strings, etc.
}

function transformArray(arr, callback) {
  let transformed = [];
  
  for (let i = 0; i < arr.length; i++) {
    // Bug 6: No error handling for callback
    transformed.push(callback(arr[i]));
  }
  
  return transformed;
}

const testData = [1, 2, 3, 4, 5];
console.log("Processed:", processData(testData));
console.log("Valid input:", validateInput("test"));
console.log("Transformed:", transformArray(testData, x => x * x));`,

    instructions: `Fix the bugs in this generic programming challenge based on the video content:

1. Array iteration has boundary issues
2. Input validation is incomplete
3. Error handling is missing for callback functions
4. Edge cases are not properly handled

Make the code robust and handle all edge cases correctly.`,

    hints: [
      "Check the loop condition - when should you stop iterating?",
      "Improve input validation to handle more edge cases",
      "Add error handling for callback function execution",
      "Consider what happens with different types of invalid input",
    ],

    testCases: [
      {
        description: "Process valid data",
        input: "[1, 2, 3, 4, 5]",
        expected: "[2,4,6,8,10]",
      },
      {
        description: "Process empty array",
        input: "[]",
        expected: "[]",
      },
      {
        description: "Validate good input",
        input: '"test"',
        expected: "true",
      },
    ],

    videoId,
    transcriptLength: transcript.length,
  }
}

// Helper function to execute test cases dynamically
const executeTestCases = async (code: string, testCases: TestCase[]): Promise<TestCase[]> => {
  const results: TestCase[] = []

  for (const testCase of testCases) {
    try {
      const result = await executeTestCase(code, testCase)
      results.push(result)
    } catch (error) {
      results.push({
        ...testCase,
        actual: "Error: " + (error instanceof Error ? error.message : "Unknown error"),
        passed: false,
      })
    }
  }

  return results
}

const executeTestCase = async (code: string, testCase: TestCase): Promise<TestCase> => {
  return new Promise((resolve) => {
    try {
      // Create a safe execution environment with console capture
      const consoleOutput: string[] = []

      const safeExecute = new Function(
        "consoleOutput",
        `
        // Mock console to capture output
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
          }
        };
        
        try {
          // Execute the user's code
          ${code}
          
          // Parse and execute the test case dynamically
          const testInput = ${JSON.stringify(testCase.input)};
          const testExpected = ${JSON.stringify(testCase.expected)};
          
          // Try to dynamically execute based on the input format
          let result = executeTestCaseDynamically(testInput, testExpected);
          
          return { 
            success: true, 
            result: result,
            consoleOutput: consoleOutput 
          };
          
        } catch (error) {
          return { 
            success: false, 
            error: error.message,
            consoleOutput: consoleOutput 
          };
        }
        
        // Dynamic test case execution function
        function executeTestCaseDynamically(input, expected) {
          try {
            // Try to parse input as JavaScript code/expression
            let parsedInput;
            
            // Handle different input formats
            if (typeof input === 'string') {
              // Remove backticks if present
              const cleanInput = input.replace(/\`/g, '');
              
              // Try to evaluate as JavaScript expression
              try {
                // Handle array inputs like "arr = [1,2,3], target = 5"
                if (cleanInput.includes('=')) {
                  const assignments = cleanInput.split(',').map(s => s.trim());
                  const variables = {};
                  
                  assignments.forEach(assignment => {
                    const [varName, varValue] = assignment.split('=').map(s => s.trim());
                    try {
                      variables[varName] = eval(varValue);
                    } catch (e) {
                      variables[varName] = varValue;
                    }
                  });
                  
                  parsedInput = variables;
                } else {
                  // Try to evaluate as direct expression
                  parsedInput = eval('(' + cleanInput + ')');
                }
              } catch (e) {
                // If evaluation fails, use as string
                parsedInput = cleanInput;
              }
            } else {
              parsedInput = input;
            }
            
            // Try to find and execute functions dynamically
            const functionNames = [];
            const codeLines = \`${code}\`.split('\\n');
            
            // Extract function names from the code
            codeLines.forEach(line => {
              const functionMatch = line.match(/function\\s+(\\w+)\\s*\\(/);
              if (functionMatch) {
                functionNames.push(functionMatch[1]);
              }
            });
            
            // Try to execute with detected functions
            for (const funcName of functionNames) {
              try {
                if (typeof eval('typeof ' + funcName) !== 'undefined' && typeof eval(funcName) === 'function') {
                  let result;
                  
                  if (typeof parsedInput === 'object' && parsedInput !== null) {
                    // Handle object inputs (like {arr: [1,2,3], target: 5})
                    if (Array.isArray(parsedInput)) {
                      result = eval(funcName)(...parsedInput);
                    } else if (parsedInput.arr !== undefined) {
                      // Handle cases like {arr: [1,2,3], target: 5}
                      const args = Object.values(parsedInput);
                      result = eval(funcName)(...args);
                    } else {
                      // Handle other object formats
                      const values = Object.values(parsedInput);
                      if (values.length === 1) {
                        result = eval(funcName)(values[0]);
                      } else {
                        result = eval(funcName)(...values);
                      }
                    }
                  } else {
                    // Handle primitive inputs
                    result = eval(funcName)(parsedInput);
                  }
                  
                  return result;
                }
              } catch (e) {
                // Function execution failed, try next function
                continue;
              }
            }
            
            // If no function worked, return undefined
            return undefined;
            
          } catch (error) {
            throw new Error('Test execution failed: ' + error.message);
          }
        }
        `,
      )

      const execution = safeExecute(consoleOutput)

      if (execution.success) {
        const actual = formatResult(execution.result)
        const expected = testCase.expected.replace(/`/g, "").trim()

        // Dynamic comparison based on expected format
        const passed = compareResults(actual, expected, testCase.description)

        resolve({
          ...testCase,
          actual,
          passed,
        })
      } else {
        resolve({
          ...testCase,
          actual: "Error: " + execution.error,
          passed: false,
        })
      }
    } catch (error) {
      resolve({
        ...testCase,
        actual: "Error: " + (error instanceof Error ? error.message : "Unknown error"),
        passed: false,
      })
    }
  })
}

// Helper function to format results consistently
const formatResult = (result: any): string => {
  if (result === null) return "null"
  if (result === undefined) return "undefined"
  if (Array.isArray(result)) return JSON.stringify(result)
  if (typeof result === "object") return JSON.stringify(result)
  return String(result)
}

// Helper function to compare results dynamically
const compareResults = (actual: string, expected: string, description: string): boolean => {
  // Handle special cases based on description
  if (description.toLowerCase().includes("duplicate") && description.toLowerCase().includes("index")) {
    // For cases where multiple valid answers exist (like finding index of duplicate)
    const actualNum = Number.parseInt(actual)
    const expectedNums = expected.match(/\d+/g)?.map((n) => Number.parseInt(n)) || []
    return expectedNums.includes(actualNum)
  }

  // Try JSON comparison for arrays/objects
  try {
    const actualParsed = JSON.parse(actual)
    const expectedParsed = JSON.parse(expected)
    return JSON.stringify(actualParsed) === JSON.stringify(expectedParsed)
  } catch (e) {
    // Fall back to string comparison
    return actual.trim() === expected.trim()
  }
}
