import React, { useState } from 'react';

const BACKGROUND_URL = "https://images.alphacoders.com/605/thumb-1920-605592.png"; // Map style background

interface MainMenuProps {
  onStartSolo: () => void;
  onStartMulti: () => void; // Trigger game start after connection
  myPeerId: string;
  connectToPeer: (id: string) => void;
  isConnected: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({ 
  onStartSolo, 
  onStartMulti, 
  myPeerId, 
  connectToPeer, 
  isConnected 
}) => {
  const [view, setView] = useState<'HOME' | 'LOBBY'>('HOME');
  const [remoteIdInput, setRemoteIdInput] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(myPeerId);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleJoin = () => {
    if (remoteIdInput.trim()) {
      connectToPeer(remoteIdInput.trim());
    }
  };

  return (
    <div 
      className="flex flex-col h-screen w-full items-center justify-center bg-gray-900 text-white font-serif relative overflow-hidden"
      style={{ 
        backgroundImage: `url(${BACKGROUND_URL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* TITLE */}
      <div className="z-10 text-center mb-12 animate-float">
        <h1 className="text-5xl md:text-7xl font-bold text-yellow-500 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] tracking-widest border-b-4 border-yellow-600 pb-2 inline-block">
          ONE PIECE
        </h1>
        <h2 className="text-2xl md:text-4xl font-bold text-white mt-2 drop-shadow-md tracking-wider">
          TACTICS BATTLE
        </h2>
      </div>

      {/* CONTENT BOX */}
      <div className="z-10 w-full max-w-md bg-gray-800/90 border-2 border-yellow-600 p-8 rounded-lg shadow-2xl mx-4 transition-all duration-300">
        
        {view === 'HOME' && (
          <div className="flex flex-col gap-4">
            <button 
              onClick={onStartSolo}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded border-2 border-blue-400 text-xl tracking-wider transition-all hover:scale-[1.02] shadow-lg uppercase"
            >
              Mode Solo
            </button>
            <button 
              onClick={() => setView('LOBBY')}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded border-2 border-red-400 text-xl tracking-wider transition-all hover:scale-[1.02] shadow-lg uppercase"
            >
              Mode En Ligne
            </button>
          </div>
        )}

        {view === 'LOBBY' && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h3 className="text-yellow-500 font-bold text-xl mb-4 uppercase">Lobby Pirate</h3>
              
              {/* MY ID SECTION */}
              <div className="bg-black/50 p-3 rounded border border-gray-600 mb-4">
                <p className="text-gray-400 text-xs uppercase mb-1">Mon ID de Capitaine</p>
                <div className="flex gap-2 items-center">
                  <code className="flex-grow bg-gray-900 p-2 rounded text-green-400 font-mono text-sm truncate select-all">
                    {myPeerId || "Génération..."}
                  </code>
                  <button 
                    onClick={handleCopy}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded border border-gray-500 text-xs font-bold uppercase"
                  >
                    {copyFeedback ? "Copié !" : "Copier"}
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-600 my-2"></div>

              {/* JOIN SECTION */}
              {!isConnected ? (
                <div className="flex flex-col gap-2">
                  <p className="text-gray-300 text-sm">Entrer l'ID d'un adversaire :</p>
                  <input 
                    type="text" 
                    value={remoteIdInput}
                    onChange={(e) => setRemoteIdInput(e.target.value)}
                    placeholder="Coller l'ID ici..."
                    className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-white focus:border-yellow-500 outline-none font-mono text-sm"
                  />
                  <button 
                    onClick={handleJoin}
                    disabled={!myPeerId || !remoteIdInput}
                    className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded uppercase transition-colors"
                  >
                    Rejoindre
                  </button>
                </div>
              ) : (
                <div className="bg-green-900/50 border border-green-500 p-4 rounded text-center animate-pulse">
                  <p className="text-green-300 font-bold text-lg mb-2">Adversaire Connecté !</p>
                  <p className="text-gray-300 text-xs italic">Préparez-vous au combat...</p>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col gap-2 mt-2">
              {isConnected && (
                <button 
                  onClick={onStartMulti}
                  className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded border border-green-400 uppercase tracking-wider shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-bounce"
                >
                  Commencer le Combat
                </button>
              )}
              <button 
                onClick={() => setView('HOME')}
                className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold rounded border border-gray-500 uppercase text-sm"
              >
                Retour
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .animate-float {
            animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};