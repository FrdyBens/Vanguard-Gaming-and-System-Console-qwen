// CachyOS Virtual Environment Simulator
// Authentic representation of block devices, Btrfs subvolumes, Wine prefixes, Steam apps

export interface BlockDevice {
  name: string;
  size: string;
  type: 'disk' | 'part' | 'crypt';
  fstype: string | null;
  mountpoint: string | null;
  label: string | null;
  uuid: string;
  model?: string;
}

export interface BtrfsSubvolume {
  path: string;
  id: number;
  parent: number;
  snapshot: boolean;
}

export interface WinePrefix {
  path: string;
  name: string;
  arch: 'win64' | 'win32';
  wineVersion: string;
  games: string[];
  lastUsed: string;
  size: string;
}

export interface SteamGame {
  appId: string;
  name: string;
  installPath: string;
  size: string;
  protonVersion: string;
  launchOptions: string;
  lastPlayed: string;
  status: 'installed' | 'updating' | 'needs_update';
}

export interface ProtonRuntime {
  name: string;
  version: string;
  path: string;
  type: 'official' | 'ge-custom';
  dxvk: string;
  vkd3d: string;
}

export interface SystemService {
  name: string;
  status: 'active' | 'inactive' | 'failed';
  enabled: boolean;
  description: string;
  pid?: number;
  memory?: string;
}

export interface FileSystemEntry {
  name: string;
  type: 'directory' | 'file' | 'symlink' | 'exe';
  size?: string;
  modified?: string;
  permissions: string;
  owner: string;
  children?: FileSystemEntry[];
  exeInfo?: {
    arch: string;
    peType: string;
    detectedBy: string;
  };
}

export const systemInfo = {
  hostname: 'vanguard-cachy',
  kernel: '6.12.9-2-cachyos-bore',
  kernelType: 'BORE (Burst-Oriented Response Enhancer)',
  arch: 'x86_64',
  uptime: '3d 14h 22m',
  cpu: 'AMD Ryzen 9 7950X3D (16C/32T)',
  cpuTemp: '52°C',
  gpu: 'NVIDIA GeForce RTX 4080 Super',
  gpuDriver: '570.86.16 (proprietary)',
  vulkanVersion: '1.3.290',
  ram: '32 GB DDR5-6000',
  ramUsed: '14.2 GB',
  swap: '8 GB zstd-compressed zram',
  desktop: 'KDE Plasma 6.2.5',
  wayland: true,
  pacmanMirror: 'https://mirror.cachyos.org',
  lastUpdate: '2025-01-14 03:22 UTC',
};

