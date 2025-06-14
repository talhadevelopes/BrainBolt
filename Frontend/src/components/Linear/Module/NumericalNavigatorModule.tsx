import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ModuleData } from '../Data/moduleData';
import { Calculator, Settings, TrendingUp, Play, RotateCcw } from 'lucide-react';

interface NumericalNavigatorModuleProps {
  module: ModuleData;
}

const NumericalNavigatorModule: React.FC<NumericalNavigatorModuleProps> = ({ module }) => {
  const [selectedProblem, setSelectedProblem] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedParameters, setSelectedParameters] = useState<{ [key: string]: number }>({});
  const [isCalculating, setIsCalculating] = useState(false);

  const problems = module.content.problems;
  const problem = problems[selectedProblem];

  const handleParameterChange = (param: string, value: number) => {
    setSelectedParameters(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const runCalculation = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
    }, 2000);
  };

  const resetCalculation = () => {
    setCurrentStep(0);
    setSelectedParameters({});
    setIsCalculating(false);
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Problem List */}
        <div className="lg:col-span-1">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calculator size={20} className="text-cyan-400" />
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
                    ? 'bg-cyan-600/20 border-2 border-cyan-500'
                    : 'bg-gray-700/30 hover:bg-gray-600/40 border border-gray-600'
                }`}
                onClick={() => {
                  setSelectedProblem(index);
                  resetCalculation();
                }}
              >
                <h4 className="font-bold text-white text-sm mb-2">{prob.title}</h4>
                <p className="text-gray-400 text-xs mb-2 line-clamp-2">{prob.description}</p>
                <div className="flex justify-between items-center">
                  <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">
                    {prob.method}
                  </span>
                  <span className="text-xs text-gray-400">{prob.timeRequired}min</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Methods */}
          <div className="mt-6">
            <h4 className="text-lg font-bold text-white mb-3">Methods</h4>
            {module.content.methods.map((method: any, index: number) => (
              <div key={index} className="mb-4 bg-gray-800/30 p-3 rounded-lg">
                <h5 className="font-medium text-gray-300 mb-2">{method.name}</h5>
                <div className="space-y-1">
                  {method.examples.map((example: string, exIndex: number) => (
                    <div key={exIndex} className="text-xs text-gray-400">• {example}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculation Interface */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold text-white">{problem.title}</h4>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={resetCalculation}
                  className="p-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white"
                >
                  <RotateCcw size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={runCalculation}
                  disabled={isCalculating}
                  className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white"
                >
                  <Play size={16} />
                </motion.button>
              </div>
            </div>

            <p className="text-gray-300 mb-4">{problem.description}</p>

            {/* Governing Equation */}
            <div className="mb-6 p-4 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg border border-cyan-500/30">
              <h5 className="font-bold text-white mb-2">Governing Equation</h5>
              <div className="bg-gray-900/70 p-3 rounded font-mono text-cyan-300 text-center">
                {problem.equation}
              </div>
              <p className="text-gray-400 text-sm mt-2">Method: {problem.method}</p>
            </div>

            {/* Parameter Controls */}
            <div className="mb-6">
              <h5 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Settings size={16} className="text-yellow-400" />
                Parameters
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(problem.parameters).map(([param, values]: [string, any]) => (
                  <div key={param} className="bg-gray-900/50 p-4 rounded-lg">
                    <label className="block text-gray-300 font-medium mb-2">{param}</label>
                    <select
                      value={selectedParameters[param] || values[0]}
                      onChange={(e) => handleParameterChange(param, parseFloat(e.target.value))}
                      className="w-full bg-gray-700 text-white rounded-lg p-2 border border-gray-600"
                    >
                      {values.map((value: number, index: number) => (
                        <option key={index} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 text-xs text-gray-400">
                      Current: {selectedParameters[param] || values[0]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculation Steps */}
            <div className="mb-6">
              <h5 className="text-lg font-bold text-white mb-4">Solution Steps</h5>
              <div className="space-y-4">
                {problem.steps.map((step: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: index <= currentStep || isCalculating ? 1 : 0.3,
                      x: 0 
                    }}
                    transition={{ delay: index * 0.2 }}
                    className={`p-4 rounded-lg border-l-4 ${
                      index <= currentStep || isCalculating
                        ? 'bg-cyan-900/30 border-cyan-500'
                        : 'bg-gray-800/20 border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index <= currentStep || isCalculating ? 'bg-cyan-600 text-white' : 'bg-gray-600 text-gray-400'
                      }`}>
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-900/70 p-3 rounded-lg mb-2 font-mono text-gray-300 border">
                          {step.equation}
                        </div>
                        <p className="text-gray-400">{step.explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {isCalculating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg flex items-center"
                >
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400 mr-3"></div>
                  <span className="text-yellow-300">Calculating numerical solution...</span>
                </motion.div>
              )}

              <div className="flex justify-center mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentStep(Math.min(currentStep + 1, problem.steps.length - 1))}
                  disabled={currentStep >= problem.steps.length - 1 || isCalculating}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-medium"
                >
                  {currentStep >= problem.steps.length - 1 ? 'Solution Complete' : 'Next Step'}
                </motion.button>
              </div>
            </div>

            {/* Solution */}
            {currentStep >= problem.steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-gradient-to-r from-green-900/30 to-cyan-900/30 rounded-lg border border-green-500/30"
              >
                <h5 className="font-bold text-white mb-3 flex items-center gap-2">
                  <TrendingUp size={20} className="text-green-400" />
                  Final Solution
                </h5>
                <div className="bg-gray-900/70 p-4 rounded-lg font-mono text-green-300 text-center text-lg">
                  {problem.solution}
                </div>
                <div className="mt-3 text-sm text-gray-400">
                  Accuracy: ±{problem.accuracy} • Time Required: {problem.timeRequired} minutes
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Domain Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {module.content.domains.map((domain: any, index: number) => (
          <div key={index} className="bg-gray-800/30 p-4 rounded-lg">
            <h5 className="font-bold text-white">{domain.name}</h5>
            <p className="text-gray-400 text-sm">{domain.problemCount} problems</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-cyan-500 h-2 rounded-full" 
                style={{ width: `${(domain.problemCount / 50) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NumericalNavigatorModule;