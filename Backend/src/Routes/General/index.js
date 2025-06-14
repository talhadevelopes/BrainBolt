
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





GeneralRouter.get("/Health", (req, res) => {
    res.status(202).json({
        Msg: "Yes its workign"
    });
});


module.exports = GeneralRouter;
