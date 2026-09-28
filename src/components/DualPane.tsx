import { useState } from 'react';
import { Folder, File, ArrowRight, Copy, Link2, Archive, ChevronRight, Home, HardDrive } from 'lucide-react';
import type { FileSystemEntry } from '../data/simulator';

interface DualPaneProps {
  leftPath: string;
  rightPath: string;
  leftEntries: FileSystemEntry[];
  rightEntries: FileSystemEntry[];
  onPathChange: (panel: 'left' | 'right', path: string) => void;
  onFileSelect: (entry: FileSystemEntry, panel: 'left' | 'right') => void;
  availablePaths: string[];
}

export function DualPane({ leftPath, rightPath, leftEntries, rightEntries, onPathChange, onFileSelect, availablePaths }: DualPaneProps) {
  const [leftSelected, setLeftSelected] = useState<string | null>(null);
  const [rightSelected, setRightSelected] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'left' | 'right'>('left');

  const handleNavigate = (entry: FileSystemEntry, panel: 'left' | 'right') => {
    if (entry.type === 'directory') {
      const basePath = panel === 'left' ? leftPath : rightPath;
      const newPath = `${basePath}/${entry.name}`;
      onPathChange(panel, newPath);
    }
    onFileSelect(entry, panel);
  };

  const handleSelect = (name: string, panel: 'left' | 'right') => {
    setActivePanel(panel);
    if (panel === 'left') setLeftSelected(name === leftSelected ? null : name);
    else setRightSelected(name === rightSelected ? null : name);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="h-10 border-b border-white/[0.08] flex items-center px-4 gap-3 bg-[#0a0e18]">
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Dual-Pane Filesystem</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <button className="px-2 py-1 text-[10px] font-mono text-white/40 hover:text-white/60 hover:bg-white/[0.04] rounded transition-colors flex items-center gap-1">
            <Copy size={10} /> Copy
          </button>
          <button className="px-2 py-1 text-[10px] font-mono text-white/40 hover:text-white/60 hover:bg-white/[0.04] rounded transition-colors flex items-center gap-1">
            <Link2 size={10} /> Symlink
          </button>
          <button className="px-2 py-1 text-[10px] font-mono text-white/40 hover:text-white/60 hover:bg-white/[0.04] rounded transition-colors flex items-center gap-1">
            <Archive size={10} /> Archive
          </button>
        </div>
      </div>

      {/* Panes */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane */}
        <FilePane
          panel="left"
          path={leftPath}
          entries={leftEntries}
          selected={leftSelected}
          isActive={activePanel === 'left'}
          onSelect={handleSelect}
          onNavigate={handleNavigate}
          onPathChange={onPathChange}
          availablePaths={availablePaths}
        />

        {/* Divider with transfer indicator */}
        <div className="w-8 flex flex-col items-center justify-center bg-[#070a11] border-x border-white/[0.05]">
          <ArrowRight size={12} className="text-white/20 mb-2" />
          <div className="w-px h-8 bg-white/[0.08]" />
          <ArrowRight size={12} className="text-white/20 mt-2 rotate-180" />
        </div>

        {/* Right Pane */}
        <FilePane
          panel="right"
          path={rightPath}
          entries={rightEntries}
          selected={rightSelected}
          isActive={activePanel === 'right'}
          onSelect={handleSelect}
          onNavigate={handleNavigate}
          onPathChange={onPathChange}
          availablePaths={availablePaths}
        />
      </div>
    </div>
  );
}

interface FilePaneProps {
  panel: 'left' | 'right';
  path: string;
  entries: FileSystemEntry[];
  selected: string | null;
  isActive: boolean;
  onSelect: (name: string, panel: 'left' | 'right') => void;
  onNavigate: (entry: FileSystemEntry, panel: 'left' | 'right') => void;
  onPathChange: (panel: 'left' | 'right', path: string) => void;
  availablePaths: string[];
}

