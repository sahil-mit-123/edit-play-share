
import React, { useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { useVideoEditor } from '../contexts/VideoEditorContext';

const VideoPlayer: React.FC = () => {
  const {
    videoUrl,
    isPlaying,
    currentTime,
    setCurrentTime,
    setDuration,
    playerRef,
    textOverlays,
    trimPoints,
    setIsPlaying,
  } = useVideoEditor();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const textOverlaysRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const player = playerRef.current;
    if (player && trimPoints.endTime > 0 && currentTime >= trimPoints.endTime) {
      player.seekTo(trimPoints.startTime);
      setCurrentTime(trimPoints.startTime);
    }
  }, [currentTime, trimPoints, setCurrentTime, playerRef]);

  const handleProgress = ({ playedSeconds }: { playedSeconds: number }) => {
    setCurrentTime(playedSeconds);
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const visibleOverlays = textOverlays.filter(
    (overlay) => currentTime >= overlay.startTime && currentTime <= overlay.endTime
  );

  if (!videoUrl) {
    return (
      <div className="relative w-full aspect-video bg-editor-background rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-editor-muted">Upload a video to begin editing</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group">
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width="100%"
        height="100%"
        playing={isPlaying}
        onProgress={handleProgress}
        onDuration={handleDuration}
        progressInterval={100}
        onEnded={() => setIsPlaying(false)}
        config={{
          file: {
            attributes: {
              style: { width: '100%', height: '100%', objectFit: 'contain' }
            }
          }
        }}
      />
      
      <div 
        ref={textOverlaysRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      >
        {visibleOverlays.map((overlay) => (
          <div
            key={overlay.id}
            className="absolute pointer-events-none select-none"
            style={{
              left: `${overlay.x}%`,
              top: `${overlay.y}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${overlay.fontSize}px`,
              color: overlay.color,
              textShadow: '0px 0px 4px rgba(0, 0, 0, 0.7)',
              whiteSpace: 'nowrap',
            }}
          >
            {overlay.text}
          </div>
        ))}
      </div>
      
      <div className="absolute bottom-0 left-0 w-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="text-white text-sm font-medium backdrop-blur-effect bg-black/40 rounded px-2 py-1 inline-block">
          {formatTime(currentTime)} / {formatTime(trimPoints.endTime)}
        </div>
      </div>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default VideoPlayer;
