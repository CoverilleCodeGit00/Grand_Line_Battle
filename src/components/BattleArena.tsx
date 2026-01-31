import React, { useState, useEffect } from 'react';
import { HealthBar, TeamSlotStatus } from './HealthBar';
import { useBattle, BattleAction } from '../hooks/useBattle';
import { Character, Move } from '../../types';
import { ITEMS } from '../data/gameData';

const BACKGROUND_URL = "https://images.alphacoders.com/133/thumb-1920-1335959.png";

interface BattleArenaProps {
    isOnline: boolean;
    isHost: boolean;
    myTeam: Character[];
    enemyTeam: Character[];
    sendMessage: (data: any) => void;
    lastMessage: any;
}

export const BattleArena: React.FC<BattleArenaProps> = ({ 
    isOnline, isHost, myTeam: initMyTeam, enemyTeam: initEnemyTeam, sendMessage, lastMessage 
}) => {
    const {
        myTeam, enemyTeam, activeIdx, enemyIdx,
        dialogue, setDialogue,
        isResolving, isWaitingForOpponent,
        submitAction, handleOpponentAction, syncState,
        myPendingAction, opponentPendingAction
    } = useBattle(initMyTeam, initEnemyTeam, isOnline, isHost, sendMessage);

    const activePlayer = myTeam[activeIdx];
    const activeEnemy = enemyTeam[enemyIdx];
    const [menuView, setMenuView] = useState<'MAIN' | 'ATTACKS' | 'TEAM' | 'BAG'>('MAIN');

    // Network Sync
    useEffect(() => {
        if (!lastMessage) return;
        if (lastMessage.type === 'ACTION_SUBMIT') {
            handleOpponentAction(lastMessage.action);
        }
        if (lastMessage.type === 'SYNC_STATE' && !isHost) {
            syncState(lastMessage.state);
        }
    }, [lastMessage, handleOpponentAction, syncState, isHost]);

    // Handle Local Resolution (Simulated for Demo)
    useEffect(() => {
        if (myPendingAction && opponentPendingAction) {
            if (isHost) {
                setDialogue("Résolution du tour en cours...");
                // In a real implementation, Host would calculate everything here
                // and then broadcast the new state:
                // sendMessage({ type: 'SYNC_STATE', state: { ... } });
            } else {
                setDialogue("L'adversaire a joué ! Résolution...");
            }
        }
    }, [myPendingAction, opponentPendingAction, isHost]);

    const handleAttack = (move: Move) => {
        if (activePlayer.currentTp < move.tpCost) return;
        submitAction({ type: 'MOVE', move });
        setMenuView('MAIN');
    };

    const getTeamSlots = (team: any[]): TeamSlotStatus[] => 
        team.map(c => c.currentHp > 0 ? 'ALIVE' : 'KO');

    return (
        <div className="flex flex-col h-screen w-full bg-gray-900 overflow-hidden font-sans select-none relative">
            
            {/* MULTIPLAYER OVERLAY */}
            {isWaitingForOpponent && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500 mb-4"></div>
                    <p className="text-yellow-500 font-bold text-xl uppercase tracking-widest animate-pulse">
                        En attente de l'adversaire...
                    </p>
                </div>
            )}

            {/* BATTLE FIELD */}
            <div 
                className="flex-grow relative bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${BACKGROUND_URL})` }}
            >
                <div className="absolute inset-0 bg-black/20"></div>

                {/* ENEMY HUD */}
                <div className="absolute top-8 right-6 md:top-12 md:right-16 flex flex-col items-end z-10 w-1/2">
                    <HealthBar 
                        currentHp={activeEnemy.currentHp} 
                        maxHp={activeEnemy.stats.hp} 
                        currentTp={activeEnemy.currentTp}
                        label={activeEnemy.name} 
                        teamSlots={getTeamSlots(enemyTeam)}
                        alignment="right"
                        status={activeEnemy.status?.type}
                    />
                    <img 
                        src={activeEnemy.spriteUrl} 
                        className="w-40 h-40 md:w-72 md:h-72 lg:w-96 lg:h-96 object-contain animate-float drop-shadow-2xl mt-4" 
                        alt={activeEnemy.name}
                    />
                </div>

                {/* PLAYER HUD */}
                <div className="absolute bottom-4 left-4 md:left-16 flex flex-col items-start z-10 w-1/2">
                    <img 
                        src={activePlayer.spriteUrl} 
                        className="w-48 h-48 md:w-80 md:h-80 lg:w-[450px] lg:h-[450px] object-contain animate-float drop-shadow-2xl" 
                        alt={activePlayer.name}
                    />
                    <HealthBar 
                        currentHp={activePlayer.currentHp} 
                        maxHp={activePlayer.stats.hp}
                        currentTp={activePlayer.currentTp}
                        label={activePlayer.name} 
                        teamSlots={getTeamSlots(myTeam)}
                        alignment="left"
                        status={activePlayer.status?.type}
                    />
                </div>
            </div>

            {/* CONSOLE */}
            <div className="h-[35vh] bg-gray-900 border-t-4 border-yellow-600 flex flex-col md:flex-row shadow-2xl">
                {/* DIALOGUE */}
                <div className="w-full md:w-2/5 p-4 border-r border-gray-700 bg-black/40">
                    <p className="text-gray-200 text-lg md:text-xl font-mono leading-relaxed">
                        {dialogue}
                    </p>
                </div>

                {/* MENU CONTROLS */}
                <div className="w-full md:w-3/5 bg-gray-800 p-3">
                    {!isWaitingForOpponent && !isResolving ? (
                        <>
                            {menuView === 'MAIN' && (
                                <div className="grid grid-cols-2 gap-3 h-full">
                                    <button onClick={() => setMenuView('ATTACKS')} className="menu-btn bg-red-800/20 hover:bg-red-700">Attaques</button>
                                    <button onClick={() => setMenuView('TEAM')} className="menu-btn bg-green-800/20 hover:bg-green-700">Équipe</button>
                                    <button onClick={() => setMenuView('BAG')} className="menu-btn bg-blue-800/20 hover:bg-blue-700">Sac</button>
                                    <button className="menu-btn bg-gray-700/50 hover:bg-gray-600">Fuite</button>
                                </div>
                            )}

                            {menuView === 'ATTACKS' && (
                                <div className="flex flex-col h-full">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                                        {activePlayer.moves.map((move, i) => (
                                            <button 
                                                key={i} 
                                                disabled={activePlayer.currentTp < move.tpCost}
                                                onClick={() => handleAttack(move)}
                                                className={`p-2 rounded border flex flex-col items-center transition-all ${activePlayer.currentTp >= move.tpCost ? 'bg-gray-700 border-yellow-600/30 hover:bg-yellow-600 hover:text-black' : 'bg-gray-800 border-gray-900 opacity-40 grayscale cursor-not-allowed'}`}
                                            >
                                                <span className="font-bold text-xs uppercase">{move.name}</span>
                                                <span className="text-[10px] opacity-60">{move.tpCost} TP</span>
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => setMenuView('MAIN')} className="mt-2 w-full py-1 bg-gray-700 text-xs rounded uppercase font-bold">Retour</button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center italic text-gray-500">
                            En attente de l'action de l'adversaire...
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .menu-btn { @apply border-2 border-gray-600 rounded p-3 font-bold text-lg uppercase transition-all shadow-md active:scale-95; }
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
                .animate-float { animation: float 5s ease-in-out infinite; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #444; border-radius: 2px; }
            `}</style>
        </div>
    );
};