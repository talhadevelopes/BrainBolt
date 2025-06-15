"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import YouTube, { type YouTubeProps } from "react-youtube"

interface YouTubePlayerProps {
  videoId: string
  onReady?: (event: any) => void
  onStateChange?: (event: any) => void
  onTimeUpdate?: (time: number) => void
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, onReady, onStateChange, onTimeUpdate }) => {
  const playerRef = useRef<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const opts: YouTubeProps["opts"] = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
    },
  }

  const handlePlayerReady: YouTubeProps["onReady"] = (event) => {
    playerRef.current = event.target
    onReady?.(event)
  }

  const handlePlayerStateChange: YouTubeProps["onStateChange"] = (event) => {
    onStateChange?.(event)

    const isPlaying = event.data === 1 // YouTube.PlayerState.PLAYING
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (playerRef.current) {
          playerRef.current.getCurrentTime().then((time: number) => {
            onTimeUpdate?.(time)
          })
        }
      }, 1000) // Update every second
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  if (!videoId) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#1e293b",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          textAlign: "center",
        }}
      >
        <div style={{ padding: "20px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              backgroundColor: "#334155",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg style={{ width: "32px", height: "32px", fill: "#64748b" }} viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <p>Enter a YouTube video ID to start learning</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#000", borderRadius: "8px", overflow: "hidden" }}>
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={handlePlayerReady}
        onStateChange={handlePlayerStateChange}
        className="youtube-player-iframe" // Use a class for external CSS if needed
        iframeClassName="youtube-player-iframe"
      />
      <style>
        {`
          .youtube-player-iframe {
            width: 100%;
            height: 100%;
          }
        `}
      </style>
    </div>
  )
}
