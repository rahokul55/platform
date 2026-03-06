import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  MonitorPlay, Settings, Mic, MicOff, Video, VideoOff, 
  MonitorUp, PhoneOff, Users
} from 'lucide-react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

function VideoElement({ stream, muted = false, className }: { stream: MediaStream, muted?: boolean, className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);
  return <video ref={ref} autoPlay playsInline muted={muted} className={className} />;
}

export default function CallRoom({ name, room, onLeave }: { name: string, room: string, onLeave: () => void }) {
  const [peers, setPeers] = useState<{id: string, stream: MediaStream, name: string}[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentTime, setCurrentTime] = useState('00:00:00');

  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<{[key: string]: RTCPeerConnection}>({});
  const namesRef = useRef<{[key: string]: string}>({});

  useEffect(() => {
    let seconds = 0;
    const interval = setInterval(() => {
      seconds++;
      const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
      const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      setCurrentTime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    socketRef.current = io('/', { path: '/socket.io' });
    
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      localStreamRef.current = stream;
      setPeers(prev => [...prev]); // trigger re-render

      socketRef.current?.emit('join-room', room, name);

      socketRef.current?.on('user-connected', async (payload: {userId: string, userName: string}) => {
        namesRef.current[payload.userId] = payload.userName;
        const peer = createPeer(payload.userId, socketRef.current!.id, stream, name);
        peersRef.current[payload.userId] = peer;
      });

      socketRef.current?.on('offer', async (payload: {signal: RTCSessionDescriptionInit, callerID: string, callerName: string}) => {
        namesRef.current[payload.callerID] = payload.callerName;
        const peer = addPeer(payload.signal, payload.callerID, stream, payload.callerName);
        peersRef.current[payload.callerID] = peer;
      });

      socketRef.current?.on('answer', async (payload: {signal: RTCSessionDescriptionInit, id: string}) => {
        const peer = peersRef.current[payload.id];
        if (peer) {
          await peer.setRemoteDescription(new RTCSessionDescription(payload.signal));
        }
      });

      socketRef.current?.on('ice-candidate', async (payload: {candidate: RTCIceCandidateInit, id: string}) => {
        const peer = peersRef.current[payload.id];
        if (peer) {
          await peer.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(e => console.error(e));
        }
      });

      socketRef.current?.on('user-disconnected', (userId: string) => {
        if (peersRef.current[userId]) {
          peersRef.current[userId].close();
          delete peersRef.current[userId];
        }
        setPeers(prev => prev.filter(p => p.id !== userId));
      });
    }).catch(err => {
      console.error("Error accessing media devices.", err);
      alert("Kamera veya mikrofon izni alınamadı. Lütfen tarayıcı ayarlarınızı kontrol edin.");
    });

    return () => {
      socketRef.current?.disconnect();
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      screenStreamRef.current?.getTracks().forEach(track => track.stop());
      Object.values(peersRef.current).forEach(peer => peer.close());
    };
  }, [room, name]);

  function createPeer(userToSignal: string, callerID: string, stream: MediaStream, callerName: string) {
    const peer = new RTCPeerConnection(ICE_SERVERS);
    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current?.emit('ice-candidate', { target: userToSignal, candidate: e.candidate });
      }
    };

    peer.ontrack = (e) => {
      setPeers(prev => {
        if (prev.find(p => p.id === userToSignal)) return prev;
        return [...prev, { id: userToSignal, stream: e.streams[0], name: namesRef.current[userToSignal] || 'Participant' }];
      });
    };

    peer.onnegotiationneeded = async () => {
      try {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socketRef.current?.emit('offer', { userToSignal, callerID, callerName, signal: peer.localDescription });
      } catch (err) {
        console.error(err);
      }
    };

    return peer;
  }

  function addPeer(incomingSignal: RTCSessionDescriptionInit, callerID: string, stream: MediaStream, callerName: string) {
    const peer = new RTCPeerConnection(ICE_SERVERS);
    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current?.emit('ice-candidate', { target: callerID, candidate: e.candidate });
      }
    };

    peer.ontrack = (e) => {
      setPeers(prev => {
        if (prev.find(p => p.id === callerID)) return prev;
        return [...prev, { id: callerID, stream: e.streams[0], name: callerName }];
      });
    };

    peer.setRemoteDescription(new RTCSessionDescription(incomingSignal)).then(async () => {
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socketRef.current?.emit('answer', { signal: peer.localDescription, callerID });
    }).catch(err => console.error(err));

    return peer;
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];
        
        Object.values(peersRef.current).forEach(peer => {
          const sender = peer.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });

        screenTrack.onended = () => stopScreenShare();
        setIsScreenSharing(true);
      } catch (err) {
        console.error("Error sharing screen", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      Object.values(peersRef.current).forEach(peer => {
        const sender = peer.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(videoTrack);
      });
    }
    setIsScreenSharing(false);
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0c] text-white overflow-hidden">
      <header className="flex items-center justify-between border-b border-slate-800 bg-[#16161e] px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-[#ec5b13] p-1.5 rounded-lg flex items-center justify-center">
            <MonitorPlay className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-white text-lg font-bold leading-none tracking-tight">Nexus Room: {room}</h2>
            <p className="text-xs text-slate-400 font-medium">Live Session • {currentTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#16161e] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
            {peers.length + 1}
          </div>
          <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 flex flex-col p-4 gap-4 relative overflow-y-auto">
          <div className={`flex-1 grid gap-4 ${peers.length === 0 ? 'grid-cols-1' : peers.length === 1 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
            
            <div className="relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 group flex items-center justify-center">
              {localStreamRef.current && (
                <VideoElement 
                  stream={isScreenSharing && screenStreamRef.current ? screenStreamRef.current : localStreamRef.current} 
                  muted={true} 
                  className={`absolute inset-0 w-full h-full object-cover ${!isScreenSharing ? 'scale-x-[-1]' : ''}`} 
                />
              )}
              {isVideoOff && !isScreenSharing && (
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center z-10">
                  <VideoOff className="w-12 h-12 text-slate-500" />
                </div>
              )}
              <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white z-20 flex items-center gap-2">
                {name} (You)
                {isMuted && <MicOff className="w-3 h-3 text-red-400" />}
              </div>
              {isScreenSharing && (
                <div className="absolute top-4 left-4 bg-[#ec5b13] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg z-20">
                  <MonitorUp className="w-4 h-4" />
                  You are sharing screen
                </div>
              )}
            </div>

            {peers.map(peer => (
              <div key={peer.id} className="relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 group flex items-center justify-center">
                <VideoElement stream={peer.stream} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white z-20">
                  {peer.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {showSidebar && (
          <aside className="w-80 bg-[#16161e] border-l border-slate-800 flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Participants</h3>
                <span className="bg-[#ec5b13]/20 text-[#ec5b13] text-[10px] font-bold px-2 py-1 rounded-full">{peers.length + 1} Online</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <ParticipantListItem name={`${name} (You)`} role="Host" isSpeaking={!isMuted} />
              {peers.map(peer => (
                <ParticipantListItem key={peer.id} name={peer.name} role="Participant" />
              ))}
            </div>
          </aside>
        )}
      </main>

      <footer className="h-20 bg-[#16161e] border-t border-slate-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2 w-1/4">
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showSidebar ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Users className="w-5 h-5" />
            <span className="text-sm font-semibold hidden md:inline">{peers.length + 1} Participants</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <ControlButton icon={isMuted ? <MicOff /> : <Mic />} active={!isMuted} onClick={toggleMute} danger={isMuted} />
          <ControlButton icon={isVideoOff ? <VideoOff /> : <Video />} active={!isVideoOff} onClick={toggleVideo} danger={isVideoOff} />
          <button 
            onClick={toggleScreenShare}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform text-white shadow-lg ${isScreenSharing ? 'bg-red-500 shadow-red-500/20' : 'bg-[#ec5b13] shadow-[#ec5b13]/20'}`}
          >
            <MonitorUp className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-4 w-1/4">
          <button onClick={onLeave} className="px-6 h-12 rounded-xl bg-red-500 hover:bg-red-600 transition-all text-white font-bold flex items-center gap-2 shadow-lg shadow-red-500/20">
            <PhoneOff className="w-5 h-5" />
            <span className="hidden md:inline">Leave Room</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

function ParticipantListItem({ name, role, isSpeaking }: { name: string, role: string, isSpeaking?: boolean }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 group transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">{name}</span>
          <span className="text-xs text-slate-500">{role}</span>
        </div>
      </div>
      {isSpeaking && <Mic className="w-4 h-4 text-[#10b981]" />}
    </div>
  );
}

function ControlButton({ icon, active, onClick, danger }: { icon: React.ReactNode, active?: boolean, onClick?: () => void, danger?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
        danger 
          ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' 
          : active === false
            ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
      }`}
    >
      {icon}
    </button>
  );
}
