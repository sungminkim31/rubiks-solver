import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, X } from 'lucide-react';

interface ScannerProps {
  onComplete: (faces: Record<string, string[]>) => void;
  onCancel: () => void;
}

const FACE_NAMES = ['UP', 'RIGHT', 'FRONT', 'DOWN', 'LEFT', 'BACK'];
const FACE_ORDER = ['U', 'R', 'F', 'D', 'L', 'B'];

export const CubeScanner = ({ onComplete, onCancel }: ScannerProps) => {
  const [currentFaceIndex, setCurrentFaceIndex] = useState(0);
  const [scannedFaces, setScannedFaces] = useState<Record<string, string[]>>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
        console.error("Camera access failed:", err);
      }
    };
    startCamera();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  const captureFace = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    const size = 300;
    canvasRef.current.width = size;
    canvasRef.current.height = size;
    
    // Capture the center square of the video
    const video = videoRef.current;
    const minDim = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - minDim) / 2;
    const sy = (video.videoHeight - minDim) / 2;
    
    ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, size, size);
    
    // Grid sampling logic
    const detectedColors: string[] = [];
    const cellSize = size / 3;
    const sampleSize = 20; // px
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;
        
        const pixelData = ctx.getImageData(x - sampleSize/2, y - sampleSize/2, sampleSize, sampleSize).data;
        
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < pixelData.length; i += 4) {
          r += pixelData[i];
          g += pixelData[i+1];
          b += pixelData[i+2];
        }
        const count = pixelData.length / 4;
        r /= count; g /= count; b /= count;
        
        // Simple color classifier
        let color = 'K';
        
        if (r > 150 && g > 150 && b > 150) color = 'W'; // White
        else if (r > 150 && g > 150 && b < 100) color = 'Y'; // Yellow
        else if (r > 150 && g < 100 && b < 100) color = 'R'; // Red
        else if (r > 150 && g < 150 && b < 100) color = 'O'; // Orange (simplified)
        else if (g > 100 && r < 100 && b < 100) color = 'G'; // Green
        else if (b > 100 && r < 100 && g < 100) color = 'B'; // Blue
        
        detectedColors.push(color);
      }
    }
    
    const faceKey = FACE_ORDER[currentFaceIndex];
    const newScanned = { ...scannedFaces, [faceKey]: detectedColors };
    setScannedFaces(newScanned);

    if (currentFaceIndex < 5) {
      setCurrentFaceIndex(currentFaceIndex + 1);
    } else {
      onComplete(newScanned);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4"
    >
      <div className="w-full max-w-md relative flex flex-col h-full">
        <button onClick={onCancel} className="absolute top-0 right-0 p-4 text-white z-10 hover:text-red-400 transition-colors"><X size={40} /></button>
        
        <div className="text-center mt-8 mb-4">
          <h2 className="text-3xl font-black text-blue-400 uppercase tracking-widest mb-2">Scan {FACE_NAMES[currentFaceIndex]}</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <p className="text-white font-bold">Align the cube face</p>
          </div>
        </div>

        <div className="relative aspect-square w-full bg-gray-900 rounded-[3rem] overflow-hidden border-4 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          
          {/* Visual Feedback: Scanned Faces mini-grid */}
          <div className="absolute top-4 left-4 grid grid-cols-3 gap-1 bg-black/50 p-2 rounded-xl backdrop-blur-md border border-white/10">
            {FACE_ORDER.map((f, i) => (
              <div key={f} className={`w-4 h-4 rounded-sm border ${scannedFaces[f] ? 'bg-green-500' : i === currentFaceIndex ? 'bg-blue-500 animate-pulse' : 'bg-white/10'}`} />
            ))}
          </div>

          {/* Overlay Grid */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-12 gap-4 pointer-events-none">
            {Array(9).fill(0).map((_, i) => (
              <div key={i} className="border-4 border-white/40 rounded-2xl shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-6 py-8">
          <button 
            onClick={captureFace}
            className="w-full py-10 bg-blue-500 rounded-[3rem] text-4xl font-black uppercase flex items-center justify-center gap-6 shadow-[0_20px_50px_rgba(59,130,246,0.4)] active:scale-95 transition-all"
          >
            <Camera size={48} />
            Capture
          </button>
          
          <div className="text-center">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Capture all 6 faces to solve</p>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} width="300" height="300" className="hidden" />
    </motion.div>
  );
};
