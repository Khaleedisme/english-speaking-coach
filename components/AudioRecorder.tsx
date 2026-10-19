import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, RefreshCw } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isProcessing: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Audio Visualization Setup
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      drawVisualizer();

      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDuration(0);
      
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Please allow microphone access to use this feature.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#f8fafc'; // Match bg
      ctx.fillRect(0, 0, width, height);

      const barWidth = (width / dataArray.length) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        barHeight = dataArray[i] / 2;
        ctx.fillStyle = `rgb(59, 130, 246)`; // Blue-500
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 w-full max-w-md mx-auto">
      {isProcessing ? (
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-slate-600 font-medium">Analyzing your speech...</p>
          <p className="text-slate-400 text-sm">Checking pronunciation & grammar</p>
        </div>
      ) : (
        <>
          <div className="mb-6 relative w-full h-32 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center border border-slate-100">
             {isRecording ? (
               <canvas ref={canvasRef} width="400" height="128" className="w-full h-full" />
             ) : (
               <div className="text-center text-slate-400">
                 <Mic className="w-12 h-12 mx-auto mb-2 opacity-50" />
                 <p className="text-sm">Ready to record</p>
               </div>
             )}
          </div>
          
          <div className="text-4xl font-mono font-bold text-slate-800 mb-8 tracking-wider">
            {formatTime(duration)}
          </div>

          <div className="flex gap-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="group relative flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                <Mic className="w-8 h-8 text-white" />
                <span className="absolute -bottom-8 text-sm font-medium text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">Record</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="group relative flex items-center justify-center w-20 h-20 bg-red-500 rounded-full hover:bg-red-600 transition-all shadow-lg hover:shadow-red-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-200"
              >
                <Square className="w-8 h-8 text-white fill-current" />
                <span className="absolute -bottom-8 text-sm font-medium text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">Stop</span>
              </button>
            )}
          </div>
          
          <p className="mt-12 text-slate-400 text-sm text-center max-w-xs">
            Try to speak for at least 30 seconds about your day or a specific topic.
          </p>
        </>
      )}
    </div>
  );
};

export default AudioRecorder;
