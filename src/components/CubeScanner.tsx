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
    ctx.drawImage(videoRef.current, 0, 0, 300, 300);
    
    // Grid detection logic placeholder
    // In a real implementation, we'd use color sampling here
    // For now, we simulate detection of the face colors
    const mockColors = ['W', 'R', 'G', 'Y', 'B', 'O'];
    const detectedColors = Array(9).fill(0).map(() => mockColors[Math.floor(Math.random() * mockColors.length)]);
    
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
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4"
    >
      <div className="w-full max-w-md relative">
        <button onClick={onCancel} className="absolute top-0 right-0 p-4 text-white z-10"><X size={32} /></button>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-blue-400 uppercase tracking-widest mb-2">Scan {FACE_NAMES[currentFaceIndex]} Face</h2>
          <p className="text-gray-400">Align the cube in the square</p>
        </div>

        <div className="relative aspect-square w-full bg-gray-900 rounded-[3rem] overflow-hidden border-4 border-blue-500/30">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale opacity-50" />
          
          {/* Overlay Grid */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-8 gap-2 pointer-events-none">
            {Array(9).fill(0).map((_, i) => (
              <div key={i} className="border-2 border-white/20 rounded-xl" />
            ))}
          </div>

          {/* Central Guide */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-2/3 h-2/3 border-2 border-blue-500 rounded-[2rem] animate-pulse" />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4">
          <button 
            onClick={captureFace}
            className="w-full py-6 bg-blue-500 rounded-[2rem] text-2xl font-black uppercase flex items-center justify-center gap-4 shadow-xl"
          >
            <Camera size={28} />
            Capture Face
          </button>
          
          <div className="flex justify-center gap-2 mt-4">
            {FACE_ORDER.map((f, i) => (
              <div 
                key={f} 
                className={`w-3 h-3 rounded-full ${i === currentFaceIndex ? 'bg-blue-400' : scannedFaces[f] ? 'bg-green-500' : 'bg-white/10'}`} 
              />
            ))}
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} width="300" height="300" className="hidden" />
    </motion.div>
  );
};
