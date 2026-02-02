import { useState } from 'react';
import { Cube3D } from './components/Cube3D';
import { Camera, Play, CheckCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [step, setStep] = useState<'upload' | 'solving' | 'done'>('upload');
  const [currentMove, setCurrentMove] = useState(0);

  const solutionSteps = [
    { move: 'F', instruction: "Turn the Front side clockwise!", description: "Look at the face with the logo and turn it to the right." },
    { move: 'R', instruction: "Turn the Right side Up!", description: "Lift the right vertical row upwards." },
    { move: 'U', instruction: "Turn the Top side Left!", description: "Push the top layer to the left." },
    { move: "R'", instruction: "Turn the Right side Down!", description: "Pull the right vertical row back down." },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 overflow-hidden">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-[90vh]">
        
        {/* Left Side: 3D Visualization */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-4 h-full flex flex-col justify-center"
        >
          <div className="flex justify-between items-center mb-4 px-4">
            <h2 className="text-xl font-bold gradient-text uppercase tracking-widest">Virtual Cube</h2>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
          </div>
          <Cube3D />
          <div className="mt-4 flex justify-center gap-4">
             <button className="p-2 glass-panel hover:bg-white/10 transition-colors">
               <RotateCcw size={20} />
             </button>
             <button className="p-2 glass-panel hover:bg-white/10 transition-colors">
               <Camera size={20} />
             </button>
          </div>
        </motion.div>

        {/* Right Side: Logic & Instructions */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {step === 'upload' ? (
              <motion.div 
                key="upload"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="space-y-6"
              >
                <h1 className="text-5xl font-black leading-tight">
                  Rubik's Solver <br/>
                  <span className="gradient-text">For Kids.</span>
                </h1>
                <p className="text-gray-400 text-lg">
                  I've received your two photos, Sungmin. My vision engine has analyzed the examples and is building the 3D model.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel p-2 flex flex-col items-center gap-2 overflow-hidden border-green-500/50">
                    <img src="https://raw.githubusercontent.com/sungminkim31/openclaw-logs/main/media/file_2---4ca21efa-e8db-42f1-bce1-e74ea1b02ef3.jpg" className="w-full aspect-square object-cover rounded opacity-80" />
                    <div className="flex items-center gap-2">
                       <CheckCircle size={14} className="text-green-500" />
                       <span className="text-[10px] font-semibold uppercase">Scan A Ready</span>
                    </div>
                  </div>
                  <div className="glass-panel p-2 flex flex-col items-center gap-2 overflow-hidden border-green-500/50">
                    <img src="https://raw.githubusercontent.com/sungminkim31/openclaw-logs/main/media/file_3---7ef5b926-75e3-400d-a00b-ef7793fdbdf7.jpg" className="w-full aspect-square object-cover rounded opacity-80" />
                    <div className="flex items-center gap-2">
                       <CheckCircle size={14} className="text-green-500" />
                       <span className="text-[10px] font-semibold uppercase">Scan B Ready</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setStep('solving')}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-xl"
                >
                  <Play size={24} fill="currentColor" />
                  Generate Tutorial
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="solving"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 text-sm font-bold text-blue-400 uppercase tracking-widest">
                  <span>Step {currentMove + 1} of {solutionSteps.length}</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="space-y-4">
                  <h2 className="text-4xl font-bold">
                    {solutionSteps[currentMove].instruction}
                  </h2>
                  <p className="text-gray-400 text-xl leading-relaxed">
                    {solutionSteps[currentMove].description}
                  </p>
                </div>

                <div className="p-8 glass-panel bg-blue-500/10 border-blue-500/30 flex justify-center">
                   <ArrowRight size={80} className="text-blue-400 animate-bounce-x" />
                </div>

                <div className="flex gap-4">
                  <button 
                    disabled={currentMove === 0}
                    onClick={() => setCurrentMove(m => m - 1)}
                    className="flex-1 py-4 glass-panel font-bold disabled:opacity-30"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => {
                      if (currentMove < solutionSteps.length - 1) {
                        setCurrentMove(m => m + 1);
                      } else {
                        setStep('done');
                      }
                    }}
                    className="flex-[2] btn-primary py-4 text-xl"
                  >
                    {currentMove < solutionSteps.length - 1 ? 'Next Step' : 'Finish!'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(20px); }
        }
        .animate-bounce-x {
          animation: bounce-x 1s infinite;
        }
      `}} />
    </div>
  );
};

export default App;
