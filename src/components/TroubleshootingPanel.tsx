import { useState } from 'react';
import { Wrench, AlertTriangle, ChevronRight, Search, CheckCircle } from 'lucide-react';
import type { TroubleshootingEntry } from '../data/commands';

interface TroubleshootingPanelProps {
  entries: TroubleshootingEntry[];
  onApplySolution: (cmd: string) => void;
}

export function TroubleshootingPanel({ entries, onApplySolution }: TroubleshootingPanelProps) {
  const [selectedEntry, setSelectedEntry] = useState<TroubleshootingEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['all', ...new Set(entries.map(e => e.category))];
  
  const filtered = entries.filter(e => {
    const matchesSearch = searchTerm === '' || 
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.symptoms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const riskColors: Record<string, string> = {
    readonly: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    safe: 'text-[#00d4ff] border-[#00d4ff]/20 bg-[#00d4ff]/5',
    elevated: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    destructive: 'text-red-400 border-red-500/20 bg-red-500/5',
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-10 border-b border-white/[0.08] flex items-center px-4 gap-3 bg-[#0a0e18]">
        <Wrench size={12} className="text-[#00d4ff]" />
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Troubleshooting Knowledge Base</span>
        <div className="flex-1" />
        <span className="text-[10px] font-mono text-white/20">{entries.length} entries</span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Entry List */}
        <div className="w-[340px] border-r border-white/[0.08] flex flex-col overflow-hidden">
          {/* Search & Filter */}
          <div className="p-3 border-b border-white/[0.06] space-y-2">
            <div className="relative">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search symptoms or errors..."
                className="w-full h-7 pl-8 pr-3 bg-white/[0.04] border border-white/[0.08] rounded text-[11px] font-mono text-white/60 placeholder:text-white/15 focus:outline-none focus:border-[#00d4ff]/30"
              />
            </div>
            <div className="flex gap-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase transition-colors ${
                    filterCategory === cat
                      ? 'bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/20'
                      : 'text-white/25 hover:text-white/40 border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Entries */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filtered.map(entry => (
              <button
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className={`w-full text-left p-3 rounded transition-colors ${
                  selectedEntry?.id === entry.id
                    ? 'bg-[#00d4ff]/10 border border-[#00d4ff]/20'
                    : 'hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle size={11} className="text-amber-400/60 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-white/70 font-medium leading-snug">{entry.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] font-mono text-white/20">{entry.category}</span>
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${riskColors[entry.riskTier]}`}>
                        {entry.riskTier}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedEntry ? (
            <div className="space-y-4 max-w-[600px]">
              {/* Title & Category */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={14} className="text-amber-400" />
                  <span className="text-[9px] font-mono text-white/25 uppercase">{selectedEntry.category}</span>
                </div>
                <h2 className="text-[16px] font-bold text-white">{selectedEntry.title}</h2>
              </div>

              {/* Symptoms */}
              <div className="panel p-4">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Symptoms</span>
                <div className="mt-2 space-y-1.5">
                  {selectedEntry.symptoms.map((symptom, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] font-mono text-white/50">
                      <span className="text-red-400/60 mt-0.5">✗</span>
                      <span>{symptom}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Root Cause */}
              <div className="panel p-4">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Root Cause</span>
                <p className="text-[12px] text-white/60 mt-2 leading-relaxed">{selectedEntry.rootCause}</p>
              </div>

              {/* Solution */}
              <div className="panel p-4">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Solution</span>
                <p className="text-[12px] text-white/60 mt-2 leading-relaxed">{selectedEntry.solution}</p>
              </div>

              {/* Command */}
              <div className="panel p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ChevronRight size={10} className="text-[#00d4ff]" />
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Recovery Command</span>
                  <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ml-auto ${riskColors[selectedEntry.riskTier]}`}>
                    {selectedEntry.riskTier}
                  </span>
                </div>
                <div className="cmd-preview text-[11px] mb-3">
                  <span className="text-white/30 select-none mr-2">$</span>
                  {selectedEntry.command}
                </div>
                <button
                  onClick={() => onApplySolution(selectedEntry.command)}
                  className="flex items-center gap-2 px-4 py-2 rounded text-[11px] font-mono font-medium bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30 hover:bg-[#00d4ff]/25 transition-colors"
                >
                  <CheckCircle size={11} />
                  Apply Solution
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white/15">
              <Wrench size={28} className="mb-3 opacity-30" />
              <p className="text-[12px] font-mono">Select an issue to diagnose</p>
              <p className="text-[10px] font-mono mt-1 text-white/10">Search by symptoms or error messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
