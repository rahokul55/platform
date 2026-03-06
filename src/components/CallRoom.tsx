import { useState, useEffect } from 'react';
import { 
  MonitorPlay, Settings, Info, Mic, MicOff, Video, VideoOff, 
  MonitorUp, MoreHorizontal, PhoneOff, Smile, 
  Users, Search, UserMinus, Ban
} from 'lucide-react';

export default function CallRoom({ name, room, onLeave }: { name: string, room: string, onLeave: () => void }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentTime, setCurrentTime] = useState('00:00:00');

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

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0c] text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800 bg-[#16161e] px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-[#ec5b13] p-1.5 rounded-lg flex items-center justify-center">
            <MonitorPlay className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-white text-lg font-bold leading-none tracking-tight">Nexus Room: {room}</h2>
            <p className="text-xs text-slate-400 font-medium">Design Sync Session • {currentTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 mr-4">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="User" className="w-8 h-8 rounded-full border-2 border-[#16161e] object-cover" />
            <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt="User" className="w-8 h-8 rounded-full border-2 border-[#16161e] object-cover" />
            <div className="w-8 h-8 rounded-full border-2 border-[#16161e] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
              +12
            </div>
          </div>
          <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Stage */}
        <div className="flex-1 flex flex-col p-4 gap-4 relative overflow-y-auto">
          {/* Main Screen Share */}
          <div className="flex-1 min-h-[400px] bg-[#16161e] rounded-xl overflow-hidden relative group border border-slate-800">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              {/* Mockup of shared screen */}
              <div className="w-3/4 h-3/4 bg-slate-900 rounded-lg shadow-2xl border border-slate-700 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">figma.com/file/nexus-design-system</div>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div className="col-span-2 bg-slate-800/50 rounded-lg border border-dashed border-slate-700"></div>
                  <div className="flex flex-col gap-4">
                    <div className="h-24 bg-[#ec5b13]/20 rounded-lg"></div>
                    <div className="h-24 bg-purple-500/20 rounded-lg"></div>
                    <div className="flex-1 bg-slate-800/50 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Presenter PIP */}
            <div className="absolute top-4 right-4 w-48 aspect-video bg-slate-900 rounded-lg border-2 border-[#ec5b13] shadow-xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600" alt="Presenter" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white flex items-center gap-1">
                <Mic className="w-3 h-3 text-[#10b981]" />
                Sarah Jenkins
              </div>
            </div>

            {/* Badge */}
            <div className="absolute top-4 left-4 bg-[#ec5b13] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
              <MonitorUp className="w-4 h-4" />
              Sarah is sharing screen
            </div>
          </div>

          {/* Bottom Participants Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-40 shrink-0">
            <ParticipantVideo name={name} img="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300" muted={isMuted} videoOff={isVideoOff} isYou />
            <ParticipantVideo name="Maria Garcia" img="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300" muted={true} />
            <ParticipantVideo name="James Wilson" img="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300" muted={false} />
            <div className="relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
              <div className="text-center">
                <VideoOff className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-[10px] text-slate-400">Emma Wilson</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <aside className="w-80 bg-[#16161e] border-l border-slate-800 flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Participants</h3>
                <span className="bg-[#ec5b13]/20 text-[#ec5b13] text-[10px] font-bold px-2 py-1 rounded-full">14 Online</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search people..." 
                  className="w-full bg-slate-900 border-none rounded-lg text-sm pl-10 pr-4 py-2 focus:ring-1 focus:ring-[#ec5b13] outline-none text-white placeholder:text-slate-500"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-4">
              {/* Presenters */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-2">Presenters — 2</h4>
                <div className="space-y-1">
                  <ParticipantListItem name="Sarah Jenkins" role="Host (Presenting)" img="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150" isHost isSpeaking />
                  <ParticipantListItem name="Michael Chen" role="Product Manager" img="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150" canKick />
                </div>
              </div>

              {/* Viewers */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-2">Viewers — 12</h4>
                <div className="space-y-1">
                  <ParticipantListItem name="David Smith" role="UX Designer" img="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" canKick />
                  <ParticipantListItem name="Emma Wilson" role="Developer" img="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150" canKick />
                  <ParticipantListItem name="James Lee" role="QA Engineer" img="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" canKick />
                </div>
                <button className="w-full mt-2 text-xs font-bold text-[#ec5b13] hover:underline py-2">
                  View 9 more viewers
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800">
              <button className="w-full bg-[#ec5b13]/10 hover:bg-[#ec5b13]/20 text-[#ec5b13] font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                <UserMinus className="w-5 h-5" />
                Invite Others
              </button>
            </div>
          </aside>
        )}
      </main>

      {/* Footer Controls */}
      <footer className="h-20 bg-[#16161e] border-t border-slate-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2 w-1/4">
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showSidebar ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Users className="w-5 h-5" />
            <span className="text-sm font-semibold hidden md:inline">14 Participants</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <ControlButton 
            icon={isMuted ? <MicOff /> : <Mic />} 
            active={!isMuted} 
            onClick={() => setIsMuted(!isMuted)} 
            danger={isMuted}
          />
          <ControlButton 
            icon={isVideoOff ? <VideoOff /> : <Video />} 
            active={!isVideoOff} 
            onClick={() => setIsVideoOff(!isVideoOff)} 
            danger={isVideoOff}
          />
          <button className="w-14 h-14 rounded-2xl bg-[#ec5b13] flex items-center justify-center hover:scale-105 transition-transform text-white shadow-lg shadow-[#ec5b13]/20">
            <MonitorUp className="w-6 h-6" />
          </button>
          <ControlButton icon={<Smile />} />
          <ControlButton icon={<MoreHorizontal />} />
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

function ParticipantVideo({ name, img, muted, videoOff, isYou }: { name: string, img: string, muted?: boolean, videoOff?: boolean, isYou?: boolean }) {
  if (videoOff) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center group">
        <div className="text-center">
          <VideoOff className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-[10px] text-slate-400">{name} {isYou && '(You)'}</p>
        </div>
        <div className="absolute top-2 right-2">
          {muted && (
            <div className="bg-black/50 p-1 rounded-full backdrop-blur-sm">
              <MicOff className="w-3 h-3 text-red-400" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 group">
      <img src={img} alt={name} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-[10px] text-white">
        {name} {isYou && '(You)'}
      </div>
      <div className="absolute top-2 right-2">
        {muted ? (
          <div className="bg-black/50 p-1 rounded-full backdrop-blur-sm">
            <MicOff className="w-3 h-3 text-red-400" />
          </div>
        ) : (
          <div className="bg-black/50 p-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <Mic className="w-3 h-3 text-[#10b981]" />
          </div>
        )}
      </div>
    </div>
  );
}

function ParticipantListItem({ name, role, img, isHost, isSpeaking, canKick }: { name: string, role: string, img: string, isHost?: boolean, isSpeaking?: boolean, canKick?: boolean }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 group transition-colors">
      <div className="flex items-center gap-3">
        <img src={img} alt={name} className="w-10 h-10 rounded-full object-cover bg-slate-800" />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{name}</span>
            {isHost && <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-bold">HOST</span>}
          </div>
          <span className="text-xs text-slate-500">{role}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isSpeaking && <Mic className="w-4 h-4 text-[#10b981]" />}
        {canKick && (
          <div className="hidden group-hover:flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors" title="Kick">
              <Ban className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
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
