import { create } from "zustand"
import axios from "axios"
import type { ModuleData } from "../../components/Linear/Data/moduleData"
import { BookOpen, Calculator, Sigma } from "lucide-react"
import type { LucideIcon } from 'lucide-react'

interface SteamState {
  videoId: string
  transcript: string
  modules: ModuleData[]
  loading: boolean
  error: string | null
  currentActiveModule: ModuleData | null
  duration: number // Total video duration
  setVideoId: (videoId: string) => void
  setTranscript: (transcript: string) => void
  setModules: (modules: ModuleData[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setCurrentActiveModule: (module: ModuleData | null) => void
  setDuration: (duration: number) => void
  generateModulesFromTranscript: (transcript: string, videoDuration: number) => ModuleData[]
  fetchModulesAndTranscript: () => Promise<void>
  reset: () => void
}

type Concept = {
  name: string
  keywords: string[]
  weight: number
  icon: LucideIcon
  type: "Numerical Navigator" | "Proof Builder"
  topic: string
}

const INITIAL_STATE: Omit<SteamState, 'setVideoId' | 'setTranscript' | 'setModules' | 'setLoading' | 'setError' | 'setCurrentActiveModule' | 'setDuration' | 'generateModulesFromTranscript' | 'fetchModulesAndTranscript' | 'reset'> = {
  videoId: "",
  transcript: "",
  modules: [],
  loading: false,
  error: null,
  currentActiveModule: null,
  duration: 0,
}

export const useSteamStore = create<SteamState>((set, get) => ({
  ...INITIAL_STATE,

  setVideoId: (videoId: string) => {
    set({ videoId, error: null })
  },
  setTranscript: (transcript: string) => {
    set({ transcript })
  },
  setModules: (modules: ModuleData[]) => {
    set({ modules })
  },
  setLoading: (loading: boolean) => {
    set({ loading })
  },
  setError: (error: string | null) => {
    set({ error })
  },
  setCurrentActiveModule: (module: ModuleData | null) => {
    set({ currentActiveModule: module })
  },
  setDuration: (duration: number) => {
    set({ duration })
  },

  // Replace your generateModulesFromTranscript function with this improved version
  generateModulesFromTranscript: (transcript: string, videoDuration: number): ModuleData[] => {
    const generated: ModuleData[] = [];
    const lowerTranscript = transcript.toLowerCase();
    
    // Enhanced concept detection with weights
    const concepts: Concept[] = [
      {
        name: "Kinematics",
        keywords: ["kinematics", "motion", "velocity", "acceleration"],
        weight: 0,
        icon: Calculator,
        type: "Numerical Navigator",
        topic: "Physics"
      },
      {
        name: "Newton's Laws",
        keywords: ["newton", "force", "motion", "law"],
        weight: 0,
        icon: Sigma,
        type: "Proof Builder",
        topic: "Physics"
      },
      // Add more concepts as needed...
    ];

    // Calculate weights for each concept
    concepts.forEach(concept => {
      concept.weight = concept.keywords.reduce((count, keyword) => {
        return count + (lowerTranscript.split(keyword).length - 1);
      }, 0);
    });

    // Filter concepts that have significant presence
    const relevantConcepts = concepts.filter(c => c.weight > 2);
    
    // Distribute modules evenly based on video duration
    const segmentDuration = videoDuration / (relevantConcepts.length || 1);
    
    relevantConcepts.forEach((concept, index) => {
      const timestamp = Math.min(
        videoDuration,
        Math.max(30, segmentDuration * index)
      );
      
      generated.push({
        id: `mod-${index + 1}`,
        name: concept.name,
        timestamp: Math.round(timestamp),
        description: `Learn about ${concept.name} concepts discussed in the video`,
        icon: concept.icon,
        type: concept.type,
        topic: concept.topic,
        content: {}
      });
    });

    // Fallback if no specific concepts detected
    if (generated.length === 0) {
      generated.push({
        id: 'mod-1',
        name: 'Key Concepts',
        timestamp: 30,
        description: 'Review the main concepts from this video',
        icon: BookOpen,
        type: 'JEE Accelerator',
        topic: 'General',
        content: {}
      });
    }

    return generated;
  },

  fetchModulesAndTranscript: async () => {
    const { videoId, setTranscript, setModules, setLoading, setError, setDuration, generateModulesFromTranscript } = get();

    if (!videoId.trim()) {
      setError("Please enter a YouTube video ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First fetch the transcript
      const transcriptResponse = await axios.get(`http://localhost:3000/api/v1/General/transcript?videoId=${videoId}`);
      const transcript = transcriptResponse.data.transcript;
      
      if (!transcript) {
        throw new Error("No transcript available for this video");
      }

      setTranscript(transcript);
      
      // Then fetch video duration
      const durationResponse = await axios.get(`http://localhost:3000/api/v1/General/transcript?videoId=${videoId}`);
      const duration = durationResponse.data.duration;
      setDuration(duration);

      // Generate modules based on actual transcript
      const modules = generateModulesFromTranscript(transcript, duration);
      setModules(modules);

    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load video content");
    } finally {
      setLoading(false);
    }
  },

  reset: () => {
    set(INITIAL_STATE)
  },
}))