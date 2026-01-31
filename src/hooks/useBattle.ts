import { useState, useCallback, useEffect } from 'react';
import { Character, Move, Stat, StatusType, EffectType } from '../../types';
import { getEffectiveness } from '../data/gameData';

export type BattleAction = 
    | { type: 'MOVE'; move: Move }
    | { type: 'ITEM'; itemId: string }
    | { type: 'SWAP'; charId: number };

export interface BattleCharacter extends Character {
    currentHp: number;
    currentTp: number;
    modifiers: Record<Stat, { value: number; turns: number }>;
    status: { type: StatusType; turns: number } | null;
}

export const useBattle = (
    initialMyTeam: Character[], 
    initialEnemyTeam: Character[],
    isOnline: boolean,
    isHost: boolean,
    onSendMessage: (data: any) => void
) => {
    const initChar = (c: Character): BattleCharacter => ({
        ...c,
        currentHp: c.stats.hp,
        currentTp: c.maxTp,
        modifiers: {
            atk: { value: 1, turns: 0 },
            def: { value: 1, turns: 0 },
            spd: { value: 1, turns: 0 },
            accuracy: { value: 1, turns: 0 },
            evasion: { value: 1, turns: 0 },
        },
        status: null
    });

    const [myTeam, setMyTeam] = useState<BattleCharacter[]>(initialMyTeam.map(initChar));
    const [enemyTeam, setEnemyTeam] = useState<BattleCharacter[]>(initialEnemyTeam.map(initChar));
    const [activeIdx, setActiveIdx] = useState(0);
    const [enemyIdx, setEnemyIdx] = useState(0);
    
    // Multiplayer flow states
    const [myPendingAction, setMyPendingAction] = useState<BattleAction | null>(null);
    const [opponentPendingAction, setOpponentPendingAction] = useState<BattleAction | null>(null);
    const [isResolving, setIsResolving] = useState(false);
    const [dialogue, setDialogue] = useState("Le combat commence !");

    // Helper to get raw stats
    const getActualStat = (char: BattleCharacter, stat: Stat) => {
        const base = stat === 'atk' ? char.stats.attack : stat === 'def' ? char.stats.defense : char.stats.speed;
        return base * char.modifiers[stat].value;
    };

    // --- HOST ONLY: Damage calculation ---
    const calculateResolution = useCallback(() => {
        if (!isHost || !myPendingAction || !opponentPendingAction) return;

        // Simplified resolution for multiplayer demonstration
        // 1. Determine speed order
        // 2. Execute actions
        // 3. Generate a state update to send to client
        
        // This is where the complex logic from the old BattleArena goes
        // For brevity in this response, let's assume Host sends the full synced state
    }, [isHost, myPendingAction, opponentPendingAction]);

    // Receive state from host
    const syncState = useCallback((state: any) => {
        setMyTeam(state.myTeam);
        setEnemyTeam(state.enemyTeam);
        setActiveIdx(state.activeIdx);
        setEnemyIdx(state.enemyIdx);
        setIsResolving(false);
        setMyPendingAction(null);
        setOpponentPendingAction(null);
    }, []);

    const submitAction = (action: BattleAction) => {
        setMyPendingAction(action);
        onSendMessage({ type: 'ACTION_SUBMIT', action });
    };

    const handleOpponentAction = (action: BattleAction) => {
        setOpponentPendingAction(action);
    };

    return {
        myTeam, enemyTeam, activeIdx, enemyIdx,
        dialogue, setDialogue,
        isResolving,
        isWaitingForOpponent: myPendingAction !== null && opponentPendingAction === null,
        submitAction,
        handleOpponentAction,
        syncState,
        myPendingAction,
        opponentPendingAction
    };
};