import { UserRole } from '../types';

export type AdminSubTab = 
  | 'dashboard' 
  | 'proposals'
  | 'members' 
  | 'users' 
  | 'cms';

export type CMSSection = 
  | 'identitas' 
  | 'hero' 
  | 'sambutan' 
  | 'visi_misi' 
  | 'section_headers' 
  | 'kontak_footer';

// Access Control Matrix defining permitted subtabs for each UserRole
export const ROLE_PERMISSIONS: Record<UserRole, AdminSubTab[]> = {
  admin_master: ['dashboard', 'proposals', 'members', 'users', 'cms'],
  ketua: ['dashboard', 'proposals', 'members', 'users', 'cms'],
  wakil_ketua: ['dashboard', 'proposals', 'members', 'users'],
  sekretaris: ['dashboard', 'proposals', 'members', 'cms'],
  bendahara: ['dashboard', 'proposals', 'members'],
  admin_bidang: ['dashboard', 'proposals', 'members'],
  anggota: ['dashboard', 'members']
};

// Granular Section Permissions inside Live Customizer CMS page
export const ROLE_CMS_SECTIONS: Record<UserRole, CMSSection[]> = {
  admin_master: ['identitas', 'hero', 'sambutan', 'visi_misi', 'section_headers', 'kontak_footer'],
  ketua: ['sambutan', 'visi_misi'],
  sekretaris: ['identitas', 'hero', 'section_headers', 'kontak_footer'],
  wakil_ketua: ['sambutan', 'visi_misi'],
  bendahara: [],
  admin_bidang: [],
  anggota: []
};

export const hasTabAccess = (role: UserRole, tab: AdminSubTab): boolean => {
  const allowedTabs = ROLE_PERMISSIONS[role] || ['dashboard', 'members'];
  return allowedTabs.includes(tab);
};

export const canEditCMSSection = (role: UserRole, section: CMSSection): boolean => {
  const allowedSections = ROLE_CMS_SECTIONS[role] || [];
  return allowedSections.includes(section);
};

export const getRoleDescription = (role: UserRole): { label: string; icon: string; description: string } => {
  switch (role) {
    case 'admin_master':
      return { label: 'Superadmin IT', icon: '⚡', description: 'Akses penuh seluruh sistem & pemeliharaan teknis.' };
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
