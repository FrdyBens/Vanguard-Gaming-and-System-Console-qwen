// Command Definition Catalog - JSON-first schema for dynamic command generation

export type RiskTier = 'readonly' | 'safe' | 'elevated' | 'destructive';
export type PrivilegeLevel = 'none' | 'sudo' | 'pkexec';

export interface CommandFlag {
  flag: string;
  description: string;
  type: 'boolean' | 'string' | 'path' | 'device' | 'enum';
  required?: boolean;
  default?: string;
  options?: string[];
  dynamic?: boolean; // auto-detected from system
}

export interface CommandDefinition {
  id: string;
  executable: string;
  category: 'storage' | 'system' | 'packages' | 'gaming' | 'network' | 'filesystem';
  description: string;
  riskTier: RiskTier;
  privilege: PrivilegeLevel;
  flags: CommandFlag[];
  positionalArgs?: { name: string; description: string; type: string; required: boolean }[];
  cachyNotes?: string;
  troubleshooting?: string[];
  example?: string;
}

export const commands: CommandDefinition[] = [
  // Storage & Filesystem
  {
    id: 'mount',
    executable: 'mount',
    category: 'storage',
    description: 'Mount a filesystem',
    riskTier: 'elevated',
    privilege: 'sudo',
    flags: [
      { flag: '-t', description: 'Filesystem type', type: 'enum', options: ['btrfs', 'ext4', 'xfs', 'vfat', 'ntfs3'] },
      { flag: '-o', description: 'Mount options', type: 'string', default: 'noatime,compress=zstd:1' },
      { flag: '--bind', description: 'Bind mount', type: 'boolean' },
    ],
    positionalArgs: [
      { name: 'device', description: 'Block device or UUID', type: 'device', required: true },
      { name: 'mountpoint', description: 'Target mount directory', type: 'path', required: true },
    ],
    cachyNotes: 'CachyOS recommends noatime,compress=zstd:1 for Btrfs mounts. Use discard=async for NVMe TRIM.',
    troubleshooting: ['wrong fs type, bad option, bad superblock', 'mount point does not exist', 'already mounted or busy'],
    example: 'sudo mount -o noatime,compress=zstd:1 /dev/nvme1n1p1 /mnt/games',
  },
  {
    id: 'umount',
    executable: 'umount',
    category: 'storage',
    description: 'Unmount a filesystem',
    riskTier: 'safe',
    privilege: 'sudo',
    flags: [
      { flag: '-l', description: 'Lazy unmount', type: 'boolean' },
      { flag: '-f', description: 'Force unmount', type: 'boolean' },
    ],
    positionalArgs: [
      { name: 'target', description: 'Mount point or device', type: 'path', required: true },
    ],
    cachyNotes: 'Use -l (lazy) if device is busy. Check with lsof +f -- before force unmount.',
    example: 'sudo umount /mnt/games',
  },
  {
    id: 'lsblk',
    executable: 'lsblk',
    category: 'storage',
    description: 'List block devices',
    riskTier: 'readonly',
    privilege: 'none',
    flags: [
      { flag: '-f', description: 'Show filesystem info', type: 'boolean' },
      { flag: '-o', description: 'Output columns', type: 'string', default: 'NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT,LABEL,UUID' },
      { flag: '-p', description: 'Show full paths', type: 'boolean' },
    ],
    cachyNotes: 'Use -f to see UUIDs and filesystem types. Essential for identifying Btrfs subvolumes.',
    example: 'lsblk -f',
  },
  {
    id: 'btrfs-subvolume',
    executable: 'btrfs subvolume',
    category: 'storage',
    description: 'Manage Btrfs subvolumes',
    riskTier: 'safe',
    privilege: 'sudo',
    flags: [
      { flag: 'list', description: 'List subvolumes', type: 'boolean' },
      { flag: 'create', description: 'Create subvolume', type: 'boolean' },
      { flag: 'delete', description: 'Delete subvolume', type: 'boolean' },
      { flag: 'snapshot', description: 'Create snapshot', type: 'boolean' },
    ],
    positionalArgs: [
      { name: 'path', description: 'Subvolume path', type: 'path', required: false },
    ],
    cachyNotes: 'CachyOS uses snapper for automated Btrfs snapshots. Check /etc/snapper/configs/root.conf.',
    example: 'sudo btrfs subvolume list /',
  },
  // System
  {
    id: 'systemctl',
    executable: 'systemctl',
    category: 'system',
    description: 'Control systemd services',
    riskTier: 'elevated',
    privilege: 'sudo',
    flags: [
      { flag: 'status', description: 'Show service status', type: 'boolean' },
      { flag: 'start', description: 'Start service', type: 'boolean' },
      { flag: 'stop', description: 'Stop service', type: 'boolean' },
      { flag: 'restart', description: 'Restart service', type: 'boolean' },
      { flag: 'enable', description: 'Enable at boot', type: 'boolean' },
      { flag: 'disable', description: 'Disable at boot', type: 'boolean' },
    ],
    positionalArgs: [
      { name: 'unit', description: 'Service unit name', type: 'string', required: true },
    ],
    cachyNotes: 'Use --user flag for user-level services. Check journalctl -u <service> for logs.',
    example: 'sudo systemctl status docker.service',
  },
  {
    id: 'journalctl',
    executable: 'journalctl',
    category: 'system',
    description: 'Query systemd journal logs',
    riskTier: 'readonly',
    privilege: 'none',
    flags: [
      { flag: '-u', description: 'Filter by unit', type: 'string' },
      { flag: '-b', description: 'Current boot only', type: 'boolean' },
      { flag: '-f', description: 'Follow (tail)', type: 'boolean' },
      { flag: '-n', description: 'Last N entries', type: 'string', default: '50' },
      { flag: '-p', description: 'Priority filter', type: 'enum', options: ['emerg', 'alert', 'crit', 'err', 'warning', 'notice', 'info', 'debug'] },
    ],
    example: 'journalctl -u docker.service -b -n 50',
  },
  // Packages
  {
    id: 'pacman',
    executable: 'pacman',
    category: 'packages',
    description: 'Arch Linux package manager',
    riskTier: 'safe',
    privilege: 'sudo',
    flags: [
      { flag: '-S', description: 'Sync/install packages', type: 'boolean' },
      { flag: '-Syu', description: 'Full system upgrade', type: 'boolean' },
      { flag: '-R', description: 'Remove packages', type: 'boolean' },
      { flag: '-Q', description: 'Query installed', type: 'boolean' },
      { flag: '-Ss', description: 'Search packages', type: 'boolean' },
      { flag: '--noconfirm', description: 'Skip confirmation', type: 'boolean' },
    ],
    positionalArgs: [
      { name: 'packages', description: 'Package names', type: 'string', required: false },
    ],
    cachyNotes: 'CachyOS uses optimized repos. Prefer paru for AUR packages. Always check mirror status first.',
    example: 'sudo pacman -Syu',
  },
  {
    id: 'paru',
    executable: 'paru',
    category: 'packages',
    description: 'AUR helper (pacman wrapper)',
    riskTier: 'safe',
    privilege: 'none',
    flags: [
      { flag: '-S', description: 'Install from AUR', type: 'boolean' },
      { flag: '-Syu', description: 'Full system upgrade (incl. AUR)', type: 'boolean' },
      { flag: '-Ss', description: 'Search AUR', type: 'boolean' },
      { flag: '--devel', description: 'Check -git packages', type: 'boolean' },
    ],
    positionalArgs: [
      { name: 'packages', description: 'Package names', type: 'string', required: false },
    ],
    cachyNotes: 'CachyOS ships paru by default. Use --bottomup to review build order.',
    example: 'paru -S gamescope',
  },
  // Gaming
  {
    id: 'wine',
    executable: 'wine',
    category: 'gaming',
    description: 'Run Windows executables',
    riskTier: 'safe',
    privilege: 'none',
    flags: [
      { flag: 'WINEPREFIX', description: 'Wine prefix path', type: 'path', dynamic: true },
      { flag: 'WINEARCH', description: 'Architecture', type: 'enum', options: ['win64', 'win32'] },
    ],
    positionalArgs: [
      { name: 'executable', description: 'Windows .exe path', type: 'path', required: true },
    ],
    cachyNotes: 'Use wine-ge for gaming. Set WINEPREFIX to isolate applications. Check protontricks for Steam prefixes.',
    troubleshooting: ['prefix architecture mismatch', 'wine: could not load ntdll.so', 'DX11/DX12 init failure'],
    example: 'WINEPREFIX=~/.wine/game wine game.exe',
  },
  {
    id: 'protontricks',
    executable: 'protontricks',
    category: 'gaming',
    description: 'Manage Steam Proton prefixes',
    riskTier: 'safe',
    privilege: 'none',
    flags: [
      { flag: '--gui', description: 'Open GUI', type: 'boolean' },
      { flag: '--launch', description: 'Launch app in prefix', type: 'boolean' },
      { flag: 'dll-override', description: 'Set DLL override', type: 'string' },
    ],
    positionalArgs: [
      { name: 'appid', description: 'Steam App ID', type: 'string', required: true },
    ],
    cachyNotes: 'Use for installing .NET, Visual C++ runtimes, or custom DLLs in Steam game prefixes.',
    example: 'protontricks 1091500 vcrun2019 dotnet48',
  },
  {
    id: 'gamescope',
    executable: 'gamescope',
    category: 'gaming',
    description: 'Micro-compositor for gaming',
    riskTier: 'safe',
    privilege: 'none',
    flags: [
      { flag: '-W', description: 'Output width', type: 'string', default: '3840' },
      { flag: '-H', description: 'Output height', type: 'string', default: '2160' },
      { flag: '-r', description: 'Refresh rate', type: 'string', default: '144' },
      { flag: '--fullscreen', description: 'Fullscreen mode', type: 'boolean' },
      { flag: '--fsr', description: 'AMD FSR upscaling', type: 'enum', options: ['quality', 'balanced', 'performance', 'ultra'] },
      { flag: '--filter', description: 'Scaling filter', type: 'enum', options: ['nearest', 'linear', 'fsr', 'nis'] },
    ],
    cachyNotes: 'Gamescope is pre-installed on CachyOS. Use with MangoHud for FPS overlay and frame timing.',
    example: 'gamescope -W 3840 -H 2160 -r 144 --fullscreen -- gamemoderun %command%',
  },
  {
    id: 'mangohud',
    executable: 'mangohud',
    category: 'gaming',
    description: 'Performance overlay for Vulkan/OpenGL',
    riskTier: 'readonly',
    privilege: 'none',
    flags: [
      { flag: '--config', description: 'Config file path', type: 'path' },
      { flag: '--fps-limit', description: 'FPS cap', type: 'string' },
      { flag: '--vulkaninfo', description: 'Show Vulkan info', type: 'boolean' },
    ],
    cachyNotes: 'Edit ~/.config/MangoHud/MangoHud.conf for persistent settings. Enable gpu_stats, cpu_stats, frametime.',
    example: 'mangohud glxgears',
  },
  {
    id: 'vulkaninfo',
    executable: 'vulkaninfo',
    category: 'gaming',
    description: 'Vulkan device and driver info',
    riskTier: 'readonly',
    privilege: 'none',
    flags: [
      { flag: '--summary', description: 'Summary output', type: 'boolean' },
      { flag: '--json', description: 'JSON output', type: 'boolean' },
    ],
    cachyNotes: 'Verify NVIDIA ICD is loaded. Check for VK_NVX_binary_import support for shader caching.',
    example: 'vulkaninfo --summary',
  },
];

