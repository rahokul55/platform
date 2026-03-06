import { useState } from 'react';
import Landing from './components/Landing';
import CallRoom from './components/CallRoom';

export default function App() {
  const [inCall, setInCall] = useState(false);
  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleJoin = (name: string, room: string) => {
    setUserName(name || 'Guest User');
    setRoomCode(room || 'NX-RANDOM');
    setInCall(true);
  };

  const handleLeave = () => {
    setInCall(false);
    setUserName('');
    setRoomCode('');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 font-sans selection:bg-[#ec5b13]/30">
      {inCall ? (
        <CallRoom name={userName} room={roomCode} onLeave={handleLeave} />
      ) : (
        <Landing onJoin={handleJoin} />
      )}
    </div>
  );
}
