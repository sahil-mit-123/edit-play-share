
import React, { useState, useCallback } from 'react';
import { VideoEditorProvider, useVideoEditor } from '../contexts/VideoEditorContext';
import VideoPlayer from '../components/VideoPlayer';
import Timeline from '../components/Timeline';
import VideoControls from '../components/VideoControls';
import TextOverlayEditor from '../components/TextOverlay';
import { processVideo, downloadVideo } from '../utils/videoProcessor';
import { Upload, Film, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const VideoEditor = () => {
  const {
    videoFile,
    setVideoFile,
    textOverlays,
    trimPoints,
    isProcessing,
    setIsProcessing,
    progressMessage,
    setProgressMessage,
  } = useVideoEditor();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is a video
      if (!file.type.startsWith('video/')) {
        toast.error('Please upload a valid video file');
        return;
      }
      
      setVideoFile(file);
      toast.success('Video uploaded successfully');
    }
  };

  const handleExport = useCallback(async () => {
    if (!videoFile) {
      toast.error('No video to export');
      return;
    }

    try {
      setIsProcessing(true);
      const processedVideo = await processVideo(
        videoFile,
        textOverlays,
        trimPoints,
        setProgressMessage
      );
      downloadVideo(processedVideo, `edited-${videoFile.name}`);
      toast.success('Video exported successfully!');
    } catch (error) {
      console.error('Error exporting video:', error);
      toast.error('Failed to export video. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgressMessage('');
    }
  }, [videoFile, textOverlays, trimPoints, setIsProcessing, setProgressMessage]);

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-medium tracking-tight text-editor-text mb-2">Video Editor</h1>
        <p className="text-editor-muted">
          Upload, edit, and export your videos with professional-quality text overlays
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {!videoFile ? (
          <div className="w-full aspect-video bg-editor-background rounded-lg border-2 border-dashed border-editor-border flex flex-col items-center justify-center animate-fade-in">
            <Film size={48} className="text-editor-muted mb-4" />
            <p className="text-editor-text font-medium mb-2">Upload a video to get started</p>
            <p className="text-editor-muted text-sm mb-6">
              Supported formats: MP4, WebM, MOV, AVI
            </p>
            <label className="btn-primary cursor-pointer flex items-center space-x-2">
              <Upload size={16} />
              <span>Select Video</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <>
            <div className="animate-fade-in">
              <VideoPlayer />
              <Timeline />
              <VideoControls />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <TextOverlayEditor />
              </div>
              
              <div className="col-span-1">
                <div className="mt-6 p-4 border border-editor-border rounded-lg bg-editor-surface">
                  <h3 className="font-medium text-lg mb-3">Export Video</h3>
                  <p className="text-editor-muted text-sm mb-4">
                    Export your edited video with all overlays and trims applied.
                  </p>
                  
                  {isProcessing ? (
                    <div className="text-center py-4">
                      <div className="loading-dots flex justify-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-editor-progress"></div>
                        <div className="w-3 h-3 rounded-full bg-editor-progress"></div>
                        <div className="w-3 h-3 rounded-full bg-editor-progress"></div>
                      </div>
                      <p className="text-editor-text">{progressMessage}</p>
                    </div>
                  ) : (
                    <button 
                      className="btn-primary w-full flex items-center justify-center gap-2"
                      onClick={handleExport}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          <span>Export Video</span>
                        </>
                      )}
                    </button>
                  )}
                  
                  <p className="text-xs text-editor-muted mt-4">
                    Processing may take some time depending on video length and complexity.
                  </p>
                </div>
                
                <div className="mt-6 p-4 border border-editor-border rounded-lg bg-editor-surface">
                  <h3 className="font-medium text-lg mb-3">Change Video</h3>
                  <label className="btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer">
                    <Upload size={16} />
                    <span>Select Another Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <VideoEditorProvider>
      <VideoEditor />
    </VideoEditorProvider>
  );
};

export default Index;
