
import React, { useEffect, useState } from 'react';
import { useVideoEditor, TextOverlay as TextOverlayType } from '../contexts/VideoEditorContext';
import { Trash2, AlignCenter, AlignLeft, AlignRight } from 'lucide-react';

const TextOverlayEditor: React.FC = () => {
  const {
    textOverlays,
    selectedOverlayId,
    updateTextOverlay,
    removeTextOverlay,
    setSelectedOverlayId,
    currentTime,
    duration,
    playerRef,
    setCurrentTime,
  } = useVideoEditor();

  const selectedOverlay = textOverlays.find((overlay) => overlay.id === selectedOverlayId);
  const [localText, setLocalText] = useState('');
  const [localFontSize, setLocalFontSize] = useState(24);
  const [localColor, setLocalColor] = useState('#FFFFFF');
  const [localPosition, setLocalPosition] = useState<'bottom' | 'center'>('bottom');
  const [localStartTime, setLocalStartTime] = useState(0);
  const [localEndTime, setLocalEndTime] = useState(0);
  const [localX, setLocalX] = useState(50);
  const [localY, setLocalY] = useState(90);

  // Update local state when selected overlay changes
  useEffect(() => {
    if (selectedOverlay) {
      setLocalText(selectedOverlay.text);
      setLocalFontSize(selectedOverlay.fontSize);
      setLocalColor(selectedOverlay.color);
      setLocalPosition(selectedOverlay.position);
      setLocalStartTime(selectedOverlay.startTime);
      setLocalEndTime(selectedOverlay.endTime);
      setLocalX(selectedOverlay.x);
      setLocalY(selectedOverlay.y);
    }
  }, [selectedOverlay]);

  // Update overlay when local state changes
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setLocalText(newText);
    if (selectedOverlayId) {
      updateTextOverlay(selectedOverlayId, { text: newText });
    }
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value);
    setLocalFontSize(newSize);
    if (selectedOverlayId) {
      updateTextOverlay(selectedOverlayId, { fontSize: newSize });
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setLocalColor(newColor);
    if (selectedOverlayId) {
      updateTextOverlay(selectedOverlayId, { color: newColor });
    }
  };

  const handlePositionChange = (position: 'bottom' | 'center') => {
    setLocalPosition(position);
    if (selectedOverlayId) {
      updateTextOverlay(selectedOverlayId, { 
        position,
        y: position === 'bottom' ? 90 : 50
      });
    }
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setLocalStartTime(newTime);
    if (selectedOverlayId) {
      updateTextOverlay(selectedOverlayId, { 
        startTime: Math.min(newTime, localEndTime - 0.1)
      });
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setLocalEndTime(newTime);
    if (selectedOverlayId) {
      updateTextOverlay(selectedOverlayId, { 
        endTime: Math.max(newTime, localStartTime + 0.1)
      });
    }
  };

  const handleXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newX = parseFloat(e.target.value);
    setLocalX(newX);
    if (selectedOverlayId) {
      updateTextOverlay(selectedOverlayId, { x: newX });
    }
  };

  const handleYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newY = parseFloat(e.target.value);
    setLocalY(newY);
    if (selectedOverlayId) {
      updateTextOverlay(selectedOverlayId, { y: newY });
    }
  };

  const handleDelete = () => {
    if (selectedOverlayId) {
      removeTextOverlay(selectedOverlayId);
    }
  };

  const handlePreviewAtStartTime = () => {
    if (selectedOverlay) {
      setCurrentTime(selectedOverlay.startTime);
      if (playerRef.current) {
        playerRef.current.seekTo(selectedOverlay.startTime);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!selectedOverlay) {
    if (textOverlays.length === 0) {
      return null;
    }
    
    return (
      <div className="mt-6 p-4 border border-editor-border rounded-lg bg-editor-surface">
        <h3 className="font-medium text-lg mb-3">Text Overlays</h3>
        <div className="text-sm text-editor-muted mb-3">Select a text overlay to edit</div>
        <div className="space-y-2">
          {textOverlays.map((overlay) => (
            <div 
              key={overlay.id}
              className="p-3 border border-editor-border rounded-md flex items-center justify-between cursor-pointer hover:bg-editor-hover transition-colors"
              onClick={() => setSelectedOverlayId(overlay.id)}
            >
              <div className="flex-1">
                <div 
                  className="text-editor-text font-medium mb-1 truncate"
                  style={{ color: overlay.color }}
                >
                  {overlay.text || 'Text Overlay'}
                </div>
                <div className="text-xs text-editor-muted">
                  {formatTime(overlay.startTime)} - {formatTime(overlay.endTime)}
                </div>
              </div>
              <div 
                className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-editor-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTextOverlay(overlay.id);
                }}
              >
                <Trash2 size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 border border-editor-border rounded-lg bg-editor-surface">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">Edit Text Overlay</h3>
        <button
          className="text-editor-muted hover:text-red-500 transition-colors"
          onClick={handleDelete}
          title="Delete overlay"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-editor-text">Text</label>
          <input
            type="text"
            value={localText}
            onChange={handleTextChange}
            className="input-field"
            placeholder="Enter overlay text"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-editor-text">Font Size</label>
            <input
              type="range"
              min="12"
              max="72"
              value={localFontSize}
              onChange={handleFontSizeChange}
              className="w-full"
            />
            <div className="text-xs text-editor-muted text-right">{localFontSize}px</div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-editor-text">Color</label>
            <div className="flex">
              <input
                type="color"
                value={localColor}
                onChange={handleColorChange}
                className="w-10 h-10 rounded-l-md border border-editor-border cursor-pointer"
              />
              <input
                type="text"
                value={localColor}
                onChange={handleColorChange}
                className="input-field rounded-l-none flex-1"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-editor-text mb-1 block">Position</label>
          <div className="flex border border-editor-border rounded-md overflow-hidden">
            <button
              className={`flex-1 py-2 px-4 flex items-center justify-center space-x-1 ${
                localPosition === 'center' ? 'bg-editor-hover' : ''
              }`}
              onClick={() => handlePositionChange('center')}
            >
              <AlignCenter size={16} />
              <span>Center</span>
            </button>
            <button
              className={`flex-1 py-2 px-4 flex items-center justify-center space-x-1 ${
                localPosition === 'bottom' ? 'bg-editor-hover' : ''
              }`}
              onClick={() => handlePositionChange('bottom')}
            >
              <AlignLeft size={16} />
              <span>Bottom</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-editor-text">Start Time</label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max={Math.min(localEndTime - 0.1, duration)}
                step="0.1"
                value={localStartTime}
                onChange={handleStartTimeChange}
                className="w-full"
              />
              <button
                className="ml-2 text-xs bg-editor-hover text-editor-text px-2 py-1 rounded"
                onClick={handlePreviewAtStartTime}
              >
                Go
              </button>
            </div>
            <div className="text-xs text-editor-muted text-right">{formatTime(localStartTime)}</div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-editor-text">End Time</label>
            <input
              type="range"
              min={Math.max(localStartTime + 0.1, 0)}
              max={duration}
              step="0.1"
              value={localEndTime}
              onChange={handleEndTimeChange}
              className="w-full"
            />
            <div className="text-xs text-editor-muted text-right">{formatTime(localEndTime)}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-editor-text">X Position (%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={localX}
              onChange={handleXChange}
              className="w-full"
            />
            <div className="text-xs text-editor-muted text-right">{localX}%</div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-editor-text">Y Position (%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={localY}
              onChange={handleYChange}
              className="w-full"
            />
            <div className="text-xs text-editor-muted text-right">{localY}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextOverlayEditor;
