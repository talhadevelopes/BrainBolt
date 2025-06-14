// src/App.tsx
import React from 'react';
import YouTubePlayer from './YouTubePlayer';

export const Test: React.FC = () => {
  // Example timestamps in seconds
  const timestamps = [10, 25, 45, 70, 100, 130];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center py-12">
          <h1 className="text-4xl font-bold mb-4">YouTube Player with Timestamp Pauses</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Play, pause, and automatically stop at specific timestamps. 
            Video ID is stored in localStorage for persistence.
          </p>
        </header>
        
        <YouTubePlayer timestamps={timestamps} />
        
        <div className="mt-12 max-w-3xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How It Works
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">●</span>
              <div>
                <strong>Automatic Pauses:</strong> The player will automatically pause at each specified timestamp
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">●</span>
              <div>
                <strong>Resume Playback:</strong> Click the play button to continue from where it paused
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">●</span>
              <div>
                <strong>Skip Ahead:</strong> Use the "Skip to next timestamp" button to jump to the next pause point
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">●</span>
              <div>
                <strong>Persistent Video:</strong> The YouTube video ID is stored in localStorage for your convenience
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

