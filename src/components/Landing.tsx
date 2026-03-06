import { MonitorPlay, HelpCircle, Settings, User, Key, LogIn, PlusCircle, Zap } from 'lucide-react';
import { useState } from 'react';

export default function Landing({ onJoin }: { onJoin: (name: string, room: string) => void }) {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');

  return (
    <div className="min-h-screen flex flex-col bg-[#1a110c] text-white relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 lg:px-12 border-b border-[#ec5b13]/10 bg-[#1a110c]/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#ec5b13] p-1.5 rounded-lg flex items-center justify-center">
            <MonitorPlay className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">Nexus</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-[#ec5b13] transition-colors">
            <HelpCircle className="w-5 h-5" />
            Support
          </button>
          <div className="h-8 w-[1px] bg-[#ec5b13]/20 hidden md:block"></div>
          <button className="p-2 hover:bg-[#ec5b13]/10 rounded-full transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {/* Background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ec5b13]/10 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#ec5b13]/5 rounded-full blur-[80px] -z-10"></div>

        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ec5b13]/10 border border-[#ec5b13]/20 text-[#ec5b13] text-xs font-bold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ec5b13] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ec5b13]"></span>
              </span>
              Live Streaming v2.4
            </div>
            <h2 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight">
              Share your <span className="text-[#ec5b13]">vision</span> in real-time.
            </h2>
            <p className="text-lg text-slate-400 max-w-md mx-auto md:mx-0">
              High-performance screen sharing for developers, designers, and modern teams. Zero lag, 4K support, instant connection.
            </p>
            <div className="hidden md:flex items-center gap-6 pt-4 text-slate-500">
              <div className="flex flex-col items-start">
                <span className="text-xl font-bold text-white">Low Latency</span>
                <span className="text-xs uppercase">Under 50ms</span>
              </div>
              <div className="h-10 w-[1px] bg-[#ec5b13]/20"></div>
              <div className="flex flex-col items-start">
                <span className="text-xl font-bold text-white">Encrypted</span>
                <span className="text-xs uppercase">End-to-End</span>
              </div>
            </div>
          </div>

          <div className="bg-[#2a1e17]/60 backdrop-blur-xl border border-[#ec5b13]/10 p-8 rounded-2xl shadow-2xl space-y-8">
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-300 ml-1">Display Name</span>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#1a110c] border border-[#ec5b13]/20 focus:ring-2 focus:ring-[#ec5b13] focus:border-transparent transition-all outline-none text-white placeholder:text-slate-600" 
                    placeholder="e.g. Alex Chen" 
                  />
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => onJoin(name, '')}
                className="group w-full bg-[#ec5b13] hover:bg-[#ec5b13]/90 text-white font-bold py-5 rounded-xl transition-all shadow-lg shadow-[#ec5b13]/20 flex flex-col items-center gap-1"
              >
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-5 h-5" />
                  <span>Create New Room</span>
                </div>
                <span className="text-[10px] font-normal opacity-80 uppercase tracking-widest">Start as Host</span>
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#ec5b13]/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#231812] px-3 text-slate-400">or join existing</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#1a110c] border border-[#ec5b13]/20 focus:ring-2 focus:ring-[#ec5b13] focus:border-transparent transition-all outline-none text-white placeholder:text-slate-600" 
                    placeholder="Enter Room Code (e.g. NX-982)" 
                  />
                </div>
                <button 
                  onClick={() => onJoin(name, room)}
                  className="w-full bg-[#3d2a20] hover:bg-[#ec5b13]/20 text-white font-bold py-5 rounded-xl transition-all flex flex-col items-center gap-1 border border-transparent border-[#ec5b13]/10"
                >
                  <div className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    <span>Join Room</span>
                  </div>
                  <span className="text-[10px] font-normal opacity-60 uppercase tracking-widest text-slate-400">Enter as Viewer</span>
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-slate-500">
              By entering Nexus, you agree to our <a href="#" className="text-[#ec5b13] hover:underline">Terms of Service</a> and <a href="#" className="text-[#ec5b13] hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-slate-600 text-sm z-10">
        <div className="flex justify-center gap-8 mb-4">
          <a href="#" className="hover:text-[#ec5b13] transition-colors">Twitter</a>
          <a href="#" className="hover:text-[#ec5b13] transition-colors">GitHub</a>
          <a href="#" className="hover:text-[#ec5b13] transition-colors">Changelog</a>
        </div>
        <p>© 2024 Nexus Technologies Inc. All rights reserved.</p>
      </footer>

      {/* Status */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:block">
        <div className="bg-[#ec5b13]/10 backdrop-blur-md border border-[#ec5b13]/20 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="bg-[#ec5b13] rounded-full p-2 h-10 w-10 flex items-center justify-center">
            <Zap className="text-white w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">Global Network Status</p>
            <p className="text-xs text-green-500 font-medium mt-1">99.9% uptime - All systems operational</p>
          </div>
        </div>
      </div>
    </div>
  );
}
