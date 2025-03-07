
import React from 'react';
import { useVideoEditor } from '../contexts/VideoEditorContext';
import { Play, Pause, SkipBack, SkipForward, Scissors, Plus, Download, RefreshCw } from 'lucide-react';

const VideoControls: React.FC = () => {
  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    playerRef,
    setCurrentTime,
    trimPoints,
    setTrimPoints,
    resetTrimPoints,
    addTextOverlay,
    videoFile,
  } = useVideoEditor();

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipBack = () => {
    const newTime = Math.max(currentTime - 5, 0);
    setCurrentTime(newTime);
    if (playerRef.current) {
      playerRef.current.seekTo(newTime);
    }
  };

  const handleSkipForward = () => {
    const newTime = Math.min(currentTime + 5, duration);
    setCurrentTime(newTime);
    if (playerRef.current) {
      playerRef.current.seekTo(newTime);
    }
  };

  const handleTrimStart = () => {
    setTrimPoints({ startTime: currentTime });
  };

  const handleTrimEnd = () => {
    setTrimPoints({ endTime: currentTime });
  };

  const handleExport = () => {
    // Export functionality is implemented in the Index component
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
      <div className="flex items-center space-x-2">
        <button
          className="video-control-button"
          onClick={handleSkipBack}
          title="Back 5 seconds"
          disabled={!videoFile}
        >
          <SkipBack size={20} />
        </button>
        
        <button
          className="video-control-button"
          onClick={handlePlayPause}
          title={isPlaying ? 'Pause' : 'Play'}
          disabled={!videoFile}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        
        <button
          className="video-control-button"
          onClick={handleSkipForward}
          title="Forward 5 seconds"
          disabled={!videoFile}
        >
          <SkipForward size={20} />
        </button>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          className="btn-secondary flex items-center space-x-1"
          onClick={handleTrimStart}
          title="Set trim start point"
          disabled={!videoFile}
        >
          <Scissors size={16} />
          <span>Set Start</span>
        </button>
        
        <button
          className="btn-secondary flex items-center space-x-1"
          onClick={handleTrimEnd}
          title="Set trim end point"
          disabled={!videoFile}
        >
          <Scissors size={16} />
          <span>Set End</span>
        </button>
        
        <button
          className="btn-secondary flex items-center space-x-1"
          onClick={resetTrimPoints}
          title="Reset trim points"
          disabled={!videoFile}
        >
          <RefreshCw size={16} />
          <span>Reset Trim</span>
        </button>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          className="btn-secondary flex items-center space-x-1"
          onClick={addTextOverlay}
          title="Add text overlay"
          disabled={!videoFile}
        >
          <Plus size={16} />
          <span>Add Text</span>
        </button>
        
        <button
          className="btn-primary flex items-center space-x-1"
          onClick={handleExport}
          title="Export video"
          disabled={!videoFile}
        >
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
};

export default VideoControls;
