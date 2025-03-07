
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useVideoEditor } from '../contexts/VideoEditorContext';

const Timeline: React.FC = () => {
  const {
    duration,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    playerRef,
    textOverlays,
    trimPoints,
    setTrimPoints,
  } = useVideoEditor();
  
  const [isDragging, setIsDragging] = useState(false);
  const [isTrimStartDragging, setIsTrimStartDragging] = useState(false);
  const [isTrimEndDragging, setIsTrimEndDragging] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / rect.width;
    const newTime = percentage * duration;
    
    setCurrentTime(newTime);
    if (playerRef.current) {
      playerRef.current.seekTo(newTime);
    }
  };
  
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleTimelineClick(e);
  };

  const handleTrimStartDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTrimStartDragging(true);
  };

  const handleTrimEndDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTrimEndDragging(true);
  };

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!timelineRef.current) return;
    if (isDragging || isTrimStartDragging || isTrimEndDragging) {
      const rect = timelineRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, offsetX / rect.width));
      const newTime = percentage * duration;
      
      if (isDragging) {
        setCurrentTime(newTime);
        if (playerRef.current) {
          playerRef.current.seekTo(newTime);
        }
      } else if (isTrimStartDragging) {
        const newStartTime = Math.min(newTime, trimPoints.endTime - 0.5);
        setTrimPoints({ startTime: newStartTime });
      } else if (isTrimEndDragging) {
        const newEndTime = Math.max(newTime, trimPoints.startTime + 0.5);
        setTrimPoints({ endTime: newEndTime });
      }
    }
  }, [
    isDragging,
    isTrimStartDragging,
    isTrimEndDragging,
    duration,
    setCurrentTime,
    playerRef,
    trimPoints,
    setTrimPoints
  ]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setIsTrimStartDragging(false);
    setIsTrimEndDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging || isTrimStartDragging || isTrimEndDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, isTrimStartDragging, isTrimEndDragging, handleDragMove, handleDragEnd]);

  // Generate time markers
  const timeMarkers = [];
  if (duration > 0) {
    const interval = duration <= 30 ? 5 : duration <= 60 ? 10 : 30;
    for (let time = 0; time <= duration; time += interval) {
      timeMarkers.push(time);
    }
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full mt-4">
      <div className="relative h-10 mb-6">
        {timeMarkers.map((time) => (
          <div
            key={time}
            className="timeline-time-marker"
            style={{ left: `${(time / duration) * 100}%` }}
          >
            {formatTime(time)}
          </div>
        ))}
        
        <div
          ref={timelineRef}
          className="absolute bottom-0 w-full h-6 bg-editor-timeline rounded-full cursor-pointer"
          onClick={handleTimelineClick}
          onMouseDown={handleDragStart}
        >
          {/* Trimmed area */}
          <div
            className="absolute h-full bg-editor-hover rounded-full"
            style={{
              left: `${(trimPoints.startTime / duration) * 100}%`,
              width: `${((trimPoints.endTime - trimPoints.startTime) / duration) * 100}%`,
            }}
          />
          
          {/* Trim handles */}
          <div
            className="absolute top-0 w-3 h-full bg-editor-muted rounded-l-full cursor-ew-resize z-10"
            style={{ left: `${(trimPoints.startTime / duration) * 100}%`, transform: 'translateX(-50%)' }}
            onMouseDown={handleTrimStartDragStart}
            title="Trim Start"
          />
          
          <div
            className="absolute top-0 w-3 h-full bg-editor-muted rounded-r-full cursor-ew-resize z-10"
            style={{ left: `${(trimPoints.endTime / duration) * 100}%`, transform: 'translateX(-50%)' }}
            onMouseDown={handleTrimEndDragStart}
            title="Trim End"
          />
          
          {/* Progress */}
          <div
            className="absolute h-full bg-editor-progress rounded-l-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          
          {/* Current position handle */}
          <div
            className="absolute top-0 w-2 h-full bg-white border-2 border-editor-progress rounded-full transform -translate-x-1/2 z-20"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
          
          {/* Text overlay markers */}
          {textOverlays.map((overlay) => (
            <React.Fragment key={overlay.id}>
              <div
                className="absolute top-[-4px] w-1 h-2 bg-white border border-editor-muted rounded-sm z-10"
                style={{ left: `${(overlay.startTime / duration) * 100}%` }}
                title={`Start: ${overlay.text}`}
              />
              <div
                className="absolute top-[-4px] w-1 h-2 bg-white border border-editor-muted rounded-sm z-10"
                style={{ left: `${(overlay.endTime / duration) * 100}%` }}
                title={`End: ${overlay.text}`}
              />
              <div
                className="absolute bottom-[-2px] h-1 bg-white z-10"
                style={{
                  left: `${(overlay.startTime / duration) * 100}%`,
                  width: `${((overlay.endTime - overlay.startTime) / duration) * 100}%`,
                }}
                title={overlay.text}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
