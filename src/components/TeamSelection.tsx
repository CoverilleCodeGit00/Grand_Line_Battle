import React, { useState } from 'react';
import { CHARACTERS } from '../data/gameData';
import { Character } from '../../types';

const MAX_TEAM_SIZE = 6;
const BG_URL = "https://images.alphacoders.com/134/thumb-1920-1341399.png"; // Ship deck or map

interface TeamSelectionProps {
    onTeamReady: (team: Character[]) => void;
    isOpponentReady: boolean;
}

export const TeamSelection: React.FC<TeamSelectionProps> = ({ onTeamReady, isOpponentReady }) => {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isLocked, setIsLocked] = useState(false);

    const toggleCharacter = (charId: number) => {
        if (isLocked) return;

        if (selectedIds.includes(charId)) {
            setSelectedIds(prev => prev.filter(id => id !== charId));
        } else {
            if (selectedIds.length < MAX_TEAM_SIZE) {
                setSelectedIds(prev => [...prev, charId]);
            }
        }
    };

    const handleConfirm = () => {
        if (selectedIds.length === MAX_TEAM_SIZE) {
            setIsLocked(true);
            const selectedTeam = selectedIds
                .map(id => CHARACTERS.find(c => c.id === id))
                .filter((c): c is Character => !!c); // Type guard
            
            onTeamReady(selectedTeam);
        }
    };

    return (
        <div 
            className="flex flex-col h-screen w-full bg-gray-900 text-white font-sans relative overflow-hidden"
            style={{ backgroundImage: `url(${BG_URL})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

            {/* HEADER */}
            <div className="z-10 w-full p-4 bg-gray-900/90 border-b-2 border-yellow-600 flex justify-between items-center shadow-lg">
                <div>
                    <h2 className="text-2xl font-bold text-yellow-500 tracking-widest uppercase">Recrutement</h2>
                    <p className="text-gray-400 text-xs">Formez votre équipage pirate</p>
                </div>
                
                <div className="flex items-center gap-6">
                    {/* OPPONENT STATUS */}
                    <div className={`px-4 py-1 rounded border transition-all duration-500 ${isOpponentReady ? 'bg-green-900/80 border-green-500' : 'bg-gray-800/50 border-gray-600'}`}>
                        <span className={`text-sm font-bold uppercase ${isOpponentReady ? 'text-green-400 animate-pulse' : 'text-gray-500'}`}>
                            {isOpponentReady ? "Adversaire Prêt !" : "Adversaire en réflexion..."}
                        </span>
                    </div>

                    {/* COUNTER */}
                    <div className="text-right">
                        <span className={`text-3xl font-bold ${selectedIds.length === MAX_TEAM_SIZE ? 'text-green-500' : 'text-white'}`}>
                            {selectedIds.length}
                        </span>
                        <span className="text-gray-500 text-xl">/{MAX_TEAM_SIZE}</span>
                    </div>
                </div>
            </div>

            {/* GRID CONTENT */}
            <div className="z-10 flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 max-w-7xl mx-auto">
                    {CHARACTERS.map((char) => {
                        const isSelected = selectedIds.includes(char.id);
                        const isDisabled = !isSelected && selectedIds.length >= MAX_TEAM_SIZE;

                        return (
                            <div 
                                key={char.id}
                                onClick={() => !isDisabled && toggleCharacter(char.id)}
                                className={`
                                    relative aspect-[3/4] rounded-lg border-2 cursor-pointer transition-all duration-200 overflow-hidden group shadow-lg
                                    ${isSelected 
                                        ? 'border-yellow-500 ring-2 ring-yellow-500/50 scale-[1.02] z-10' 
                                        : 'border-gray-700 hover:border-gray-500 grayscale hover:grayscale-0'
                                    }
                                    ${isDisabled ? 'opacity-30 cursor-not-allowed grayscale' : ''}
                                `}
                            >
                                <img 
                                    src={char.spriteUrl} 
                                    alt={char.name} 
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                                
                                <div className="absolute bottom-0 left-0 w-full p-2">
                                    <p className={`text-xs md:text-sm font-bold truncate ${isSelected ? 'text-yellow-400' : 'text-gray-300'}`}>
                                        {char.name}
                                    </p>
                                    <div className="flex gap-1 mt-1">
                                        {char.types.map(t => (
                                            <span key={t} className="text-[9px] px-1 bg-gray-800 text-gray-300 rounded border border-gray-600">
                                                {t.substring(0, 3)}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* SELECTION CHECKMARK */}
                                {isSelected && (
                                    <div className="absolute top-2 right-2 bg-yellow-500 text-black rounded-full p-0.5 shadow-md">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* FOOTER ACTION */}
            <div className="z-10 p-4 bg-gray-900 border-t border-gray-800 flex justify-center">
                {isLocked ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <span className="text-yellow-500 font-bold uppercase tracking-wider mb-1">Équipage validé</span>
                        <span className="text-gray-400 text-sm">En attente de l'adversaire...</span>
                    </div>
                ) : (
                    <button 
                        onClick={handleConfirm}
                        disabled={selectedIds.length !== MAX_TEAM_SIZE}
                        className={`
                            px-12 py-3 rounded font-bold uppercase tracking-widest text-lg transition-all shadow-lg
                            ${selectedIds.length === MAX_TEAM_SIZE 
                                ? 'bg-yellow-600 hover:bg-yellow-500 text-black shadow-yellow-600/20 hover:scale-105' 
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
                        `}
                    >
                        Prêt au Combat
                    </button>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #555; border-radius: 3px; }
            `}</style>
        </div>
    );
};