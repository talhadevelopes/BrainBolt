const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { ApifyClient } = require("apify-client");
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();

const UserModel = require("../../models/UsersSchema");
app.use(express.json());
app.use(cors());

const STEMROuter = express.Router();

const MONGOOSE_URL = process.env.MONGO_URL;
const KEY1 = process.env.KEY1;
const KEY2 = process.env.KEY2;
const KEY3 = process.env.KEY3;

// Initialize Apify client
const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

// In-memory transcript cache
const transcriptCache = new Map();
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

// Helper function to get transcript using Apify
async function getTranscript(videoId) {
  // Check cache first
  if (transcriptCache.has(videoId)) {
    const cached = transcriptCache.get(videoId);
    if (Date.now() - cached.timestamp < CACHE_EXPIRY) {
      console.log(`Using cached transcript for video: ${videoId}`);
      return {
        transcriptText: cached.transcriptText,
        fullTranscript: cached.fullTranscript
      };
    }
    // Remove expired entry
    transcriptCache.delete(videoId);
  }

  try {
    console.log(`Fetching new transcript with Apify for video: ${videoId}`);
    
    // Run Apify actor
    const input = {
      video_url: `https://www.youtube.com/watch?v=${videoId}`,
    };

    const run = await apifyClient.actor("invideoiq/video-transcript-scraper").call(input);
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
      throw new Error("Transcript not available for this video");
    }

    // Format transcript
    const transcriptText = items.map(item => item.text).join(" ");
    const fullTranscript = items.map(item => ({
      text: item.text,
      start: item.start,
      duration: item.duration
    }));

    // Cache the result
    transcriptCache.set(videoId, {
      transcriptText,
      fullTranscript,
      timestamp: Date.now()
    });

    return { transcriptText, fullTranscript };
    
  } catch (error) {
    console.error(`Apify fetch failed for ${videoId}:`, error);
    throw error;
  }
}

// Helper function to clear cache (optional)
function clearTranscriptCache(videoId = null) {
  if (videoId) {
    transcriptCache.delete(videoId);
    console.log(`Cleared cache for video: ${videoId}`);
  } else {
    transcriptCache.clear();
    console.log('Cleared entire transcript cache');
  }
}

// Helper function to get cache stats (optional)
function getCacheStats() {
  return {
    size: transcriptCache.size,
    videos: Array.from(transcriptCache.keys()),
    memoryUsage: process.memoryUsage()
  };
}





STEMROuter.get("/Health", (req, res) => {
  res.json({
    msg: "Everything Works fine till now",
    cacheStats: getCacheStats()
  });
});

// Cache management endpoints (optional)
STEMROuter.post("/ClearCache", (req, res) => {
  const { videoId } = req.body;
  clearTranscriptCache(videoId);
  res.json({ success: true, message: videoId ? `Cache cleared for ${videoId}` : 'All cache cleared' });
});

STEMROuter.get("/Transcript", async (req, res) => {
  try {
    const { videoId } = req.query;
    
    // Validate video ID format
    if (!videoId || !videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
      return res.status(400).json({
        error: "Invalid YouTube video ID. Must be 11 characters (e.g., dQw4w9WgXcQ)"
      });
    }

    const { transcriptText, fullTranscript } = await getTranscript(videoId);

    res.status(200).json({
      success: true,
      transcript: transcriptText,
      fullTranscript: fullTranscript,
      cacheInfo: transcriptCache.has(videoId) ? "Cached" : "Fresh"
    });
    
  } catch (error) {
    console.error("Transcript Error:", error);
    
    // Handle specific error types
    if (error.message.includes("Transcript not available")) {
      return res.status(404).json({
        error: "Transcript not available for this video",
        possibleReasons: [
          "Transcripts disabled by creator",
          "Video is private or age-restricted",
          "Live stream or music content"
        ]
      });
    }
    
    if (error.message.includes("ENOTFOUND") || error.message.includes("EAI_AGAIN")) {
      return res.status(503).json({
        error: "Network error - cannot access YouTube",
        solution: "Check server internet connection and DNS settings"
      });
    }
    
    res.status(500).json({
      error: "Failed to fetch transcript",
      details: error.message
    });
  }
});

STEMROuter.get("/CacheStats", (req, res) => {
  res.json(getCacheStats());
});

STEMROuter.post("/Signup", async (req, res) => {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const User = new UserModel({ username, email, password: hashedPassword });
    await User.save();

    res.status(200).json({
      msg: "Signup ready",
      username,
      email,
      objectid: User._id,
    });
  } catch (err) {
    res.status(500).json({
      Msg: "Something went wrong",
      error: err,
    });
  }
});

