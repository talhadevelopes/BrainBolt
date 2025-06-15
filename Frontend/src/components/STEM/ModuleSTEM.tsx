import React from "react";
import { useSteamStore } from "../../stores/STEMstore";
import { motion } from "framer-motion";

interface ModuleStemProps {
  onModuleClick: (module: {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: number;
    topic: string;
    icon?: any;
  }) => void;
  onTestModule: () => void;
}

const ModuleStem: React.FC<ModuleStemProps> = ({ onModuleClick, onTestModule }) => {
  const { modules } = useSteamStore();
  console.log("Modules in ModuleStem:", modules);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div style={{ marginTop: "24px", padding: "0 16px" }}>
      <h2
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          marginBottom: "24px",
          color: "#60a5fa",
        }}
      >
        Learning Modules
      </h2>
      {modules.length === 0 ? (
        <p style={{ color: "#cbd5e0", fontSize: "16px" }}>
          No modules loaded. Please check if the video loaded successfully.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {modules.map((module) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                padding: "24px",
                backgroundColor: "#1a202c",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                color: "#fff",
                cursor: "pointer",
              }}
              onClick={() => onModuleClick(module)}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                {module.icon && <module.icon size={32} />}
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                >
                  {module.title}
                </h3>
              </div>
              <p style={{ color: "#a0aec0", marginBottom: "16px" }}>
                {module.description}
              </p>
              <p style={{ color: "#cbd5e0", fontSize: "14px", marginBottom: "16px" }}>
                Timestamp: {formatTime(module.timestamp)} | Topic: {module.topic}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTestModule();
                }}
                style={{
                  backgroundColor: "#f97316",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  border: "none",
                  transition: "background-color 0.2s",
                }}
              >
                Test Module
              </button>
              
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModuleStem;
