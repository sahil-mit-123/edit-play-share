
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { TextOverlay, TrimPoint } from '../contexts/VideoEditorContext';

export const loadFFmpeg = async (
  setProgressMessage: (message: string) => void
): Promise<FFmpeg> => {
  const ffmpeg = new FFmpeg();
  
  ffmpeg.on('log', ({ message }) => {
    console.log(message);
  });
  
  ffmpeg.on('progress', ({ progress, time }) => {
    const percentage = Math.round(progress * 100);
    setProgressMessage(`Processing: ${percentage}%`);
  });

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  
  return ffmpeg;
};

export const processVideo = async (
  videoFile: File,
  textOverlays: TextOverlay[],
  trimPoints: TrimPoint,
  setProgressMessage: (message: string) => void
): Promise<Blob> => {
  setProgressMessage('Initializing video processor...');
  const ffmpeg = await loadFFmpeg(setProgressMessage);
  
  // Write the input file to memory
  setProgressMessage('Loading video...');
  await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
  
  // Create filter complex for trimming and text overlays
  let filterComplex = '';
  let filterInputs = '[0:v]';
  let currentOutput = 'v0';
  
  // Apply trimming
  if (trimPoints.startTime > 0 || trimPoints.endTime < videoFile.duration) {
    const duration = trimPoints.endTime - trimPoints.startTime;
    filterComplex += `${filterInputs}trim=start=${trimPoints.startTime}:duration=${duration},setpts=PTS-STARTPTS[${currentOutput}];`;
    filterInputs = `[${currentOutput}]`;
    currentOutput = 'v1';
  }
  
  // Apply text overlays
  if (textOverlays.length > 0) {
    setProgressMessage('Adding text overlays...');
    
    textOverlays.forEach((overlay, index) => {
      const nextOutput = `v${Number(currentOutput.substring(1)) + 1}`;
      const x = `(W*${overlay.x/100})`;
      const y = `(H*${overlay.y/100})`;
      
      // Escape special characters in text
      const escapedText = overlay.text.replace(/'/g, "'\\''");
      
      // Create the drawtext filter for this overlay
      const drawTextFilter = `drawtext=text='${escapedText}':fontsize=${overlay.fontSize}:fontcolor=${overlay.color}:x=${x}-text_w/2:y=${y}-text_h/2:enable='between(t,${overlay.startTime},${overlay.endTime})'`;
      
      filterComplex += `${filterInputs}${drawTextFilter}[${nextOutput}];`;
      filterInputs = `[${nextOutput}]`;
      currentOutput = nextOutput;
    });
  }
  
  // Get the final output label
  const finalOutput = currentOutput;
  
  // Build the FFmpeg command
  let command = [
    '-i', 'input.mp4',
    '-filter_complex', filterComplex.slice(0, -1), // Remove the last semicolon
    '-map', `[${finalOutput}]`,
    '-map', '0:a?', // Map audio if exists
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-preset', 'ultrafast', // Use ultrafast preset for faster encoding
    'output.mp4'
  ];
  
  // Execute the FFmpeg command
  setProgressMessage('Processing video...');
  await ffmpeg.exec(command);
  
  // Read the output file
  setProgressMessage('Finalizing video...');
  const data = await ffmpeg.readFile('output.mp4');
  
  // Create and return the processed video blob
  const blob = new Blob([data], { type: 'video/mp4' });
  setProgressMessage('Video processing complete!');
  
  return blob;
};

export const downloadVideo = (blob: Blob, filename: string = 'edited-video.mp4') => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
