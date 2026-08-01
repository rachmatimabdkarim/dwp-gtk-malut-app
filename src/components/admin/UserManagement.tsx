import React, { useState } from 'react';
import { useApp, getEffectiveRole } from '../../context/AppContext';
import { UserAccount, UserRole } from '../../types';
import { 
  AdminSubTab, 
  CMSSection, 
  DynamicPermissionMatrix, 
  DEFAULT_PERMISSION_MATRIX 
} from '../../utils/RoleAccessControl';
import { 
  UserCheck, 
  UserPlus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X, 
  ShieldCheck, 
  Link, 
  Unlink, 
  Sparkles,
  Shield,
  Building2,
  Lock,
  User as UserIcon,
  Save,
  RotateCcw,
  Check,
  CheckSquare,
  Globe,
  FileText,
  Sliders
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { 
    members, 
    userAccounts, 
    addUserAccount, 
    updateUserAccount, 
    deleteUserAccount,
    permissionMatrix,
    updatePermissionMatrix,
    resetPermissionMatrix
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users_list' | 'rbac_matrix'>('users_list');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [memberId, setMemberId] = useState<string>('');
  const [manualRole, setManualRole] = useState<UserRole>('admin_master');
  const [status, setStatus] = useState<'aktif' | 'non-aktif'>('aktif');

  // Dynamic RBAC Local Form State
  const [matrixState, setMatrixState] = useState<DynamicPermissionMatrix>(permissionMatrix);

  const rolesList: { role: UserRole; label: string; icon: string }[] = [
    { role: 'ketua', label: 'Ketua DWP', icon: '👑' },
    { role: 'wakil_ketua', label: 'Wakil Ketua', icon: '🛡️' },
    { role: 'sekretaris', label: 'Sekretaris DWP', icon: '📜' },
    { role: 'bendahara', label: 'Bendahara DWP', icon: '💰' },
    { role: 'admin_bidang', label: 'Ketua Bidang', icon: '🎓' },
    { role: 'anggota', label: 'Anggota DWP', icon: '👤' }
  ];

  const menuTabsList: { id: AdminSubTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard Utama' },
    { id: 'proposals', label: 'Workflow Proposal' },
    { id: 'members', label: 'Data Anggota' },
    { id: 'users', label: 'Akun User & Hak Akses' },
    { id: 'cms', label: 'CMS Customizer' }
  ];

  const cmsSectionsList: { id: CMSSection; label: string }[] = [
    { id: 'identitas', label: '1. Identitas, Logo & Favicon' },
    { id: 'hero', label: '2. Banner Hero Utama' },
    { id: 'sambutan', label: '3. Sambutan Ketua DWP' },
    { id: 'visi_misi', label: '4. Visi & Misi Organisasi' },
    { id: 'section_headers', label: '5. Judul Section Publik' },
    { id: 'kontak_footer', label: '6. Kontak Footer & Alamat' }
  ];

  const filteredUsers = userAccounts.filter(u => {
    const linkedMember = u.memberId ? members.find(m => m.id === u.memberId) : null;
    const matchSearch = u.username.toLowerCase().includes(search.toLowerCase()) || 
                        u.email.toLowerCase().includes(search.toLowerCase()) || 
                        (linkedMember && linkedMember.name.toLowerCase().includes(search.toLowerCase()));
    
    const effectiveRole = getEffectiveRole(u, members);
    const matchRole = filterRole === 'all' || effectiveRole === filterRole;

    return matchSearch && matchRole;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email) return;

    const cleanUsername = username.trim().toLowerCase();
    const existingUserWithUsername = userAccounts.find(u => 
      u.username.trim().toLowerCase() === cleanUsername && (!editingUser || u.id !== editingUser.id)
    );
    if (existingUserWithUsername) {
      alert(`⚠️ PERINGATAN DUPLIKASI USERNAME:\n\nUsername "${username}" sudah digunakan oleh akun lain.`);
      return;
    }

    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const existingUserWithEmail = userAccounts.find(u => 
        u.email && u.email.trim().toLowerCase() === cleanEmail && (!editingUser || u.id !== editingUser.id)
      );
      if (existingUserWithEmail) {
        alert(`⚠️ PERINGATAN DUPLIKASI EMAIL:\n\nEmail "${email}" sudah digunakan oleh akun user lain.`);
        return;
      }
    }

    if (memberId) {
      const existingUserWithMember = userAccounts.find(u => 
        u.memberId === memberId && (!editingUser || u.id !== editingUser.id)
      );
      if (existingUserWithMember) {
        const linkedM = members.find(m => m.id === memberId);
        alert(`⚠️ PERINGATAN TAUTAN ANGGOTA GANDA:\n\nAnggota "${linkedM?.name || memberId}" sudah memiliki Akun User terdaftar.`);
        return;
      }
    }

    const calculatedRole = memberId ? getEffectiveRole({ role: manualRole, memberId } as any, members) : manualRole;

    if (editingUser) {
      updateUserAccount(editingUser.id, {
        username,
        email,
        memberId: memberId || undefined,
        role: calculatedRole,
        status
      });
      setEditingUser(null);
    } else {
      addUserAccount({
        username,
        email,
        memberId: memberId || undefined,
        role: calculatedRole,
        status
      });
    }

    setShowAddModal(false);
    setUsername('');
    setEmail('');
    setMemberId('');
    setManualRole('admin_master');
    setStatus('aktif');
  };

  const startEdit = (u: UserAccount) => {
    setEditingUser(u);
    setUsername(u.username);
    setEmail(u.email);
    setMemberId(u.memberId || '');
    setManualRole(u.role);
    setStatus(u.status);
    setShowAddModal(true);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ketua':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">👑 Ketua DWP</span>;
      case 'wakil_ketua':
        return <span className="bg-sky-100 text-sky-900 border border-sky-300 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">🛡️ Wakil Ketua</span>;
      case 'sekretaris':
        return <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">📜 Sekretaris DWP</span>;
      case 'bendahara':
        return <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">💰 Bendahara DWP</span>;
      case 'admin_bidang':
        return <span className="bg-dwp-burgundy/10 text-dwp-burgundy border border-dwp-burgundy/20 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">🎓 Ketua Bidang</span>;
      case 'admin_master':
        return <span className="bg-slate-900 text-dwp-gold border border-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">⚡ Superadmin IT</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">👤 Anggota</span>;
    }
  };

  // Toggle Handlers for Matrix
  const toggleTabPermission = (role: UserRole, tab: AdminSubTab) => {
    setMatrixState(prev => {
      const currentTabs = prev.tabs[role] || [];
      const updated = currentTabs.includes(tab)
        ? currentTabs.filter(t => t !== tab)
        : [...currentTabs, tab];
      return {
        ...prev,
        tabs: { ...prev.tabs, [role]: updated }
      };
    });
  };

  const toggleCMSSectionPermission = (role: UserRole, section: CMSSection) => {
    setMatrixState(prev => {
      const currentSections = prev.cmsSections[role] || [];
      const updated = currentSections.includes(section)
        ? currentSections.filter(s => s !== section)
        : [...currentSections, section];
      return {
        ...prev,
        cmsSections: { ...prev.cmsSections, [role]: updated }
      };
    });
  };

  const toggleProposalActionPermission = (role: UserRole, actionKey: 'canSubmit' | 'canVerifyWaket' | 'canApproveKetua' | 'canReceiveRab') => {
    setMatrixState(prev => {
      const currentActions = prev.proposalActions[role] || { canSubmit: false, canVerifyWaket: false, canApproveKetua: false, canReceiveRab: false };
      return {
        ...prev,
        proposalActions: {
          ...prev.proposalActions,
          [role]: {
            ...currentActions,
            [actionKey]: !currentActions[actionKey]
          }
        }
      };
    });
  };

  const handleSaveMatrix = () => {
    updatePermissionMatrix(matrixState);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleResetMatrix = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan seluruh Matriks Hak Akses ke Pengaturan Standar Bawaan?')) {
      resetPermissionMatrix();
      setMatrixState(DEFAULT_PERMISSION_MATRIX);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-xs">Matriks Hak Akses Berhasil Diperbarui!</div>
            <div className="text-[10px] text-emerald-200">Aturan role telah diterapkan secara real-time.</div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg md:text-xl font-bold text-slate-900">
              Manajemen Akun User & Hak Akses Role
            </h2>
            <span className="bg-dwp-burgundy text-dwp-gold text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              {userAccounts.length} Akun User
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Pengelolaan kredensial akun login sistem & konfigurasi dinamis matriks hak akses per role.
          </p>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('users_list')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'users_list' 
                ? 'bg-dwp-burgundy text-white shadow' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>1. Daftar Akun User</span>
          </button>
          <button
            onClick={() => setActiveTab('rbac_matrix')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'rbac_matrix' 
                ? 'bg-dwp-burgundy text-white shadow' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-dwp-gold" />
            <span>2. Matriks Hak Akses Role</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DAFTAR AKUN USER SYSTEM */}
      {activeTab === 'users_list' && (
        <div className="space-y-6">
          {/* Integration Explanation Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-dwp-darkBurgundy to-slate-900 text-white p-4 rounded-2xl border border-dwp-gold/30 shadow-md text-xs space-y-1.5">
            <div className="font-bold text-dwp-gold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-dwp-gold" />
              Aturan Integrasi Akun User & Data Anggota:
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              - <strong>User dari Anggota DWP</strong>: Saat akun dihubungkan ke <strong>Data Anggota</strong>, Role Sistem otomatis ditata sesuai <strong>Jabatan Resmi DWP</strong> (Ketua ➔ role <i>ketua</i>, Waket ➔ role <i>wakil_ketua</i>, dsb).<br />
              - <strong>User Non-Anggota</strong>: Akun tanpa tautan anggota (misal: Tim Support IT) secara khusus memegang role <strong>Superadmin IT (`admin_master`)</strong>.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari username, email, nama anggota..."
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter Role:
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="p-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-dwp-burgundy focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Role Pengurus</option>
                <option value="admin_master">⚡ Superadmin IT</option>
                <option value="ketua">👑 Ketua DWP</option>
                <option value="wakil_ketua">🛡️ Wakil Ketua</option>
                <option value="sekretaris">📜 Sekretaris DWP</option>
                <option value="bendahara">💰 Bendahara DWP</option>
                <option value="admin_bidang">🎓 Ketua Bidang</option>
                <option value="anggota">👤 Anggota DWP</option>
              </select>

              <button
                onClick={() => {
                  setEditingUser(null);
                  setUsername('');
                  setEmail('');
                  setMemberId('');
                  setManualRole('admin_master');
                  setStatus('aktif');
                  setShowAddModal(true);
                }}
                className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white font-semibold px-4 py-2 rounded-xl text-xs shadow flex items-center gap-1.5 transition-all hover:scale-[1.02] shrink-0"
              >
                <UserPlus className="w-4 h-4 text-dwp-gold" />
                <span>Tambah Akun User</span>
              </button>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="p-3.5 pl-5">Username & Kredensial</th>
                    <th className="p-3.5">Role Sistem / Jabatan</th>
                    <th className="p-3.5">Tautan Profil Anggota DWP</th>
                    <th className="p-3.5">Status Akun</th>
                    <th className="p-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                        Tidak ada akun user system yang sesuai dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const linkedMember = u.memberId ? members.find(m => m.id === u.memberId) : null;
                      const effectiveRole = getEffectiveRole(u, members);

                      return (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 pl-5">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <UserIcon className="w-3.5 h-3.5 text-dwp-burgundy" />
                              <span>{u.username}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">{u.email}</div>
                          </td>

                          <td className="p-3.5">
                            {getRoleBadge(effectiveRole)}
                          </td>

                          <td className="p-3.5">
                            {linkedMember ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={linkedMember.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                                  alt={linkedMember.name}
                                  className="w-7 h-7 rounded-full object-cover border border-dwp-gold shadow-sm shrink-0"
                                />
                                <div>
                                  <div className="font-bold text-slate-900">{linkedMember.name}</div>
                                  <div className="text-[10px] text-slate-500">{linkedMember.jabatan}</div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-1 rounded-md border border-slate-200 italic flex items-center gap-1 w-fit">
                                <Unlink className="w-3 h-3 text-slate-400" /> User Non-Anggota (Support IT)
                              </span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                              u.status === 'aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {u.status === 'aktif' ? '● Aktif' : '○ Non-Aktif'}
                            </span>
                          </td>

                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => startEdit(u)}
                                className="p-1.5 text-slate-600 hover:text-dwp-burgundy hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit Akun User"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              {u.username !== 'admin.it' && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Apakah Anda yakin ingin menghapus akun user "${u.username}"?`)) {
                                      deleteUserAccount(u.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Hapus Akun User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MATRIKS HAK AKSES & FITUR ROLE (DYNAMIC RBAC) */}
      {activeTab === 'rbac_matrix' && (
        <div className="space-y-6">
          {/* Header Action Control Bar */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-base text-dwp-gold flex items-center gap-2">
                <Sliders className="w-5 h-5" />
                Matriks Hak Akses & Fitur Role (No-Code RBAC)
              </h3>
              <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
                Superadmin IT dapat mengaktifkan atau me-nonaktifkan akses menu, bagian CMS, dan wewenang aksi proposal untuk setiap jenis role tanpa perlu mengubah kode program.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={handleResetMatrix}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>Reset ke Default</span>
              </button>
              <button
                onClick={handleSaveMatrix}
                className="bg-dwp-gold hover:bg-dwp-darkGold text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg flex items-center gap-1.5 transition-all hover:scale-[1.02]"
              >
                <Save className="w-4 h-4 text-slate-950" />
                <span>Simpan Perubahan Matriks</span>
              </button>
            </div>
          </div>

          {/* GROUP 1: HAK AKSES MENU PENGELOLAAN (SUBTAB NAVIGATION) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <CheckSquare className="w-5 h-5 text-dwp-burgundy" />
              <div>
                <h4 className="font-serif font-bold text-slate-900 text-sm">1. Hak Akses Menu Pengelolaan (Subtab Navigation)</h4>
                <p className="text-[11px] text-slate-500">Mengatur menu utama mana saja yang muncul di sidebar dan dapat diakses oleh masing-masing role pengurus.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 text-[11px] font-bold uppercase tracking-wider">
                    <th className="p-3 border border-slate-200">Nama Menu Pengelolaan</th>
                    {rolesList.map(r => (
                      <th key={r.role} className="p-3 border border-slate-200 text-center min-w-[110px]">
                        <span className="block text-sm mb-0.5">{r.icon}</span>
                        <span>{r.label}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                  {menuTabsList.map(tabItem => (
                    <tr key={tabItem.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 border border-slate-200 font-bold text-slate-900 bg-slate-50/50">
                        {tabItem.label}
                      </td>
                      {rolesList.map(r => {
                        const isChecked = matrixState.tabs[r.role]?.includes(tabItem.id) ?? false;
                        return (
                          <td key={r.role} className="p-3 border border-slate-200 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleTabPermission(r.role, tabItem.id)}
                              className="w-4 h-4 text-dwp-burgundy rounded border-slate-300 focus:ring-dwp-burgundy cursor-pointer"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* GROUP 2: HAK AKSES PENYUNTINGAN BAGIAN CMS CUSTOMIZER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Globe className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="font-serif font-bold text-slate-900 text-sm">2. Hak Akses Penyuntingan Bagian CMS Customizer</h4>
                <p className="text-[11px] text-slate-500">Mengatur bagian formulir CMS mana saja yang dapat diedit oleh masing-masing role di Live Customizer.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 text-[11px] font-bold uppercase tracking-wider">
                    <th className="p-3 border border-slate-200">Bagian Halaman CMS</th>
                    {rolesList.map(r => (
                      <th key={r.role} className="p-3 border border-slate-200 text-center min-w-[110px]">
                        <span className="block text-sm mb-0.5">{r.icon}</span>
                        <span>{r.label}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                  {cmsSectionsList.map(secItem => (
                    <tr key={secItem.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 border border-slate-200 font-bold text-slate-900 bg-slate-50/50">
                        {secItem.label}
                      </td>
                      {rolesList.map(r => {
                        const isChecked = matrixState.cmsSections[r.role]?.includes(secItem.id) ?? false;
                        return (
                          <td key={r.role} className="p-3 border border-slate-200 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCMSSectionPermission(r.role, secItem.id)}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* GROUP 3: WEWENANG AKSI WORKFLOW PROPOSAL KEGIATAN */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-5 h-5 text-sky-600" />
              <div>
                <h4 className="font-serif font-bold text-slate-900 text-sm">3. Wewenang Aksi Workflow Proposal Kegiatan</h4>
                <p className="text-[11px] text-slate-500">Mengatur wewenang khusus dalam alur pengusulan, verifikasi berjenjang, persetujuan, dan pencairan RAB.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 text-[11px] font-bold uppercase tracking-wider">
                    <th className="p-3 border border-slate-200">Jenis Wewenang Aksi Proposal</th>
                    {rolesList.map(r => (
                      <th key={r.role} className="p-3 border border-slate-200 text-center min-w-[110px]">
                        <span className="block text-sm mb-0.5">{r.icon}</span>
                        <span>{r.label}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 border border-slate-200 font-bold text-slate-900 bg-slate-50/50">
                      Hak Pengusulan Kegiatan Baru (Form Digital)
                    </td>
                    {rolesList.map(r => (
                      <td key={r.role} className="p-3 border border-slate-200 text-center">
                        <input
                          type="checkbox"
                          checked={matrixState.proposalActions[r.role]?.canSubmit ?? false}
                          onChange={() => toggleProposalActionPermission(r.role, 'canSubmit')}
                          className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 border border-slate-200 font-bold text-slate-900 bg-slate-50/50">
                      Hak Verifikasi Awal Usulan (Wakil Ketua DWP)
                    </td>
                    {rolesList.map(r => (
                      <td key={r.role} className="p-3 border border-slate-200 text-center">
                        <input
                          type="checkbox"
                          checked={matrixState.proposalActions[r.role]?.canVerifyWaket ?? false}
                          onChange={() => toggleProposalActionPermission(r.role, 'canVerifyWaket')}
                          className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 border border-slate-200 font-bold text-slate-900 bg-slate-50/50">
                      Hak Persetujuan Final Usulan (Ketua DWP)
                    </td>
                    {rolesList.map(r => (
                      <td key={r.role} className="p-3 border border-slate-200 text-center">
                        <input
                          type="checkbox"
                          checked={matrixState.proposalActions[r.role]?.canApproveKetua ?? false}
                          onChange={() => toggleProposalActionPermission(r.role, 'canApproveKetua')}
                          className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 border border-slate-200 font-bold text-slate-900 bg-slate-50/50">
                      Hak Notifikasi Pencairan RAB Keuangan (Bendahara DWP)
                    </td>
                    {rolesList.map(r => (
                      <td key={r.role} className="p-3 border border-slate-200 text-center">
                        <input
                          type="checkbox"
                          checked={matrixState.proposalActions[r.role]?.canReceiveRab ?? false}
                          onChange={() => toggleProposalActionPermission(r.role, 'canReceiveRab')}
                          className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USER ADD/EDIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 md:px-6 relative">
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-dwp-burgundy text-dwp-gold flex items-center justify-center font-bold shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white">
                    {editingUser ? 'Edit Kredensial Akun User' : 'Tambah Akun User System Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Konfigurasi username, email login, dan tautan data anggota DWP.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4 text-xs">
              
              <div>
                <label className="font-bold text-slate-700 block mb-1">Username Login</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: fatimah.waket atau admin.it"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Email Kredensial</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@malut.go.id"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                />
              </div>

              {/* Tautan Data Anggota DWP */}
              <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="font-bold text-slate-800 block text-xs">Tautan Profil Anggota DWP</label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-semibold text-slate-900 bg-white cursor-pointer"
                >
                  <option value="">-- User Non-Anggota (Superadmin IT Support) --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      👤 {m.name} ({m.jabatan})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 italic leading-relaxed pt-1">
                  * Menautkan akun ke Anggota DWP akan menyesuaikan Role Sistem secara otomatis sesuai Jabatan Resmi DWP.
                </p>
              </div>

              {!memberId && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role Sistem Manual (User Non-Anggota)</label>
                  <select
                    value={manualRole}
                    onChange={(e) => setManualRole(e.target.value as UserRole)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-bold text-slate-900 bg-white cursor-pointer"
                  >
                    <option value="admin_master">⚡ Superadmin IT Support</option>
                    <option value="ketua">👑 Ketua DWP</option>
                    <option value="wakil_ketua">🛡️ Wakil Ketua DWP</option>
                    <option value="sekretaris">📜 Sekretaris DWP</option>
                    <option value="bendahara">💰 Bendahara DWP</option>
                    <option value="admin_bidang">🎓 Ketua Bidang</option>
                    <option value="anggota">👤 Anggota DWP</option>
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Akun</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-bold text-slate-900 bg-white cursor-pointer"
                >
                  <option value="aktif">● Aktif (Bisa Login)</option>
                  <option value="non-aktif">○ Non-Aktif (Di-suspend)</option>
                </select>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white font-bold px-5 py-2 rounded-xl shadow text-xs transition-all"
                >
                  {editingUser ? 'Simpan Kredensial Akun' : 'Buat Akun User Baru'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
