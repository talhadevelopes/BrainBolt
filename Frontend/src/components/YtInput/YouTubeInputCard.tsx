import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  ArrowRight, 
  Loader, 
  CheckCircle2, 
  Search, 
  Clock, 
  Download, 
  Upload, 
  Trash2, 
  Zap,
  Microscope,
  AlertCircle,
  Info,
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';

interface HistoryItem {
  track: string;
  url: string;
  timestamp: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const toastVariants: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

const trackOptions = [
  {
    id: 'Science',
    name: 'Science',
    description: 'Explore natural phenomena and scientific principles',
    icon: <Microscope className="w-6 h-6" />,
    gradient: 'from-blue-400 via-purple-400 to-pink-400',
    subjects: ['Physics', 'Chemistry', 'Biology', 'Astronomy', 'Environmental Science'],
  },
  {
    id: 'Engineering',
    name: 'Engineering',
    description: 'Apply science to design and build innovative solutions',
    icon: <Zap className="w-6 h-6" />,
    gradient: 'from-green-400 via-blue-400 to-purple-400',
    subjects: ['Information Technology', 'CSE', 'EEE', 'ECE'],
  },
];
//@ts-ignore
const customToastStyle = {
  background: 'rgba(20, 20, 20, 0.9)',
  color: '#fff',
  borderRadius: '12px',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
  padding: '12px 16px',
};

export const YouTubeLearningPortal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracted, setIsExtracted] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTrackSelection, setShowTrackSelection] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<'Science' | 'Engineering' | null>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning! Ready to learn something new?');
    else if (hour < 18) setGreeting('Good afternoon! What shall we explore today?');
    else setGreeting('Good evening! Time for some evening learning!');

    const input = urlInputRef.current;
    if (input) input.focus();

    const savedHistory = localStorage.getItem('youtubeUrlHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        if (parsedHistory.length > 0) {
          if (typeof parsedHistory[0] === 'string') {
            const convertedHistory: HistoryItem[] = parsedHistory.map((url: string) => ({
              url,
              timestamp: Date.now(),
              track: 'Unknown',
            }));
            setHistory(convertedHistory);
            localStorage.setItem('youtubeUrlHistory', JSON.stringify(convertedHistory));
          } else {
            const validatedHistory: HistoryItem[] = parsedHistory.map((item: any) => ({
              url: item.url,
              timestamp: item.timestamp || Date.now(),
              track: item.track || 'Unknown',
            }));
            setHistory(validatedHistory);
            localStorage.setItem('youtubeUrlHistory', JSON.stringify(validatedHistory));
          }
        }
      } catch (error) {
        console.error('Error parsing history:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (location.pathname === '/input') {
      navigator.clipboard.readText().then(text => {
        if (isValidYouTubeUrl(text)) {
          setUrl(text);
          toast.info(
            <motion.div
              variants={toastVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex items-center gap-3 p-3 bg-gray-900/90 rounded-xl shadow-lg"
            >
              <Info className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-light text-white">YouTube URL detected and pasted!</span>
            </motion.div>,
            { autoClose: 3000 }
          );
        }
      }).catch(() => {});
    }
  }, [location.pathname]);

  const isValidYouTubeUrl = (url: string): boolean => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return regex.test(url.trim());
  };

  const extractVideoId = (url: string) => {
    const regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regex);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const updateHistory = (urlToSave: string, track: string) => {
    const existingIndex = history.findIndex(item => item.url === urlToSave);
    let updatedHistory: HistoryItem[];
    
    if (existingIndex >= 0) {
      const newHistory = [...history];
      newHistory.splice(existingIndex, 1);
      updatedHistory = [
        { url: urlToSave, timestamp: Date.now(), track },
        ...newHistory,
      ];
    } else {
      updatedHistory = [
        { url: urlToSave, timestamp: Date.now(), track },
        ...history,
      ].slice(0, 20);
    }
    
    setHistory(updatedHistory);
    localStorage.setItem('youtubeUrlHistory', JSON.stringify(updatedHistory));
  };

  useEffect(() => {
    if (url) {
      const trimmedUrl = url.trim();
      const isValid = isValidYouTubeUrl(trimmedUrl);
      setIsValidUrl(isValid);
      if (isValid) {
        const extractedId = extractVideoId(trimmedUrl);
        if (extractedId) setVideoId(extractedId);
      } else {
        setVideoId('');
      }
    } else {
      setIsValidUrl(false);
      setVideoId('');
    }
  }, [url]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (isExtracted && selectedTrack) {
      timeoutId = setTimeout(() => {
        localStorage.setItem('currentVideoId', videoId);
        localStorage.setItem('selectedTrack', selectedTrack);
        const route = selectedTrack === 'Engineering' ? '/stem' : '/Test';
        navigate(route, { state: { videoId, track: selectedTrack } });
      }, 3000);
    }
    return () => clearTimeout(timeoutId);
  }, [isExtracted, navigate, videoId, selectedTrack]);

  const handleAnalyze = () => {
    setIsLoading(true);
    try {
      if (!url) {
        toast.error(
          <motion.div
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center gap-3 p-3 bg-gray-900/90 rounded-xl shadow-lg"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm font-light text-white">Please enter a YouTube URL</span>
          </motion.div>,
          { autoClose: 3000 }
        );
        setIsLoading(false);
        return;
      }

      const extractedId = extractVideoId(url);
      if (!extractedId) {
        toast.error(
          <motion.div
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center gap-3 p-3 bg-gray-900/90 rounded-xl shadow-lg"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm font-light text-white">Invalid YouTube URL</span>
          </motion.div>,
          { autoClose: 3000 }
        );
        setIsLoading(false);
        return;
      }

      setVideoId(extractedId);
      setShowTrackSelection(true);
      setIsLoading(false);
    } catch (error) {
      toast.error(
        <motion.div
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex items-center gap-3 p-3 bg-gray-900/90 rounded-xl shadow-lg"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-sm font-light text-white">Error processing video URL</span>
        </motion.div>,
        { autoClose: 3000 }
      );
      setIsLoading(false);
    }
  };

  const handleTrackSelection = (track: 'Science' | 'Engineering') => {
    setSelectedTrack(track);
    setIsLoading(true);

    try {
      updateHistory(url, track);
      localStorage.setItem('currentVideoId', videoId);
      setIsExtracted(true);
      toast.success(
        <motion.div
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex items-center gap-3 p-3 bg-gray-900/90 rounded-xl shadow-lg"
        >
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-sm font-light text-white">Video ID extracted and stored</span>
        </motion.div>,
        { autoClose: 3000 }
      );
    } catch (error) {
      toast.error(
        <motion.div
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex items-center gap-3 p-3 bg-gray-900/90 rounded-xl shadow-lg"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-sm font-light text-white">Error processing video</span>
        </motion.div>,
        { autoClose: 3000 }
      );
      setIsLoading(false);
    }
  };

  const filteredHistory = history.filter(item =>
    item.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `youtube-learning-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(
      <motion.div
        variants={toastVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex items-center gap-3 p-3 bg-gray-900/90 rounded-xl shadow-lg"
      >
        <CheckCircle2 className="w-5 h-5 text-green-400" />
        <span className="text-sm font-light text-white">History exported successfully!</span>
      </motion.div>,
      { autoClose: 3000 }
    );
  };

  const handleImportHistory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedHistory = JSON.parse(e.target?.result as string);
        const validatedHistory: HistoryItem[] = importedHistory.map((item: any) => ({
          url: item.url,
          timestamp: item.timestamp || Date.now(),
          track: item.track || 'Unknown',
        }));
        setHistory(validatedHistory);
        localStorage.setItem('youtubeUrlHistory', JSON.stringify(validatedHistory));
        toast.success(
          <motion.div
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center gap-3 p-3 bg-gray-900/90 rounded-xl shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-sm font-light text-white">History imported successfully!</span>
          </motion.div>,
          { autoClose: 3000 }
        );
      } catch (error) {
        toast.error(
          <motion.div
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center gap-3 p-3 bg-gray-900/90 rounded-xl shadow-lg"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm font-light text-white">Error importing history file</span>
          </motion.div>,
          { autoClose: 3000 }
        );
      }
    };
    reader.readAsText(file);
  };

  console.log('YouTubeLearningPortal component rendered');

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="mt-4 mr-4"
      /> */}
      <motion.div
        animate={{
          opacity: [0.04, 0.06, 0.04],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 opacity-[0.05] z-0"
      >
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="hex-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#A78BFA', stopOpacity: 0.3 }} />
              <stop offset="50%" style={{ stopColor: '#3B82F6', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.3 }} />
            </linearGradient>
            <pattern
              id="hexagons"
              x="0"
              y="0"
              width="20"
              height="17.32"
              patternUnits="userSpaceOnUse"
            >
              <polygon
                points="10,1 18.66,6 18.66,16 10,21 1.34,16 1.34,6"
                fill="none"
                stroke="url(#hex-gradient)"
                strokeWidth="0.6"
              />
              <polygon
                points="20,9.5 28.66,14.5 28.66,24.5 20,29.5 11.34,24.5 11.34,14.5"
                fill="none"
                stroke="url(#hex-gradient)"
                strokeWidth="0.4"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </motion.div>
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
          opacity: [0.02, 0.03, 0.02],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute top-20 right-20 opacity-[0.02]"
      >
        <svg width="120" height="120" viewBox="0 0 120 120">
          <polygon
            points="60,10 95,32.5 95,77.5 60,100 25,77.5 25,32.5"
            fill="none"
            stroke="url(#hex-gradient)"
            strokeWidth="1"
          />
        </svg>
      </motion.div>
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.02, 0.04, 0.02],
          rotate: [0, 60, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-[600px] h-[600px] -top-80 -right-80"
      >
        <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl transform rotate-45" />
      </motion.div>
      <div className="container mx-auto px-6 py-12 relative z-10 max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-8"
          >
            <div className="text-center lg:text-left">
              <motion.p
                variants={itemVariants}
                className="text-white/60 mb-4 font-light"
              >
                👋 {greeting}
              </motion.p>
              <motion.h1
                variants={itemVariants}
                className="text-4xl lg:text-6xl font-light text-white mb-4 tracking-tight leading-[0.9]"
              >
                NextGen
              </motion.h1>
              <motion.h1
                variants={itemVariants}
                className="text-4xl lg:text-6xl font-light text-white mb-4 tracking-tight leading-[0.9]"
              >
                Learning
                <span className="relative ml-4">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text font-medium">
                    Portal
                  </span>
                  <motion.div
                    animate={{
                      scale: [1, 1.02, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute -inset-2 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-lg blur-xl -z-10"
                  />
                </span>
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-xl text-white/40 font-light"
              >
                Transform videos into personalized learning experiences
              </motion.p>
            </div>
            <motion.div
              variants={itemVariants}
              className="relative p-8 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] overflow-hidden"
            >
              <div className="space-y-6">
                <div className="relative">
                  <input
                    ref={urlInputRef}
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste YouTube URL here..."
                    className="w-full bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 px-6 py-4 pr-12 text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-all text-lg font-light"
                    disabled={isExtracted}
                  />
                  {isValidUrl && (
                    <CheckCircle2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                  )}
                </div>
                <AnimatePresence>
                  {isExtracted && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/10 p-6 space-y-4 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-center gap-3 relative z-10">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <Loader className="w-6 h-6 text-indigo-300" />
                        </motion.div>
                        <span className="text-lg text-white font-light">
                          Processing video content for {selectedTrack} Track...
                        </span>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-center"
                      >
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/0.jpg`}
                          alt="Video Thumbnail"
                          className="rounded-xl border border-white/10 shadow-lg max-w-sm w-full object-cover"
                        />
                      </motion.div>
                      <div className="space-y-3 relative z-10">
                        <p className="font-light tracking-wide text-neutral-300">Extracted Video ID:</p>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="relative"
                        >
                          <code className="text-indigo-300 break-all font-mono p-3 bg-black/20 rounded-lg block w-full backdrop-blur-sm border border-white/10">
                            {videoId}
                          </code>
                        </motion.div>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="text-sm text-neutral-400 mt-2 font-light tracking-wide"
                        >
                          Redirecting to content page...
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.button
                  onClick={handleAnalyze}
                  disabled={!isValidUrl || isLoading || isExtracted}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-2xl font-medium text-lg transition-all duration-300 ${
                    isValidUrl && !isLoading && !isExtracted
                      ? 'bg-white text-black hover:shadow-2xl hover:shadow-white/20'
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      Analyze Video
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </motion.button>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm text-white/40 mb-2 font-medium">Keyboard Shortcuts:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-white/30">
                  <span>⌘K: Focus input</span>
                  <span>⌘Enter: Analyze</span>
                  <span>Esc: Clear</span>
                  <span>⌘V: Paste URL</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="space-y-6"
          >
            <div className="p-6 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] relative z-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light">Learning History</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-white/10 rounded-lg border border-white/10 hover:bg-white/20 transition-all"
                    title="Import history"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleExportHistory}
                    className="p-2 bg-white/10 rounded-lg border border-white/10 hover:bg-white/20 transition-all"
                    title="Export history"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setHistory([]);
                      localStorage.removeItem('youtubeUrlHistory');
                      toast.success(
                        <motion.div
                          variants={toastVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="flex items-center gap-3 p-3 bg-gray-900/90 rounded-xl shadow-lg"
                        >
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                          <span className="text-sm font-light text-white">History cleared</span>
                        </motion.div>,
                        { autoClose: 3000 }
                      );
                    }}
                    className="p-2 bg-red-500/20 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-all"
                    title="Clear history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search history..."
                  className="w-full bg-white/5 rounded-lg border border-white/10 pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/20"
                />
              </div>
              <div className="mt-4 max-h-96 overflow-y-auto">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 mb-2 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-all cursor-pointer"
                      onClick={() => setUrl(item.url)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{item.url}</p>
                          <div className="flex items-center mt-1 text-xs text-white/60">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-white/60 text-sm text-center">No history available</p>
                )}
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05]">
              <h3 className="text-lg font-light mb-4">Learning Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Videos Processed</span>
                  <span className="font-medium text-white">{history.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Science Track</span>
                  <span className="font-medium text-blue-400">
                    {history.filter(item => item.track === 'Science').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Engineering Track</span>
                  <span className="font-medium text-green-400">
                    {history.filter(item => item.track === 'Engineering').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">This Week</span>
                  <span className="font-medium text-purple-400">
                    {history.filter(item => 
                      Date.now() - item.timestamp < 7 * 24 * 60 * 60 * 1000
                    ).length}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <AnimatePresence>
        {showTrackSelection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isLoading && setShowTrackSelection(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/[0.05] p-8 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-light text-white mb-2">Select Your Track</h2>
                <p className="text-white/60 font-light">Choose the learning path that best fits your goals</p>
              </div>
              {!isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trackOptions.map((track) => (
                    <motion.button
                      key={track.id}
                      onClick={() => handleTrackSelection(track.id as 'Science' | 'Engineering')}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 text-left overflow-hidden"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${track.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${track.gradient} bg-opacity-20`}>
                            {track.icon}
                          </div>
                          <div>
                            <h3 className="text-xl font-medium text-white">{track.name}</h3>
                            <p className="text-sm text-white/60">{track.description}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-white/40 font-medium">Subjects:</p>
                          <div className="flex flex-wrap gap-2">
                            {track.subjects.map((subject, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/70"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 mx-auto mb-4"
                  >
                    <Loader className="w-full h-full text-white/60" />
                  </motion.div>
                  <h3 className="text-xl font-light text-white mb-2">
                    Processing for {selectedTrack} Track
                  </h3>
                  <p className="text-white/60">
                    Analyzing video content and generating personalized learning materials...
                  </p>
                </div>
              )}
              {!isLoading && (
                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <button
                    onClick={() => setShowTrackSelection(false)}
                    className="text-white/60 hover:text-white/80 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportHistory}
        className="hidden"
      />
    </div>
  );
};
