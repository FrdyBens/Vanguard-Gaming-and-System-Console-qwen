import { Terminal, CheckCircle, XCircle, Clock, Trash2, ChevronRight } from 'lucide-react';

interface ExecutionGatewayProps {
  output: string | null;
  history: {
    id: string;
    command: string;
    target: string;
    timestamp: string;
    exitCode: number;
    outcome: string;
    duration: string;
    notes: string;
  }[];
  onClear: () => void;
}

export function ExecutionGateway({ output, history, onClear }: ExecutionGatewayProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-10 border-b border-white/[0.08] flex items-center px-4 gap-3 bg-[#0a0e18]">
        <Terminal size={12} className="text-[#00d4ff]" />
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Execution Gateway</span>
        <div className="flex-1" />
        {output && (
          <button onClick={onClear} className="flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-white/50 transition-colors">
            <Trash2 size={10} /> Clear
          </button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Terminal Output */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-white/[0.08]">
          <div className="flex-1 overflow-y-auto p-4">
            {output ? (
              <div className="space-y-3">
                {/* Current execution */}
                <div className="panel p-4 glow-border-cyan">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Active Execution</span>
                  </div>
                  <div className="bg-[#070a11] rounded p-3 font-mono text-[11px] leading-relaxed">
                    {output.split('\n').map((line, i) => (
                      <div key={i} className={
                        line.startsWith('>') ? 'text-white/40' :
                        line.includes('Exit code: 0') ? 'text-emerald-400' :
                        line.includes('Exit code:') ? 'text-red-400' :
                        'text-[#a5f3fc]'
                      }>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Execution metadata */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="panel p-3">
                    <span className="text-[9px] font-mono text-white/25 uppercase">Status</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <CheckCircle size={11} className="text-emerald-400" />
                      <span className="text-[11px] font-mono text-emerald-400">Completed</span>
                    </div>
                  </div>
                  <div className="panel p-3">
                    <span className="text-[9px] font-mono text-white/25 uppercase">Exit Code</span>
                    <p className="text-[11px] font-mono text-white/60 mt-1 tabular">0</p>
                  </div>
                  <div className="panel p-3">
                    <span className="text-[9px] font-mono text-white/25 uppercase">Duration</span>
                    <p className="text-[11px] font-mono text-white/60 mt-1 tabular">0.4s</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-white/15">
                <Terminal size={28} className="mb-3 opacity-30" />
                <p className="text-[12px] font-mono">No active execution</p>
                <p className="text-[10px] font-mono mt-1">Build and execute a command from the Command Builder</p>
              </div>
            )}
          </div>
        </div>

        {/* History Panel */}
        <div className="w-[320px] flex flex-col overflow-hidden">
          <div className="h-8 border-b border-white/[0.06] flex items-center px-3 bg-[#0a0e18]">
            <Clock size={10} className="text-[#00d4ff] mr-2" />
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Execution History</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {history.map(exec => (
              <div key={exec.id} className="panel p-3 hover:border-white/[0.12] transition-colors">
                <div className="flex items-start gap-2">
                  {exec.outcome === 'success' ? (
                    <CheckCircle size={11} className="text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle size={11} className="text-red-400 mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10px] text-white/50 truncate">{exec.command}</div>
                    <div className="flex items-center gap-2 mt-1.5 text-[9px] font-mono text-white/25">
                      <span>{exec.target}</span>
                      <span>·</span>
                      <span className="tabular">{exec.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] font-mono tabular ${exec.exitCode === 0 ? 'text-emerald-400/60' : 'text-red-400/60'}`}>
                        exit:{exec.exitCode}
                      </span>
                      <span className="text-[9px] font-mono text-white/20 tabular">{exec.duration}</span>
                    </div>
                    {exec.notes && (
                      <p className="text-[9px] text-white/25 mt-1.5 leading-relaxed">{exec.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