export interface TroubleshootingEntry {
  id: string;
  title: string;
  category: string;
  symptoms: string[];
  rootCause: string;
  solution: string;
  command: string;
  riskTier: RiskTier;
}

export const troubleshootingDB: TroubleshootingEntry[] = [
  {
    id: 'ts-001',
    title: 'Btrfs mount: wrong fs type, bad option',
    category: 'storage',
    symptoms: ['mount: /mnt/games: wrong fs type, bad option, bad superblock', 'dmesg shows BTRFS error'],
    rootCause: 'Missing btrfs-progs or incorrect mount options for kernel version',
    solution: 'Ensure btrfs-progs is installed and use compatible mount options',
    command: 'sudo pacman -S btrfs-progs && sudo mount -o noatime,compress=zstd:1 /dev/nvme1n1p1 /mnt/games',
    riskTier: 'elevated',
  },
  {
    id: 'ts-002',
    title: 'Wine prefix: DX12 init failure',
    category: 'gaming',
    symptoms: ['err:vkd3d_main:create_vk_device', 'DX12 feature level not supported', 'Game crashes on launch'],
    rootCause: 'Missing or outdated VKD3D in Wine/Proton version',
    solution: 'Switch to Proton-GE which includes latest VKD3D, or install vkd3d-proton separately',
    command: 'WINEPREFIX=~/.local/share/bottles/game wine-ge game.exe',
    riskTier: 'safe',
  },
  {
    id: 'ts-003',
    title: 'Vulkan ICD driver mismatch',
    category: 'gaming',
    symptoms: ['vulkaninfo shows wrong GPU', 'Game uses integrated graphics', 'VK_ERROR_INCOMPATIBLE_DRIVER'],
    rootCause: 'Multiple Vulkan ICDs installed, wrong one selected by default',
    solution: 'Set VK_ICD_FILENAMES to NVIDIA ICD explicitly',
    command: 'VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/nvidia_icd.json mangohud game',
    riskTier: 'safe',
  },
  {
    id: 'ts-004',
    title: 'Steam shader cache corruption',
    category: 'gaming',
    symptoms: ['Stuttering in game', 'Shader compilation stalls', 'DXVK HUD shows pipeline stalls'],
    rootCause: 'Corrupted shader cache after driver update',
    solution: 'Clear shader cache for affected game',
    command: 'rm -rf ~/.cache/dxvk-shader-cache/* && rm -rf ~/.cache/nvidia/GLCache/*',
    riskTier: 'safe',
  },
  {
    id: 'ts-005',
    title: 'Pacman keyring invalid/trusted errors',
    category: 'packages',
    symptoms: ['error: required key missing from keyring', 'invalid or corrupted package (PGP signature)'],
    rootCause: 'Outdated or corrupted pacman keyring',
    solution: 'Reinitialize pacman keyring with current Arch/CachyOS keys',
    command: 'sudo rm -rf /etc/pacman.d/gnupg && sudo pacman-key --init && sudo pacman-key --populate archlinux cachyos',
    riskTier: 'elevated',
  },
];
