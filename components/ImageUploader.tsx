
import React, { useRef, useState, useEffect } from 'react';
import { ImageData } from '../types';

interface ImageUploaderProps {
  label: string;
  image: ImageData | null;
  onUpload: (data: ImageData) => void;
  onClear: () => void;
  icon: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, image, onUpload, onClear, icon }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onUpload({
        base64: event.target?.result as string,
        mimeType: file.type,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
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
        onUpload({
          base64: dataUrl,
          mimeType: 'image/jpeg',
          name: `capture-${Date.now()}.jpg`,
        });
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
        <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">{label}</label>
        {!image && !isCameraActive && (
          <button 
            onClick={startCamera}
            className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 transition-all flex items-center gap-2"
          >
            <i className="fas fa-camera"></i> Take Photo
          </button>
        )}
        {isCameraActive && (
          <button 
            onClick={stopCamera}
            className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/20 transition-all flex items-center gap-2"
          >
            <i className="fas fa-times"></i> Cancel
          </button>
        )}
      </div>

      <div className={`relative h-72 w-full rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden ${
        image || isCameraActive ? 'border-indigo-500/50 bg-slate-800/50' : 'border-slate-700 hover:border-slate-500 bg-slate-900/50'
      }`}>
        {isCameraActive ? (
          <div className="relative w-full h-full">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover grayscale-[0.3]"
            />
            <div className="absolute inset-0 border-[20px] border-slate-950/20 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border border-white/30 rounded-[3rem] pointer-events-none"></div>
            <button 
              onClick={takePhoto}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white border-4 border-indigo-500/50 flex items-center justify-center shadow-xl active:scale-95 transition-transform"
            >
              <div className="w-8 h-8 rounded-full border-2 border-slate-900"></div>
            </button>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : image ? (
          <>
            <img src={image.base64} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none"></div>
            <button 
              onClick={onClear}
              className="absolute top-3 right-3 bg-slate-950/80 hover:bg-red-500 text-white w-8 h-8 rounded-full transition-all z-10 flex items-center justify-center border border-white/10"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          </>
        ) : (
          <label className="cursor-pointer flex flex-col items-center gap-4 p-8 text-center w-full h-full justify-center group">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all duration-300">
              <i className={`fas ${icon} text-2xl`}></i>
            </div>
            <div>
              <p className="text-slate-200 font-medium">Upload {label}</p>
              <p className="text-slate-500 text-sm mt-1">PNG, JPG or WEBP</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
