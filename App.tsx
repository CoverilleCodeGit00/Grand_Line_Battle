import React, { useState, useEffect } from 'react';
import { BattleArena } from './src/components/BattleArena';
import { MainMenu } from './src/components/MainMenu';
import { TeamSelection } from './src/components/TeamSelection';
import { usePeer } from './src/hooks/usePeer';
import { Character } from './types';

type GameState = 'MENU' | 'SOLO' | 'MULTI_LOBBY' | 'MULTI_SELECTION' | 'MULTI_GAME';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [isHost, setIsHost] = useState(false);
  
  // Multiplayer Data
  const [myTeam, setMyTeam] = useState<Character[] | null>(null);
  const [enemyTeam, setEnemyTeam] = useState<Character[] | null>(null);

  // Initialize PeerJS Hook
  const { myPeerId, connectToPeer, isConnected, sendMessage, lastMessage, connection, peer } = usePeer();

  // Detect Host status: In PeerJS, if someone connected to us, we are the host
  useEffect(() => {
    if (peer) {
        peer.on('connection', () => {
            setIsHost(true);
            console.log("I am the HOST");
        });
    }
  }, [peer]);

  // Handle network messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
        case 'GAME_START':
            if (gameState === 'MENU' || gameState === 'MULTI_LOBBY') {
                setGameState('MULTI_SELECTION');
            }
            break;
        case 'TEAM_SUBMIT':
            setEnemyTeam(lastMessage.payload);
            break;
        default:
            break;
    }
  }, [lastMessage, gameState]);

  // Sync Check to start Battle
  useEffect(() => {
    if (gameState === 'MULTI_SELECTION' && myTeam && enemyTeam) {
        setTimeout(() => {
            setGameState('MULTI_GAME');
        }, 1000);
    }
  }, [myTeam, enemyTeam, gameState]);

  const handleStartSolo = () => setGameState('SOLO');

  const handleStartMulti = () => {
    if (isConnected) {
      setGameState('MULTI_SELECTION');
      sendMessage({ type: 'GAME_START' });
    }
  };

  const handleTeamReady = (team: Character[]) => {
      setMyTeam(team);
      sendMessage({ type: 'TEAM_SUBMIT', payload: team });
  };

  return (
    <div className="w-full h-full bg-black overflow-hidden">
      {gameState === 'MENU' && (
        <MainMenu 
          onStartSolo={handleStartSolo}
          onStartMulti={handleStartMulti}
          myPeerId={myPeerId}
          connectToPeer={connectToPeer}
          isConnected={isConnected}
        />
      )}

      {gameState === 'SOLO' && (
        <BattleArena 
          isOnline={false} 
          isHost={true} 
          myTeam={[]} // Will be filled by character selection or defaults
          enemyTeam={[]} 
          sendMessage={() => {}} 
          lastMessage={null} 
        />
      )}

      {gameState === 'MULTI_SELECTION' && (
          <TeamSelection 
            onTeamReady={handleTeamReady}
            isOpponentReady={!!enemyTeam}
          />
      )}

      {gameState === 'MULTI_GAME' && myTeam && enemyTeam && (
          <BattleArena 
            isOnline={true}
            isHost={isHost}
            myTeam={myTeam}
            enemyTeam={enemyTeam}
            sendMessage={sendMessage}
            lastMessage={lastMessage}
          />
      )}
    </div>
  );
};

export default App;