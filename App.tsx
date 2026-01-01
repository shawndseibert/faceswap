
import React, { useState, useEffect } from 'react';
import { ImageData, AttributeType, GenerationResult } from './types';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import AttributeSelector from './components/AttributeSelector';
import Loader from './components/Loader';
import { transferAttributes } from './geminiService';

const STORAGE_KEYS = {
  REFERENCE: 'face_swap_ref',
  TARGET: 'face_swap_target',
  ATTRIBUTES: 'face_swap_attrs'
};

const App: React.FC = () => {
  const [reference, setReference] = useState<ImageData | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REFERENCE);
    return saved ? JSON.parse(saved) : null;
  });
  const [target, setTarget] = useState<ImageData | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TARGET);
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedAttributes, setSelectedAttributes] = useState<AttributeType[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTRIBUTES);
    return saved ? JSON.parse(saved) : ['Expression', 'Pose', 'Outfit'];
  });

  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    try {
      if (reference) localStorage.setItem(STORAGE_KEYS.REFERENCE, JSON.stringify(reference));
      else localStorage.removeItem(STORAGE_KEYS.REFERENCE);
    } catch (e) {
      console.warn("Storage quota exceeded");
    }
  }, [reference]);

  useEffect(() => {
    try {
      if (target) localStorage.setItem(STORAGE_KEYS.TARGET, JSON.stringify(target));
      else localStorage.removeItem(STORAGE_KEYS.TARGET);
    } catch (e) {
      console.warn("Storage quota exceeded");
    }
  }, [target]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTRIBUTES, JSON.stringify(selectedAttributes));
  }, [selectedAttributes]);

  const handleReferenceUpload = (data: ImageData) => {
    setReference(data);
    setResult(null); 
    setError(null);
  };

  const handleTargetUpload = (data: ImageData) => {
    setTarget(data);
    setResult(null); 
    setError(null);
  };

  const swapImages = () => {
    setResult(null);
    setError(null);
    const oldRef = reference;
    const oldTarget = target;
    setReference(oldTarget);
    setTarget(oldRef);
  };

  const toggleAttribute = (id: AttributeType) => {
    setSelectedAttributes(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!reference || !target || selectedAttributes.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const imageUrl = await transferAttributes(reference, target, selectedAttributes);
      setResult({
        imageUrl,
        timestamp: Date.now()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Neural link failed.");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setReference(null);
    setTarget(null);
    setResult(null);
    setError(null);
    setSelectedAttributes(['Expression', 'Pose', 'Outfit']);
    localStorage.clear();
  };

  const canGenerate = reference && target && selectedAttributes.length > 0 && !loading;

  return (
    <div className={`min-h-screen bg-[#050810] text-slate-200 pb-20 selection:bg-indigo-500/30 overflow-x-hidden ${isFullscreen ? 'overflow-hidden h-screen' : ''}`}>
      <div className="max-w-6xl mx-auto px-4 relative">
        <Header />

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
          <div className="lg:col-span-8 space-y-6">
            <div className="glass p-6 md:p-10 rounded-[3rem] shadow-2xl border-white/5 relative overflow-hidden">
              <div className="flex flex-col md:flex-row gap-4 md:gap-8 relative z-10 items-center">
                <ImageUploader 
                  label="Plate B (Attribute Template)" 
                  image={reference}
                  onUpload={handleReferenceUpload}
                  onClear={() => { setReference(null); setResult(null); }}
                  icon="fa-database"
                />
                
                <div className="flex flex-row md:flex-col items-center justify-center gap-4">
                  <div className="w-10 h-10 rounded-full border border-indigo-500/30 bg-indigo-500/5 flex items-center justify-center text-indigo-400">
                    <i className="fas fa-microchip animate-pulse"></i>
                  </div>
                  <button 
                    onClick={swapImages}
                    disabled={!reference && !target}
                    title="Swap Role Priority"
                    className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 hover:border-indigo-500 hover:text-indigo-400 text-slate-400 shadow-xl transition-all flex items-center justify-center active:scale-90 disabled:opacity-30 disabled:pointer-events-none group z-20"
                  >
                    <i className="fas fa-repeat group-active:rotate-180 transition-transform duration-500"></i>
                  </button>
                </div>

                <ImageUploader 
                  label="Plate A (Identity Anchor)" 
                  image={target}
                  onUpload={handleTargetUpload}
                  onClear={() => { setTarget(null); setResult(null); }}
                  icon="fa-shield-halved"
                />
              </div>

              <div className="mt-12 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">Fusion Parameters</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                      <i className="fas fa-lock text-emerald-500"></i>
                      Identity Locked
                    </div>
                  </div>
                </div>
                <AttributeSelector 
                  selected={selectedAttributes} 
                  onToggle={toggleAttribute} 
                />
              </div>

              <div className="mt-12 flex flex-col md:flex-row gap-4 items-center relative z-10">
                <button
                  disabled={!canGenerate}
                  onClick={handleGenerate}
                  className={`group relative overflow-hidden w-full md:flex-1 py-6 px-8 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${
                    !canGenerate
                      ? 'bg-slate-900 text-slate-600 border border-slate-800'
                      : 'bg-indigo-600 text-white shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] active:scale-[0.97] hover:bg-indigo-500'
                  }`}
                >
                  <i className={`fas ${loading ? 'fa-circle-notch animate-spin' : 'fa-bolt-lightning'}`}></i>
                  {loading ? 'Synthesizing Individual...' : 'Execute Neural Morph'}
                </button>
                <button onClick={resetAll} className="w-full md:w-auto py-6 px-10 rounded-2xl font-bold border border-slate-800 hover:bg-slate-900 transition-colors text-slate-400">Clear Workspace</button>
              </div>

              {selectedAttributes.length === 0 && (reference || target) && (
                <p className="mt-4 text-center text-xs text-indigo-400 font-bold animate-pulse">
                  <i className="fas fa-info-circle mr-2"></i>
                  Select attributes to transfer from Template B to Anchor A.
                </p>
              )}

              {error && (
                <div className="mt-6 p-5 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-400 flex items-start gap-4 animate-in slide-in-from-top-2">
                  <i className="fas fa-triangle-exclamation mt-1"></i>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Morph Conflict</p>
                    <p className="text-xs opacity-70">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-8 space-y-6">
              <div className="glass p-8 rounded-[3rem] min-h-[540px] flex flex-col shadow-2xl overflow-hidden border-indigo-500/10 relative">
                <div className="flex items-center justify-between mb-8">
                   <div>
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">Neural Monitor</h3>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                      <div className="w-1 h-1 rounded-full bg-emerald-500/30 animate-pulse"></div>
                    </div>
                   </div>
                  {result && (
                    <button 
                      onClick={() => setShowComparison(!showComparison)}
                      className="text-[10px] font-bold border border-white/10 hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all"
                    >
                      {showComparison ? 'Hide Base' : 'Split View'}
                    </button>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center bg-[#07090f] rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-inner">
                  {loading ? (
                    <Loader />
                  ) : result ? (
                    <div className="w-full h-full relative overflow-hidden cursor-zoom-in" onClick={() => setIsFullscreen(true)}>
                      <img 
                        key={result.timestamp} 
                        src={result.imageUrl} 
                        alt="Result" 
                        className="w-full h-full object-contain transition-transform duration-500" 
                      />
                      
                      {showComparison && target && (
                        <div className="absolute inset-0 flex">
                          <div className="w-1/2 overflow-hidden border-r border-indigo-500/50 relative backdrop-blur-sm">
                            <img src={target.base64} className="w-[200%] max-w-none h-full object-contain opacity-60 grayscale" />
                            <div className="absolute bottom-4 left-4 text-[8px] font-black text-white/50 uppercase tracking-widest bg-black/40 px-2 py-1 rounded">Identity Source</div>
                          </div>
                          <div className="w-1/2 overflow-hidden relative">
                             <img src={result.imageUrl} className="w-[200%] -ml-[100%] max-w-none h-full object-contain" />
                             <div className="absolute bottom-4 right-4 text-[8px] font-black text-indigo-400 uppercase tracking-widest text-right bg-indigo-500/20 px-2 py-1 rounded border border-indigo-500/30">Fused Plate</div>
                          </div>
                        </div>
                      )}

                      <div className="absolute top-4 right-4 bg-indigo-600/80 p-2 rounded-full text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                         <i className="fas fa-expand"></i>
                      </div>

                      <div className="absolute bottom-6 left-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        <a 
                          href={result.imageUrl} 
                          download="morph-render.png" 
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-white/10"
                        >
                          <i className="fas fa-file-export"></i> Export Render
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-10">
                      <div className="w-24 h-24 rounded-full bg-slate-900/50 flex items-center justify-center text-slate-800 mx-auto mb-6 border border-slate-800/50 group-hover:border-indigo-500/30 transition-colors">
                        <i className="fas fa-dna text-4xl animate-[spin_4s_linear_infinite]"></i>
                      </div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Ready for Synthesis</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass p-8 rounded-[3rem] border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <i className="fas fa-microchip text-4xl"></i>
                </div>
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">Neural Integrity</h4>
                <div className="space-y-4">
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-slate-500">IDENTITY_LOCK</span>
                        <span className="text-white">VERIFIED</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500/50 w-[99%]"></div>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-slate-500">FACE_FIDELITY</span>
                        <span className="text-indigo-400">ANCHORED</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500/50 w-[100%]"></div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {isFullscreen && result && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out animate-in fade-in duration-300"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-5xl w-full aspect-square md:h-full md:w-auto">
            <img 
              src={result.imageUrl} 
              className="w-full h-full object-contain rounded-2xl shadow-2xl border border-white/10" 
              alt="Morphed Result Fullscreen"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