export const blockDevices: BlockDevice[] = [
  { name: 'nvme0n1', size: '2TB', type: 'disk', fstype: null, mountpoint: null, label: null, uuid: 'nvme-Samsung_990_PRO_2TB', model: 'Samsung 990 PRO 2TB' },
  { name: 'nvme0n1p1', size: '512M', type: 'part', fstype: 'vfat', mountpoint: '/boot/efi', label: 'EFI', uuid: 'A1B2-C3D4' },
  { name: 'nvme0n1p2', size: '1.8T', type: 'part', fstype: 'btrfs', mountpoint: '/', label: 'cachyos-root', uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
  { name: 'nvme1n1', size: '4TB', type: 'disk', fstype: null, mountpoint: null, label: null, uuid: 'nvme-WD_SN850X_4TB', model: 'WD Black SN850X 4TB' },
  { name: 'nvme1n1p1', size: '4TB', type: 'part', fstype: 'btrfs', mountpoint: '/mnt/games', label: 'games-vault', uuid: 'b58dd21c-69dd-4483-b678-1f03c4d5e6f7' },
  { name: 'sda', size: '8TB', type: 'disk', fstype: null, mountpoint: null, label: null, uuid: 'ata-Seagate_IronWolf_8TB', model: 'Seagate IronWolf 8TB' },
  { name: 'sda1', size: '8TB', type: 'part', fstype: 'ext4', mountpoint: '/mnt/archive', label: 'archive', uuid: 'c69ee32d-7aee-5594-c789-2g14d5e6f7g8' },
];

export const btrfsSubvolumes: BtrfsSubvolume[] = [
  { path: '@', id: 5, parent: 5, snapshot: false },
  { path: '@/home', id: 256, parent: 5, snapshot: false },
  { path: '@/var/log', id: 257, parent: 5, snapshot: false },
  { path: '@/var/cache/pacman', id: 258, parent: 5, snapshot: false },
  { path: '@/snapshots/root-2025-01-13', id: 301, parent: 5, snapshot: true },
  { path: '@/snapshots/root-2025-01-07', id: 299, parent: 5, snapshot: true },
  { path: '@/games', id: 260, parent: 5, snapshot: false },
];

export const winePrefixes: WinePrefix[] = [
  { path: '/home/vanguard/.wine', name: 'default', arch: 'win64', wineVersion: 'wine-ge-8-26', games: ['GTA V.exe', 'RDR2.exe'], lastUsed: '2025-01-13', size: '12.4 GB' },
  { path: '/home/vanguard/.local/share/bottles/cyberpunk', name: 'cyberpunk', arch: 'win64', wineVersion: 'proton-ge-9-1', games: ['Cyberpunk2077.exe'], lastUsed: '2025-01-12', size: '89.2 GB' },
  { path: '/home/vanguard/.local/share/bottles/elden-ring', name: 'elden-ring', arch: 'win64', wineVersion: 'proton-ge-9-1', games: ['eldenring.exe'], lastUsed: '2025-01-10', size: '48.7 GB' },
  { path: '/home/vanguard/.steam/steam/steamapps/compatdata/1091500', name: 'steam-1091500', arch: 'win64', wineVersion: 'proton-9.0-3', games: ['Cyberpunk2077.exe'], lastUsed: '2025-01-14', size: '92.1 GB' },
];

export const steamGames: SteamGame[] = [
  { appId: '1091500', name: 'Cyberpunk 2077', installPath: '/mnt/games/steam/steamapps/common/Cyberpunk 2077', size: '89.4 GB', protonVersion: 'Proton-GE 9-1', launchOptions: 'PROTON_ENABLE_NVAPI=1 DLSS_ENABLE=1 %command%', lastPlayed: '2025-01-14', status: 'installed' },
  { appId: '1245620', name: 'Elden Ring', installPath: '/mnt/games/steam/steamapps/common/ELDEN RING', size: '49.2 GB', protonVersion: 'Proton-GE 9-1', launchOptions: 'gamemoderun mangohud %command%', lastPlayed: '2025-01-10', status: 'installed' },
  { appId: '292030', name: 'The Witcher 3', installPath: '/mnt/games/steam/steamapps/common/The Witcher 3', size: '50.1 GB', protonVersion: 'Proton 9.0-3', launchOptions: 'PROTON_ENABLE_NVAPI=1 %command%', lastPlayed: '2025-01-08', status: 'installed' },
  { appId: '413150', name: 'Stardew Valley', installPath: '/mnt/games/steam/steamapps/common/Stardew Valley', size: '534 MB', protonVersion: 'Native', launchOptions: '', lastPlayed: '2025-01-06', status: 'installed' },
  { appId: '1174180', name: 'Red Dead Redemption 2', installPath: '/mnt/games/steam/steamapps/common/Red Dead Redemption 2', size: '116.8 GB', protonVersion: 'Proton-GE 9-1', launchOptions: 'PROTON_ENABLE_NVAPI=1 vkd3d.features=all %command%', lastPlayed: '2025-01-05', status: 'installed' },
  { appId: '236390', name: 'Warframe', installPath: '/mnt/games/steam/steamapps/common/Warframe', size: '62.3 GB', protonVersion: 'Proton 9.0-3', launchOptions: 'gamemoderun %command%', lastPlayed: '2025-01-13', status: 'needs_update' },
];

export const protonRuntimes: ProtonRuntime[] = [
  { name: 'Proton', version: '9.0-3', path: '/usr/share/steam/compatibilitytools.d/proton-9.0-3', type: 'official', dxvk: '2.4', vkd3d: '2.12' },
  { name: 'Proton-GE', version: 'GE-9-1', path: '/home/vanguard/.local/share/Steam/compatibilitytools.d/GE-Proton9-1', type: 'ge-custom', dxvk: '2.4', vkd3d: '2.12' },
  { name: 'Proton-GE', version: 'GE-8-26', path: '/home/vanguard/.local/share/Steam/compatibilitytools.d/GE-Proton8-26', type: 'ge-custom', dxvk: '2.3.1', vkd3d: '2.11' },
  { name: 'Wine-GE', version: '8-26', path: '/home/vanguard/.local/share/lutris/runners/wine/wine-ge-8-26-x86_64', type: 'ge-custom', dxvk: '2.3.1', vkd3d: '2.11' },
];

export const systemServices: SystemService[] = [
  { name: 'NetworkManager.service', status: 'active', enabled: true, description: 'Network Manager', pid: 892, memory: '28.4 MB' },
  { name: 'bluetooth.service', status: 'active', enabled: true, description: 'Bluetooth service', pid: 901, memory: '6.2 MB' },
  { name: 'docker.service', status: 'active', enabled: true, description: 'Docker Application Container Engine', pid: 1024, memory: '142.8 MB' },
  { name: 'sshd.service', status: 'active', enabled: true, description: 'OpenSSH server daemon', pid: 847, memory: '4.1 MB' },
  { name: 'libvirtd.service', status: 'inactive', enabled: false, description: 'Virtualization management daemon' },
  { name: 'gamemode.service', status: 'active', enabled: true, description: 'Feral GameMode daemon', pid: 1102, memory: '2.8 MB' },
  { name: 'pipewire.service', status: 'active', enabled: true, description: 'PipeWire multimedia system', pid: 1205, memory: '18.6 MB' },
  { name: 'fstrim.timer', status: 'active', enabled: true, description: 'Discard unused filesystem blocks weekly' },
];

export const filesystemTree: Record<string, FileSystemEntry[]> = {
  '/home/vanguard': [
    { name: '.steam', type: 'directory', permissions: 'drwxr-xr-x', owner: 'vanguard', modified: '2025-01-14' },
    { name: '.local', type: 'directory', permissions: 'drwxr-xr-x', owner: 'vanguard', modified: '2025-01-14' },
    { name: '.wine', type: 'directory', permissions: 'drwxr-xr-x', owner: 'vanguard', modified: '2025-01-13' },
    { name: 'Documents', type: 'directory', permissions: 'drwxr-xr-x', owner: 'vanguard', modified: '2025-01-14' },
    { name: 'Downloads', type: 'directory', permissions: 'drwxr-xr-x', owner: 'vanguard', modified: '2025-01-14' },
    { name: 'Games', type: 'directory', permissions: 'drwxr-xr-x', owner: 'vanguard', modified: '2025-01-12' },
    { name: '.bashrc', type: 'file', size: '2.4 KB', permissions: '-rw-r--r--', owner: 'vanguard', modified: '2025-01-10' },
    { name: '.zshrc', type: 'file', size: '3.1 KB', permissions: '-rw-r--r--', owner: 'vanguard', modified: '2025-01-11' },
  ],
  '/mnt/games': [
    { name: 'steam', type: 'directory', permissions: 'drwxr-xr-x', owner: 'vanguard', modified: '2025-01-14' },
    { name: 'lutris', type: 'directory', permissions: 'drwxr-xr-x', owner: 'vanguard', modified: '2025-01-12' },
    { name: 'heroic', type: 'directory', permissions: 'drwxr-xr-x', owner: 'vanguard', modified: '2025-01-10' },
    { name: 'emulators', type: 'directory', permissions: 'drwxr-xr-x', owner: 'vanguard', modified: '2025-01-08' },
  ],
  '/mnt/archive': [
    { name: 'backups', type: 'directory', permissions: 'drwxr-xr-x', owner: 'vanguard', modified: '2025-01-13' },
    { name: 'media', type: 'directory', permissions: 'drwxr-xr-x', owner: 'vanguard', modified: '2025-01-11' },
    { name: 'isos', type: 'directory', permissions: 'drwxr-xr-x', owner: 'vanguard', modified: '2025-01-05' },
    { name: 'old-prefixes', type: 'directory', permissions: 'drwxr-xr-x', owner: 'vanguard', modified: '2024-12-20' },
  ],
  '/dev': [
    { name: 'nvme0n1', type: 'file', permissions: 'brw-rw----', owner: 'root:disk', modified: '2025-01-11' },
    { name: 'nvme0n1p1', type: 'file', permissions: 'brw-rw----', owner: 'root:disk', modified: '2025-01-11' },
    { name: 'nvme0n1p2', type: 'file', permissions: 'brw-rw----', owner: 'root:disk', modified: '2025-01-11' },
    { name: 'nvme1n1', type: 'file', permissions: 'brw-rw----', owner: 'root:disk', modified: '2025-01-11' },
    { name: 'nvme1n1p1', type: 'file', permissions: 'brw-rw----', owner: 'root:disk', modified: '2025-01-11' },
    { name: 'sda', type: 'file', permissions: 'brw-rw----', owner: 'root:disk', modified: '2025-01-11' },
    { name: 'sda1', type: 'file', permissions: 'brw-rw----', owner: 'root:disk', modified: '2025-01-11' },
  ],
  '/mnt/games/steam/steamapps/compatdata/1091500': [
    { name: 'pfx', type: 'directory', permissions: 'drwxr-xr-x', owner: 'vanguard', modified: '2025-01-14' },
    { name: 'proton', type: 'directory', permissions: 'drwxr-xr-x', owner: 'vanguard', modified: '2025-01-14' },
  ],
  '/home/vanguard/.local/share/Steam/compatibilitytools.d': [
    { name: 'GE-Proton9-1', type: 'directory', permissions: 'drwxr-xr-x', owner: 'vanguard', modified: '2025-01-08' },
    { name: 'GE-Proton8-26', type: 'directory', permissions: 'drwxr-xr-x', owner: 'vanguard', modified: '2024-12-15' },
  ],
};

export const executionHistory = [
  {
    id: 'exec-001',
    command: 'gamemoderun mangohud %command%',
    target: 'Cyberpunk 2077',
    targetId: '1091500',
    timestamp: '2025-01-14 18:42',
    exitCode: 0,
    outcome: 'success' as const,
    duration: '4h 12m',
    notes: 'Stable, no crashes. DLSS Quality mode active.',
  },
  {
    id: 'exec-002',
    command: 'WINEPREFIX=/home/vanguard/.local/share/bottles/cyberpunk wine Cyberpunk2077.exe',
    target: 'Cyberpunk2077.exe',
    targetId: 'wine-cyberpunk',
    timestamp: '2025-01-12 21:15',
    exitCode: 1,
    outcome: 'fatal_error' as const,
    duration: '2m 34s',
    notes: 'DX12 init failure. Switched to Proton-GE for better VKD3D support.',
  },
  {
    id: 'exec-003',
    command: 'sudo mount -o noatime,compress=zstd:1 /dev/nvme1n1p1 /mnt/games',
    target: '/dev/nvme1n1p1',
    targetId: 'nvme1n1p1',
    timestamp: '2025-01-11 09:00',
    exitCode: 0,
    outcome: 'success' as const,
    duration: '0.4s',
    notes: 'Mounted with optimal Btrfs compression settings.',
  },
  {
    id: 'exec-004',
    command: 'paru -Syu',
    target: 'system',
    targetId: 'pacman',
    timestamp: '2025-01-14 03:22',
    exitCode: 0,
    outcome: 'success' as const,
    duration: '8m 45s',
    notes: 'Full system update. 47 packages upgraded. Kernel 6.12.9-2 installed.',
  },
  {
    id: 'exec-005',
    command: 'gamescope -W 3840 -H 2160 -r 144 --fullscreen --',
    target: 'gamescope-session',
    targetId: 'gamescope',
    timestamp: '2025-01-13 20:00',
    exitCode: 0,
    outcome: 'success' as const,
    duration: '1h 45m',
    notes: 'Running Elden Ring at 4K with FSR Quality. Stable 60fps.',
  },
];
