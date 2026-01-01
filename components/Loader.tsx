
import React, { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  "DECONSTRUCTING TARGET IDENTITY...",
  "SAMPLING REFERENCE SEMANTICS...",
  "WARPING FACIAL GEOMETRY...",
  "APPLYING EXPRESSION OVERLAY...",
  "RECONSTRUCTING PIXEL DENSITY...",
  "FINALIZING NEURAL BLEND..."
];

const Loader: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center w-full">
      <div className="relative w-32 h-32 mb-10">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-[1px] border-indigo-500/20 animate-[spin_10s_linear_infinite]"></div>
        <div className="absolute inset-2 rounded-full border-t-2 border-indigo-500 animate-[spin_2s_linear_infinite]"></div>
        
        {/* Inner Scanning Effect */}
        <div className="absolute inset-8 rounded-full bg-indigo-500/5 flex items-center justify-center overflow-hidden">
           <div className="w-full h-1 bg-indigo-400/50 absolute top-0 animate-[loader-scan_2s_ease-in-out_infinite]"></div>
           <i className="fas fa-microchip text-indigo-400 text-2xl animate-pulse"></i>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-xs font-black text-white tracking-[0.4em] uppercase">Processing</h3>
        <p className="text-[10px] font-mono text-indigo-400 h-4">{LOADING_MESSAGES[msgIndex]}</p>
        
        <div className="w-48 h-1 bg-slate-900 rounded-full mx-auto overflow-hidden">
           <div className="h-full bg-indigo-500 animate-[loader-progress_20s_linear_infinite]"></div>
        </div>
      </div>

      <style>{`
        @keyframes loader-scan {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes loader-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Loader;
