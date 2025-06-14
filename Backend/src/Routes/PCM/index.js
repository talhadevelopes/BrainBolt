const express = require("express");
const { ApifyClient } = require("apify-client");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const PCMRouter = express.Router();
const KEY2 = process.env.KEY2;

PCMRouter.get("/Health", (req, res) => {
    res.status(200).json({
        msg:"Pcm router working"
    });
});


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


// Add this route to your STEMRouter
PCMRouter.post("/FormulaFusion", async (req, res) => {
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
    const transcriptText = transcriptResult.transcriptText;

    // Validate transcript exists
    if (!transcriptText || transcriptText.length < 100) {
      return res.status(404).json({
        success: false,
        error: "Transcript unavailable or too short"
      });
    }

    const genAI = new GoogleGenerativeAI(KEY2); // Using KEY2 for Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Truncate transcript
    const maxLength = 30000;
    const truncatedText = transcriptText.length > maxLength 
      ? transcriptText.substring(0, maxLength) 
      : transcriptText;

    const prompt = `Generate a FormulaFusion module for STEM education based on this video transcript.
    
    Requirements:
    1. Create 3-5 mathematical derivations with:
       - Title
       - Complexity rating (1-5)
       - Time required (minutes)
       - 5-8 step-by-step derivation steps (equation + explanation)
       - 2-4 real-world applications
    2. Create an equation database with 3-5 categories containing 2-4 equations each
    3. Create 4 subject categories with derivation counts
    4. Focus on mathematical concepts from the transcript
    
    Format EXACTLY as valid JSON:
    {
      "derivations": [
        {
          "id": "deriv1",
          "title": "Derivation Title",
          "complexity": 3,
          "timeRequired": 15,
          "steps": [
            {
              "step": 1,
              "equation": "E = mc^2",
              "explanation": "Explanation of this step"
            },
            ...
          ],
          "applications": [
            "Nuclear energy calculation",
            "Particle physics"
          ]
        },
        ...
      ],
      "equationDatabase": [
        {
          "name": "Category Name",
          "equations": [
            "F = ma",
            "v = u + at"
          ]
        },
        ...
      ],
      "categories": [
        {
          "name": "Physics",
          "derivationCount": 5
        },
        ...
      ]
    }
    
    Transcript: ${truncatedText}`;

    // Generate content with retries
    let result;
    const maxRetries = 3;
    let attempt = 1;
    
    while (attempt <= maxRetries) {
      try {
        result = await model.generateContent(prompt, { timeout: 30000 });
        break;
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        attempt++;
      }
    }

    const rawOutput = (await result.response).text();
    
    // Extract JSON from response
    const jsonStart = rawOutput.indexOf('{');
    const jsonEnd = rawOutput.lastIndexOf('}') + 1;
    const jsonString = rawOutput.slice(jsonStart, jsonEnd);
    let moduleData = JSON.parse(jsonString);

    // Validation and fallbacks
    if (!Array.isArray(moduleData.derivations)) {
      moduleData.derivations = [];
    }

    if (!Array.isArray(moduleData.equationDatabase)) {
      moduleData.equationDatabase = [];
    }

    if (!Array.isArray(moduleData.categories)) {
      moduleData.categories = [];
    }

    // Ensure derivations have required structure
    moduleData.derivations = moduleData.derivations.map((deriv, index) => ({
      id: deriv.id || `deriv${index + 1}`,
      title: deriv.title || `Derivation ${index + 1}`,
      complexity: Math.min(5, Math.max(1, deriv.complexity || 3)),
      timeRequired: Math.max(5, Math.min(60, deriv.timeRequired || 15)),
      steps: Array.isArray(deriv.steps) 
        ? deriv.steps.slice(0, 8).map((step, i) => ({
            step: step.step || i + 1,
            equation: step.equation || `x_{${i+1}} = y_{${i+1}}^2 + c`,
            explanation: step.explanation || "Key derivation step explanation"
          }))
        : [],
      applications: Array.isArray(deriv.applications) 
        ? deriv.applications.slice(0, 4) 
        : ["Physics applications", "Engineering use cases"]
    }));

    // Ensure equation database has required structure
    moduleData.equationDatabase = moduleData.equationDatabase.map((cat, idx) => ({
      name: cat.name || `Category ${idx + 1}`,
      equations: Array.isArray(cat.equations) 
        ? cat.equations.slice(0, 4)
        : ["F = ma", "E = mc²"]
    }));

    // Ensure categories have required structure
    moduleData.categories = moduleData.categories.slice(0, 4).map((cat, i) => ({
      name: cat.name || ["Physics", "Calculus", "Algebra", "Geometry"][i] || `Category ${i + 1}`,
      derivationCount: Math.max(1, Math.min(20, cat.derivationCount || 5))
    }));

    res.status(200).json({
      success: true,
      moduleData,
      videoId,
      transcriptLength: transcriptText.length
    });

  } catch (error) {
    console.error('FormulaFusion Error:', error);
    
    let statusCode = 500;
    let errorMessage = "Failed to generate module content";
    
    if (error.message.includes("transcript")) {
      statusCode = 404;
      errorMessage = "Transcript unavailable or too short";
    } 
    else if (error.message.includes("JSON")) {
      statusCode = 500;
      errorMessage = "Failed to parse module content";
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message
    });
  }
});

module.exports = PCMRouter;