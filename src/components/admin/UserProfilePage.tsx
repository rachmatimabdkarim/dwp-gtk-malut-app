import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ImageUploadCompressor } from '../common/ImageUploadCompressor';
import { 
  User, 
  Lock, 
  Save, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Key, 
  UserCheck, 
  Phone, 
  Mail, 
  Briefcase, 
  Heart,
  Sparkles
} from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { 
    currentAccount, 
    activePersona, 
    members, 
    updateMember, 
    updateUserAccount,
    userAccounts
  } = useApp();

  // Find linked member record if any
  const linkedMember = members.find(m => 
    (currentAccount?.memberId && m.id === currentAccount.memberId) ||
    m.name.toLowerCase() === activePersona.name.toLowerCase()
  );

  // Form State - Personal Profile
  const [name, setName] = useState(linkedMember?.name || activePersona.name);
  const [nip, setNip] = useState(linkedMember?.nip || '');
  const [jabatan, setJabatan] = useState(linkedMember?.jabatan || activePersona.title);
  const [unitKerja, setUnitKerja] = useState(linkedMember?.unitKerja || '');
  const [pekerjaan, setPekerjaan] = useState(linkedMember?.pekerjaan || '');
  const [bidang, setBidang] = useState<'Pendidikan' | 'Ekonomi' | 'Sosial Budaya' | '-'>(linkedMember?.bidang || '-');
  const [phone, setPhone] = useState(linkedMember?.phone || '');
  const [email, setEmail] = useState(linkedMember?.email || currentAccount?.email || '');
  const [golonganDarah, setGolonganDarah] = useState(linkedMember?.golonganDarah || '-');
  const [namaSuami, setNamaSuami] = useState(linkedMember?.namaSuami || '');
  const [namaAnak, setNamaAnak] = useState(linkedMember?.namaAnak || '');
  const [avatar, setAvatar] = useState(linkedMember?.avatar || activePersona.avatar);

  // Form State - Security / Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status Alerts
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (linkedMember) {
      setName(linkedMember.name);
      setNip(linkedMember.nip || '');
      setJabatan(linkedMember.jabatan);
      setUnitKerja(linkedMember.unitKerja || '');
      setPekerjaan(linkedMember.pekerjaan || '');
      setBidang(linkedMember.bidang || '-');
      setPhone(linkedMember.phone || '');
      setEmail(linkedMember.email || '');
      setGolonganDarah(linkedMember.golonganDarah || '-');
      setNamaSuami(linkedMember.namaSuami || '');
      setNamaAnak(linkedMember.namaAnak || '');
      if (linkedMember.avatar) setAvatar(linkedMember.avatar);
    }
  }, [linkedMember]);

  // Handle Save Profile Data
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);

    if (linkedMember) {
      // Update Member Record
      updateMember(linkedMember.id, {
        name,
        nip,
        jabatan,
        unitKerja,
        pekerjaan,
        bidang,
        phone,
        email,
        golonganDarah,
        namaSuami,
        namaAnak,
        avatar
      });
    }

    // Also update linked UserAccount email if present
    if (currentAccount) {
      updateUserAccount(currentAccount.id, {
        email
      });
    }

    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 4000);
  };

  // Handle Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentAccount) {
      setPasswordError('Tidak ada akun user aktif yang terdeteksi.');
      return;
    }

    // Verify current password match
    const accountInDb = userAccounts.find(u => u.id === currentAccount.id);
    const actualCurrentPass = accountInDb?.password || currentAccount.password;

    if (currentPassword !== actualCurrentPass) {
      setPasswordError('Password saat ini (password lama) tidak sesuai!');
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError('Password baru minimal harus 4 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password baru tidak cocok.');
      return;
    }

    // Update password in AppContext / Database
    updateUserAccount(currentAccount.id, {
      password: newPassword
    });

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-dwp-burgundy via-dwp-darkBurgundy to-slate-900 text-white rounded-3xl p-6 shadow-md border border-dwp-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={avatar || activePersona.avatar} 
              alt={name} 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-dwp-gold shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full text-[10px]" title="Akun Aktif">
              ✓
            </span>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-dwp-gold/20 text-dwp-lightGold text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-dwp-gold/30 mb-1">
              <Sparkles className="w-3 h-3 text-dwp-gold" />
              <span>Profil Pengurus & Anggota</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white">
              {name}
            </h2>
            <p className="text-xs text-slate-300">
              {jabatan} | NIP: {nip || '-'}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <span className="bg-slate-800 text-dwp-gold text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-dwp-gold" />
            <span>Role: {activePersona.title}</span>
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-dwp-burgundy" />
              <span>Foto Profil Pas Resmi</span>
            </h3>

            <ImageUploadCompressor
              label="Unggah Foto Pas Resmi (WebP Auto-Compress)"
              value={avatar}
              onChange={(compressedUrl) => setAvatar(compressedUrl)}
            />
          </div>

          {/* Account Overview Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-sm space-y-3 text-xs">
            <h4 className="font-serif font-bold text-dwp-gold text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-dwp-gold" />
              <span>Info Akun System</span>
            </h4>
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Username Login:</span>
                <span className="font-mono text-dwp-gold font-bold">{currentAccount?.username || activePersona.role}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Hak Akses:</span>
                <span className="font-bold text-white">{activePersona.title}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Status Akun:</span>
                <span className="text-emerald-400 font-bold">● Terverifikasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form & Password Form */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Section 1: Edit Profile Details */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-dwp-burgundy" />
                <h3 className="font-serif font-bold text-slate-900 text-lg">
                  Data Diri & Keanggotaan
                </h3>
              </div>
            </div>

            {profileSuccess && (
              <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Data profil Anda berhasil diperbarui dan tersimpan!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">NIP (Nomor Induk Pegawai)</label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="Contoh: 19780512 200312 2 001"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No. HP / WhatsApp *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alamat Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@domain.com"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jabatan Resmi DWP</label>
                  <input
                    type="text"
                    readOnly
                    value={jabatan}
                    className="w-full p-2.5 border border-slate-200 bg-slate-50 text-slate-700 rounded-xl font-semibold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bidang Organisasi</label>
                  <select
                    value={bidang}
                    onChange={(e) => setBidang(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                  >
                    <option value="-">Blank / Sekretariat</option>
                    <option value="Pendidikan">Bidang Pendidikan</option>
                    <option value="Ekonomi">Bidang Ekonomi</option>
                    <option value="Sosial Budaya">Bidang Sosial Budaya</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit Kerja / Instansi Suami</label>
                  <input
                    type="text"
                    value={unitKerja}
                    onChange={(e) => setUnitKerja(e.target.value)}
                    placeholder="Contoh: Kantor GTK Prov. Maluku Utara"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pekerjaan Utama</label>
                  <input
                    type="text"
                    value={pekerjaan}
                    onChange={(e) => setPekerjaan(e.target.value)}
                    placeholder="Contoh: PNS / Guru / Ibu Rumah Tangga"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Suami</label>
                  <input
                    type="text"
                    value={namaSuami}
                    onChange={(e) => setNamaSuami(e.target.value)}
                    placeholder="Nama Suami"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Anak-Anak</label>
                  <input
                    type="text"
                    value={namaAnak}
                    onChange={(e) => setNamaAnak(e.target.value)}
                    placeholder="Nama Anak"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Golongan Darah</label>
                  <select
                    value={golonganDarah}
                    onChange={(e) => setGolonganDarah(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                  >
                    <option value="-">- Tidak tahu -</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white font-bold px-5 py-2.5 rounded-xl shadow flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Save className="w-4 h-4 text-dwp-gold" />
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Change Password Form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-dwp-burgundy" />
                <h3 className="font-serif font-bold text-slate-900 text-lg">
                  Keamanan Akun & Ganti Password
                </h3>
              </div>
            </div>

            {passwordError && (
              <div className="bg-rose-100 text-rose-900 border border-rose-300 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Password akun Anda berhasil diperbarui! Silakan gunakan password baru ini untuk login berikutnya.</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Password Saat Ini (Password Lama) *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password Anda saat ini..."
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Password Baru *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Password baru (min. 4 karakter)"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Konfirmasi Password Baru *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang password baru..."
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-dwp-gold font-bold px-5 py-2.5 rounded-xl shadow flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Key className="w-4 h-4 text-dwp-gold" />
                  <span>Update Password Akun</span>
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
