import { create } from "zustand";
import axios, { AxiosError } from "axios";
import { BookOpen, Atom, Calculator, Sigma, Zap } from "lucide-react";

interface AudioTrack {
  id: string;
  name: string;
  url: string;
}

interface ModuleData {
  id: string;
  name: string;
  timestamp: number;
  title: string;
  description: string;
  icon?: React.ComponentType<{ size?: number }>;
  type: string;
  topic: string;
  content: Record<string, unknown>;
}

interface SteamState {
  videoId: string;
  transcript: string;
  modules: ModuleData[];
  loading: boolean;
  error: string | null;
  currentActiveModule: ModuleData | null;
  duration: number;
  audioTracks: AudioTrack[];
  setVideoId: (videoId: string) => void;
  setTranscript: (transcript: string) => void;
  setModules: (modules: ModuleData[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentActiveModule: (module: ModuleData | null) => void;
  setDuration: (duration: number) => void;
  generateModulesFromTranscript: (transcript: string, videoDuration: number) => ModuleData[];
  fetchModulesAndTranscript: () => Promise<void>;
  reset: () => void;
}

const DEFAULT_AUDIO_TRACKS: AudioTrack[] = [
  { id: "track-1", name: "Classical Study Music", url: "/audio/classical.mp3" },
  { id: "track-2", name: "Lo-fi Beats", url: "/audio/lofi.mp3" },
];

const INITIAL_STATE: Omit<
  SteamState,
  | "setVideoId"
  | "setTranscript"
  | "setModules"
  | "setLoading"
  | "setError"
  | "setCurrentActiveModule"
  | "setDuration"
  | "generateModulesFromTranscript"
  | "fetchModulesAndTranscript"
  | "reset"
> = {
  videoId: "",
  transcript: "",
  modules: [],
  loading: false,
  error: null,
  currentActiveModule: null,
  duration: 0,
  audioTracks: DEFAULT_AUDIO_TRACKS,
};

export const useSteamStore = create<SteamState>((set, get) => ({
  ...INITIAL_STATE,

  setVideoId: (videoId) => set({ videoId, error: null }),
  setTranscript: (transcript) => set({ transcript }),
  setModules: (modules) => {
    console.log("Setting modules:", modules);
    set({ modules });
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentActiveModule: (module) => set({ currentActiveModule: module }),
  setDuration: (duration) => set({ duration }),

  generateModulesFromTranscript: (transcript, videoDuration) => {
    console.log("Generating modules for:", {
      transcriptLength: transcript.length,
      videoDuration,
    });
    const validDuration = videoDuration > 0 && !isNaN(videoDuration) ? videoDuration : 454;
    const modules: ModuleData[] = [];
    let moduleCount = 0;

    const addModule = (
      name: string,
      description: string,
      icon: ModuleData["icon"],
      type: string,
      topic: string,
      timestampFactor: number
    ) => {
      if (moduleCount >= 5) return;
      const timestamp = Math.round(validDuration * timestampFactor);
      modules.push({
        id: `mod-${moduleCount + 1}`,
        name,
        description,
        icon,
        type,
        topic,
        timestamp,
        content: {},
        title: ""
      });
      moduleCount++;
    };

    if (transcript && transcript.length > 50) {
      const lowerTranscript = transcript.toLowerCase();
      const concepts = {
        programming:
          lowerTranscript.includes("code") ||
          lowerTranscript.includes("algorithm") ||
          lowerTranscript.includes("array"),
        kinematics: lowerTranscript.includes("kinematics") || lowerTranscript.includes("motion"),
        mathematics: lowerTranscript.includes("math") || lowerTranscript.includes("algebra"),
      };
      console.log("Concepts detected:", concepts);

      if (concepts.programming) {
        addModule(
          "Basics of Programming",
          "Learn core concepts like arrays and algorithms.",
          Zap,
          "CodeCrafter",
          "Computer Science",
          0.6
        );
      }
      if (concepts.kinematics && moduleCount < 5) {
        addModule(
          "Introduction to Kinematics",
          "Explore motion, velocity, and acceleration.",
          Calculator,
          "NumericalNavigator",
          "Physics",
          0.2
        );
      }
      if (concepts.mathematics && moduleCount < 5) {
        addModule(
          "Algebra Foundations",
          "Master algebraic expressions and equations.",
          Sigma,
          "MathMaster",
          "Mathematics",
          0.4
        );
      }

      // Add fallback modules to reach 5
      const fallbackModules = [
        {
          name: "Introduction to Concepts",
          description: "Get started with the video’s key ideas.",
          icon: BookOpen,
          type: "ConceptExplorer",
          topic: "General",
          timestampFactor: 0.2,
        },
        {
          name: "Core Principles",
          description: "Dive into the fundamental principles.",
          icon: Atom,
          type: "ConceptExplorer",
          topic: "General",
          timestampFactor: 0.4,
        },
        {
          name: "Practical Applications",
          description: "Apply the concepts to real-world scenarios.",
          icon: Zap,
          type: "ApplicationLab",
          topic: "General",
          timestampFactor: 0.6,
        },
        {
          name: "Advanced Topics",
          description: "Explore more complex aspects.",
          icon: Sigma,
          type: "DeepDive",
          topic: "General",
          timestampFactor: 0.8,
        },
        {
          name: "Conclusion and Review",
          description: "Summarize and reinforce key takeaways.",
          icon: Calculator,
          type: "ReviewSession",
          topic: "General",
          timestampFactor: 0.9,
        },
      ];

      let fallbackIndex = 0;
      while (moduleCount < 5 && fallbackIndex < fallbackModules.length) {
        const fb = fallbackModules[fallbackIndex];
        // Skip if a module with the same timestamp factor exists
        if (!modules.some((m) => Math.abs(m.timestamp - validDuration * fb.timestampFactor) < 10)) {
          addModule(
            fb.name,
            fb.description,
            fb.icon,
            fb.type,
            fb.topic,
            fb.timestampFactor
          );
        }
        fallbackIndex++;
      }
    } else {
      console.log("Short transcript, using fallback modules");
      addModule(
        "Introduction to Concepts",
        "Get started with the video’s key ideas.",
        BookOpen,
        "ConceptExplorer",
        "General",
        0.2
      );
      addModule(
        "Core Principles",
        "Dive into the fundamental principles.",
        Atom,
        "ConceptExplorer",
        "General",
        0.4
      );
      addModule(
        "Practical Applications",
        "Apply the concepts to real-world scenarios.",
        Zap,
        "ApplicationLab",
        "General",
        0.6
      );
      addModule(
        "Advanced Topics",
        "Explore more complex aspects.",
        Sigma,
        "DeepDive",
        "General",
        0.8
      );
      addModule(
        "Conclusion and Review",
        "Summarize and reinforce key takeaways.",
        Calculator,
        "ReviewSession",
        "General",
        0.9
      );
    }

    console.log("Generated modules:", modules);
    return modules;
  },

  fetchModulesAndTranscript: async () => {
    const { videoId, setTranscript, setModules, setLoading, setError, generateModulesFromTranscript } = get();
    if (!videoId.trim()) {
      setError("Please enter a YouTube video ID");
      return;
    }
    setLoading(true);
    setError(null);
    setModules([]);
    setTranscript("");
    try {
      const apiUrl = `http://localhost:3000/api/v1/STEM/Transcript?videoId=${videoId}`;
      const response = await axios.get<{ success: boolean; transcript: string }>(apiUrl);
      console.log("API response:", response.data);
      if (response.data.success && response.data.transcript) {
        setTranscript(response.data.transcript);
        const videoDuration = get().duration || 454;
        const modules = generateModulesFromTranscript(response.data.transcript, videoDuration);
        setModules(modules);
      } else {
        throw new Error("Invalid API response: missing transcript or success=false");
      }
    } catch (err: unknown) {
      let errorMessage = "Failed to load transcript.";
      if (err instanceof AxiosError) {
        errorMessage += ` ${err.message}`;
      } else if (err instanceof Error) {
        errorMessage += ` ${err.message}`;
      }
      console.error("Fetch error:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  },

  reset: () => set(INITIAL_STATE),
}));
