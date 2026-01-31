import { useState, useEffect, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';

export interface UsePeerResult {
  peer: Peer | null;
  myPeerId: string;
  connection: DataConnection | null;
  isConnected: boolean;
  connectToPeer: (remoteId: string) => void;
  sendMessage: (data: any) => void;
  lastMessage: any;
}

export const usePeer = (): UsePeerResult => {
  const [myPeerId, setMyPeerId] = useState<string>('');
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  
  const peerRef = useRef<Peer | null>(null);

  useEffect(() => {
    // Initialize Peer
    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', (id) => {
      console.log('My Peer ID is:', id);
      setMyPeerId(id);
    });

    peer.on('connection', (conn) => {
      console.log('Incoming connection from:', conn.peer);
      handleConnection(conn);
    });

    peer.on('error', (err) => {
      console.error('PeerJS Error:', err);
    });

    return () => {
      peer.destroy();
    };
  }, []);

  const handleConnection = (conn: DataConnection) => {
    setConnection(conn);

    conn.on('open', () => {
      console.log('Connection opened with:', conn.peer);
      setIsConnected(true);
    });

    conn.on('data', (data) => {
      console.log('Received data:', data);
      setLastMessage(data);
    });

    conn.on('close', () => {
      console.log('Connection closed');
      setIsConnected(false);
      setConnection(null);
    });

    conn.on('error', (err) => {
      console.error('Connection Error:', err);
      setIsConnected(false);
    });
  };

  const connectToPeer = (remoteId: string) => {
    if (!peerRef.current) return;
    console.log('Connecting to:', remoteId);
    const conn = peerRef.current.connect(remoteId);
    handleConnection(conn);
  };

  const sendMessage = (data: any) => {
    if (connection && isConnected) {
      connection.send(data);
    } else {
      console.warn('Cannot send message: No active connection');
    }
  };

  return {
    peer: peerRef.current,
    myPeerId,
    connection,
    isConnected,
    connectToPeer,
    sendMessage,
    lastMessage
  };
};