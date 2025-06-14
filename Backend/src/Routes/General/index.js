
const express = require("express");
const { ApifyClient } = require("apify-client");

const GeneralRouter = express.Router();

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

GeneralRouter.post("/ClearCache", (req, res) => {
  const { videoId } = req.body;
  clearTranscriptCache(videoId);
  res.json({ success: true, message: videoId ? `Cache cleared for ${videoId}` : 'All cache cleared' });
});

GeneralRouter.get("/Transcript", async (req, res) => {
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

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.KEY3);

GeneralRouter.post("/KeyConcepts", async (req, res) => {
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
    const fullTranscript = transcriptResult.fullTranscript;
    
    // Validate transcript exists
    if (!fullTranscript || fullTranscript.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Transcript unavailable for this video"
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Format transcript for analysis
    const formattedTranscript = fullTranscript.map(item => 
      `[${Math.floor(item.start)}s] ${item.text}`
    ).join("\n");

    // Truncate to avoid token limits
    const maxLength = 30000;
    const truncatedTranscript = formattedTranscript.length > maxLength 
      ? formattedTranscript.substring(0, maxLength) + "... [truncated]" 
      : formattedTranscript;

    const prompt = `Analyze this video transcript with timestamps and identify key concepts with their end times.
    
    Requirements:
    1. Identify 5-8 main concepts discussed in the video
    2. For each concept, determine the end timestamp (in seconds) when the concept discussion ends
    3. Provide a concise name for each concept (2-5 words)
    4. Return only the concepts array in JSON format
    
    Output MUST be EXACTLY this format:
    [
      {
        "timestamp": 123.45,  // End time in seconds
        "name": "Concept Name"
      },
      ...
    ]
    
    Guidelines:
    - Timestamps should be whole numbers (seconds)
    - Concepts should be distinct and significant
    - Ignore introductions and conclusions
    
    Transcript with timestamps:
    ${truncatedTranscript}`;

    // Generate content
    const result = await model.generateContent(prompt);
    const rawOutput = (await result.response).text();
    
    // Extract JSON array from response
    const arrayStart = rawOutput.indexOf('[');
    const arrayEnd = rawOutput.lastIndexOf(']') + 1;
    const arrayString = rawOutput.slice(arrayStart, arrayEnd);
    let concepts = JSON.parse(arrayString);

    // Validate and process concepts
    concepts = concepts
      .filter(concept => 
        concept.timestamp >= 0 && 
        concept.name && 
        concept.name.trim().length > 0
      )
      .map(concept => ({
        timestamp: Math.floor(concept.timestamp),
        name: concept.name.trim()
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    // Add fallback if no concepts found
    if (concepts.length === 0) {
      const videoDuration = Math.max(...fullTranscript.map(t => t.start + t.duration));
      concepts = [
        { timestamp: Math.floor(videoDuration * 0.3), name: "Core Concept 1" },
        { timestamp: Math.floor(videoDuration * 0.6), name: "Core Concept 2" },
        { timestamp: Math.floor(videoDuration * 0.9), name: "Conclusion" }
      ];
    }

    res.status(200).json({
      success: true,
      concepts,
      videoId,
      conceptCount: concepts.length
    });

  } catch (error) {
    console.error("KeyConcepts Error:", error);
    
    let statusCode = 500;
    let errorMessage = "Failed to extract key concepts";
    
    if (error.message.includes("Transcript not available")) {
      statusCode = 404;
      errorMessage = "Transcript unavailable";
    } 
    else if (error.message.includes("JSON")) {
      errorMessage = "Failed to parse concept data";
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message
    });
  }
});




GeneralRouter.get("/Health", (req, res) => {
    res.status(202).json({
        Msg: "Yes its workign"
    });
});


module.exports = GeneralRouter;
