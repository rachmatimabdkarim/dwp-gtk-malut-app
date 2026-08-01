import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import { ImageUploadCompressor } from '../common/ImageUploadCompressor';
import { Users, UserPlus, Search, Filter, Edit2, Trash2, Printer, X, CheckCircle2, Upload, Image as ImageIcon, Eye, Columns, Phone, Mail, Briefcase, Heart, Building2, User } from 'lucide-react';

export const MemberManagement: React.FC = () => {
  const { members, addMember, updateMember, deleteMember } = useApp();

  const [search, setSearch] = useState('');
  const [filterBidang, setFilterBidang] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [showFullColumns, setShowFullColumns] = useState(false);

  // Form State
  const [avatar, setAvatar] = useState('');
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [jabatan, setJabatan] = useState('Anggota DWP');
  const [unitKerja, setUnitKerja] = useState('Kantor GTK Prov. Maluku Utara');
  const [pekerjaan, setPekerjaan] = useState('');
  const [golonganDarah, setGolonganDarah] = useState<string>('-');
  const [namaSuami, setNamaSuami] = useState('');
  const [namaAnak, setNamaAnak] = useState('');
  const [bidang, setBidang] = useState<'Pendidikan' | 'Ekonomi' | 'Sosial Budaya' | 'Sekretariat' | 'Pengurus Inti' | '-' >('-');

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const filteredMembers = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                        (m.nip && m.nip.includes(search)) || 
                        (m.pekerjaan && m.pekerjaan.toLowerCase().includes(search.toLowerCase())) ||
                        (m.namaSuami && m.namaSuami.toLowerCase().includes(search.toLowerCase())) ||
                        (m.namaAnak && m.namaAnak.toLowerCase().includes(search.toLowerCase())) ||
                        m.jabatan.toLowerCase().includes(search.toLowerCase());
    const matchBidang = filterBidang === 'all' || m.bidang === filterBidang;
    return matchSearch && matchBidang;
  });

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    // Single-Occupant Positions Validation (Tidak boleh duplikat)
    const singleOccupantPositions = [
      'ketua',
      'wakil ketua',
      'sekretaris',
      'wakil sekretaris',
      'bendahara',
      'ketua bidang pendidikan',
      'ketua bidang ekonomi',
      'ketua bidang sosial budaya'
    ];

    const cleanJabatan = jabatan.trim().toLowerCase();
    const isSingleOccupant = singleOccupantPositions.some(p => cleanJabatan === p || cleanJabatan === `ketua pengurus dwp` && p === 'ketua');

    if (isSingleOccupant) {
      const existingDuplicate = members.find(m => {
        const mJabatan = m.jabatan.trim().toLowerCase();
        const isSamePos = mJabatan === cleanJabatan || (cleanJabatan === 'ketua' && (mJabatan === 'ketua' || mJabatan === 'ketua pengurus dwp'));
        return isSamePos && (!editingMember || m.id !== editingMember.id);
      });

      if (existingDuplicate) {
        alert(`⚠️ PERINGATAN DUPLIKASI JABATAN:\n\nJabatan "${jabatan}" bersifat TUNGGAL dan sudah diisi oleh:\n👉 ${existingDuplicate.name}\n\nSatu posisi pengurus inti/ketua bidang tidak boleh diisi oleh lebih dari 1 personil.\nSilakan ubah terlebih dahulu jabatan pengurus yang lama, atau pilih jabatan "Anggota".`);
        return;
      }
    }

    // Email Uniqueness Validation
    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const existingMemberWithEmail = members.find(m => 
        m.email && m.email.trim().toLowerCase() === cleanEmail && (!editingMember || m.id !== editingMember.id)
      );
      if (existingMemberWithEmail) {
        alert(`⚠️ PERINGATAN DUPLIKASI EMAIL:\n\nEmail "${email}" sudah terdaftar pada anggota:\n👉 ${existingMemberWithEmail.name} (${existingMemberWithEmail.jabatan})\n\nSetiap anggota harus menggunakan alamat email yang unik.`);
        return;
      }
    }

    const defaultAvatar = avatar || `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random()*1000)}?w=150&auto=format&fit=crop&q=80`;

    if (editingMember) {
      updateMember(editingMember.id, {
        name,
        nip,
        jabatan,
        unitKerja,
        pekerjaan,
        golonganDarah,
        namaSuami,
        namaAnak,
        bidang: bidang as any,
        phone,
        email,
        avatar: avatar || editingMember.avatar
      });
      setEditingMember(null);
    } else {
      addMember({
        name,
        nip,
        jabatan,
        unitKerja,
        pekerjaan,
        golonganDarah,
        namaSuami,
        namaAnak,
        bidang: bidang as any,
        phone,
        email,
        status: 'Aktif',
        avatar: defaultAvatar
      });
    }

    setShowAddModal(false);
    // Reset Form
    setName('');
    setNip('');
    setUnitKerja('');
    setPekerjaan('');
    setGolonganDarah('-');
    setNamaSuami('');
    setNamaAnak('');
    setPhone('');
    setEmail('');
    setAvatar('');
  };

  const startEdit = (m: Member) => {
    setEditingMember(m);
    setName(m.name);
    setNip(m.nip || '');
    setJabatan(m.jabatan);
    setUnitKerja(m.unitKerja || '');
    setPekerjaan(m.pekerjaan || '');
    setGolonganDarah(m.golonganDarah || '-');
    setNamaSuami(m.namaSuami || '');
    setNamaAnak(m.namaAnak || '');
    setBidang((['Pendidikan', 'Ekonomi', 'Sosial Budaya'].includes(m.bidang) ? m.bidang : '-') as any);

    setPhone(m.phone);
    setEmail(m.email);
    setAvatar(m.avatar || '');
    setShowAddModal(true);
  };


  return (

    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg md:text-xl font-bold text-slate-900">
              Manajemen Data Anggota DWP
            </h2>
            <span className="bg-dwp-burgundy text-dwp-gold text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              {members.length} Anggota
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingMember(null);
              setName('');
              setNip('');
              setJabatan('Anggota DWP');
              setUnitKerja('');
              setPekerjaan('');
              setGolonganDarah('-');
              setNamaSuami('');
              setNamaAnak('');
              setBidang('Pendidikan');
              setPhone('');
              setEmail('');
              setAvatar('');
              setShowAddModal(true);
            }}
            className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white font-semibold px-4 py-2 rounded-xl text-xs shadow flex items-center gap-1.5 transition-all hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4 text-dwp-gold" />
            <span>Tambah Anggota Baru</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nama, NIP, atau jabatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterBidang}
              onChange={(e) => setFilterBidang(e.target.value)}
              className="p-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
            >
              <option value="all">Semua Bidang ({members.length})</option>
              <option value="-">Blank / Tanpa Bidang (-)</option>
              <option value="Pendidikan">Bidang Pendidikan</option>
              <option value="Ekonomi">Bidang Ekonomi</option>
              <option value="Sosial Budaya">Bidang Sosial Budaya</option>
            </select>
          </div>

          <button
            onClick={() => setShowFullColumns(!showFullColumns)}
            className={`p-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              showFullColumns 
                ? 'bg-dwp-burgundy/10 text-dwp-burgundy border-dwp-burgundy/30' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title={showFullColumns ? "Kembali ke Tampilan Ringkas" : "Tampilkan Semua Kolom Detail"}
          >
            <Columns className="w-4 h-4 text-dwp-gold" />
            <span>{showFullColumns ? 'Tampilan Ringkas' : 'Semua Kolom'}</span>
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold">
                <th className="p-3.5 w-12 text-center">No</th>
                <th className="p-3.5">Nama & Foto Anggota</th>
                <th className="p-3.5">Jabatan & Bidang</th>
                <th className="p-3.5">Instansi / Unit Kerja</th>
                {showFullColumns && (
                  <>
                    <th className="p-3.5">Pekerjaan</th>
                    <th className="p-3.5 text-center">Gol. Darah</th>
                    <th className="p-3.5">Data Keluarga</th>
                  </>
                )}
                <th className="p-3.5">Kontak</th>
                <th className="p-3.5 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {filteredMembers.map((m, idx) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img src={m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt={m.name} className="w-9 h-9 rounded-full object-cover border border-dwp-gold shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{m.name}</div>
                        <div className="text-[10px] text-slate-500 font-medium">NIP. {m.nip || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{m.jabatan}</div>
                    {m.bidang && m.bidang !== '-' && (
                      <span className="inline-block mt-0.5 bg-dwp-burgundy/10 text-dwp-burgundy text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {m.bidang}
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-700 font-semibold">{m.unitKerja || '-'}</td>
                  
                  {showFullColumns && (
                    <>
                      <td className="p-3.5 text-slate-700 font-semibold">{m.pekerjaan || '-'}</td>
                      <td className="p-3.5 text-center">
                        <span className="inline-block bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          {m.golonganDarah || '-'}
                        </span>
                      </td>
                      <td className="p-3.5 text-[11px] text-slate-700">
                        <div className="font-bold text-slate-900">💍 {m.namaSuami || '-'}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">👶 {m.namaAnak || '-'}</div>
                      </td>
                    </>
                  )}

                  <td className="p-3.5 text-[11px] text-slate-600">
                    <div className="font-semibold text-slate-800">{m.phone || '-'}</div>
                    <div className="text-[10px] text-slate-400">{m.email || '-'}</div>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setViewingMember(m)}
                        className="p-1.5 bg-slate-100 hover:bg-dwp-burgundy hover:text-white text-slate-700 rounded-lg transition-colors"
                        title="Lihat Detail Profil"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => startEdit(m)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                        title="Sunting Profile & Foto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus data anggota ${m.name}?`)) {
                            deleteMember(m.id);
                          }
                        }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                        title="Hapus Data"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Member Modal */}

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <form 
            onSubmit={handleSubmit} 
            className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 md:px-6 md:py-4 shrink-0 bg-slate-50/50">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-base md:text-lg">
                  {editingMember ? 'Sunting Profil & Data Anggota' : 'Tambah Anggota Baru'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Isi data profil anggota DWP secara lengkap dan proporsional.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3.5 text-xs">
              {/* Foto Profil Anggota Upload (Dikompres Otomatis ke WebP HD) */}
              <ImageUploadCompressor
                label="Foto Pas Profil Resmi Anggota / Pengurus"
                value={avatar}
                onChange={(compressedUrl) => setAvatar(compressedUrl)}
                maxWidth={600}
                maxHeight={600}
                quality={0.85}
                helpText="Foto profil anggota. Otomatis dikompres cerdas (format WebP HD super hemat storage)."
              />

              {/* Nama Lengkap */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ny. Hj. Siti Aminah, S.Pd"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                />
              </div>

              {/* NIP & Jabatan */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">NIP (Jika Ada)</label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="19820315..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jabatan Resmi *</label>
                  <select
                    required
                    value={jabatan}
                    onChange={(e) => {
                      const val = e.target.value;
                      setJabatan(val);

                      if (['Ketua', 'Wakil Ketua', 'Sekretaris', 'Wakil Sekretaris', 'Bendahara'].includes(val)) {
                        setBidang('-');
                      } else if (val === 'Ketua Bidang Pendidikan') {
                        setBidang('Pendidikan');
                      } else if (val === 'Ketua Bidang Ekonomi') {
                        setBidang('Ekonomi');
                      } else if (val === 'Ketua Bidang Sosial Budaya') {
                        setBidang('Sosial Budaya');
                      } else if (val === 'Anggota' && bidang === '-') {
                        setBidang('Pendidikan');
                      }
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-bold text-slate-900 cursor-pointer bg-white"
                  >
                    <option value="Ketua">👑 Ketua DWP</option>
                    <option value="Wakil Ketua">🛡️ Wakil Ketua</option>
                    <option value="Sekretaris">📑 Sekretaris</option>
                    <option value="Wakil Sekretaris">📝 Wakil Sekretaris</option>
                    <option value="Bendahara">💰 Bendahara</option>
                    <option value="Ketua Bidang Pendidikan">🎓 Ketua Bidang Pendidikan</option>
                    <option value="Ketua Bidang Ekonomi">📈 Ketua Bidang Ekonomi</option>
                    <option value="Ketua Bidang Sosial Budaya">🤝 Ketua Bidang Sosial Budaya</option>
                    <option value="Anggota">👥 Anggota DWP</option>
                  </select>
                </div>
              </div>




              {/* Bidang Organisasi */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 block">Bidang Organisasi</label>
                  {jabatan !== 'Anggota' && (
                    <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">
                      {bidang === '-' ? 'Blank (-)' : `Bidang ${bidang}`}
                    </span>
                  )}
                </div>
                <select
                  value={bidang}
                  disabled={jabatan !== 'Anggota'}
                  onChange={(e) => setBidang(e.target.value as any)}
                  className={`w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-semibold ${
                    jabatan !== 'Anggota' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-900 cursor-pointer'
                  }`}
                >
                  <option value="-">- (Blank / Tanpa Bidang)</option>
                  <option value="Pendidikan">Bidang Pendidikan</option>
                  <option value="Ekonomi">Bidang Ekonomi</option>
                  <option value="Sosial Budaya">Bidang Sosial Budaya</option>
                </select>
              </div>

              {/* 1. Pekerjaan / Profesi */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pekerjaan / Profesi</label>
                <input
                  type="text"
                  value={pekerjaan}
                  onChange={(e) => setPekerjaan(e.target.value)}
                  placeholder="Contoh: PNS / Guru / Wiraswasta"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                />
              </div>


              {/* 2. Instansi / Tempat Bekerja */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Instansi / Tempat Bekerja</label>
                <input
                  type="text"
                  value={unitKerja}
                  onChange={(e) => setUnitKerja(e.target.value)}
                  placeholder="Contoh: Kantor BGP / SMA Negeri 1 Ternate (Opsional)"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                />
              </div>

              {/* 3. Gol. Darah & 4. Nama Suami */}
              <div className="grid sm:grid-cols-3 gap-3">
                {/* 3. Gol. Darah */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gol. Darah Anggota</label>
                  <select
                    value={golonganDarah}
                    onChange={(e) => setGolonganDarah(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-bold text-slate-900 bg-white"
                  >
                    <option value="-">- (Belum Tahu)</option>
                    <option value="A">Golongan A</option>
                    <option value="B">Golongan B</option>
                    <option value="AB">Golongan AB</option>
                    <option value="O">Golongan O</option>
                  </select>
                </div>

                {/* 4. Nama Suami */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Nama Suami</label>
                  <input
                    type="text"
                    value={namaSuami}
                    onChange={(e) => setNamaSuami(e.target.value)}
                    placeholder="Ketik nama suami..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* 5. Nama Anak-Anak */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Anak-Anak</label>
                <input
                  type="text"
                  value={namaAnak}
                  onChange={(e) => setNamaAnak(e.target.value)}
                  placeholder="Contoh: 1. Muhammad Rizky, 2. Anisa Rahma"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                />
              </div>

              {/* No HP & Email */}
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@malut.go.id"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 md:px-6 md:py-3 border-t border-slate-100 flex justify-end gap-2 shrink-0 bg-slate-50/50">
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
                {editingMember ? 'Simpan Perubahan' : 'Simpan Data Anggota'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Member Detail View Modal */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Card Header */}
            <div className="bg-slate-900 text-white p-5 relative">
              <button 
                onClick={() => setViewingMember(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4">
                <img 
                  src={viewingMember.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                  alt={viewingMember.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-dwp-gold shadow-md shrink-0" 
                />
                <div>
                  <h3 className="font-serif font-bold text-base text-white">{viewingMember.name}</h3>
                  <div className="text-xs text-dwp-gold font-bold mt-0.5">{viewingMember.jabatan}</div>
                  {viewingMember.nip && (
                    <div className="text-[11px] text-slate-300 font-mono mt-0.5">NIP: {viewingMember.nip}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs divide-y divide-slate-100">
              <div className="space-y-2 pb-3">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-dwp-burgundy" /> Instansi / Unit Kerja
                  </span>
                  <span className="font-bold text-slate-800 text-right">{viewingMember.unitKerja || '-'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-dwp-burgundy" /> Bidang Organisasi
                  </span>
                  <span className="bg-dwp-burgundy/10 text-dwp-burgundy font-bold px-2 py-0.5 rounded-full text-[10px]">
                    {viewingMember.bidang || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-dwp-burgundy" /> Pekerjaan / Profesi
                  </span>
                  <span className="font-bold text-slate-800">{viewingMember.pekerjaan || '-'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" /> Golongan Darah
                  </span>
                  <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                    {viewingMember.golonganDarah || '-'}
                  </span>
                </div>
              </div>

              {/* Data Keluarga */}
              <div className="py-3 space-y-2">
                <div className="font-bold text-slate-900 mb-1">Data Keluarga</div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-500">Nama Suami</span>
                  <span className="font-bold text-slate-800">💍 {viewingMember.namaSuami || '-'}</span>
                </div>
                <div className="flex items-start justify-between text-slate-600 gap-2">
                  <span className="text-slate-500 shrink-0">Nama Anak</span>
                  <span className="font-semibold text-slate-800 text-right">👶 {viewingMember.namaAnak || '-'}</span>
                </div>
              </div>

              {/* Kontak */}
              <div className="pt-3 space-y-2">
                <div className="font-bold text-slate-900 mb-1">Informasi Kontak</div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> Telepon / WA
                  </span>
                  <span className="font-bold text-slate-800">{viewingMember.phone || '-'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" /> Email
                  </span>
                  <span className="font-semibold text-slate-800">{viewingMember.email || '-'}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  const m = viewingMember;
                  setViewingMember(null);
                  startEdit(m);
                }}
                className="bg-dwp-burgundy text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow hover:bg-dwp-darkBurgundy transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-dwp-gold" />
                <span>Sunting Anggota</span>
              </button>
              <button
                onClick={() => setViewingMember(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


