import { Search, Zap, Terminal, Shield } from 'lucide-react';

interface TopBarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  executionMode: 'simulator' | 'daemon';
  onModeSwitch: () => void;
}

export function TopBar({ searchQuery, onSearch, executionMode, onModeSwitch }: TopBarProps) {
  return (
    <div className="h-12 bg-[#0a0e18] border-b border-white/[0.08] flex items-center px-4 gap-4 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5 mr-4">
        <div className="w-7 h-7 rounded bg-gradient-to-br from-[#00d4ff] to-[#0088aa] flex items-center justify-center">
          <Zap size={14} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-bold tracking-tight text-white leading-none">VANGUARD</span>
          <span className="text-[9px] font-mono text-white/30 tracking-widest">COMMAND INTELLIGENCE</span>
        </div>
      </div>

      {/* Omni-Search */}
      <div className="flex-1 max-w-2xl relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="/ for filesystem · type intent for commands · .exe for compatibility"
          className="w-full h-8 pl-9 pr-4 bg-white/[0.04] border border-white/[0.08] rounded text-[12px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#00d4ff]/40 focus:bg-white/[0.06] transition-colors font-mono"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <kbd className="text-[9px] font-mono text-white/20 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.06]">⌘K</kbd>
        </div>
      </div>

      {/* Execution Mode Switch */}
      <button
        onClick={onModeSwitch}
        className={`flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-mono font-medium border transition-all ${
          executionMode === 'simulator'
            ? 'bg-[#00d4ff]/10 border-[#00d4ff]/30 text-[#00d4ff]'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}
      >
        {executionMode === 'simulator' ? <Shield size={12} /> : <Terminal size={12} />}
        {executionMode === 'simulator' ? 'SIMULATOR' : 'LIVE DAEMON'}
      </button>

      {/* System indicator */}
      <div className="flex items-center gap-2 ml-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
        <span className="text-[10px] font-mono text-white/40">CachyOS</span>
      </div>
    </div>
  );
}
