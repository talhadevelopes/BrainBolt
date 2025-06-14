import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ModuleData } from '../Data/moduleData';
import { BookOpen, Clock, Target, Lightbulb, ChevronRight } from 'lucide-react';

interface JEEAcceleratorModuleProps {
  module: ModuleData;
}

const JEEAcceleratorModule: React.FC<JEEAcceleratorModuleProps> = ({ module }) => {
  const [selectedProblem, setSelectedProblem] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const problems = module.content.problems;
  const problem = problems[selectedProblem];
  const solutionLines = problem.solution.split('\n').filter((line: string) => line.trim());

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Problem List */}
        <div className="lg:col-span-1">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-400" />
            Problems
          </h3>
          <div className="space-y-3">
            {problems.map((prob: any, index: number) => (
              <motion.div
                key={prob.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedProblem === index
                    ? 'bg-blue-600/20 border-2 border-blue-500'
                    : 'bg-gray-700/30 hover:bg-gray-600/40 border border-gray-600'
                }`}
                onClick={() => {
                  setSelectedProblem(index);
                  setShowSolution(false);
                  setCurrentStep(0);
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-blue-400 font-medium">Problem {index + 1}</span>
                  <span className="bg-orange-600/20 text-orange-400 px-2 py-1 rounded text-xs">
                    {prob.difficulty}
                  </span>
                </div>
                <p className="text-gray-300 text-sm line-clamp-2">{prob.topic}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {prob.timeRequired}min
                  </span>
                  <span className="flex items-center gap-1">
                    <Target size={12} />
                    {prob.marks} marks
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Problem Details */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm">
                  {problem.year}
                </span>
                <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                  {problem.topic}
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{problem.marks}</div>
                <div className="text-gray-400 text-sm">marks</div>
              </div>
            </div>

            <h4 className="text-lg font-bold text-white mb-4">Question:</h4>
            <p className="text-gray-300 leading-relaxed mb-6 bg-gray-900/50 p-4 rounded-lg">
              {problem.question}
            </p>

            <div className="flex gap-3 mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSolution(!showSolution)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  showSolution
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {showSolution ? 'Hide Solution' : 'Show Solution'}
              </motion.button>
              
              {showSolution && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentStep(0)}
                  className="px-4 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium"
                >
                  Reset Steps
                </motion.button>
              )}
            </div>

            {showSolution && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-500/30"
              >
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Lightbulb size={20} className="text-yellow-400" />
                  Step-by-Step Solution
                </h4>
                
                <div className="space-y-4">
                  {solutionLines.map((line: string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: index <= currentStep ? 1 : 0.3,
                        x: 0 
                      }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg ${
                        index <= currentStep
                          ? 'bg-gray-800/50 border-l-4 border-blue-500'
                          : 'bg-gray-800/20 border-l-4 border-gray-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <p className="text-gray-300 flex-1">{line.trim()}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-center mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentStep(Math.min(currentStep + 1, solutionLines.length - 1))}
                    disabled={currentStep >= solutionLines.length - 1}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-2"
                  >
                    {currentStep >= solutionLines.length - 1 ? 'Complete!' : 'Next Step'}
                    {currentStep < solutionLines.length - 1 && <ChevronRight size={16} />}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Similar Problems */}
            <div className="mt-6">
              <h4 className="text-lg font-bold text-white mb-3">Similar Problems</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {problem.similarProblems.map((similar: string, index: number) => (
                  <div key={index} className="bg-gray-700/30 p-3 rounded-lg">
                    <p className="text-gray-300 text-sm">{similar}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Panel */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {module.content.topics.map((topic: any, index: number) => (
          <div key={index} className="bg-gray-800/30 p-4 rounded-lg">
            <h5 className="font-bold text-white">{topic.name}</h5>
            <p className="text-gray-400 text-sm">{topic.problemCount} problems</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${topic.weightage}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{topic.weightage}% weightage</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JEEAcceleratorModule;