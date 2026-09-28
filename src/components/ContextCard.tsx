import { Gamepad2, Wine, Box, Clock, CheckCircle, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import type { WinePrefix, SteamGame, ProtonRuntime } from '../data/simulator';
import type { CommandDefinition } from '../data/commands';

interface ContextCardProps {
  selectedObject: {
    type: string;
    name: string;
    path: string;
    data: Record<string, unknown>;
  } | null;
  winePrefixes: WinePrefix[];
  steamGames: SteamGame[];
  protonRuntimes: ProtonRuntime[];
  executionHistory: { id: string; command: string; target: string; targetId: string; timestamp: string; exitCode: number; outcome: string; duration: string; notes: string }[];
  onSelectCommand: (cmd: CommandDefinition) => void;
}

export function ContextCard({ selectedObject, winePrefixes, steamGames, protonRuntimes, executionHistory, onSelectCommand }: ContextCardProps) {
  if (!selectedObject) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-white/20">
        <Box size={32} className="mb-3 opacity-30" />
        <p className="text-[12px] font-mono">Select an object to inspect</p>
        <p className="text-[10px] font-mono mt-1 text-white/10">Files, executables, devices, or services</p>
      </div>
    );
  }

  const isExe = selectedObject.name.endsWith('.exe') || selectedObject.type === 'exe';
  const isDirectory = selectedObject.type === 'directory';
  const relatedWinePrefix = winePrefixes.find(p => selectedObject.path.includes(p.path) || p.games.some(g => selectedObject.name.includes(g)));
  const relatedSteamGame = steamGames.find(g => selectedObject.path.includes(g.installPath) || g.name.toLowerCase().includes(selectedObject.name.toLowerCase().replace('.exe', '')));
  const relatedHistory = executionHistory.filter(h => h.targetId === selectedObject.name || h.target.toLowerCase().includes(selectedObject.name.toLowerCase().replace('.exe', '')));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-10 border-b border-white/[0.08] flex items-center px-4 gap-3 bg-[#0a0e18]">
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Universal Context Card</span>
        <div className="flex-1" />
        <span className="text-[10px] font-mono text-[#00d4ff]/60">{selectedObject.type.toUpperCase()}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Object Identity */}
        <div className="panel p-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${
              isExe ? 'bg-[#00d4ff]/10 border border-[#00d4ff]/20' : isDirectory ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/[0.04] border border-white/[0.08]'
            }`}>
              {isExe ? <Gamepad2 size={18} className="text-[#00d4ff]" /> : isDirectory ? <Box size={18} className="text-amber-400" /> : <Box size={18} className="text-white/40" />}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[14px] font-semibold text-white truncate">{selectedObject.name}</h3>
              <p className="text-[11px] font-mono text-white/40 truncate mt-0.5">{selectedObject.path}</p>
              <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-white/30">
                <span>Type: {selectedObject.type}</span>
                <span>·</span>
                <span>Owner: {(selectedObject.data as Record<string, string>).owner || 'vanguard'}</span>
                <span>·</span>
                <span>Perms: {(selectedObject.data as Record<string, string>).permissions || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Executable Compatibility Card */}
        {isExe && (
          <div className="panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <Wine size={12} className="text-[#00d4ff]" />
              <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Windows Compatibility</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MetaField label="Architecture" value="x86_64 (PE32+)" />
              <MetaField label="PE Type" value="Portable Executable" />
              <MetaField label="Detected By" value="file(1) + binwalk" />
              <MetaField label="Save Redirect" value="~/Documents/My Games/" />
            </div>

            {/* Available Runtimes */}
            <div className="mt-4 pt-3 border-t border-white/[0.06]">
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Available Runtimes</span>
              <div className="mt-2 space-y-1.5">
                {protonRuntimes.map(rt => (
                  <div key={rt.name + rt.version} className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${rt.type === 'ge-custom' ? 'bg-[#00d4ff]' : 'bg-white/30'}`} />
                      <span className="font-mono text-white/60">{rt.name} {rt.version}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-white/25">
                      <span>DXVK {rt.dxvk}</span>
                      <span>VKD3D {rt.vkd3d}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Wine Prefix */}
            {relatedWinePrefix && (
              <div className="mt-4 pt-3 border-t border-white/[0.06]">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Existing Prefix</span>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-white/50">{relatedWinePrefix.path}</span>
                  <span className="font-mono text-white/25 tabular">{relatedWinePrefix.size}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Steam Game Info */}
        {relatedSteamGame && (
          <div className="panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <Gamepad2 size={12} className="text-[#00d4ff]" />
              <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Steam Game Profile</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MetaField label="App ID" value={relatedSteamGame.appId} />
              <MetaField label="Proton" value={relatedSteamGame.protonVersion} />
              <MetaField label="Size" value={relatedSteamGame.size} />
              <MetaField label="Last Played" value={relatedSteamGame.lastPlayed} />
            </div>
            {relatedSteamGame.launchOptions && (
              <div className="mt-3 pt-3 border-t border-white/[0.06]">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Launch Options</span>
                <div className="mt-1.5 cmd-preview text-[10px]">{relatedSteamGame.launchOptions}</div>
              </div>
            )}
            <div className="mt-3 flex items-center gap-2">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                relatedSteamGame.status === 'installed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
              }`}>
                {relatedSteamGame.status}
              </span>
              <span className="text-[10px] font-mono text-white/20">{relatedSteamGame.installPath}</span>
            </div>
          </div>
        )}

        {/* Execution History */}
        {relatedHistory.length > 0 && (
          <div className="panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={12} className="text-[#00d4ff]" />
              <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Contextual History</span>
            </div>
            <div className="space-y-2">
              {relatedHistory.map(h => (
                <div key={h.id} className="flex items-start gap-2 p-2 rounded bg-white/[0.02]">
                  {h.outcome === 'success' ? (
                    <CheckCircle size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle size={12} className="text-red-400 mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-mono text-white/50 truncate">{h.command}</div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-white/25">
                      <span>{h.timestamp}</span>
                      <span>·</span>
                      <span>Exit: {h.exitCode}</span>
                      <span>·</span>
                      <span>{h.duration}</span>
                    </div>
                    {h.notes && <p className="text-[10px] text-white/30 mt-1">{h.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Actions */}
        <div className="panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRight size={12} className="text-[#00d4ff]" />
            <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Available Actions</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {isExe && (
              <>
                <ActionButton label="Run with Wine" command="wine" tier="safe" onClick={() => onSelectCommand({ id: 'wine', executable: 'wine', category: 'gaming', description: 'Run Windows executables', riskTier: 'safe', privilege: 'none', flags: [] })} />
                <ActionButton label="Protontricks" command="protontricks" tier="safe" onClick={() => onSelectCommand({ id: 'protontricks', executable: 'protontricks', category: 'gaming', description: 'Manage Steam Proton prefixes', riskTier: 'safe', privilege: 'none', flags: [] })} />
                <ActionButton label="Gamescope" command="gamescope" tier="safe" onClick={() => onSelectCommand({ id: 'gamescope', executable: 'gamescope', category: 'gaming', description: 'Micro-compositor for gaming', riskTier: 'safe', privilege: 'none', flags: [] })} />
                <ActionButton label="MangoHud" command="mangohud" tier="readonly" onClick={() => onSelectCommand({ id: 'mangohud', executable: 'mangohud', category: 'gaming', description: 'Performance overlay', riskTier: 'readonly', privilege: 'none', flags: [] })} />
              </>
            )}
            {isDirectory && (
              <>
                <ActionButton label="Mount" command="mount" tier="elevated" onClick={() => onSelectCommand({ id: 'mount', executable: 'mount', category: 'storage', description: 'Mount filesystem', riskTier: 'elevated', privilege: 'sudo', flags: [] })} />
                <ActionButton label="Inspect" command="lsblk" tier="readonly" onClick={() => onSelectCommand({ id: 'lsblk', executable: 'lsblk', category: 'storage', description: 'List block devices', riskTier: 'readonly', privilege: 'none', flags: [] })} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[9px] font-mono text-white/25 uppercase tracking-wider">{label}</span>
      <p className="text-[11px] font-mono text-white/60 mt-0.5">{value}</p>
    </div>
  );
}

function ActionButton({ label, command, tier, onClick }: { label: string; command: string; tier: string; onClick: () => void }) {
  const tierColors: Record<string, string> = {
    readonly: 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/5',
    safe: 'border-[#00d4ff]/20 text-[#00d4ff] hover:bg-[#00d4ff]/5',
    elevated: 'border-amber-500/20 text-amber-400 hover:bg-amber-500/5',
    destructive: 'border-red-500/20 text-red-400 hover:bg-red-500/5',
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded border text-[11px] font-mono transition-colors ${tierColors[tier] || tierColors.safe}`}
    >
      <span>{label}</span>
      <span className="text-[9px] opacity-50">{command}</span>
    </button>
  );
}
