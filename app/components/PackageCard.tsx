import React from 'react';
import { PackageLevel } from '../types';
import { Check } from 'lucide-react';

interface PackageCardProps {
  level: PackageLevel;
  features: string[];
  colorClass: string;
  imageUrl?: string;
  isSelected: boolean;
  onSelect: (level: PackageLevel) => void;
}

export default function PackageCard({ level, features, colorClass, imageUrl, isSelected, onSelect }: PackageCardProps) {
  return (
    <div 
      onClick={() => onSelect(level)}
      className={`
        relative p-6 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden group
        ${isSelected 
          ? `bg-zinc-900 ${colorClass} scale-105 border-2` 
          : 'bg-zinc-950 border border-zinc-800 hover:border-zinc-700 opacity-80 hover:opacity-100'}
      `}
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
            <h3 className={`text-2xl font-bold uppercase tracking-wider ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
            {level}
            </h3>
        </div>
        <ul className="space-y-2 mb-4">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center text-sm text-zinc-300">
              <Check className="w-4 h-4 mr-2 text-green-400" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Coverage Diagram */}
      {imageUrl && (
        <div className="mt-6 pt-4 border-t border-zinc-800/50 flex justify-center">
            <div className="relative w-full h-32 opacity-70 group-hover:opacity-100 transition-opacity">
                <img 
                    src={imageUrl} 
                    alt={`${level} Coverage`} 
                    className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]" 
                />
            </div>
        </div>
      )}
    </div>
  );
}
