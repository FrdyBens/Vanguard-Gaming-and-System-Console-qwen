import { Folder, Terminal, Info, Wrench, Play, Cpu, HardDrive, Activity, Clock } from 'lucide-react';
import type { CommandDefinition } from '../data/commands';
import type { BlockDevice, SystemService } from '../data/simulator';

interface LeftPanelProps {
  activeView: string;
  navItems: { id: string; label: string; icon: string }[];
  onViewChange: (view: 'filesystem' | 'command' | 'context' | 'troubleshoot' | 'execution') => void;
  systemInfo: Record<string, unknown>;
  blockDevices: BlockDevice[];
  services: SystemService[];
  commands: CommandDefinition[];
  onCommandSelect: (cmd: CommandDefinition) => void;
  executionHistory: { id: string; command: string; target: string; timestamp: string; exitCode: number; outcome: string }[];
}

const iconMap: Record<string, React.ReactNode> = {
  folder: <Folder size={14} />,
  terminal: <Terminal size={14} />,
  info: <Info size={14} />,
  wrench: <Wrench size={14} />,
  play: <Play size={14} />,
};

export function LeftPanel({ activeView, navItems, onViewChange, systemInfo, blockDevices, services, commands, onCommandSelect, executionHistory }: LeftPanelProps) {
  const activeServices = services.filter(s => s.status === 'active').length;

  return (
    <div className="w-[280px] flex flex-col overflow-hidden bg-[#0a0e18] border-r border-white/[0.08] shrink-0">
      {/* Navigation */}
      <div className="p-3 border-b border-white/[0.08]">
        <div className="flex flex-col gap-0.5">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as 'filesystem' | 'command' | 'context' | 'troubleshoot' | 'execution')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded text-[12px] font-medium transition-all ${
                activeView === item.id
                  ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              {iconMap[item.icon]}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* System Telemetry */}
      <div className="p-3 border-b border-white/[0.08]">
        <div className="panel-header px-0 pb-2 mb-2 flex items-center gap-1.5">
          <Cpu size={10} className="text-[#00d4ff]" />
          <span>System Snapshot</span>
        </div>
        <div className="space-y-1.5">
          <TelemetryRow label="Kernel" value={systemInfo.kernel as string} mono />
          <TelemetryRow label="CPU" value={systemInfo.cpu as string} />
          <TelemetryRow label="Temp" value={systemInfo.cpuTemp as string} mono />
          <TelemetryRow label="GPU" value={systemInfo.gpu as string} />
          <TelemetryRow label="VRAM Driver" value={systemInfo.gpuDriver as string} mono />
          <TelemetryRow label="Vulkan" value={systemInfo.vulkanVersion as string} mono />
          <TelemetryRow label="Desktop" value={systemInfo.desktop as string} />
        </div>
      </div>

      {/* Block Devices */}
      <div className="p-3 border-b border-white/[0.08] overflow-y-auto max-h-[140px]">
        <div className="panel-header px-0 pb-2 mb-2 flex items-center gap-1.5">
          <HardDrive size={10} className="text-[#00d4ff]" />
          <span>Block Devices</span>
        </div>
        <div className="space-y-1">
          {blockDevices.filter(d => d.type === 'disk').map(device => (
            <div key={device.name} className="flex items-center justify-between text-[11px]">
              <span className="font-mono text-white/60">{device.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-white/30 tabular">{device.size}</span>
                <span className="text-[9px] text-white/20">{device.model}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Commands */}
      <div className="p-3 border-b border-white/[0.08] overflow-y-auto max-h-[180px]">
        <div className="panel-header px-0 pb-2 mb-2 flex items-center gap-1.5">
          <Terminal size={10} className="text-[#00d4ff]" />
          <span>Command Catalog</span>
        </div>
        <div className="space-y-0.5">
          {commands.map(cmd => (
            <button
              key={cmd.id}
              onClick={() => onCommandSelect(cmd)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded text-[11px] hover:bg-white/[0.04] transition-colors group"
            >
              <span className="font-mono text-white/50 group-hover:text-[#00d4ff] transition-colors">{cmd.executable}</span>
              <RiskDot tier={cmd.riskTier} />
            </button>
          ))}
        </div>
      </div>

      {/* Services & History */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="panel-header px-0 pb-2 mb-2 flex items-center gap-1.5">
          <Activity size={10} className="text-[#00d4ff]" />
          <span>Services · {activeServices}/{services.length} active</span>
        </div>
        <div className="space-y-1 mb-4">
          {services.slice(0, 5).map(svc => (
            <div key={svc.name} className="flex items-center gap-2 text-[11px]">
              <div className={`w-1.5 h-1.5 rounded-full ${
                svc.status === 'active' ? 'bg-emerald-400' : svc.status === 'failed' ? 'bg-red-400' : 'bg-white/20'
              }`} />
              <span className="font-mono text-white/50 truncate">{svc.name.replace('.service', '')}</span>
            </div>
          ))}
        </div>

        <div className="panel-header px-0 pb-2 mb-2 flex items-center gap-1.5">
          <Clock size={10} className="text-[#00d4ff]" />
          <span>Recent Executions</span>
        </div>
        <div className="space-y-1.5">
          {executionHistory.slice(0, 4).map(exec => (
            <div key={exec.id} className="flex items-start gap-2 text-[10px]">
              <div className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${
                exec.outcome === 'success' ? 'bg-emerald-400' : 'bg-red-400'
              }`} />
              <div className="min-w-0">
                <div className="font-mono text-white/40 truncate">{exec.command.substring(0, 40)}...</div>
                <div className="text-white/20 tabular">{exec.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TelemetryRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-white/30">{label}</span>
      <span className={`text-white/60 truncate ml-2 max-w-[160px] ${mono ? 'font-mono text-[10px]' : ''}`}>{value}</span>
    </div>
  );
}

function RiskDot({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    readonly: 'bg-emerald-400',
    safe: 'bg-[#00d4ff]',
    elevated: 'bg-amber-400',
    destructive: 'bg-red-400',
  };
  return <div className={`w-1.5 h-1.5 rounded-full ${colors[tier] || 'bg-white/20'}`} />;
}
