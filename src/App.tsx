import { useState, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { LeftPanel } from './components/LeftPanel';
import { DualPane } from './components/DualPane';
import { ContextCard } from './components/ContextCard';
import { CommandBuilder } from './components/CommandBuilder';
import { ExecutionGateway } from './components/ExecutionGateway';
import { TroubleshootingPanel } from './components/TroubleshootingPanel';
import { systemInfo, blockDevices, winePrefixes, steamGames, protonRuntimes, systemServices, executionHistory, filesystemTree } from './data/simulator';
import { commands, troubleshootingDB } from './data/commands';
import type { CommandDefinition } from './data/commands';
import type { FileSystemEntry } from './data/simulator';

type ActiveView = 'filesystem' | 'command' | 'context' | 'troubleshoot' | 'execution';

interface SelectedObject {
  type: string;
  name: string;
  path: string;
  data: Record<string, unknown>;
}

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('filesystem');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(null);
  const [selectedCommand, setSelectedCommand] = useState<CommandDefinition | null>(null);
  const [leftPath, setLeftPath] = useState('/home/vanguard');
  const [rightPath, setRightPath] = useState('/mnt/games');
  const [executionMode, setExecutionMode] = useState<'simulator' | 'daemon'>('simulator');
  const [commandOutput, setCommandOutput] = useState<string | null>(null);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.startsWith('/')) {
      setActiveView('filesystem');
    } else if (query.toLowerCase().includes('wine') || query.toLowerCase().includes('proton') || query.toLowerCase().includes('game')) {
      setActiveView('context');
    }
  }, []);

  const handleFileSelect = useCallback((entry: FileSystemEntry, panel: 'left' | 'right') => {
    const basePath = panel === 'left' ? leftPath : rightPath;
    const fullPath = `${basePath}/${entry.name}`;
    setSelectedObject({
      type: entry.type,
      name: entry.name,
      path: fullPath,
      data: entry as unknown as Record<string, unknown>,
    });
    if (entry.type === 'exe' || entry.name.endsWith('.exe')) {
      setActiveView('context');
    }
  }, [leftPath, rightPath]);

  const handleCommandSelect = useCallback((cmd: CommandDefinition) => {
    setSelectedCommand(cmd);
    setActiveView('command');
  }, []);

  const handleExecute = useCallback((cmd: string) => {
    setCommandOutput(`[${new Date().toLocaleTimeString()}] Executing: ${cmd}\n\n> Simulated execution in ${executionMode} mode\n> Exit code: 0\n> Command completed successfully.`);
    setActiveView('execution');
  }, [executionMode]);

  const navItems = [
    { id: 'filesystem', label: 'Filesystem', icon: 'folder' },
    { id: 'command', label: 'Commands', icon: 'terminal' },
    { id: 'context', label: 'Context', icon: 'info' },
    { id: 'troubleshoot', label: 'Troubleshoot', icon: 'wrench' },
    { id: 'execution', label: 'Execution', icon: 'play' },
  ];

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#070a11]">
      {/* Scan line effect */}
      <div className="scan-line" />
      
      {/* Top Bar */}
      <TopBar
        searchQuery={searchQuery}
        onSearch={handleSearch}
        executionMode={executionMode}
        onModeSwitch={() => setExecutionMode(executionMode === 'simulator' ? 'daemon' : 'simulator')}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Navigation & Telemetry */}
        <LeftPanel
          activeView={activeView}
          navItems={navItems}
          onViewChange={setActiveView}
          systemInfo={systemInfo}
          blockDevices={blockDevices}
          services={systemServices}
          commands={commands}
          onCommandSelect={handleCommandSelect}
          executionHistory={executionHistory}
        />

        {/* Right Panel - Main Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden border-l border-white/[0.08]">
          {activeView === 'filesystem' && (
            <DualPane
              leftPath={leftPath}
              rightPath={rightPath}
              leftEntries={filesystemTree[leftPath] || []}
              rightEntries={filesystemTree[rightPath] || []}
              onPathChange={(panel: 'left' | 'right', path: string) => panel === 'left' ? setLeftPath(path) : setRightPath(path)}
              onFileSelect={handleFileSelect}
              availablePaths={Object.keys(filesystemTree)}
            />
          )}

          {activeView === 'command' && (
            <CommandBuilder
              commands={commands}
              selectedCommand={selectedCommand}
              onSelectCommand={setSelectedCommand}
              onExecute={handleExecute}
              systemInfo={systemInfo}
              blockDevices={blockDevices}
            />
          )}

          {activeView === 'context' && (
            <ContextCard
              selectedObject={selectedObject}
              winePrefixes={winePrefixes}
              steamGames={steamGames}
              protonRuntimes={protonRuntimes}
              executionHistory={executionHistory}
              onSelectCommand={handleCommandSelect}
            />
          )}

          {activeView === 'troubleshoot' && (
            <TroubleshootingPanel
              entries={troubleshootingDB}
              onApplySolution={(cmd: string) => handleExecute(cmd)}
            />
          )}

          {activeView === 'execution' && (
            <ExecutionGateway
              output={commandOutput}
              history={executionHistory}
              onClear={() => setCommandOutput(null)}
            />
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-7 bg-[#0a0e18] border-t border-white/[0.08] flex items-center px-4 gap-6 text-[10px] font-mono text-white/40">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
          {executionMode === 'simulator' ? 'SIMULATOR' : 'DAEMON'} MODE
        </span>
        <span>Kernel: {systemInfo.kernel}</span>
        <span>Uptime: {systemInfo.uptime}</span>
        <span>RAM: {systemInfo.ramUsed} / {systemInfo.ram}</span>
        <span className="ml-auto">Vanguard v0.1.0 · CachyOS Command Intelligence</span>
      </div>
    </div>
  );
}
