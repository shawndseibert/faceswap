
import React from 'react';
import { AttributeType } from '../types';
import { ATTRIBUTES } from '../constants';

interface AttributeSelectorProps {
  selected: AttributeType[];
  onToggle: (id: AttributeType) => void;
}

const AttributeSelector: React.FC<AttributeSelectorProps> = ({ selected, onToggle }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
      {ATTRIBUTES.map((attr) => {
        const isSelected = selected.includes(attr.id);
        return (
          <button
            key={attr.id}
            onClick={() => onToggle(attr.id)}
            className={`flex flex-col items-start p-4 rounded-xl border transition-all duration-200 text-left ${
              isSelected 
                ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
              isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'
            }`}>
              <i className={`fas ${attr.icon}`}></i>
            </div>
            <span className={`font-semibold text-sm mb-1 ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>
              {attr.label}
            </span>
            <span className="text-xs text-slate-500 line-clamp-2">
              {attr.description}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default AttributeSelector;
