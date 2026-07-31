import React, { useState } from 'react';
import { useApp, getEffectiveRole } from '../../context/AppContext';
import { UserAccount, UserRole } from '../../types';
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
  User as UserIcon
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { members, userAccounts, addUserAccount, updateUserAccount, deleteUserAccount } = useApp();

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [memberId, setMemberId] = useState<string>(''); // empty string = Non-Member
  const [manualRole, setManualRole] = useState<UserRole>('admin_master');
  const [status, setStatus] = useState<'aktif' | 'non-aktif'>('aktif');

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

    // 1. Username Uniqueness Validation
    const cleanUsername = username.trim().toLowerCase();
    const existingUserWithUsername = userAccounts.find(u => 
      u.username.trim().toLowerCase() === cleanUsername && (!editingUser || u.id !== editingUser.id)
    );
    if (existingUserWithUsername) {
      alert(`⚠️ PERINGATAN DUPLIKASI USERNAME:\n\nUsername "${username}" sudah digunakan oleh akun lain.\nSilakan gunakan username lain yang unik.`);
      return;
    }

    // 2. Email Uniqueness Validation
    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const existingUserWithEmail = userAccounts.find(u => 
        u.email && u.email.trim().toLowerCase() === cleanEmail && (!editingUser || u.id !== editingUser.id)
      );
      if (existingUserWithEmail) {
        alert(`⚠️ PERINGATAN DUPLIKASI EMAIL:\n\nEmail "${email}" sudah digunakan oleh akun user (${existingUserWithEmail.username}).\nSetiap akun user harus memiliki email yang unik.`);
        return;
      }
    }

    // 3. Member Linkage Uniqueness Validation (Satu Anggota Hanya 1 Akun User)
    if (memberId) {
      const existingUserWithMember = userAccounts.find(u => 
        u.memberId === memberId && (!editingUser || u.id !== editingUser.id)
      );
      if (existingUserWithMember) {
        const linkedM = members.find(m => m.id === memberId);
        alert(`⚠️ PERINGATAN TAUTAN ANGGOTA GANDA:\n\nAnggota "${linkedM?.name || memberId}" sudah memiliki Akun User terdaftar (${existingUserWithMember.username}).\nSatu profil anggota tidak boleh ditautkan ke lebih dari 1 akun user.`);
        return;
      }
    }

    const selectedMember = memberId ? members.find(m => m.id === memberId) : null;
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
    // Reset Form
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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg md:text-xl font-bold text-slate-900">
              Manajemen Akun User & Hak Akses
            </h2>
            <span className="bg-dwp-burgundy text-dwp-gold text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              {userAccounts.length} Akun User
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Pengelolaan kredensial akun login sistem yang terintegrasi secara otomatis dengan Jabatan Anggota DWP.
          </p>
        </div>

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
          <span>Tambah Akun User Baru</span>
        </button>
      </div>

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
            placeholder="Cari username, email, atau nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full sm:w-auto p-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
          >
            <option value="all">Semua Role Sistem ({userAccounts.length})</option>
            <option value="admin_master">Superadmin IT</option>
            <option value="ketua">Ketua DWP</option>
            <option value="wakil_ketua">Wakil Ketua</option>
            <option value="sekretaris">Sekretaris DWP</option>
            <option value="bendahara">Bendahara DWP</option>
            <option value="admin_bidang">Ketua Bidang</option>
            <option value="anggota">Anggota Biasa</option>
          </select>
        </div>
      </div>

      {/* User Accounts Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold">
                <th className="p-3.5 w-12 text-center">No</th>
                <th className="p-3.5">Username & Email</th>
                <th className="p-3.5">Tautan Profile Anggota</th>
                <th className="p-3.5">Jabatan DWP</th>
                <th className="p-3.5">Role & Hak Akses</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {filteredUsers.map((u, idx) => {
                const linkedMember = u.memberId ? members.find(m => m.id === u.memberId) : null;
                const effectiveRole = getEffectiveRole(u, members);

                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{u.username}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="p-3.5">
                      {linkedMember ? (
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={linkedMember.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                            alt={linkedMember.name} 
                            className="w-7 h-7 rounded-full object-cover border border-dwp-gold" 
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                              <Link className="w-3 h-3 text-emerald-600" />
                              <span>{linkedMember.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">ID: {linkedMember.id}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                          <Unlink className="w-3 h-3 text-slate-400" />
                          <span>User Non-Anggota (IT External)</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">
                      {linkedMember ? linkedMember.jabatan : '- (Non-Anggota)'}
                    </td>
                    <td className="p-3.5">
                      {getRoleBadge(effectiveRole)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        u.status === 'aktif' 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}>
                        {u.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => startEdit(u)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          title="Sunting Akun & Tautan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Apakah Anda yakin ingin menghapus akun user ${u.username}?`)) {
                              deleteUserAccount(u.id);
                            }
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                          title="Hapus Akun User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <form 
            onSubmit={handleSubmit} 
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-xs max-h-[90vh] flex flex-col my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/50 shrink-0">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-base">
                  {editingUser ? 'Sunting Akun User & Tautan' : 'Buat Akun User Baru'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Kelola kredensial dan hubungan ke Data Anggota DWP.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)} 
                className="p-1 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3.5 overflow-y-auto flex-1">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Username Akses *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: rahmiati.ketua / admin.it"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                />
              </div>

              {/* Tautan Ke Data Anggota */}
              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-800 block">Tautkan ke Profile Anggota DWP</label>
                <p className="text-[10px] text-slate-500 mb-2">
                  Jika terhubung ke Anggota, Role Sistem & Email akan otomatis disinkronkan dengan Data Anggota DWP.
                </p>
                <select
                  value={memberId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMemberId(val);
                    if (val) {
                      const linkedM = members.find(m => m.id === val);
                      if (linkedM?.email) setEmail(linkedM.email);
                    }
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-bold text-slate-900 bg-white"
                >
                  <option value="">🌐 User Non-Anggota (Superadmin IT External)</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      👤 {m.name} — {m.jabatan} ({m.unitKerja})
                    </option>
                  ))}
                </select>

                {memberId ? (
                  <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-[11px] text-emerald-900 mt-2 space-y-1">
                    <span className="font-bold block">✓ Terhubung ke Profile Anggota:</span>
                    <div>Role Sistem Otomatis: <span className="font-bold underline">{getEffectiveRole({ role: manualRole, memberId } as any, members).toUpperCase().replace('_', ' ')}</span></div>
                    <div className="text-[10px] text-emerald-700">📧 Email disinkronkan dari Data Anggota: <strong>{email}</strong></div>
                  </div>
                ) : (
                  <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[11px] text-amber-900 mt-2">
                    <span className="font-bold block">🌐 Akun User Non-Anggota:</span>
                    <span>Pilih Role Khusus Sistem di bawah ini:</span>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Email Resmi {memberId ? '(Disinkronkan dari Data Anggota)' : '*'}
                </label>
                <input
                  type="email"
                  required
                  readOnly={!!memberId}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@malut.go.id"
                  className={`w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium ${
                    memberId ? 'bg-slate-100 text-slate-600 cursor-not-allowed' : 'bg-white'
                  }`}
                />
              </div>

              {/* Role Selection (If Non-Member) */}
              {!memberId && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role Khusus Sistem (Non-Anggota) *</label>
                  <select
                    value={manualRole}
                    onChange={(e) => setManualRole(e.target.value as UserRole)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-bold text-slate-900 bg-white"
                  >
                    <option value="admin_master">⚡ Superadmin IT (Akses Penuh Pemeliharaan)</option>
                    <option value="admin_bidang">🎓 Admin Bidang (Operator External)</option>
                    <option value="sekretaris">📜 Sekretaris (Operator External)</option>
                    <option value="bendahara">💰 Bendahara (Operator External)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Akun</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-semibold text-slate-900 bg-white"
                >
                  <option value="aktif">Aktif</option>
                  <option value="non-aktif">Non-Aktif (Blokir Akses)</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white font-bold px-5 py-2 rounded-xl shadow text-xs"
              >
                {editingUser ? 'Simpan Perubahan' : 'Simpan Akun User'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
