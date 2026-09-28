import { useState, useMemo } from 'react';
import { Terminal, Shield, AlertTriangle, Zap, Play, ChevronRight } from 'lucide-react';
import type { CommandDefinition, RiskTier } from '../data/commands';
import type { BlockDevice } from '../data/simulator';

interface CommandBuilderProps {
  commands: CommandDefinition[];
  selectedCommand: CommandDefinition | null;
  onSelectCommand: (cmd: CommandDefinition | null) => void;
  onExecute: (cmd: string) => void;
  systemInfo: Record<string, unknown>;
  blockDevices: BlockDevice[];
}

export function CommandBuilder({ commands, selectedCommand, onSelectCommand, onExecute, blockDevices }: CommandBuilderProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [flagValues, setFlagValues] = useState<Record<string, string>>({});
  const [positionalValues, setPositonalValues] = useState<Record<string, string>>({});

  const categories = ['all', 'storage', 'system', 'packages', 'gaming', 'network', 'filesystem'];
  
  const filteredCommands = useMemo(() => {
    if (activeCategory === 'all') return commands;
    return commands.filter(c => c.category === activeCategory);
  }, [commands, activeCategory]);

  const generatedCommand = useMemo(() => {
    if (!selectedCommand) return '';
    let cmd = '';
    
    if (selectedCommand.privilege === 'sudo') cmd += 'sudo ';
    else if (selectedCommand.privilege === 'pkexec') cmd += 'pkexec ';
    
    cmd += selectedCommand.executable;
    
    // Add flags
    Object.entries(flagValues).forEach(([flag, value]) => {
      if (value === 'true' || value === '') {
        cmd += ` ${flag}`;
      } else if (value) {
        cmd += ` ${flag} ${value}`;
      }
    });
    
    // Add positional args
    if (selectedCommand.positionalArgs) {
      selectedCommand.positionalArgs.forEach(arg => {
        const val = positionalValues[arg.name];
        if (val) cmd += ` ${val}`;
      });
    }
    
    return cmd;
  }, [selectedCommand, flagValues, positionalValues]);

  const riskColors: Record<RiskTier, { bg: string; text: string; border: string; label: string }> = {
    readonly: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'READ-ONLY' },
    safe: { bg: 'bg-[#00d4ff]/10', text: 'text-[#00d4ff]', border: 'border-[#00d4ff]/20', label: 'SAFE' },
    elevated: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'ELEVATED' },
    destructive: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'DESTRUCTIVE' },
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-10 border-b border-white/[0.08] flex items-center px-4 gap-3 bg-[#0a0e18]">
        <Terminal size={12} className="text-[#00d4ff]" />
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Command Builder</span>
        <div className="flex-1" />
        {selectedCommand && (
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-mono font-bold ${riskColors[selectedCommand.riskTier].bg} ${riskColors[selectedCommand.riskTier].text} ${riskColors[selectedCommand.riskTier].border}`}>
            <Shield size={9} />
            {riskColors[selectedCommand.riskTier].label}
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Command List */}
        <div className="w-[240px] border-r border-white/[0.08] flex flex-col overflow-hidden">
          {/* Category Filter */}
          <div className="p-2 border-b border-white/[0.06] flex flex-wrap gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/20'
                    : 'text-white/30 hover:text-white/50 border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Command List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {filteredCommands.map(cmd => (
              <button
                key={cmd.id}
                onClick={() => { onSelectCommand(cmd); setFlagValues({}); setPositonalValues({}); }}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  selectedCommand?.id === cmd.id
                    ? 'bg-[#00d4ff]/10 border border-[#00d4ff]/20'
                    : 'hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px] text-white/70">{cmd.executable}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    cmd.riskTier === 'readonly' ? 'bg-emerald-400' :
                    cmd.riskTier === 'safe' ? 'bg-[#00d4ff]' :
                    cmd.riskTier === 'elevated' ? 'bg-amber-400' : 'bg-red-400'
                  }`} />
                </div>
                <p className="text-[10px] text-white/30 mt-0.5 truncate">{cmd.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Builder Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedCommand ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Command Info */}
                <div className="panel p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[14px] font-bold text-white">{selectedCommand.executable}</span>
                    <span className="text-[10px] font-mono text-white/30">· {selectedCommand.category}</span>
                    {selectedCommand.privilege !== 'none' && (
                      <span className="flex items-center gap-1 text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        <AlertTriangle size={8} />
                        {selectedCommand.privilege}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/50">{selectedCommand.description}</p>
                  {selectedCommand.cachyNotes && (
                    <div className="mt-3 p-2 rounded bg-[#00d4ff]/5 border border-[#00d4ff]/10">
                      <p className="text-[10px] text-[#00d4ff]/70 font-mono">
                        <span className="text-[#00d4ff] font-bold">CachyOS:</span> {selectedCommand.cachyNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Flags */}
                {selectedCommand.flags.length > 0 && (
                  <div className="panel p-4">
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Flags & Options</span>
                    <div className="mt-3 space-y-2">
                      {selectedCommand.flags.map(flag => (
                        <div key={flag.flag} className="flex items-center gap-3">
                          <label className="flex items-center gap-2 min-w-[140px]">
                            <input
                              type={flag.type === 'boolean' ? 'checkbox' : 'text'}
                              checked={flag.type === 'boolean' ? flagValues[flag.flag] === 'true' : undefined}
                              value={flag.type !== 'boolean' ? (flagValues[flag.flag] || flag.default || '') : undefined}
                              onChange={(e) => {
                                const val = flag.type === 'boolean' ? (e.target.checked ? 'true' : '') : e.target.value;
                                setFlagValues(prev => ({ ...prev, [flag.flag]: val }));
                              }}
                              className="bg-white/[0.04] border border-white/[0.1] rounded px-2 py-1 text-[11px] font-mono text-white/70 focus:outline-none focus:border-[#00d4ff]/40 w-full"
                            />
                            <span className="text-[10px] font-mono text-[#00d4ff]/70">{flag.flag}</span>
                          </label>
                          <span className="text-[10px] text-white/30 flex-1">{flag.description}</span>
                          {flag.type === 'enum' && flag.options && (
                            <select
                              value={flagValues[flag.flag] || ''}
                              onChange={(e) => setFlagValues(prev => ({ ...prev, [flag.flag]: e.target.value }))}
                              className="bg-white/[0.04] border border-white/[0.1] rounded px-2 py-1 text-[10px] font-mono text-white/60 focus:outline-none focus:border-[#00d4ff]/40"
                            >
                              <option value="">—</option>
                              {flag.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Positional Args */}
                {selectedCommand.positionalArgs && (
                  <div className="panel p-4">
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Arguments</span>
                    <div className="mt-3 space-y-2">
                      {selectedCommand.positionalArgs.map(arg => (
                        <div key={arg.name} className="flex items-center gap-3">
                          <div className="min-w-[140px]">
                            <input
                              type="text"
                              placeholder={arg.name}
                              list={arg.type === 'device' ? 'devices-list' : undefined}
                              value={positionalValues[arg.name] || ''}
                              onChange={(e) => setPositonalValues(prev => ({ ...prev, [arg.name]: e.target.value }))}
                              className="w-full bg-white/[0.04] border border-white/[0.1] rounded px-2 py-1.5 text-[11px] font-mono text-white/70 placeholder:text-white/20 focus:outline-none focus:border-[#00d4ff]/40"
                            />
                            {arg.type === 'device' && (
                              <datalist id="devices-list">
                                {blockDevices.map(d => <option key={d.name} value={`/dev/${d.name}`} />)}
                              </datalist>
                            )}
                          </div>
                          <span className="text-[10px] text-white/30 flex-1">
                            {arg.description}
                            {arg.required && <span className="text-red-400 ml-1">*</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Troubleshooting Links */}
                {selectedCommand.troubleshooting && selectedCommand.troubleshooting.length > 0 && (
                  <div className="panel p-4">
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Known Issues</span>
                    <div className="mt-2 space-y-1">
                      {selectedCommand.troubleshooting.map((issue, i) => (
                        <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-white/30">
                          <AlertTriangle size={9} className="text-amber-400/60 shrink-0" />
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Command Preview & Execute */}
              <div className="border-t border-white/[0.08] p-4 bg-[#0a0e18]">
                <div className="flex items-center gap-2 mb-2">
                  <ChevronRight size={10} className="text-[#00d4ff]" />
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Command Preview</span>
                  {selectedCommand.privilege !== 'none' && (
                    <span className="flex items-center gap-1 text-[9px] font-mono text-amber-400 ml-auto">
                      <Shield size={8} />
                      Requires {selectedCommand.privilege}
                    </span>
                  )}
                </div>
                <div className="cmd-preview mb-3 flex items-center gap-2">
                  <span className="text-white/30 select-none">$</span>
                  <span className="flex-1">{generatedCommand || <span className="text-white/20 italic">Configure parameters above...</span>}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generatedCommand && onExecute(generatedCommand)}
                    disabled={!generatedCommand}
                    className={`flex items-center gap-2 px-4 py-2 rounded text-[11px] font-mono font-medium transition-all ${
                      generatedCommand
                        ? 'bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30 hover:bg-[#00d4ff]/25'
                        : 'bg-white/[0.03] text-white/20 border border-white/[0.06] cursor-not-allowed'
                    }`}
                  >
                    <Play size={11} />
                    Execute
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded text-[11px] font-mono text-white/40 border border-white/[0.08] hover:bg-white/[0.04] transition-colors">
                    <Zap size={11} />
                    Dry Run
                  </button>
                  {selectedCommand.example && (
                    <span className="text-[10px] font-mono text-white/20 ml-auto">
                      Example: {selectedCommand.example}
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/20">
              <Terminal size={28} className="mb-3 opacity-30" />
              <p className="text-[12px] font-mono">Select a command from the catalog</p>
              <p className="text-[10px] font-mono mt-1 text-white/10">Or use the search bar above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
