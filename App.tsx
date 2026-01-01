
import React, { useState } from 'react';
import { ImageData, AttributeType, GenerationResult } from './types';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import AttributeSelector from './components/AttributeSelector';
import Loader from './components/Loader';
import { transferAttributes } from './geminiService';

const App: React.FC = () => {
  const [reference, setReference] = useState<ImageData | null>(null);
  const [target, setTarget] = useState<ImageData | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<AttributeType[]>(['Expression']);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const toggleAttribute = (id: AttributeType) => {
    setSelectedAttributes(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!reference || !target) return;
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
    setSelectedAttributes(['Expression']);
  };

  return (
    <div className="min-h-screen bg-[#050810] text-slate-200 pb-20 selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 relative">
        <Header />

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
          <div className="lg:col-span-8 space-y-6">
            <div className="glass p-6 md:p-10 rounded-[3rem] shadow-2xl border-white/5 relative overflow-hidden">
              <div className="flex flex-col md:flex-row gap-8 relative z-10">
                <ImageUploader 
                  label="Reference (Source of State)" 
                  image={reference}
                  onUpload={setReference}
                  onClear={() => setReference(null)}
                  icon="fa-bolt"
                />
                <div className="hidden md:flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full border border-indigo-500/30 bg-indigo-500/5 flex items-center justify-center text-indigo-400 animate-pulse">
                    <i className="fas fa-arrow-right"></i>
                  </div>
                </div>
                <ImageUploader 
                  label="Subject (Keep Identity)" 
                  image={target}
                  onUpload={setTarget}
                  onClear={() => setTarget(null)}
                  icon="fa-user-check"
                />
              </div>

              <div className="mt-12 relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">Translation Layers</h3>
                  <div className="h-px flex-1 bg-slate-800/50"></div>
                </div>
                <AttributeSelector 
                  selected={selectedAttributes} 
                  onToggle={toggleAttribute} 
                />
              </div>

              <div className="mt-12 flex flex-col md:flex-row gap-4 items-center relative z-10">
                <button
                  disabled={!reference || !target || loading}
                  onClick={handleGenerate}
                  className={`group relative overflow-hidden w-full md:flex-1 py-6 px-8 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${
                    !reference || !target || loading
                      ? 'bg-slate-900 text-slate-600 border border-slate-800'
                      : 'bg-indigo-600 text-white shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] active:scale-[0.97]'
                  }`}
                >
                  <i className={`fas ${loading ? 'fa-circle-notch animate-spin' : 'fa-wand-magic-sparkles'}`}></i>
                  {loading ? 'Synthesizing...' : 'Execute Neural Morph'}
                </button>
                <button onClick={resetAll} className="w-full md:w-auto py-6 px-10 rounded-2xl font-bold border border-slate-800 hover:bg-slate-900 transition-colors">Reset</button>
              </div>

              {error && (
                <div className="mt-6 p-5 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-400 flex items-start gap-4 animate-in slide-in-from-top-2">
                  <i className="fas fa-shield-virus mt-1"></i>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Neural Error</p>
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
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">Output Monitor</h3>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                      <div className="w-1 h-1 rounded-full bg-emerald-500/30"></div>
                    </div>
                   </div>
                  {result && (
                    <button 
                      onClick={() => setShowComparison(!showComparison)}
                      className="text-[10px] font-bold border border-white/10 hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all"
                    >
                      {showComparison ? 'Exit Split' : 'Compare'}
                    </button>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center bg-[#07090f] rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-inner">
                  {loading ? (
                    <Loader />
                  ) : result ? (
                    <div className="w-full h-full relative overflow-hidden">
                      <img src={result.imageUrl} alt="Result" className="w-full h-full object-cover" />
                      
                      {showComparison && target && (
                        <div className="absolute inset-0 flex">
                          <div className="w-1/2 overflow-hidden border-r border-indigo-500/50 relative">
                            <img src={target.base64} className="w-[200%] max-w-none h-full object-cover opacity-60 grayscale" />
                            <div className="absolute bottom-4 left-4 text-[8px] font-black text-white/50 uppercase tracking-widest">Target Identity</div>
                          </div>
                          <div className="w-1/2 overflow-hidden relative">
                             <img src={result.imageUrl} className="w-[200%] -ml-[100%] max-w-none h-full object-cover" />
                             <div className="absolute bottom-4 right-4 text-[8px] font-black text-indigo-400 uppercase tracking-widest text-right">Morphed Result</div>
                          </div>
                        </div>
                      )}

                      <div className="absolute bottom-6 left-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        <a href={result.imageUrl} download="morph-result.png" className="flex-1 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-white/10">
                          <i className="fas fa-download"></i> Export Result
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-10">
                      <div className="w-24 h-24 rounded-full bg-slate-900/50 flex items-center justify-center text-slate-800 mx-auto mb-6 border border-slate-800/50 group-hover:border-indigo-500/30 transition-colors">
                        <i className="fas fa-atom text-4xl animate-[spin_8s_linear_infinite]"></i>
                      </div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">System Idling</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass p-8 rounded-[3rem] border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <i className="fas fa-fingerprint text-4xl"></i>
                </div>
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">Neural Consistency</h4>
                <div className="space-y-4">
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-slate-500">MORPH_THRESHOLD</span>
                        <span className="text-white">92%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500/50 w-[92%] animate-[pulse_2s_infinite]"></div>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-slate-500">IDENTITY_LOCK</span>
                        <span className="text-emerald-500">SECURE</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500/50 w-[98%]"></div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