STEMROuter.post("/Login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

//THEORY MASTER START

STEMROuter.post("/Summary", async (req, res) => {
  try {
    const { videoId } = req.body;
    
    // Get transcript object
    const transcriptResult = await getTranscript(videoId);
    
    // Extract the text property
    const transcriptText = transcriptResult.transcriptText;

    const genAI = new GoogleGenerativeAI(KEY1);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Provide a concise 200-word summary of this video transcript:\n\n${transcriptText}`;
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    const result = await model.generateContent(prompt, {
      timeout: 30000  // Gemini API timeout
    });
    
    clearTimeout(timeout);
    
    const summary = (await result.response).text();

    res.status(200).json({ 
      success: true, 
      summary,
      videoId,
      transcriptLength: transcriptText.length
    });
    
  } catch (error) {
    console.error("Summary error:", error);
    
    let statusCode = 500;
    let errorMessage = "Failed to generate summary";
    
    if (error.message.includes("transcript not available")) {
      statusCode = 404;
      errorMessage = "Transcript unavailable for this video";
    }
    else if (error.name === "AbortError" || error.message.includes("timeout")) {
      statusCode = 504;
      errorMessage = "Summary generation timed out";
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

STEMROuter.post("/SummaryMain", async (req, res) => {
  try {
    const { videoId } = req.body;
    
    // Get transcript object
    const transcriptResult = await getTranscript(videoId);
    
    // Extract text property
    const transcriptText = transcriptResult.transcriptText;

    // Validate transcript exists
    if (!transcriptText || transcriptText.length < 100) {
      throw new Error("Transcript too short for analysis");
    }

    const genAI = new GoogleGenerativeAI(KEY1);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Truncate transcript if too long
    const maxLength = 30000;
    const truncatedText = transcriptText.length > maxLength 
      ? transcriptText.substring(0, maxLength) + "... [truncated]" 
      : transcriptText;

    const prompt = `Analyze this video transcript and format the response EXACTLY like this:
    """
    Title: [Generated Course Title]
    Duration: [HH:MM:SS]
    Topics: [Number] Topics
    Points: [Number] Total Points
    ---
    KEY TOPICS:
    - [Topic 1]
    - [Topic 2]
    - [Topic...]
    """
    
    Requirements:
    1. Create a concise 5-7 word course title
    2. Convert total video length to HH:MM:SS
    3. Count distinct main topics
    4. Generate points between 150-300 if not specified
    5. List key topics as bullet points
    
    Transcript: ${truncatedText}`;

    const result = await model.generateContent(prompt);
    const rawOutput = (await result.response).text();

    // Parse components with improved regex patterns
    const parseSection = (text, pattern) => {
      const match = text.match(pattern);
      return match ? match[1].trim() : null;
    };
    
    const title = parseSection(rawOutput, /Title:\s*([^\n]+)/i);
    const duration = parseSection(rawOutput, /Duration:\s*([\d:]+)/i);
    const topics = parseSection(rawOutput, /Topics:\s*(\d+)\s*Topics?/i);
    const points = parseSection(rawOutput, /Points:\s*(\d+)\s*Points?/i);

    // Generate random points if not found (150-300 range)
    const randomPoints = Math.floor(Math.random() * 151) + 150; // 150-300
    
    // Parse key topics with more robust extraction
    const topicsSection = rawOutput.split('KEY TOPICS:')[1] || '';
    const keyTopics = topicsSection.split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(topic => topic.length > 0);

    // Fallback title from first meaningful words
    const firstWords = transcriptText.replace(/\s+/g, ' ').trim().split(' ');
    const fallbackTitle = firstWords.slice(0, 5).join(' ') + '...';

    // Format duration properly
    const formattedDuration = duration && /^\d+:\d{2}:\d{2}$/.test(duration) 
      ? duration 
      : "00:00:00";

    res.status(200).json({
      success: true,
      title: title || fallbackTitle,
      duration: formattedDuration,
      topics: topics || String(keyTopics.length || 0),
      points: points || String(randomPoints),
      keyTopics: keyTopics.length > 0 ? keyTopics : ["No key topics identified"],
      transcriptLength: transcriptText.length
    });

  } catch (error) {
    console.error("SummaryMain error:", error);
    
    const statusCode = error.message.includes("transcript") ? 404 : 500;
    const errorMessage = error.message.includes("transcript") 
      ? "Transcript unavailable or too short" 
      : "Analysis generation failed";
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

STEMROuter.post("/SummarySubPoints", async (req, res) => {
  try {
    const { videoId } = req.body;
    
    // Get transcript object
    const transcriptResult = await getTranscript(videoId);
    
    // Extract text property
    const transcriptText = transcriptResult.transcriptText;

    // Validate transcript exists
    if (!transcriptText || transcriptText.length < 100) {
      throw new Error("Transcript too short for section analysis");
    }

    const genAI = new GoogleGenerativeAI(KEY1);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Truncate transcript if too long
    const maxLength = 30000;
    const truncatedText = transcriptText.length > maxLength 
      ? transcriptText.substring(0, maxLength) + "... [truncated]" 
      : transcriptText;

    const prompt = `Analyze this video transcript and generate 3-5 important sections with:
    1. Timestamp (HH:MM:SS)
    2. Section title (5-7 words)
    3. Subtitle (short phrase)
    4. 20-30 word summary
    5. 3 bullet point tips
    Format each section EXACTLY like this:
    """
    [HH:MM:SS]
    Title: [Section Title]
    Subtitle: [Descriptive Subtitle]
    Summary: [Concise summary]
    Tips:
    - [Practical tip 1]
    - [Practical tip 2]
    - [Practical tip 3]
    """
    Transcript: ${truncatedText}`;

    const result = await model.generateContent(prompt);
    const rawOutput = (await result.response).text();

    // Enhanced parsing logic with better section detection
    const sectionSeparator = '"""';
    const sections = rawOutput.split(sectionSeparator)
      .map(section => section.trim())
      .filter(section => section.length > 0 && !section.startsWith("Transcript:"));

    const subPoints = [];

    for (const section of sections) {
      const lines = section.split('\n').map(line => line.trim()).filter(line => line);
      
      // Skip empty sections
      if (lines.length < 5) continue;

      const entry = {
        timestamp: null,
        title: null,
        subtitle: null,
        summary: null,
        tips: []
      };

      // First line should be timestamp
      const timestampMatch = lines[0].match(/(\d{1,2}:\d{2}:\d{2})/);
      if (timestampMatch) {
        entry.timestamp = timestampMatch[1];
      }

      // Process remaining lines
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.startsWith('Title:')) {
          entry.title = line.replace('Title:', '').trim();
        } else if (line.startsWith('Subtitle:')) {
          entry.subtitle = line.replace('Subtitle:', '').trim();
        } else if (line.startsWith('Summary:')) {
          entry.summary = line.replace('Summary:', '').trim();
        } else if (line.startsWith('-')) {
          entry.tips.push(line.replace(/^-/, '').trim());
        }
      }

      // Validate and add section
      if (entry.timestamp && entry.title && entry.tips.length >= 3) {
        subPoints.push({
          timestamp: entry.timestamp,
          title: entry.title,
          subtitle: entry.subtitle || "Key Concepts",
          summary: entry.summary || "Essential insights from this section",
          tips: entry.tips.slice(0, 3)
        });
      }
    }

    // Fallback if no sections parsed
    if (subPoints.length === 0) {
      // Create a single section using the beginning of the transcript
      const firstWords = transcriptText.split(/\s+/).slice(0, 20).join(' ');
      subPoints.push({
        timestamp: "00:00:00",
        title: "Introduction",
        subtitle: "Video Overview",
        summary: firstWords + (firstWords.length < transcriptText.length ? "..." : ""),
        tips: [
          "Pay attention to key concepts",
          "Take notes on important points",
          "Review difficult sections"
        ]
      });
    }

    res.status(200).json({
      success: true,
      subPoints,
      sectionCount: subPoints.length,
      transcriptLength: transcriptText.length
    });

  } catch (error) {
    console.error("SubPoints error:", error);
    
    const statusCode = error.message.includes("transcript") ? 404 : 500;
    const errorMessage = error.message.includes("transcript") 
      ? "Transcript unavailable or too short" 
      : "Failed to generate section points";
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

//CODE DOJO

STEMROuter.post("/CodeDojoEasy", async (req, res) => {
  try {
    const { videoId } = req.body;
    
    // Get transcript object
    const transcriptResult = await getTranscript(videoId);
    
    // Extract text property
    const transcriptText = transcriptResult.transcriptText;

    // Validate transcript exists
    if (!transcriptText || transcriptText.length < 100) {
      throw new Error("Transcript too short to generate coding problems");
    }

    const genAI = new GoogleGenerativeAI(KEY2);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Truncate transcript if too long
    const maxLength = 30000;
    const truncatedText = transcriptText.length > maxLength 
      ? transcriptText.substring(0, maxLength) + "... [truncated]" 
      : transcriptText;

    const prompt = `Generate 3 beginner-friendly coding problems based on this transcript.
    For each problem include:
    1. Title
    2. Problem description
    3. Sample input/output
    4. Solution function
    Format EXACTLY like this:
    Problem 1:
    Title: [Problem Name]
    Description: [2-3 sentence challenge]
    Sample Input: [Example input]
    Sample Output: [Expected output]
    Solution:
    function exampleSolution(input) {
        // Implementation
    }
    
    Problem 2:
    ...
    
    Transcript: ${truncatedText}`;

    const result = await model.generateContent(prompt);
    const rawOutput = (await result.response).text();

    const easyProblems = [];
    // Split by "Problem X:" pattern
    const problemBlocks = rawOutput.split(/(Problem\s+\d+:)/i);
    
    let currentProblem = null;
    for (const block of problemBlocks) {
      if (block.match(/Problem\s+\d+:/i)) {
        if (currentProblem) easyProblems.push(currentProblem);
        currentProblem = {
          title: "",
          description: "",
          sampleInput: "",
          sampleOutput: "",
          solution: []
        };
      } else if (currentProblem) {
        const lines = block.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
          if (line.startsWith('Title:')) {
            currentProblem.title = line.replace('Title:', '').trim();
          } else if (line.startsWith('Description:')) {
            currentProblem.description = line.replace('Description:', '').trim();
          } else if (line.startsWith('Sample Input:')) {
            currentProblem.sampleInput = line.replace('Sample Input:', '').trim();
          } else if (line.startsWith('Sample Output:')) {
            currentProblem.sampleOutput = line.replace('Sample Output:', '').trim();
          } else if (line.includes('function') || line.includes('{') || line.trim().startsWith('//')) {
            currentProblem.solution.push(line.trim());
          }
        });
      }
    }
    if (currentProblem && currentProblem.title) {
      easyProblems.push(currentProblem);
    }

    // Format and validate problems
    const formattedProblems = easyProblems.slice(0, 3).map(problem => {
      return {
        title: problem.title || "Easy Coding Challenge",
        description: problem.description || "Solve this beginner programming problem",
        sampleInput: problem.sampleInput || "Test input",
        sampleOutput: problem.sampleOutput || "Expected output",
        solution: problem.solution.join('\n') || "// Solution code not generated"
      };
    });

    // Fallback if no problems generated
    if (formattedProblems.length === 0) {
      formattedProblems.push({
        title: "Array Sum",
        description: "Calculate the sum of elements in an array",
        sampleInput: "[1, 2, 3, 4]",
        sampleOutput: "10",
        solution: `function sumArray(arr) {
  return arr.reduce((total, num) => total + num, 0);
}`
      });
    }

    res.status(200).json({
      success: true,
      problems: formattedProblems,
      transcriptLength: transcriptText.length
    });

  } catch (error) {
    console.error("Easy problems error:", error);
    
    const statusCode = error.message.includes("transcript") ? 404 : 500;
    const errorMessage = error.message.includes("transcript") 
      ? "Transcript unavailable or too short" 
      : "Failed to generate coding problems";
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

STEMROuter.post("/CodeDojoMedium", async (req, res) => {
  try {
    const { videoId } = req.body;
    
    // Validate video ID format
    if (!videoId || !videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid YouTube video ID format",
        example: "dQw4w9WgXcQ"
      });
    }

    // Get transcript object
    const transcriptResult = await getTranscript(videoId);
    
    // Extract text property
    const transcriptText = transcriptResult.transcriptText;

    // Validate transcript exists
    if (!transcriptText || transcriptText.length < 100) {
      throw new Error("Transcript too short to generate medium problems");
    }

    const genAI = new GoogleGenerativeAI(KEY2);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Truncate transcript if too long
    const maxLength = 30000;
    const truncatedText = transcriptText.length > maxLength 
      ? transcriptText.substring(0, maxLength) + "... [truncated]" 
      : transcriptText;

    const prompt = `Generate 3 intermediate-level coding problems based on this transcript.
    Requirements:
    - Optimization challenges
    - Edge case handling
    - OOP or algorithms
    For each problem include:
    1. Title
    2. Problem description
    3. Sample input/output
    4. Solution implementation
    Format EXACTLY like this:
    
    Problem 1:
    Title: [Problem Name]
    Description: [Complex problem statement]
    Sample Input: [Challenging input]
    Sample Output: [Non-trivial output]
    Solution:
    class Solution {
        // Implementation
    }
    
    Problem 2:
    ...
    
    Transcript: ${truncatedText}`;

    const result = await model.generateContent(prompt);
    const rawOutput = (await result.response).text();

    // Enhanced parsing logic
    const mediumProblems = [];
    const problemBlocks = rawOutput.split(/(Problem\s+\d+:)/i);
    
    let currentProblem = null;
    for (const block of problemBlocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      
      if (block.match(/Problem\s+\d+:/i)) {
        if (currentProblem) mediumProblems.push(currentProblem);
        currentProblem = {
          title: "",
          description: "",
          sampleInput: "",
          sampleOutput: "",
          solution: []
        };
      } else if (currentProblem) {
        lines.forEach(line => {
          if (line.startsWith('Title:')) {
            currentProblem.title = line.replace('Title:', '').trim();
          } else if (line.startsWith('Description:')) {
            currentProblem.description = line.replace('Description:', '').trim();
          } else if (line.startsWith('Sample Input:')) {
            currentProblem.sampleInput = line.replace('Sample Input:', '').trim();
          } else if (line.startsWith('Sample Output:')) {
            currentProblem.sampleOutput = line.replace('Sample Output:', '').trim();
          } else if (line.includes('class') || line.includes('{') || 
                     line.includes('}') || line.trim().startsWith('//')) {
            currentProblem.solution.push(line.trim());
          }
        });
      }
    }
    
    if (currentProblem && currentProblem.title) {
      mediumProblems.push(currentProblem);
    }

    // Process solutions
    const formattedProblems = mediumProblems.slice(0, 3).map(p => {
      const solutionCode = p.solution.join('\n').trim();
      return {
        title: p.title || "Intermediate Challenge",
        description: p.description || "Solve this medium programming problem",
        sampleInput: p.sampleInput || "Complex input",
        sampleOutput: p.sampleOutput || "Expected output",
        solution: solutionCode || "// Solution code not generated"
      };
    });

    // Fallback if no problems generated
    if (formattedProblems.length === 0) {
      formattedProblems.push({
        title: "Binary Tree Traversal",
        description: "Implement inorder traversal of a binary tree",
        sampleInput: "[1,null,2,3]",
        sampleOutput: "[1,3,2]",
        solution: `class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = this.right = null;
  }
}

function inorderTraversal(root) {
  const result = [];
  const traverse = node => {
    if (!node) return;
    traverse(node.left);
    result.push(node.val);
    traverse(node.right);
  };
  traverse(root);
  return result;
}`
      });
    }

    res.status(200).json({
      success: true,
      problems: formattedProblems,
      transcriptLength: transcriptText.length
    });

  } catch (error) {
    console.error("Medium Error:", error);
    
    const statusCode = error.message.includes("transcript") ? 404 : 500;
    const errorMessage = error.message.includes("transcript") 
      ? "Transcript unavailable or too short" 
      : "Failed to generate medium problems";
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

STEMROuter.post("/CodeDojoHard", async (req, res) => {
  try {
    const { videoId } = req.body;
    
    // Validate video ID format
    if (!videoId || !videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid YouTube video ID format",
        example: "dQw4w9WgXcQ"
      });
    }

    // Get transcript object
    const transcriptResult = await getTranscript(videoId);
    
    // Extract text property
    const transcriptText = transcriptResult.transcriptText;

    // Validate transcript exists
    if (!transcriptText || transcriptText.length < 100) {
      throw new Error("Transcript too short to generate hard problems");
    }

    const genAI = new GoogleGenerativeAI(KEY2);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Truncate transcript if too long
    const maxLength = 30000;
    const truncatedText = transcriptText.length > maxLength 
      ? transcriptText.substring(0, maxLength) + "... [truncated]" 
      : transcriptText;

    const prompt = `Generate 3 advanced coding problems based on this transcript.
    Requirements:
    - Complex algorithms (DP, graphs, greedy)
    - Time/space optimization challenges
    - Multiple solution approaches
    For each problem include:
    1. Title
    2. Problem description
    3. Sample input/output
    4. Solution implementation
    Format EXACTLY like this:
    
    Problem 1:
    Title: [Problem Name]
    Description: [Advanced problem statement]
    Sample Input: [Complex input]
    Sample Output: [Optimized output]
    Solution:
    function advancedSolution(input) {
        // Optimal implementation
    }
    
    Problem 2:
    ...
    
    Transcript: ${truncatedText}`;

    const result = await model.generateContent(prompt);
    const rawOutput = (await result.response).text();

    // Enhanced parsing logic
    const hardProblems = [];
    const problemBlocks = rawOutput.split(/(Problem\s+\d+:)/i);
    
    let currentProblem = null;
    for (const block of problemBlocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      
      if (block.match(/Problem\s+\d+:/i)) {
        if (currentProblem) hardProblems.push(currentProblem);
        currentProblem = {
          title: "",
          description: "",
          sampleInput: "",
          sampleOutput: "",
          solution: []
        };
      } else if (currentProblem) {
        lines.forEach(line => {
          if (line.startsWith('Title:')) {
            currentProblem.title = line.replace('Title:', '').trim();
          } else if (line.startsWith('Description:')) {
            currentProblem.description = line.replace('Description:', '').trim();
          } else if (line.startsWith('Sample Input:')) {
            currentProblem.sampleInput = line.replace('Sample Input:', '').trim();
          } else if (line.startsWith('Sample Output:')) {
            currentProblem.sampleOutput = line.replace('Sample Output:', '').trim();
          } else if (line.includes('function') || line.includes('{') || 
                     line.includes('}') || line.includes('=>') || 
                     line.trim().startsWith('//')) {
            currentProblem.solution.push(line.trim());
          }
        });
      }
    }
    
    if (currentProblem && currentProblem.title) {
      hardProblems.push(currentProblem);
    }

    // Process solutions
    const formattedProblems = hardProblems.slice(0, 3).map(p => {
      const solutionCode = p.solution.join('\n').trim();
      return {
        title: p.title || "Advanced Challenge",
        description: p.description || "Solve this hard programming problem",
        sampleInput: p.sampleInput || "Complex input",
        sampleOutput: p.sampleOutput || "Optimized output",
        solution: solutionCode || "// Solution code not generated"
      };
    });

    // Fallback if no problems generated
    if (formattedProblems.length === 0) {
      formattedProblems.push({
        title: "Traveling Salesman Problem",
        description: "Find the shortest possible route visiting all cities exactly once",
        sampleInput: "[[0,10,15,20],[10,0,35,25],[15,35,0,30],[20,25,30,0]]",
        sampleOutput: "80",
        solution: `function tsp(graph) {
  const n = graph.length;
  const VISITED_ALL = (1 << n) - 1;
  const dp = Array(1 << n).fill(null).map(() => Array(n).fill(-1));
  
  function tspMask(mask, pos) {
    if (mask === VISITED_ALL) return graph[pos][0];
    if (dp[mask][pos] !== -1) return dp[mask][pos];
    
    let ans = Infinity;
    for (let city = 0; city < n; city++) {
      if ((mask & (1 << city)) === 0) {
        const newAns = graph[pos][city] + tspMask(mask | (1 << city), city);
        ans = Math.min(ans, newAns);
      }
    }
    return dp[mask][pos] = ans;
  }
  
  return tspMask(1, 0);
}`
      });
    }

    res.status(200).json({
      success: true,
      problems: formattedProblems,
      transcriptLength: transcriptText.length
    });

  } catch (error) {
    console.error("Hard Error:", error);
    
    const statusCode = error.message.includes("transcript") ? 404 : 500;
    const errorMessage = error.message.includes("transcript") 
      ? "Transcript unavailable or too short" 
      : "Failed to generate hard problems";
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

STEMROuter.post("/CodeDojoQuiz", async (req, res) => {
  try {
    const { videoId } = req.body;
    
    // Validate video ID format
    if (!videoId || !videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid YouTube video ID format",
        example: "dQw4w9WgXcQ"
      });
    }

    // Get transcript object
    const transcriptResult = await getTranscript(videoId);
    
    // Extract text property
    const transcriptText = transcriptResult.transcriptText;

    // Validate transcript exists
    if (!transcriptText || transcriptText.length < 100) {
      throw new Error("Transcript too short to generate quiz questions");
    }

    const genAI = new GoogleGenerativeAI(KEY2);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Truncate transcript if too long
    const maxLength = 30000;
    const truncatedText = transcriptText.length > maxLength 
      ? transcriptText.substring(0, maxLength) + "... [truncated]" 
      : transcriptText;

    const prompt = `Generate 5 programming quiz questions based on this transcript.
    Requirements:
    - Focus on key programming concepts from the content
    - Include 4 options per question
    - Provide clear explanations
    Format EXACTLY like this:
    
    Question 1:
    Question: [Programming concept question]
    Options:
    A) [Option 1]
    B) [Option 2]
    C) [Option 3]
    D) [Option 4]
    Answer: [Correct option letter]
    Explanation: [Brief technical explanation]
    
    Question 2:
    ...
    
    Transcript: ${truncatedText}`;

    const result = await model.generateContent(prompt);
    const rawOutput = (await result.response).text();

    // Enhanced parsing logic
    const quizQuestions = [];
    const questionBlocks = rawOutput.split(/(Question\s+\d+:)/i);
    
    let currentQuestion = null;
    for (const block of questionBlocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      
      if (block.match(/Question\s+\d+:/i)) {
        if (currentQuestion) quizQuestions.push(currentQuestion);
        currentQuestion = {
          question: "",
          options: [],
          answer: "",
          explanation: ""
        };
      } else if (currentQuestion) {
        lines.forEach(line => {
          if (line.startsWith('Question:')) {
            currentQuestion.question = line.replace('Question:', '').trim();
          } else if (line.match(/^[A-D]\)/)) {
            currentQuestion.options.push(line.trim());
          } else if (line.startsWith('Answer:')) {
            // Take only the first letter (A, B, C, or D)
            const answerLetter = line.replace('Answer:', '').trim().charAt(0).toUpperCase();
            if (['A', 'B', 'C', 'D'].includes(answerLetter)) {
              currentQuestion.answer = answerLetter;
            }
          } else if (line.startsWith('Explanation:')) {
            currentQuestion.explanation = line.replace('Explanation:', '').trim();
          }
        });
      }
    }
    
    if (currentQuestion && currentQuestion.question) {
      quizQuestions.push(currentQuestion);
    }

    // Format questions and ensure valid options
    const formattedQuestions = quizQuestions.slice(0, 5).map(q => {
      // Ensure we have at least 4 options
      while (q.options.length < 4) {
        q.options.push(`${String.fromCharCode(65 + q.options.length)}) Placeholder option`);
      }
      
      return {
        question: q.question || "Programming concept question",
        options: q.options.slice(0, 4),
        answer: q.answer || "A",
        explanation: q.explanation || "Key concept explanation"
      };
    });

    // Fallback if no questions generated
    if (formattedQuestions.length === 0) {
      formattedQuestions.push({
        question: "What is the time complexity of a binary search algorithm?",
        options: [
          "A) O(1)",
          "B) O(n)",
          "C) O(log n)",
          "D) O(n log n)"
        ],
        answer: "C",
        explanation: "Binary search divides the search space in half with each iteration, resulting in logarithmic time complexity."
      });
    }

    res.status(200).json({
      success: true,
      quiz: formattedQuestions,
      questionCount: formattedQuestions.length,
      transcriptLength: transcriptText.length
    });

  } catch (error) {
    console.error("Quiz Error:", error);
    
    const statusCode = error.message.includes("transcript") ? 404 : 500;
    const errorMessage = error.message.includes("transcript") 
      ? "Transcript unavailable or too short" 
      : "Failed to generate quiz questions";
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});
//KNOWLEDGE CHECK

// ========== KNOWLEDGE CHECK ENDPOINTS (UPDATED) ========== //

STEMROuter.post("/KnowledgeCheckEasy", async (req, res) => {
  try {
    const { videoId } = req.body;
    
    // Validate video ID format
    if (!videoId || !videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid YouTube video ID format",
        example: "dQw4w9WgXcQ"
      });
    }

    // Get transcript object
    const transcriptResult = await getTranscript(videoId);
    
    // Extract text property
    const transcriptText = transcriptResult.transcriptText;

    // Validate transcript exists
    if (!transcriptText || transcriptText.length < 100) {
      throw new Error("Transcript too short to generate quiz questions");
    }

    const genAI = new GoogleGenerativeAI(KEY3);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Truncate transcript if too long
    const maxLength = 30000;
    const truncatedText = transcriptText.length > maxLength 
      ? transcriptText.substring(0, maxLength) + "... [truncated]" 
      : transcriptText;

    const prompt = `Generate 10 beginner programming quiz questions based on this transcript.
    Requirements:
    - Focus on basic programming concepts
    - Include 4 options per question
    - Provide a helpful hint for each
    Format EXACTLY like this:
    
    Question 1:
    Question: [Programming concept question]
    Options:
    A) [Option 1]
    B) [Option 2]
    C) [Option 3]
    D) [Option 4]
    Correct Answer: [Letter]
    Hint: [Brief helpful hint]
    
    Question 2:
    ...
    
    Transcript: ${truncatedText}`;

    const result = await model.generateContent(prompt);
    const rawOutput = (await result.response).text();

    // Enhanced parsing logic
    const questions = [];
    const questionBlocks = rawOutput.split(/(Question\s+\d+:)/i);
    
    let currentQuestion = null;
    for (const block of questionBlocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      
      if (block.match(/Question\s+\d+:/i)) {
        if (currentQuestion) questions.push(currentQuestion);
        currentQuestion = {
          question: "",
          options: [],
          correctAnswer: "",
          hint: ""
        };
      } else if (currentQuestion) {
        lines.forEach(line => {
          if (line.startsWith('Question:')) {
            currentQuestion.question = line.replace('Question:', '').trim();
          } else if (line.match(/^[A-D]\)/)) {
            // Extract option text without the letter
            currentQuestion.options.push(line.replace(/^[A-D]\)\s*/, '').trim());
          } else if (line.startsWith('Correct Answer:')) {
            // Take only the first letter (A, B, C, or D)
            const answerLetter = line.replace('Correct Answer:', '').trim().charAt(0).toUpperCase();
            if (['A', 'B', 'C', 'D'].includes(answerLetter)) {
              currentQuestion.correctAnswer = answerLetter;
            }
          } else if (line.startsWith('Hint:')) {
            currentQuestion.hint = line.replace('Hint:', '').trim();
          }
        });
      }
    }
    
    if (currentQuestion && currentQuestion.question) {
      questions.push(currentQuestion);
    }

    // Format questions and ensure valid options
    const formattedQuestions = questions.slice(0, 10).map(q => {
      // Ensure we have exactly 4 options
      const fullOptions = [...q.options];
      while (fullOptions.length < 4) {
        fullOptions.push(`Option ${fullOptions.length + 1}`);
      }
      
      return {
        question: q.question || "Programming concept question",
        options: fullOptions.slice(0, 4),
        correctAnswer: q.correctAnswer || "A",
        hint: q.hint || "Review basic programming concepts"
      };
    });

    // Fallback if no questions generated
    if (formattedQuestions.length === 0) {
      formattedQuestions.push(
        {
          question: "What does HTML stand for?",
          options: [
            "Hyper Text Markup Language",
            "High Tech Modern Language",
            "Hyper Transfer Markup Language",
            "Home Tool Markup Language"
          ],
          correctAnswer: "A",
          hint: "It's the standard language for creating web pages"
        },
        {
          question: "Which symbol is used for single-line comments in JavaScript?",
          options: [
            "//",
            "/*",
            "#",
            "--"
          ],
          correctAnswer: "A",
          hint: "Think about how you temporarily disable code"
        }
      );
    }

    res.status(200).json({
      success: true,
      questions: formattedQuestions,
      questionCount: formattedQuestions.length,
      transcriptLength: transcriptText.length
    });

  } catch (error) {
    console.error("Knowledge Check Error:", error);
    
    const statusCode = error.message.includes("transcript") ? 404 : 500;
    const errorMessage = error.message.includes("transcript") 
      ? "Transcript unavailable or too short" 
      : "Failed to generate quiz questions";
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

STEMROuter.post("/KnowledgeCheckMedium", async (req, res) => {
  try {
    const { videoId } = req.body;
    
    // Validate video ID format
    if (!videoId || !videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid YouTube video ID format",
        example: "dQw4w9WgXcQ"
      });
    }

    // Get transcript object
    const transcriptResult = await getTranscript(videoId);
    
    // Extract text property
    const transcriptText = transcriptResult.transcriptText;

    // Validate transcript exists
    if (!transcriptText || transcriptText.length < 100) {
      throw new Error("Transcript too short to generate medium-level questions");
    }

    const genAI = new GoogleGenerativeAI(KEY3);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Truncate transcript if too long
    const maxLength = 30000;
    const truncatedText = transcriptText.length > maxLength 
      ? transcriptText.substring(0, maxLength) + "... [truncated]" 
      : transcriptText;

    const prompt = `Generate 10 intermediate programming quiz questions based on this transcript.
    Requirements:
    - Focus on algorithms, data structures, and system design concepts
    - Include 4 options per question
    - Provide detailed technical explanations
    Format EXACTLY like this:
    
    Question 1:
    Question: [Intermediate concept question]
    Options:
    A) [Option 1]
    B) [Option 2]
    C) [Option 3]
    D) [Option 4]
    Correct Answer: [Letter]
    Explanation: [Technical explanation]
    
    Question 2:
    ...
    
    Transcript: ${truncatedText}`;

    const result = await model.generateContent(prompt);
    const rawOutput = (await result.response).text();

    // Enhanced parsing logic
    const mediumQuestions = [];
    const questionBlocks = rawOutput.split(/(Question\s+\d+:)/i);
    
    let currentQuestion = null;
    for (const block of questionBlocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      
      if (block.match(/Question\s+\d+:/i)) {
        if (currentQuestion) mediumQuestions.push(currentQuestion);
        currentQuestion = {
          question: "",
          options: [],
          correctAnswer: "",
          explanation: ""
        };
      } else if (currentQuestion) {
        lines.forEach(line => {
          if (line.startsWith('Question:')) {
            currentQuestion.question = line.replace('Question:', '').trim();
          } else if (line.match(/^[A-D]\)/)) {
            // Extract option text without the letter
            currentQuestion.options.push(line.replace(/^[A-D]\)\s*/, '').trim());
          } else if (line.startsWith('Correct Answer:')) {
            // Take only the first letter (A, B, C, or D)
            const answerLetter = line.replace('Correct Answer:', '').trim().charAt(0).toUpperCase();
            if (['A', 'B', 'C', 'D'].includes(answerLetter)) {
              currentQuestion.correctAnswer = answerLetter;
            }
          } else if (line.startsWith('Explanation:')) {
            currentQuestion.explanation = line.replace('Explanation:', '').trim();
          }
        });
      }
    }
    
    if (currentQuestion && currentQuestion.question) {
      mediumQuestions.push(currentQuestion);
    }

    // Format questions and ensure valid options
    const formattedQuestions = mediumQuestions.slice(0, 10).map(q => {
      // Ensure we have exactly 4 options
      const fullOptions = [...q.options];
      while (fullOptions.length < 4) {
        fullOptions.push(`Option ${fullOptions.length + 1}`);
      }
      
      return {
        question: q.question || "Intermediate programming concept",
        options: fullOptions.slice(0, 4),
        correctAnswer: q.correctAnswer || "A",
        explanation: q.explanation || "Detailed technical explanation not available"
      };
    });

    // Fallback if no questions generated
    if (formattedQuestions.length === 0) {
      formattedQuestions.push(
        {
          question: "What is the time complexity of a well-balanced binary search tree?",
          options: [
            "O(1) for all operations",
            "O(n) for search",
            "O(log n) for search, insertion, and deletion",
            "O(n log n) for insertion"
          ],
          correctAnswer: "C",
          explanation: "Balanced BSTs maintain O(log n) time for core operations due to their height-balanced structure."
        },
        {
          question: "Which data structure uses FIFO (First-In-First-Out) ordering?",
          options: [
            "Stack",
            "Heap",
            "Queue",
            "Tree"
          ],
          correctAnswer: "C",
          explanation: "Queues process elements in the order they were added (first-in-first-out), unlike stacks which are LIFO."
        }
      );
    }

    res.status(200).json({
      success: true,
      questions: formattedQuestions,
      questionCount: formattedQuestions.length,
      transcriptLength: transcriptText.length
    });

  } catch (error) {
    console.error("Medium Check Error:", error);
    
    const statusCode = error.message.includes("transcript") ? 404 : 500;
    const errorMessage = error.message.includes("transcript") 
      ? "Transcript unavailable or too short" 
      : "Failed to generate medium-level questions";
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

STEMROuter.post("/KnowledgeCheckHard", async (req, res) => {
  try {
    const { videoId } = req.body;

    // Validate video ID format
    if (!videoId || !videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid YouTube video ID format",
        example: "dQw4w9WgXcQ"
      });
    }

    // Get transcript object
    const transcriptResult = await getTranscript(videoId);
    
    // Extract text property
    let transcriptText = transcriptResult.transcriptText;

    // Validate transcript exists
    if (!transcriptText || transcriptText.length < 100) {
      throw new Error("Transcript too short to generate advanced questions");
    }

    // Truncate transcript
    const maxLength = 30000;
    transcriptText = transcriptText.length > maxLength 
      ? transcriptText.substring(0, maxLength) 
      : transcriptText;

    const genAI = new GoogleGenerativeAI(KEY3);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Generate 10 advanced programming quiz questions based on this transcript.
    Requirements:
    - Focus on complex algorithms, distributed systems, and low-level optimizations
    - Include 4 challenging options per question
    - Provide in-depth technical analysis
    Format EXACTLY like this:
    
    Question 1:
    Question: [Complex algorithm question]
    Options:
    A) [Option 1]
    B) [Option 2]
    C) [Option 3]
    D) [Option 4]
    Correct Answer: [Letter]
    Technical Analysis: [Detailed analysis]
    
    Question 2:
    ...
    
    Transcript: ${transcriptText}`;

    // Retry mechanism
    let result;
    const maxRetries = 3;
    let attempt = 1;
    
    while (attempt <= maxRetries) {
      try {
        result = await model.generateContent(prompt, { timeout: 30000 });
        break;
      } catch (error) {
        if (attempt === maxRetries) throw error;
        console.log(`Retry attempt ${attempt} for video ${videoId}`);
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        attempt++;
      }
    }

    const rawOutput = (await result.response).text();
    
    // Enhanced parsing logic
    const hardQuestions = [];
    const questionBlocks = rawOutput.split(/(Question\s+\d+:)/i);
    
    for (const block of questionBlocks) {
      if (block.match(/Question\s+\d+:/i)) continue; // Skip the separator
      
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length === 0) continue;
      
      const questionObj = {
        question: "",
        options: [],
        correctAnswer: "",
        analysis: ""
      };

      let currentSection = null;
      
      for (const line of lines) {
        if (line.startsWith('Question:')) {
          questionObj.question = line.replace('Question:', '').trim();
          currentSection = 'question';
        } 
        else if (line.startsWith('Options:')) {
          currentSection = 'options';
        }
        else if (line.match(/^[A-D]\)/)) {
          if (currentSection === 'options') {
            questionObj.options.push(line.replace(/^[A-D]\)\s*/, '').trim());
          }
        }
        else if (line.startsWith('Correct Answer:')) {
          const answerLetter = line.replace('Correct Answer:', '').trim().charAt(0).toUpperCase();
          if (['A', 'B', 'C', 'D'].includes(answerLetter)) {
            questionObj.correctAnswer = answerLetter;
          }
        }
        else if (line.startsWith('Technical Analysis:')) {
          questionObj.analysis = line.replace('Technical Analysis:', '').trim();
          currentSection = 'analysis';
        }
        else if (currentSection === 'analysis' && questionObj.analysis) {
          // Append continuation lines to analysis
          questionObj.analysis += ' ' + line.trim();
        }
      }

      // Validate and add question
      if (questionObj.question && questionObj.options.length >= 2) {
        hardQuestions.push(questionObj);
      }
    }

    // Format response with fallbacks
    const formattedQuestions = hardQuestions.slice(0, 10).map((q, index) => {
      // Ensure minimum 4 options
      const fullOptions = [...q.options];
      while (fullOptions.length < 4) {
        fullOptions.push(`Advanced Option ${fullOptions.length + 1}`);
      }
      
      return {
        id: index + 1,
        question: q.question || `Advanced Programming Question ${index + 1}`,
        options: fullOptions.slice(0, 4),
        correctAnswer: ['A','B','C','D'].includes(q.correctAnswer) ? q.correctAnswer : 'A',
        analysis: q.analysis || "Detailed technical analysis not available"
      };
    });

    // Fallback if no questions generated
    if (formattedQuestions.length === 0) {
      formattedQuestions.push({
        id: 1,
        question: "What is the time complexity of the Floyd-Warshall algorithm?",
        options: [
          "O(n log n)",
          "O(n^3)",
          "O(2^n)",
          "O(n^2)"
        ],
        correctAnswer: "B",
        analysis: "Floyd-Warshall computes shortest paths between all pairs of vertices in O(V^3) time, making it suitable for dense graphs but inefficient for large sparse graphs."
      });
    }

    res.status(200).json({
      success: true,
      count: formattedQuestions.length,
      questions: formattedQuestions,
      transcriptLength: transcriptText.length
    });

  } catch (error) {
    console.error("Hard Check Error:", error);
    
    let statusCode = 500;
    let errorMessage = "Failed to generate advanced questions";
    
    if (error.message.includes("transcript")) {
      statusCode = 404;
      errorMessage = "Transcript unavailable or too short";
    } 
    else if (error.message.includes("timeout") || error.name === "AbortError") {
      statusCode = 504;
      errorMessage = "Question generation timed out";
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message.replace(/\[GoogleGenerativeAI Error\]:\s*/gi, ''),
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});


module.exports = STEMROuter;