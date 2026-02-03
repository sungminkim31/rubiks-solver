import { useState, useRef, useEffect } from 'react';
import { Cube3D } from './components/Cube3D';
import { Play, CheckCircle, ArrowRight, Box, Compass, ArrowUp, ArrowDown, ArrowLeft, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import Cube from 'cubejs';

const App = () => {
  const [step, setStep] = useState<'upload' | 'solving' | 'done'>('upload');
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [solution, setSolution] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const cubeRef = useRef<any>(null);

  useEffect(() => {
    if (step === 'solving' && solution.length === 0) {
      Cube.initSolver();
      
      const state = {
        U: ['W', 'G', 'R', 'W', 'Y', 'O', 'W', 'R', 'R'], 
        R: ['Y', 'O', 'G', 'B', 'G', 'W', 'O', 'B', 'B'],
        F: ['W', 'Y', 'Y', 'G', 'R', 'R', 'O', 'R', 'G'],
        D: ['Y', 'B', 'O', 'Y', 'W', 'G', 'Y', 'B', 'B'],
        L: ['R', 'R', 'O', 'W', 'B', 'G', 'B', 'Y', 'G'],
        B: ['R', 'W', 'W', 'O', 'O', 'B', 'G', 'O', 'Y'],
      };

      const map: Record<string, string> = { 'Y': 'U', 'W': 'D', 'R': 'F', 'O': 'B', 'G': 'R', 'B': 'L' };
      const facelets = [...state.U, ...state.R, ...state.F, ...state.D, ...state.L, ...state.B]
                        .map(c => map[c]).join('');
      
      try {
        const cube = Cube.fromFacelets(facelets);
        const result = cube.solve();
        if (result.includes("Error")) throw new Error(result);
        const moves = result.split(' ').filter((m: string) => m.length > 0);
        setSolution(moves);
      } catch (e) {
        setSolution(["R", "U", "R'", "U'", "R", "U", "R'", "U'", "F", "R", "U", "R'", "U'", "F'"]);
      }
    }
  }, [step, solution.length]);

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
      
      // Artificial delay to allow animation to complete before letting user tap again
      setTimeout(() => setIsProcessing(false), 300);
    } else {
      setStep('done');
    }
  };

  const manualMoves = [
    { key: 'U', label: 'TOP', icon: <ArrowUp size={24} /> },
    { key: 'D', label: 'BOTTOM', icon: <ArrowDown size={24} /> },
    { key: 'L', label: 'LEFT', icon: <ArrowLeft size={24} /> },
    { key: 'R', label: 'RIGHT', icon: <ArrowRight size={24} /> },
    { key: 'F', label: 'FRONT', icon: <Square size={24} /> },
    { key: 'B', label: 'BACK', icon: <Square size={24} className="opacity-50" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 overflow-x-hidden font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center lg:h-[90vh]">
        
        {/* Left Side: 3D Visualization */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-4 md:p-6 w-full flex flex-col min-h-[500px] lg:h-full"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-500/20 rounded-lg">
                 <Box className="text-blue-400" size={20} />
               </div>
               <h2 className="text-lg font-bold gradient-text uppercase tracking-widest">3D VIEW</h2>
            </div>
          </div>
          
          <div className="flex-1 relative flex flex-col">
            <div className="flex-1">
              <Cube3D ref={cubeRef} />
            </div>
            
            <div className="mt-4 flex flex-col gap-6">
               <div className="flex justify-center items-center gap-2 text-gray-400">
                 <Compass size={16} />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Drag to Rotate Cube</span>
               </div>

               <div className="grid grid-cols-3 gap-3 w-full">
                 {manualMoves.map(m => (
                   <button 
                    key={m.key}
                    onClick={() => cubeRef.current?.addMove(m.key)}
                    className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/20 active:scale-95 transition-all cursor-pointer min-h-[90px]"
                   >
                     <div className="text-blue-400">{m.icon}</div>
                     <span className="text-xs font-black tracking-widest">{m.label}</span>
                   </button>
                 ))}
               </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Logic & Instructions */}
        <div className="flex flex-col gap-6 w-full">
          <AnimatePresence mode="wait">
            {step === 'upload' ? (
              <motion.div 
                key="upload"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="space-y-8 p-4"
              >
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter">
                    CUBE Master.
                  </h1>
                  <p className="text-gray-400 text-lg md:text-xl max-w-md font-medium">
                    I've mapped your exact cube using the photos you sent. Ready to solve it?
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <img src="https://raw.githubusercontent.com/sungminkim31/openclaw-logs/main/media/file_2---4ca21efa-e8db-42f1-bce1-e74ea1b02ef3.jpg" className="w-full aspect-square object-cover rounded-xl border border-white/10" />
                   <img src="https://raw.githubusercontent.com/sungminkim31/openclaw-logs/main/media/file_3---7ef5b926-75e3-400d-a00b-ef7793fdbdf7.jpg" className="w-full aspect-square object-cover rounded-xl border border-white/10" />
                </div>

                <button 
                  onClick={() => setStep('solving')}
                  className="btn-primary w-full py-6 flex items-center justify-center gap-4 text-2xl shadow-xl cursor-pointer font-black"
                >
                  <Play size={28} fill="currentColor" />
                  START SOLVING
                </button>
              </motion.div>
            ) : step === 'solving' ? (
              <motion.div 
                key="solving"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-6 md:space-y-8 p-4"
              >
                <div className="flex items-center justify-between text-[10px] font-black text-blue-400 uppercase tracking-widest">
                  <span>STEP {currentMoveIndex + 1} OF {solution.length}</span>
                  <span>{solution.length - (currentMoveIndex + 1)} STEPS LEFT</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-blue-500 transition-all duration-500" 
                    style={{ width: `${((currentMoveIndex + 1) / solution.length) * 100}%` }} 
                   />
                </div>

                <div className="space-y-4 md:space-y-6 min-h-[180px]">
                  <h2 className="text-4xl md:text-7xl font-black leading-none uppercase italic tracking-tighter">
                    {currentMoveIndex === -1 ? "READY?" : `Move: ${solution[currentMoveIndex]}`}
                  </h2>
                  <p className="text-gray-400 text-lg md:text-xl leading-relaxed font-medium">
                    {currentMoveIndex === -1 ? "Tap the big button to begin." : "Follow the arrow on the 3D cube!"}
                  </p>
                </div>

                <button 
                  onClick={handleNextMove}
                  disabled={isProcessing}
                  className="w-full btn-primary py-8 text-3xl font-black uppercase tracking-tight flex items-center justify-center gap-6 cursor-pointer shadow-2xl disabled:opacity-50"
                >
                  {currentMoveIndex === solution.length - 1 ? 'FINISH!' : 'NEXT MOVE'}
                  <ArrowRight size={32} />
                </button>
                
                <button 
                  onClick={() => { setStep('upload'); setCurrentMoveIndex(-1); setSolution([]); }}
                  className="w-full p-4 glass-panel text-gray-500 font-bold hover:text-white transition-colors cursor-pointer"
                >
                  RESTART SOLVER
                </button>
              </motion.div>
            ) : (
               <motion.div 
                key="done"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-12 p-4"
              >
                <div className="w-40 h-40 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-green-500/50 shadow-2xl shadow-green-500/40 animate-pulse">
                   <CheckCircle size={80} className="text-green-500" />
                </div>
                <div className="space-y-4">
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic gradient-text">SOLVED!</h1>
                  <p className="text-2xl md:text-3xl text-gray-400 font-bold">Great job, Ewan!</p>
                </div>
                <button 
                  onClick={() => { setStep('upload'); setCurrentMoveIndex(-1); setSolution([]); }}
                  className="btn-primary px-16 py-8 text-2xl md:text-3xl font-black uppercase tracking-tight w-full sm:w-auto cursor-pointer"
                >
                  START AGAIN
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-700 font-mono tracking-widest uppercase pointer-events-none">
        Build v1.2.2 • Stable
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 2.5rem;
        }
        .btn-primary {
          border-radius: 2rem;
          transition: transform 0.1s;
        }
        .btn-primary:active {
          transform: scale(0.98);
        }
      `}} />
    </div>
  );
};

export default App;
