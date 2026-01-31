import React from 'react';
import { StatusType } from '../../types';

export type TeamSlotStatus = 'ALIVE' | 'KO' | 'EMPTY';

interface HealthBarProps {
  currentHp: number;
  maxHp: number;
  currentTp?: number;
  maxTp?: number;
  label?: string;
  teamSlots?: TeamSlotStatus[];
  alignment?: 'left' | 'right';
  status?: StatusType | null; // New prop for status visualization
}

export const HealthBar: React.FC<HealthBarProps> = ({ 
  currentHp, 
  maxHp, 
  currentTp = 0,
  maxTp = 3,
  label, 
  teamSlots, 
  alignment = 'left',
  status = null
}) => {
  const percentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  
  let colorClass = 'bg-green-500';
  let barColor = 'shadow-[0_0_10px_rgba(34,197,94,0.6)]';
  
  if (percentage <= 20) {
    colorClass = 'bg-red-600';
    barColor = 'shadow-[0_0_10px_rgba(220,38,38,0.6)]';
  } else if (percentage <= 50) {
    colorClass = 'bg-yellow-500';
    barColor = 'shadow-[0_0_10px_rgba(234,179,8,0.6)]';
  }

  const justifyClass = alignment === 'right' ? 'justify-end' : 'justify-start';
  const flexDirectionClass = alignment === 'right' ? 'flex-row-reverse' : 'flex-row';
  const tpContainerClass = alignment === 'right' ? 'items-end' : 'items-start';

  // Status Colors
  const getStatusColor = (s: StatusType) => {
    switch(s) {
        case 'POISON': return 'bg-purple-600 text-purple-100';
        case 'BURN': return 'bg-orange-600 text-orange-100';
        case 'FREEZE': return 'bg-cyan-500 text-cyan-900';
        case 'PARALYSIS': return 'bg-yellow-400 text-yellow-900';
        case 'SLEEP': return 'bg-indigo-400 text-indigo-900';
        case 'CONFUSION': return 'bg-pink-500 text-white';
        default: return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full max-w-xs bg-gray-900/90 p-2 rounded-lg border border-gray-600 shadow-2xl backdrop-blur-md transition-all">
      {/* Label Row */}
      <div className={`flex justify-between items-center text-xs md:text-sm font-bold text-white mb-1 uppercase tracking-widest font-serif ${flexDirectionClass}`}>
        <div className={`flex items-center gap-2 ${flexDirectionClass}`}>
            <span className="text-yellow-400 drop-shadow-md">{label || 'HP'}</span>
            {status && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono animate-pulse ${getStatusColor(status)}`}>
                    {status}
                </span>
            )}
        </div>
        <span className="font-mono">{Math.floor(currentHp)}/{maxHp}</span>
      </div>

      {/* Bar Container */}
      <div className="w-full h-3 md:h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-600 relative">
        <div 
          className={`h-full ${colorClass} ${barColor} transition-all duration-500 ease-out flex items-center ${justifyClass}`}
          style={{ width: `${percentage}%` }}
        >
            <div className="h-full w-full bg-gradient-to-b from-white/30 to-transparent"></div>
        </div>
      </div>

      {/* Stats & TP Row */}
      <div className={`flex flex-col mt-2 gap-1 ${tpContainerClass}`}>
        
        {/* TP Indicators */}
        <div className={`flex gap-1.5 ${justifyClass}`}>
            {[...Array(maxTp)].map((_, i) => (
                <div 
                    key={i}
                    className={`
                        w-3 h-3 md:w-4 md:h-4 rotate-45 border border-gray-700 shadow-sm transition-all duration-300
                        ${i < currentTp 
                            ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] scale-100' 
                            : 'bg-gray-800 opacity-50 scale-75'}
                    `}
                />
            ))}
        </div>

        {/* Team Indicators */}
        {teamSlots && (
            <div className={`flex gap-1 ${justifyClass}`}>
            {teamSlots.map((status, index) => (
                <div 
                key={index}
                className={`
                    w-2 h-2 md:w-3 md:h-3 rounded-full border border-gray-600 shadow-sm transition-all
                    ${status === 'ALIVE' ? 'bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.8)]' : ''}
                    ${status === 'KO' ? 'bg-red-900/50' : ''}
                    ${status === 'EMPTY' ? 'bg-gray-800' : ''}
                `}
                />
            ))}
            </div>
        )}
      </div>
    </div>
  );
};