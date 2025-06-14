import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleData } from '../Data/moduleData';
import { X } from 'lucide-react';
import JEEAcceleratorModule from './JEEAcceleratorModule';
import FormulaFusionModule from './FormulaFusionModule';
import ThreeDExplorerModule from './ThreeDExplorerModule';
import ProofBuilderModule from './ProofBuilderModule';
import NumericalNavigatorModule from './NumericalNavigatorModule';

interface ModuleContainerProps {
  module: ModuleData | null;
  isVisible: boolean;
  onClose: () => void;
  timestamp: number;
}

const ModuleContainer: React.FC<ModuleContainerProps> = ({ 
  module, 
  isVisible, 
  onClose, 
  timestamp 
}) => {
  if (!module) return null;

  const renderModule = () => {
    switch (module.type) {
      case 'JEE Accelerator':
        return <JEEAcceleratorModule module={module} />;
      case 'Formula Fusion':
        return <FormulaFusionModule module={module} />;
      case '3D Explorer':
        return <ThreeDExplorerModule module={module} />;
      case 'Proof Builder':
        return <ProofBuilderModule module={module} />;
      case 'Numerical Navigator':
        return <NumericalNavigatorModule module={module} />;
      default:
        return <div>Unknown module type</div>;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-900/50">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{module.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{module.title}</h2>
                  <p className="text-gray-400">{module.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                      {module.type}
                    </span>
                    <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                      Timestamp: {Math.floor(timestamp / 60)}:{String(Math.floor(timestamp % 60)).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 rounded-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Module Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              {renderModule()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModuleContainer;