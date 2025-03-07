
import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

export type TextOverlay = {
  id: string;
  text: string;
  position: 'bottom' | 'center';
  startTime: number;
  endTime: number;
  fontSize: number;
  color: string;
  x: number;
  y: number;
};

export type TrimPoint = {
  startTime: number;
  endTime: number;
};

type VideoEditorContextType = {
  videoFile: File | null;
  videoUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  videoRef: React.RefObject<HTMLVideoElement>;
  playerRef: React.RefObject<any>;
  textOverlays: TextOverlay[];
  selectedOverlayId: string | null;
  trimPoints: TrimPoint;
  isProcessing: boolean;
  progressMessage: string;
  setVideoFile: (file: File | null) => void;
  setVideoUrl: (url: string | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  addTextOverlay: () => void;
  updateTextOverlay: (id: string, updates: Partial<TextOverlay>) => void;
  removeTextOverlay: (id: string) => void;
  setSelectedOverlayId: (id: string | null) => void;
  setTrimPoints: (points: Partial<TrimPoint>) => void;
  resetTrimPoints: () => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setProgressMessage: (message: string) => void;
};

const VideoEditorContext = createContext<VideoEditorContextType | null>(null);

export const VideoEditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [trimPoints, setTrimPointsState] = useState<TrimPoint>({ startTime: 0, endTime: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [videoFile]);

  useEffect(() => {
    if (duration > 0 && trimPoints.endTime === 0) {
      setTrimPointsState({ startTime: 0, endTime: duration });
    }
  }, [duration, trimPoints.endTime]);

  const addTextOverlay = useCallback(() => {
    const newOverlay: TextOverlay = {
      id: `overlay-${Date.now()}`,
      text: 'Text Overlay',
      position: 'bottom',
      startTime: currentTime,
      endTime: Math.min(currentTime + 3, duration),
      fontSize: 24,
      color: '#FFFFFF',
      x: 50, // center position (percentage)
      y: 90, // bottom position (percentage)
    };
    setTextOverlays((prev) => [...prev, newOverlay]);
    setSelectedOverlayId(newOverlay.id);
  }, [currentTime, duration]);

  const updateTextOverlay = useCallback((id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays((prev) => 
      prev.map((overlay) => (overlay.id === id ? { ...overlay, ...updates } : overlay))
    );
  }, []);

  const removeTextOverlay = useCallback((id: string) => {
    setTextOverlays((prev) => prev.filter((overlay) => overlay.id !== id));
    if (selectedOverlayId === id) {
      setSelectedOverlayId(null);
    }
  }, [selectedOverlayId]);

  const setTrimPoints = useCallback((points: Partial<TrimPoint>) => {
    setTrimPointsState((prev) => ({ ...prev, ...points }));
  }, []);

  const resetTrimPoints = useCallback(() => {
    setTrimPointsState({ startTime: 0, endTime: duration });
  }, [duration]);

  const contextValue: VideoEditorContextType = {
    videoFile,
    videoUrl,
    isPlaying,
    currentTime,
    duration,
    videoRef,
    playerRef,
    textOverlays,
    selectedOverlayId,
    trimPoints,
    isProcessing,
    progressMessage,
    setVideoFile,
    setVideoUrl,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    addTextOverlay,
    updateTextOverlay,
    removeTextOverlay,
    setSelectedOverlayId,
    setTrimPoints,
    resetTrimPoints,
    setIsProcessing,
    setProgressMessage,
  };

  return (
    <VideoEditorContext.Provider value={contextValue}>
      {children}
    </VideoEditorContext.Provider>
  );
};

export const useVideoEditor = () => {
  const context = useContext(VideoEditorContext);
  if (!context) {
    throw new Error('useVideoEditor must be used within a VideoEditorProvider');
  }
  return context;
};
