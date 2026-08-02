import { UserRole } from '../types';

export type AdminSubTab = 
  | 'dashboard' 
  | 'proposals'
  | 'notifications'
  | 'members' 
  | 'users' 
  | 'cms'
  | 'logs'
  | 'profile';

export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'admin_master':
      return 'Super Admin IT';
    case 'admin_bidang':
      return 'Ketua Bidang';
    case 'sekretaris':
      return 'Sekretaris DWP';
    case 'bendahara':
      return 'Bendahara DWP';
    case 'wakil_ketua':
      return 'Wakil Ketua DWP';
    case 'ketua':
      return 'Ketua DWP';
    case 'anggota':
      return 'Anggota DWP';
    default:
      return 'Pengurus DWP';
  }
};

export type CMSSection = 
  | 'identitas' 
  | 'hero' 
  | 'sambutan' 
  | 'visi_misi' 
  | 'section_headers' 
  | 'kontak_footer';

export interface DynamicPermissionMatrix {
  tabs: Record<UserRole, AdminSubTab[]>;
  cmsSections: Record<UserRole, CMSSection[]>;
  proposalActions: Record<UserRole, {
    canSubmit: boolean;
    canVerifyWaket: boolean;
    canApproveKetua: boolean;
    canReceiveSekretarisNotif: boolean;
    canReceiveRab: boolean;
  }>;
}

// Default Access Control Matrix
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, AdminSubTab[]> = {
  admin_master: ['dashboard', 'proposals', 'notifications', 'members', 'users', 'cms', 'logs', 'profile'],
  ketua: ['dashboard', 'proposals', 'notifications', 'members', 'users', 'cms', 'logs', 'profile'],
  wakil_ketua: ['dashboard', 'proposals', 'notifications', 'members', 'users', 'logs', 'profile'],
  sekretaris: ['dashboard', 'proposals', 'notifications', 'members', 'cms', 'logs', 'profile'],
  bendahara: ['dashboard', 'proposals', 'notifications', 'members', 'logs', 'profile'],
  admin_bidang: ['dashboard', 'proposals', 'notifications', 'members', 'logs', 'profile'],
  anggota: ['dashboard', 'notifications', 'members', 'profile']
};

export const DEFAULT_ROLE_CMS_SECTIONS: Record<UserRole, CMSSection[]> = {
  admin_master: ['identitas', 'hero', 'sambutan', 'visi_misi', 'section_headers', 'kontak_footer'],
  ketua: ['sambutan', 'visi_misi'],
  sekretaris: ['identitas', 'hero', 'section_headers', 'kontak_footer'],
  wakil_ketua: ['sambutan', 'visi_misi'],
  bendahara: [],
  admin_bidang: [],
  anggota: []
};

export const DEFAULT_PROPOSAL_ACTIONS: Record<UserRole, { 
  canSubmit: boolean; 
  canVerifyWaket: boolean; 
  canApproveKetua: boolean; 
  canReceiveSekretarisNotif: boolean;
  canReceiveRab: boolean;
}> = {
  admin_master: { canSubmit: true, canVerifyWaket: true, canApproveKetua: true, canReceiveSekretarisNotif: true, canReceiveRab: true },
  ketua: { canSubmit: true, canVerifyWaket: false, canApproveKetua: true, canReceiveSekretarisNotif: true, canReceiveRab: false },
  wakil_ketua: { canSubmit: true, canVerifyWaket: true, canApproveKetua: false, canReceiveSekretarisNotif: false, canReceiveRab: false },
  sekretaris: { canSubmit: true, canVerifyWaket: false, canApproveKetua: false, canReceiveSekretarisNotif: true, canReceiveRab: false },
  bendahara: { canSubmit: false, canVerifyWaket: false, canApproveKetua: false, canReceiveSekretarisNotif: false, canReceiveRab: true },
  admin_bidang: { canSubmit: true, canVerifyWaket: false, canApproveKetua: false, canReceiveSekretarisNotif: false, canReceiveRab: false },
  anggota: { canSubmit: false, canVerifyWaket: false, canApproveKetua: false, canReceiveSekretarisNotif: false, canReceiveRab: false }
};

export const DEFAULT_PERMISSION_MATRIX: DynamicPermissionMatrix = {
  tabs: DEFAULT_ROLE_PERMISSIONS,
  cmsSections: DEFAULT_ROLE_CMS_SECTIONS,
  proposalActions: DEFAULT_PROPOSAL_ACTIONS
};

const STORAGE_KEY = 'dwp_dynamic_permissions_v2';

// Load Matrix from Local Storage
export const getDynamicPermissions = (): DynamicPermissionMatrix => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const tabs = { ...DEFAULT_ROLE_PERMISSIONS, ...parsed.tabs };
      // Ensure 'notifications' and 'profile' tabs are always present for every role
      (Object.keys(tabs) as UserRole[]).forEach(r => {
        if (tabs[r]) {
          if (!tabs[r].includes('notifications')) {
            tabs[r] = [...tabs[r], 'notifications'];
          }
          if (!tabs[r].includes('profile')) {
            tabs[r] = [...tabs[r], 'profile'];
          }
        }
      });
      return {
        tabs,
        cmsSections: { ...DEFAULT_ROLE_CMS_SECTIONS, ...parsed.cmsSections },
        proposalActions: { ...DEFAULT_PROPOSAL_ACTIONS, ...parsed.proposalActions }
      };
    }
  } catch (e) {
    console.error('Failed to parse saved dynamic permissions', e);
  }
  return DEFAULT_PERMISSION_MATRIX;
};

// Save Matrix to Local Storage
export const saveDynamicPermissions = (matrix: DynamicPermissionMatrix): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matrix));
  } catch (e) {
    console.error('Failed to save dynamic permissions', e);
  }
};

// Reset Matrix to Default
export const resetDynamicPermissionsToDefault = (): DynamicPermissionMatrix => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to reset dynamic permissions', e);
  }
  return DEFAULT_PERMISSION_MATRIX;
};

export const hasTabAccess = (role: UserRole, tab: AdminSubTab): boolean => {
  if (tab === 'profile') return true; // Profile is universal for ALL roles
  if (role === 'admin_master') return true;
  const matrix = getDynamicPermissions();
  const allowedTabs = matrix.tabs[role] || ['dashboard', 'members', 'profile'];
  return allowedTabs.includes(tab);
};

export const canEditCMSSection = (role: UserRole, section: CMSSection): boolean => {
  if (role === 'admin_master') return true;
  const matrix = getDynamicPermissions();
  const allowedSections = matrix.cmsSections[role] || [];
  return allowedSections.includes(section);
};

export const canSubmitProposal = (role: UserRole): boolean => {
  if (role === 'admin_master') return true;
  const matrix = getDynamicPermissions();
  return matrix.proposalActions[role]?.canSubmit ?? false;
};

export const getRoleDescription = (role: UserRole): { label: string; icon: string; description: string } => {
  switch (role) {
    case 'admin_master':
      return { label: 'Superadmin IT', icon: '⚡', description: 'Akses penuh seluruh sistem, matriks hak akses, & pemeliharaan teknis.' };
    case 'ketua':
      return { label: 'Ketua DWP', icon: '👑', description: 'Persetujuan akhir usulan kegiatan & penyuntingan Sambutan/Visi Misi.' };
    case 'wakil_ketua':
      return { label: 'Wakil Ketua', icon: '🛡️', description: 'Verifikasi awal usulan kegiatan organisasi.' };
    case 'sekretaris':
      return { label: 'Sekretaris DWP', icon: '📜', description: 'Pengusulan kegiatan, pengarsipan agenda, & tata persuratan.' };
    case 'bendahara':
      return { label: 'Bendahara DWP', icon: '💰', description: 'Verifikasi & pencairan Rencana Anggaran Biaya (RAB).' };
    case 'admin_bidang':
      return { label: 'Ketua Bidang', icon: '🎓', description: 'Pengusulan program kerja & kegiatan bidang.' };
    default:
      return { label: 'Anggota DWP', icon: '👤', description: 'Akses informasi statistik & profil anggota.' };
  }
};

/**
  * Hak Akses Membuka Detil & Workspace Kegiatan:
  * - Ketua Bidang (admin_bidang): Detil HANYA bisa dilihat oleh yang mengusulkan kegiatan tersebut.
  * - Ketua, Wakil Ketua, Sekretaris, Bendahara, Super Admin: Dapat melihat detil SEMUA kegiatan.
  */
export const canViewProposalDetail = (
  role: UserRole,
  activePersonaName: string,
  proposal: { createdBy: string; creatorRole?: UserRole }
): boolean => {
  if (
    role === 'ketua' || 
    role === 'wakil_ketua' || 
    role === 'sekretaris' || 
    role === 'bendahara' || 
    role === 'admin_master'
  ) {
    return true;
  }

  const isCreator = proposal.createdBy === activePersonaName || proposal.creatorRole === role;
  return isCreator;
};
