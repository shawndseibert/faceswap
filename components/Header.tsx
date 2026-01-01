
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-8 text-center relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
        <i className="fas fa-sparkles"></i>
        Powered by Gemini
      </div>
      <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-400 mb-4 tracking-tight">
        Attribute Transfer AI
      </h1>
      <p className="text-slate-400 max-w-xl mx-auto text-lg">
        Take a reference photo, choose what you like, and watch the magic happen on your target image.
      </p>
    </header>
  );
};

export default Header;
