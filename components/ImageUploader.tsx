
import React, { useRef, useState, useEffect } from 'react';
import { ImageData } from '../types';

interface ImageUploaderProps {
  label: string;
  image: ImageData | null;
  onUpload: (data: ImageData) => void;
  onClear: () => void;
  icon: string;
}

const getBestAspectRatio = (width: number, height: number): "1:1" | "3:4" | "4:3" | "9:16" | "16:9" => {
  const ratio = width / height;
  const targets = [
    { label: "1:1", value: 1 },
    { label: "3:4", value: 3/4 },
    { label: "4:3", value: 4/3 },
    { label: "9:16", value: 9/16 },
    { label: "16:9", value: 16/9 },
  ];
  
  const closest = targets.reduce((prev, curr) => {
    return Math.abs(curr.value - ratio) < Math.abs(prev.value - ratio) ? curr : prev;
  });
  
  return closest.label as any;
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, image, onUpload, onClear, icon }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [url, setUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImageData = (base64: string, mimeType: string, name: string) => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = getBestAspectRatio(img.width, img.height);
      onUpload({ base64, mimeType, name, aspectRatio });
    };
    img.src = base64;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      processImageData(event.target?.result as string, file.type, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsFetching(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        processImageData(reader.result as string, blob.type, url.split('/').pop() || 'remote-image');
        setShowUrlInput(false);
        setUrl('');
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      alert("Could not fetch image. This might be due to CORS restrictions on the source website. Try uploading the file directly.");
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1024 }, height: { ideal: 1024 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      alert("Could not access camera. Please ensure permissions are granted.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        processImageData(dataUrl, 'image/jpeg', `capture-${Date.now()}.jpg`);
        stopCamera();
      }
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</label>
        <div className="flex gap-2">
          {!image && !isCameraActive && !showUrlInput && (
            <>
              <button 
                onClick={() => setShowUrlInput(true)}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full border border-white/5 transition-all flex items-center gap-2"
              >
                <i className="fas fa-link"></i> URL
              </button>
              <button 
                onClick={startCamera}
                className="text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 transition-all flex items-center gap-2"
              >
                <i className="fas fa-camera"></i> Camera
              </button>
            </>
          )}
          {(isCameraActive || showUrlInput) && (
            <button 
              onClick={() => { stopCamera(); setShowUrlInput(false); }}
              className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/20 transition-all flex items-center gap-2"
            >
              <i className="fas fa-times"></i> Cancel
            </button>
          )}
        </div>
      </div>

      <div className={`relative h-72 w-full rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden ${
        image || isCameraActive || showUrlInput ? 'border-indigo-500/50 bg-slate-800/20' : 'border-slate-800 hover:border-indigo-500/30 bg-slate-900/40'
      }`}>
        {isCameraActive ? (
          <div className="relative w-full h-full">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover grayscale-[0.3]"
            />
            <div className="absolute inset-0 border-[20px] border-[#050810]/40 pointer-events-none"></div>
            <button 
              onClick={takePhoto}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white border-4 border-indigo-500 flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
            >
              <div className="w-8 h-8 rounded-full border-2 border-slate-900"></div>
            </button>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : showUrlInput ? (
          <form onSubmit={handleUrlSubmit} className="w-full h-full p-8 flex flex-col items-center justify-center gap-4 bg-slate-900/60 backdrop-blur-md">
            <input 
              type="url" 
              placeholder="Paste image link here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button 
              type="submit"
              disabled={isFetching}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isFetching ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-cloud-download"></i>}
              {isFetching ? 'Fetching Data...' : 'Import from URL'}
            </button>
          </form>
        ) : image ? (
          <>
            <img src={image.base64} alt={label} className="w-full h-full object-contain bg-black/40" />
            <button 
              onClick={onClear}
              className="absolute top-4 right-4 bg-black/60 hover:bg-red-500 text-white w-9 h-9 rounded-full transition-all z-10 flex items-center justify-center border border-white/10 backdrop-blur-md"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
            <div className="absolute bottom-4 left-4 text-[9px] font-black text-white bg-black/40 px-2 py-1 rounded uppercase tracking-[0.2em] truncate max-w-[80%]">
              {image.aspectRatio}
            </div>
          </>
        ) : (
          <label className="cursor-pointer flex flex-col items-center gap-4 p-8 text-center w-full h-full justify-center group transition-colors">
            <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all duration-300 border border-white/5">
              <i className={`fas ${icon} text-2xl`}></i>
            </div>
            <div>
              <p className="text-slate-200 font-bold uppercase tracking-widest text-xs">Drop Neural Plate</p>
              <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-wider">Tap to browse files</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