function FilePane({ panel, path, entries, selected, isActive, onSelect, onNavigate, onPathChange, availablePaths }: FilePaneProps) {
  const pathParts = path.split('/').filter(Boolean);
  const [showPathPicker, setShowPathPicker] = useState(false);

  const navigateUp = () => {
    const parts = path.split('/').filter(Boolean);
    if (parts.length > 1) {
      parts.pop();
      onPathChange(panel, '/' + parts.join('/'));
    }
  };

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${isActive ? '' : 'opacity-70'}`}>
      {/* Path bar */}
      <div className="h-8 border-b border-white/[0.06] flex items-center px-3 gap-2 bg-[#0d1322]">
        <button onClick={navigateUp} className="text-white/30 hover:text-white/60 transition-colors">
          <ChevronRight size={12} className="rotate-180" />
        </button>
        <button
          onClick={() => setShowPathPicker(!showPathPicker)}
          className="flex-1 flex items-center gap-1 text-[11px] font-mono text-white/50 hover:text-white/70 transition-colors overflow-hidden"
        >
          {pathParts.length > 0 && <Home size={10} className="shrink-0 text-[#00d4ff]/60" />}
          <span className="truncate">{path || '/'}</span>
        </button>
        {showPathPicker && (
          <div className="absolute top-10 left-4 z-50 bg-[#141d30] border border-white/[0.12] rounded shadow-xl p-1 min-w-[200px]">
            {availablePaths.map(p => (
              <button
                key={p}
                onClick={() => { onPathChange(panel, p); setShowPathPicker(false); }}
                className="w-full text-left px-2 py-1 text-[11px] font-mono text-white/50 hover:text-white/80 hover:bg-white/[0.05] rounded transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto" onClick={() => onSelect('', panel)}>
        {entries.length === 0 ? (
          <div className="p-4 text-[11px] text-white/20 font-mono">No entries found</div>
        ) : (
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-white/25 border-b border-white/[0.05]">
                <th className="text-left font-normal px-3 py-1.5 w-6"></th>
                <th className="text-left font-normal px-1 py-1.5">Name</th>
                <th className="text-right font-normal px-3 py-1.5 w-16">Size</th>
                <th className="text-left font-normal px-3 py-1.5 w-20">Modified</th>
                <th className="text-left font-normal px-3 py-1.5 w-24">Perms</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr
                  key={entry.name}
                  onClick={(e) => { e.stopPropagation(); onSelect(entry.name, panel); }}
                  onDoubleClick={() => onNavigate(entry, panel)}
                  className={`cursor-pointer transition-colors ${
                    selected === entry.name
                      ? 'bg-[#00d4ff]/10 text-[#00d4ff]'
                      : 'hover:bg-white/[0.03] text-white/60'
                  }`}
                >
                  <td className="px-3 py-1">
                    {entry.type === 'directory' ? (
                      <Folder size={12} className="text-amber-400/70" />
                    ) : entry.type === 'exe' ? (
                      <div className="w-3 h-3 rounded-sm bg-[#00d4ff]/30 flex items-center justify-center">
                        <span className="text-[7px] font-bold text-[#00d4ff]">E</span>
                      </div>
                    ) : (
                      <File size={12} className="text-white/30" />
                    )}
                  </td>
                  <td className="px-1 py-1 font-mono truncate max-w-[200px]">{entry.name}</td>
                  <td className="px-3 py-1 text-right font-mono text-white/30 tabular">{entry.size || '—'}</td>
                  <td className="px-3 py-1 font-mono text-white/25 tabular">{entry.modified}</td>
                  <td className="px-3 py-1 font-mono text-white/20 text-[10px]">{entry.permissions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Status */}
      <div className="h-6 border-t border-white/[0.06] flex items-center px-3 bg-[#0a0e18]">
        <span className="text-[9px] font-mono text-white/20">
          {entries.length} items · {entries.filter(e => e.type === 'directory').length} dirs · {entries.filter(e => e.type === 'file' || e.type === 'exe').length} files
        </span>
      </div>
    </div>
  );
}
