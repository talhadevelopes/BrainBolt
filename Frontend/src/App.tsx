import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { YouTubeLearningPortal } from "./components/YtInput/YouTubeInputCard";
import { MainLanding } from "./components/Landing/Main-Landing";
import { MainQuiz } from "./components/Knowledge-Check/MainQuiz";
import { MainResources } from "./components/Resources/MainResources";
import { CodePlayground } from "./components/CodeDojo/Codeplayground";
import { CompetitiveArena } from "./components/CP/CompetitiveArena";
import { Signup } from "./components/Auth/Signup";
import { Login } from "./components/Auth/Login";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { TheoryContent } from "./components/Content/TheoryContent";
// import { Layout } from 'lucide-react';
import { Layout } from "./components/Linear/Test/Layout";
import { SteamLayout } from "./components/STEM/Layout";
import { BugHunter } from "./components/CP/BugHunterArena";
import { QuizArena } from "./components/CP/QuizArena";

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MainLanding />} />
          <Route path="/input" element={<YouTubeLearningPortal />} />
          <Route path="/content" element={<TheoryContent />} />
          <Route path="/code" element={<CodePlayground />} />
          <Route path="/cp" element={<CompetitiveArena />} />
          <Route path="/kc" element={<MainQuiz />} />
          <Route path="/rh" element={<MainResources />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/steam" element={<SteamLayout />} />
          <Route path="/steam" element={<BugHunter />} />
          <Route path="/steam" element={<QuizArena />} />

          <Route path="/Test" element={<Layout />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
};

export default App;
