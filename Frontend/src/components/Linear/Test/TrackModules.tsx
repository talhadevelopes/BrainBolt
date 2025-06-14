import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PCMTrack } from '../Data/hardcodedData';
import { pcmTracks } from '../Data/hardcodedData';
import { TimestampModule } from '../Data/moduleAssignment';
import { Play, BarChart3, Clock, BookOpen, Target } from 'lucide-react';

interface TrackModulesProps {
  timestampModules: TimestampModule[];
}

const TrackModules: React.FC<TrackModulesProps> = ({ timestampModules }) => {
  const [selectedTrack, setSelectedTrack] = useState<PCMTrack | null>(null);
  const [activeTab, setActiveTab] = useState<'tracks' | 'modules'>('modules');

  const moduleTypeStats = timestampModules.reduce((acc, tm) => {
    acc[tm.module.type] = (acc[tm.module.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getModuleTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'JEE Accelerator': 'from-blue-600 to-blue-800',
      'Formula Fusion': 'from-purple-600 to-purple-800',
      '3D Explorer': 'from-green-600 to-green-800',
      'Proof Builder': 'from-orange-600 to-orange-800',
      'Numerical Navigator': 'from-cyan-600 to-cyan-800'
    };
    return colors[type] || 'from-gray-600 to-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl">
        <div className="flex border-b border-gray-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('modules')}
            className={`flex-1 p-4 text-center font-medium transition-colors ${
              activeTab === 'modules'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen size={16} className="inline mr-2" />
            Learning Modules
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('tracks')}
            className={`flex-1 p-4 text-center font-medium transition-colors ${
              activeTab === 'tracks'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            <Play size={16} className="inline mr-2" />
            Audio Tracks
          </motion.button>
        </div>

        <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
          {activeTab === 'modules' ? (
            <>
              {/* Module Statistics */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 size={16} className="text-purple-400" />
                  Module Distribution
                </h3>
                <div className="space-y-3">
                  {Object.entries(moduleTypeStats).map(([type, count]) => (
                    <div key={type} className="bg-gray-700/30 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white text-sm font-medium">{type}</span>
                        {/* @ts-ignore */}
                        <span className="text-gray-400 text-sm">{count} modules</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                        //   @ts-ignore
                          animate={{ width: `${(count / timestampModules.length) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={`h-2 rounded-full bg-gradient-to-r ${getModuleTypeColor(type)}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned Modules */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target size={16} className="text-green-400" />
                  Assigned Modules
                </h3>
                {timestampModules.map((tm, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30 hover:border-gray-500/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getModuleTypeColor(tm.module.type)} flex items-center justify-center text-xl`}>
                        {tm.module.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-white text-sm">{tm.module.title}</h4>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={12} />
                            <span>{Math.floor(tm.timestamp.time / 60)}:{String(Math.floor(tm.timestamp.time % 60)).padStart(2, '0')}</span>
                          </div>
                        </div>
                        <p className="text-gray-400 text-xs mb-2 line-clamp-2">{tm.module.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full text-xs">
                            {tm.module.type}
                          </span>
                          <span className="bg-gray-600/20 text-gray-400 px-2 py-1 rounded-full text-xs">
                            {tm.timestamp.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* PCM Tracks */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Play size={16} className="text-blue-400" />
                  Background Audio
                </h3>
                        {/* @ts-ignore */}

                {pcmTracks.map(track => (
                  <motion.div 
                    key={track.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-lg transition-all cursor-pointer ${
                      selectedTrack?.id === track.id
                        ? 'bg-blue-900/30 border-2 border-blue-500'
                        : 'bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30'
                    }`}
                    onClick={() => setSelectedTrack(track)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-br from-blue-600 to-purple-600 w-14 h-14 rounded-lg flex items-center justify-center">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white">{track.title}</h4>
                        <p className="text-gray-400 text-sm">{track.duration} • {track.bpm} BPM</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="bg-gray-600/50 text-gray-300 px-2 py-1 rounded-full text-xs">
                            {track.key}
                          </span>
                          <span className="bg-gray-600/50 text-gray-300 px-2 py-1 rounded-full text-xs">
                            {track.mood}
                          </span>
                        {/* @ts-ignore */}
                          {track.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="bg-gray-600/50 text-gray-300 px-2 py-1 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Selected Track Preview */}
              {selectedTrack && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border-t border-gray-700 bg-gray-900/50 rounded-lg"
                >
                  <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                    <Play size={16} className="text-green-400" />
                    Now Playing: {selectedTrack.title}
                  </h4>
                  <div className="flex items-center gap-4">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full"
                    >
                      <Play className="h-6 w-6" />
                    </motion.button>
                    <div className="flex-1">
                      <div className="w-full h-2 bg-gray-700 rounded-full">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '33%' }}
                          transition={{ duration: 2 }}
                          className="h-full bg-blue-500 rounded-full"
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-400 mt-1">
                        <span>0:15</span>
                        <span>{selectedTrack.duration}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Player Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-2xl"
      >
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-yellow-400" />
          Session Stats
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Modules Assigned</span>
            <span className="text-white font-medium">{timestampModules.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Module Types</span>
            <span className="text-white font-medium">{Object.keys(moduleTypeStats).length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Audio Tracks</span>
            <span className="text-white font-medium">{pcmTracks.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Selected Track</span>
            <span className="text-white font-medium text-xs">
              {selectedTrack ? selectedTrack.title : 'None'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TrackModules;