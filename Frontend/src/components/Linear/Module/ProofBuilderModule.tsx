import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ModuleData } from '../Data/moduleData';
import { FileText, CheckCircle, ArrowRight, Lightbulb, Target } from 'lucide-react';

interface ProofBuilderModuleProps {
  module: ModuleData;
}

const ProofBuilderModule: React.FC<ProofBuilderModuleProps> = ({ module }) => {
  const [selectedTheorem, setSelectedTheorem] = useState(0);
  const [proofStep, setProofStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showRelated, setShowRelated] = useState(false);

  const theorems = module.content.theorems;
  const theorem = theorems[selectedTheorem];

  const markStepComplete = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Basic': return 'text-green-400 bg-green-600/20';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-600/20';
      case 'Advanced': return 'text-red-400 bg-red-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Theorem List */}
        <div className="lg:col-span-1">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FileText size={20} className="text-orange-400" />
            Theorems
          </h3>
          <div className="space-y-3">
            {theorems.map((thm: any, index: number) => (
              <motion.div
                key={thm.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedTheorem === index
                    ? 'bg-orange-600/20 border-2 border-orange-500'
                    : 'bg-gray-700/30 hover:bg-gray-600/40 border border-gray-600'
                }`}
                onClick={() => {
                  setSelectedTheorem(index);
                  setProofStep(0);
                  setCompletedSteps([]);
                  setShowRelated(false);
                }}
              >
                <h4 className="font-bold text-white text-sm mb-2">{thm.name}</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(thm.difficulty)}`}>
                    {thm.difficulty}
                  </span>
                  <span className="text-xs text-gray-400">{thm.timeRequired}min</span>
                </div>
                <p className="text-gray-400 text-xs line-clamp-2">{thm.statement}</p>
              </motion.div>
            ))}
          </div>

          {/* Proof Methods */}
          <div className="mt-6">
            <h4 className="text-lg font-bold text-white mb-3">Proof Methods</h4>
            {module.content.proofMethods.map((method: any, index: number) => (
              <div key={index} className="mb-3 bg-gray-800/30 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <h5 className="font-medium text-gray-300">{method.name}</h5>
                  <span className="text-gray-400 text-sm">{method.examples} examples</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${(method.examples / 50) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proof Builder */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold text-white">{theorem.name}</h4>
              <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(theorem.difficulty)}`}>
                {theorem.difficulty}
              </span>
            </div>

            {/* Theorem Statement */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/30">
              <h5 className="font-bold text-white mb-2 flex items-center gap-2">
                <Target size={16} className="text-blue-400" />
                Theorem Statement
              </h5>
              <p className="text-gray-300 leading-relaxed">{theorem.statement}</p>
            </div>

            {/* Proof Steps */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-lg font-bold text-white">Proof Construction</h5>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    Progress: {completedSteps.length}/{theorem.steps.length}
                  </span>
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all" 
                      style={{ width: `${(completedSteps.length / theorem.steps.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {theorem.steps.map((step: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: index <= proofStep ? 1 : 0.3,
                      x: 0 
                    }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-lg transition-all ${
                      completedSteps.includes(index)
                        ? 'bg-green-900/30 border-2 border-green-500'
                        : index === proofStep
                          ? 'bg-orange-900/30 border-2 border-orange-500'
                          : 'bg-gray-800/30 border border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        completedSteps.includes(index)
                          ? 'bg-green-600 text-white'
                          : index === proofStep
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-600 text-gray-400'
                      }`}>
                        {completedSteps.includes(index) ? (
                          <CheckCircle size={16} />
                        ) : (
                          step.step
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-900/70 p-4 rounded-lg mb-3 border">
                          <p className="text-gray-300 font-medium">{step.statement}</p>
                        </div>
                        <p className="text-gray-400">{step.explanation}</p>
                        
                        {index === proofStep && !completedSteps.includes(index) && (
                          <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              markStepComplete(index);
                              if (index < theorem.steps.length - 1) {
                                setProofStep(index + 1);
                              }
                            }}
                            className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium flex items-center gap-2"
                          >
                            <CheckCircle size={16} />
                            Mark Complete
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {completedSteps.length < theorem.steps.length && (
                <div className="flex justify-center mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProofStep(Math.min(proofStep + 1, theorem.steps.length - 1))}
                    disabled={proofStep >= theorem.steps.length - 1}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-2"
                  >
                    Next Step
                    <ArrowRight size={16} />
                  </motion.button>
                </div>
              )}

              {completedSteps.length === theorem.steps.length && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-4 bg-green-900/30 border border-green-500 rounded-lg text-center"
                >
                  <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
                  <h6 className="text-xl font-bold text-green-400">Proof Complete!</h6>
                  <p className="text-green-300 mt-2">You have successfully constructed the proof.</p>
                </motion.div>
              )}
            </div>

            {/* Related Theorems & Applications */}
            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowRelated(!showRelated)}
                className="flex items-center gap-2 text-lg font-bold text-white mb-4"
              >
                <Lightbulb size={20} className="text-yellow-400" />
                Related & Applications
                <ArrowRight 
                  size={16} 
                  className={`transform transition-transform ${showRelated ? 'rotate-90' : ''}`} 
                />
              </motion.button>

              {showRelated && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="bg-purple-900/20 border border-purple-700/30 p-4 rounded-lg">
                    <h6 className="font-bold text-purple-300 mb-2">Related Theorems</h6>
                    <div className="space-y-2">
                      {theorem.relatedTheorems.map((related: string, index: number) => (
                        <div key={index} className="text-purple-200 text-sm">• {related}</div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-green-900/20 border border-green-700/30 p-4 rounded-lg">
                    <h6 className="font-bold text-green-300 mb-2">Applications</h6>
                    <div className="space-y-2">
                      {theorem.applications.map((app: string, index: number) => (
                        <div key={index} className="text-green-200 text-sm">• {app}</div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {module.content.categories.map((category: any, index: number) => (
          <div key={index} className="bg-gray-800/30 p-4 rounded-lg">
            <h5 className="font-bold text-white">{category.name}</h5>
            <p className="text-gray-400 text-sm">{category.theoremCount} theorems</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-orange-500 h-2 rounded-full" 
                style={{ width: `${(category.theoremCount / 30) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProofBuilderModule;