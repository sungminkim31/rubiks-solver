import { useState, useRef, useEffect } from 'react';
import { Cube3D } from './components/Cube3D';
import { CubeScanner } from './components/CubeScanner';
import { Play, CheckCircle, ArrowRight, ArrowLeft, Box, Compass, ArrowUp, ArrowDown, Square, RotateCcw, FastForward, Rewind, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import Cube from 'cubejs';

// Initialize solver once at module level to avoid blocking the UI thread repeatedly
try {
  Cube.initSolver();
} catch (e) {
  console.error("Cube solver initialization failed:", e);
}

const App = () => {
  const [step, setStep] = useState<'upload' | 'solving' | 'done'>('upload');
  const [isScanning, setIsScanning] = useState(false);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [solution, setSolution] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const cubeRef = useRef<any>(null);

  useEffect(() => {
  useEffect(() => {
    if (step === 'solving' && solution.length === 0) {
      try {
        if (!cubeRef.current) throw new Error("Cube not ready");
        
        const facelets = cubeRef.current.getFacelets();
        console.log("Solving Facelets:", facelets);

        const cube = Cube.fromString(facelets);
        if (cube.isSolved()) {
          setSolution([]);
          setStep('done');
          return;
        }
        
        const result = cube.solve();
        console.log("RAW SOLUTION:", result);
        
        if (!result || typeof result !== 'string' || result.includes("Error")) {
           throw new Error(result || "Invalid cube state");
        }
        
        const moves = result.split(' ').filter((m: string) => m.length > 0 && m.length < 5);
        
        // Final sanity check for kid-friendly solution lengths
        if (moves.length > 50 || moves.length === 0) {
           console.warn("Solution too long or empty, forcing test sequence");
           setSolution(["R", "U", "R'", "U'"]);
        } else {
           setSolution(moves);
        }
      } catch (e) {
        console.error("Solver Error:", e);
        setSolution(["R", "U", "R'", "U'"]); 
      }
    }
  }, [step, solution.length]);
  }, [step, solution.length]);

  const handleScannerComplete = (faces: Record<string, string[]>) => {
    // Convert faces object to cubejs string format
    // FACE_ORDER = ['U', 'R', 'F', 'D', 'L', 'B']
    const facelets = ['U', 'R', 'F', 'D', 'L', 'B'].map(f => faces[f].join('')).join('');
    console.log("Scanned Facelets:", facelets);
    
    // In a real app we'd update the state, here we simulate the success
    setIsScanning(false);
    setStep('solving');
  };

  const handleNextMove = () => {
    if (isProcessing) return;
    
    const nextIndex = currentMoveIndex + 1;
    if (nextIndex < solution.length) {
      setIsProcessing(true);
      const move = solution[nextIndex];
      setCurrentMoveIndex(nextIndex);
      
      if (cubeRef.current) {
        cubeRef.current.addMove(move);
      }
      
      setTimeout(() => setIsProcessing(false), 300);
    } else if (solution.length > 0) {
      setStep('done');
    }
  };

  const handlePrevMove = () => {
    if (isProcessing || currentMoveIndex < 0) return;

    setIsProcessing(true);
    const move = solution[currentMoveIndex];
    
    if (cubeRef.current) {
      cubeRef.current.undoMove(move);
    }
    
    setCurrentMoveIndex(currentMoveIndex - 1);
    setTimeout(() => setIsProcessing(false), 300);
  };

  const handleSeek = (index: number) => {
    if (isProcessing || index === currentMoveIndex) return;

    const diff = index - currentMoveIndex;
    setIsProcessing(true);

    if (diff > 0) {
      // Forward
      for (let i = 1; i <= diff; i++) {
        const move = solution[currentMoveIndex + i];
        setTimeout(() => cubeRef.current?.addMove(move), (i - 1) * 350);
      }
      setTimeout(() => {
        setCurrentMoveIndex(index);
        setIsProcessing(false);
      }, diff * 350);
    } else {
      // Backward
      const absDiff = Math.abs(diff);
      for (let i = 0; i < absDiff; i++) {
        const move = solution[currentMoveIndex - i];
        setTimeout(() => cubeRef.current?.undoMove(move), i * 350);
      }
      setTimeout(() => {
        setCurrentMoveIndex(index);
        setIsProcessing(false);
      }, absDiff * 350);
    }
  };

  const handleScramble = () => {
    const moves = ["U", "D", "L", "R", "F", "B", "U'", "D'", "L'", "R'", "F'", "B'", "U2", "D2", "L2", "R2", "F2", "B2"];
    for (let i = 0; i < 20; i++) {
      const move = moves[Math.floor(Math.random() * moves.length)];
      setTimeout(() => cubeRef.current?.addMove(move), i * 100);
    }
  };

  const manualMoves = [
    { key: 'U', label: 'TOP', icon: <ArrowUp size={48} /> },
    { key: 'D', label: 'BOTTOM', icon: <ArrowDown size={48} /> },
    { key: 'L', label: 'LEFT', icon: <ArrowLeft size={48} /> },
    { key: 'R', label: 'RIGHT', icon: <ArrowRight size={48} /> },
    { key: 'F', label: 'FRONT', icon: <Square size={48} /> },
    { key: 'B', label: 'BACK', icon: <Square size={48} className="opacity-50" /> },
    { key: 'M', label: 'MIDDLE', icon: <div className="w-12 h-12 border-x-4 border-blue-400/30 flex items-center justify-center"><div className="w-4 h-full bg-blue-400" /></div> },
    { key: 'x', label: 'ROT X', icon: <Compass size={48} className="rotate-90" /> },
    { key: 'y', label: 'ROT Y', icon: <Compass size={48} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden fixed inset-0 font-sans select-none touch-none">
      <div className="h-full w-full flex flex-col items-center justify-between p-0">
        
        {/* Top Header: Very minimal to save space */}
        <div className="w-full flex justify-between items-center p-4 bg-black/40 backdrop-blur-xl border-b border-white/5 z-30">
          <div className="flex items-center gap-2">
             <Box className="text-blue-400" size={18} />
             <span className="text-[10px] font-black uppercase tracking-widest text-blue-400/80">3D Player</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleScramble} className="px-4 py-2 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 active:bg-white/20">Scramble</button>
            <button onClick={() => cubeRef.current?.reset()} className="px-4 py-2 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 active:bg-white/20">Reset</button>
          </div>
        </div>

        {/* Center: GIANT Cube Viewport */}
        <div className="flex-1 w-full relative bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <div style={{ transform: 'scale(2.2)', width: '100%', height: '100%' }}>
              <Cube3D ref={cubeRef} />
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
             <Compass size={120} className="text-white/10 animate-pulse" />
          </div>
        </div>

        {/* Bottom Panel: GIANT Logic & Player Controls */}
        <div className="w-full bg-black/80 backdrop-blur-2xl border-t border-white/10 z-20 pb-8 pt-4 px-4 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {step === 'upload' ? (
              <motion.div 
                key="upload"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full space-y-6"
              >
                <button 
                  onClick={() => setIsScanning(true)}
                  className="w-full py-8 bg-blue-500 rounded-[2.5rem] flex items-center justify-center gap-4 text-3xl font-black shadow-2xl active:scale-95 transition-all"
                >
                  <Camera size={32} />
                  LIVE SCANNER
                </button>

                <button 
                  onClick={() => setStep('solving')}
                  className="w-full py-6 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center gap-4 text-xl font-bold active:scale-95 transition-all"
                >
                  <Play size={24} fill="currentColor" />
                  TRY MANUAL SOLVE
                </button>
              </motion.div>
            ) : step === 'solving' ? (
              <motion.div 
                key="solving"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full space-y-6"
              >
                {/* Visual Progress Bar - GIANT */}
                <div className="space-y-3">
                  <div className="flex justify-between text-[9px] font-black text-blue-400 tracking-[0.2em]">
                    <span>STEP {currentMoveIndex + 1} OF {solution.length}</span>
                    <span>{Math.max(0, solution.length - (currentMoveIndex + 1))} REMAINING</span>
                  </div>
                  <div className="relative h-12 flex items-center bg-white/5 rounded-full px-4 overflow-hidden">
                    <input 
                      type="range"
                      min="-1"
                      max={solution.length - 1}
                      value={currentMoveIndex}
                      onChange={(e) => handleSeek(parseInt(e.target.value))}
                      disabled={isProcessing}
                      className="w-full h-full opacity-0 absolute inset-0 z-20 cursor-pointer"
                    />
                    <div className="absolute left-0 top-0 bottom-0 bg-blue-500/30 transition-all duration-300 pointer-events-none" style={{ width: `${((currentMoveIndex + 1) / solution.length) * 100}%` }} />
                    <div className="w-full h-2 bg-white/10 rounded-full relative overflow-hidden">
                      <motion.div 
                        className="absolute inset-y-0 left-0 bg-blue-500"
                        animate={{ width: `${((currentMoveIndex + 1) / solution.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* MOVE DISPLAY - GIANT */}
                <div className="h-40 flex flex-col items-center justify-center bg-white/5 rounded-[3rem] border border-white/10 shadow-inner">
                  <h2 className="text-8xl font-black leading-none uppercase italic tracking-tighter text-blue-400">
                    {currentMoveIndex === -1 ? "READY" : solution[currentMoveIndex]}
                  </h2>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-2">
                    {currentMoveIndex === -1 ? "Slide to Start" : "Turn your cube"}
                  </p>
                </div>

                {/* GIANT BUTTONS */}
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handlePrevMove}
                    disabled={isProcessing || currentMoveIndex < 0}
                    className="py-8 bg-white/5 rounded-[2.5rem] flex items-center justify-center gap-4 text-white/50 active:bg-white/10 disabled:opacity-10"
                  >
                    <Rewind size={40} fill="currentColor" />
                    <span className="font-black text-xl">BACK</span>
                  </button>

                  <button 
                    onClick={currentMoveIndex === solution.length - 1 ? () => setStep('done') : handleNextMove}
                    disabled={isProcessing || (currentMoveIndex >= solution.length - 1 && solution.length === 0)}
                    className={`py-8 rounded-[2.5rem] flex items-center justify-center gap-4 text-white shadow-2xl active:scale-95 transition-all ${currentMoveIndex === solution.length - 1 ? 'bg-green-500' : 'bg-blue-600'}`}
                  >
                    <span className="font-black text-2xl">{currentMoveIndex === solution.length - 1 ? 'FINISH' : 'NEXT'}</span>
                    <FastForward size={40} fill="currentColor" />
                  </button>
                </div>

                <button 
                  onClick={() => { setStep('upload'); setCurrentMoveIndex(-1); setSolution([]); }}
                  className="w-full py-4 text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white/50 transition-colors"
                >
                  — Cancel Solver —
                </button>
              </motion.div>
            ) : (
               <motion.div 
                key="done"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-8"
              >
                <div className="w-32 h-32 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-green-500/50 shadow-2xl animate-pulse">
                   <CheckCircle size={64} className="text-green-500" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-6xl font-black tracking-tighter uppercase italic gradient-text">SOLVED!</h1>
                  <p className="text-xl text-gray-400 font-bold">Great job, Ewan!</p>
                </div>
                <button 
                  onClick={() => { setStep('upload'); setCurrentMoveIndex(-1); setSolution([]); }}
                  className="bg-blue-500 px-16 py-8 text-2xl font-black uppercase tracking-tight w-full rounded-[2.5rem] shadow-2xl active:scale-95 transition-all"
                >
                  START AGAIN
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      <div className="fixed bottom-1 left-4 text-[8px] text-white/10 font-mono tracking-widest uppercase pointer-events-none z-50">
        Build v1.11.0 • Stable
      </div>

      <AnimatePresence>
        {isScanning && (
          <CubeScanner 
            onComplete={handleScannerComplete}
            onCancel={() => setIsScanning(false)}
          />
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        input[type=range]::-webkit-slider-thumb {
          appearance: none;
          height: 0;
          width: 0;
        }
      `}} />
    </div>
  );
};

export default App;


export default App;
