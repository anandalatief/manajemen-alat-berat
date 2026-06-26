import React, { useState, useEffect } from 'react';
import { Plus, Save, X, Edit2, Trash2, ImageIcon, UploadCloud, Users, Wrench, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function MasterData({ userAktif }) {
  // Proteksi Otoritas: Hanya Super Admin dan Admin yang memiliki akses ke fitur CRUD
  const punyaAksesSistem = userAktif?.role === 'Super Admin' || userAktif?.role === 'Admin';

  const [activeTab, setActiveTab] = useState('alat');
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // States data penampung dari MySQL Database
  const [daftarAlat, setDaftarAlat] = useState([]);
  const [daftarPekerja, setDaftarPekerja] = useState([]);
  const [daftarUsers, setDaftarUsers] = useState([]);

  // States Form Manajemen Objek
  const [formAlat, setFormAlat] = useState({ no_lambung: '', nama_alat: '', spesifikasi: '', tarif_per_hari: '', status_unit: 'Ready', foto_url: '' });
  const [formPekerja, setFormPekerja] = useState({ id_pekerja: '', nama_pekerja: '', peran: 'Operator', spesialisasi_sio: '', gaji_per_shift: '', status_tugas: 'Siap' });
  const [formUser, setFormUser] = useState({ id_user: '', username: '', password: '', nama_lengkap: '', role: 'Admin' });

  // =========================================================================
  // FUNGSI READ: MEMANGGIL DATA DARI BACKEND API
  // =========================================================================
  const muatAlat = async () => { try { const r = await axios.get('http://localhost:5000/api/alat-berat'); setDaftarAlat(r.data); } catch(e){ console.error(e); } };
  const muatPekerja = async () => { try { const r = await axios.get('http://localhost:5000/api/pekerja'); setDaftarPekerja(r.data); } catch(e){ console.error(e); } };
  const muatUsers = async () => { try { const r = await axios.get('http://localhost:5000/api/users'); setDaftarUsers(r.data); } catch(e){ console.error(e); } };

  useEffect(() => {
    if (activeTab === 'alat') muatAlat();
    if (activeTab === 'pekerja') muatPekerja();
    if (activeTab === 'users') muatUsers();
  }, [activeTab]);

  // =========================================================================
  // FUNGSI DELETE: MENGHAPUS REKORD DATA DARI MYSQL
  // =========================================================================
  const handleHapusAlat = async (no_lambung) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus unit ${no_lambung}?`)) return;
    try { const res = await axios.delete(`http://localhost:5000/api/alat-berat/${no_lambung}`); alert(res.data.message); muatAlat(); } catch (err) { alert(err.response?.data?.message || "Gagal menghapus."); }
  };

  const handleHapusPekerja = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data pekerja ini?")) return;
    try { const res = await axios.delete(`http://localhost:5000/api/pekerja/${id}`); alert(res.data.message); muatPekerja(); } catch (err) { alert(err.response?.data?.message || "Gagal menghapus."); }
  };

  const handleHapusUser = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus akun user ini?")) return;
    try { const res = await axios.delete(`http://localhost:5000/api/users/${id}`); alert(res.data.message); muatUsers(); } catch (err) { alert(err.response?.data?.message || "Gagal menghapus."); }
  };

  // HANDLER DETEKSI JENDELA FILE EXPLORER LAPTOP
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFormAlat({ ...formAlat, foto_url: file.name });
    }
  };

  // =========================================================================
  // LOGIKA SUBMIT FORMS (CREATE & UPDATE DUA KOLOM LUAS)
  // =========================================================================
  const handleSubmitAlat = async (e) => {
    e.preventDefault();
    let namaFileFinal = formAlat.foto_url;
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('foto', selectedFile);
        const uploadRes = await axios.post('http://localhost:5000/api/upload-foto', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        namaFileFinal = uploadRes.data.filename;
      }
      const dataKirim = { ...formAlat, foto_url: namaFileFinal };
      if (isEditMode) await axios.put(`http://localhost:5000/api/alat-berat/${formAlat.no_lambung}`, dataKirim);
      else await axios.post('http://localhost:5000/api/alat-berat', dataKirim);
      setSelectedFile(null); setShowModal(false); muatAlat();
    } catch(e){ alert("Gagal mengeksekusi data alat berat. Periksa koneksi backend."); }
  };

  const handleSubmitPekerja = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) await axios.put(`http://localhost:5000/api/pekerja/${formPekerja.id_pekerja}`, formPekerja);
      else await axios.post('http://localhost:5000/api/pekerja', formPekerja);
      setShowModal(false); muatPekerja();
    } catch(e){ alert("Gagal mengeksekusi data pekerja."); }
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) await axios.put(`http://localhost:5000/api/users/${formUser.id_user}`, formUser);
      else await axios.post('http://localhost:5000/api/users', formUser);
      setShowModal(false); muatUsers();
    } catch(e){ alert("Gagal mengeksekusi hak akses."); }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-xl font-black text-[#1E2229] uppercase tracking-wide">Pusat Data Utama</h2>
          <p className="text-xs text-gray-400 font-medium mt-1">Sistem kontrol terintegrasi penuh untuk aset alat berat, tim lapangan, dan manajemen hak akses.</p>
        </div>
        
        {/* REVISI: TOMBOL TAMBAH DATA EMAS INDUSTRIAL YANG ELEGAN */}
        {punyaAksesSistem && (
          <button 
            onClick={() => { setIsEditMode(false); setSelectedFile(null); setFormAlat({ no_lambung: '', nama_alat: '', spesifikasi: '', tarif_per_hari: '', status_unit: 'Ready', foto_url: '' }); setFormPekerja({ id_pekerja: '', nama_pekerja: '', peran: 'Operator', spesialisasi_sio: '', gaji_per_shift: '', status_tugas: 'Siap' }); setFormUser({ id_user: '', username: '', password: '', nama_lengkap: '', role: 'Admin' }); setShowModal(true); }}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFB800] to-[#D99B00] hover:from-[#E6A600] hover:to-[#B38000] text-[#111] font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg shadow-yellow-500/10 transition-all duration-150 transform active:scale-[0.98]"
          >
            <Plus size={14} strokeWidth={3} className="text-[#111]" />
            <span>
              {activeTab === 'alat' ? 'Tambah Alat Berat' : activeTab === 'pekerja' ? 'Registrasi Pekerja' : 'Tambah Otoritas'}
            </span>
          </button>
        )}
      </div>

      {/* NAVIGASI SUB-TAB KONTROL */}
      <div className="flex space-x-2 border-b border-gray-200/60 pb-px">
        <button onClick={() => setActiveTab('alat')} className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === 'alat' ? 'border-[#FFB800] text-[#1E2229]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Aset Alat Berat</button>
        <button onClick={() => setActiveTab('pekerja')} className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === 'pekerja' ? 'border-[#FFB800] text-[#1E2229]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Operator & Mekanik</button>
        <button onClick={() => setActiveTab('users')} className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === 'users' ? 'border-[#FFB800] text-[#1E2229]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Manajemen Pengguna</button>
      </div>

      {/* RENDER DATA UTAMA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden">
        
        {/* SUB-HALAMAN 1: TABEL ALAT BERAT */}
        {activeTab === 'alat' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-5 w-28 text-center">Visual Unit</th>
                  <th className="py-3 px-5">No Lambung</th>
                  <th className="py-3 px-5">Nama Alat Berat</th>
                  <th className="py-3 px-5">Spesifikasi</th>
                  <th className="py-3 px-5">Tarif / Hari</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  {punyaAksesSistem && <th className="py-3 px-5 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-bold text-[#1E2229]">
                {daftarAlat.map(u => (
                  <tr key={u.no_lambung} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-5 text-center relative">
                      <div className="w-20 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shadow-sm relative group cursor-zoom-in mx-auto">
                        <img 
                          src={u.foto_url ? `/images/${u.foto_url}` : "https://images.unsplash.com/photo-1579294800821-694d95e86143?q=80&w=200"} 
                          alt="Unit" className="w-full h-full object-cover"
                          onError={(e)=>{e.target.src="https://images.unsplash.com/photo-1579294800821-694d95e86143?q=80&w=200";}}
                        />
                        {/* KOTAK HOVER HOVER POP-UP LARGE PREVIEW */}
                        <div className="absolute hidden group-hover:block absolute left-24 top-[-20px] w-56 h-36 bg-white border-2 border-[#FFB800] p-1 rounded-xl shadow-2xl z-50 pointer-events-none">
                          <img src={u.foto_url ? `/images/${u.foto_url}` : "https://images.unsplash.com/photo-1579294800821-694d95e86143?q=80&w=500"} className="w-full h-full object-cover rounded-lg" onError={(e)=>{e.target.src="https://images.unsplash.com/photo-1579294800821-694d95e86143?q=80&w=500";}} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-black text-[#1E2229]">{u.no_lambung}</td>
                    <td className="py-3.5 px-5 text-gray-800">{u.nama_alat}</td>
                    <td className="py-3.5 px-5 text-gray-400 font-medium">{u.spesifikasi}</td>
                    <td className="py-3.5 px-5 text-[#D99B00] font-black">Rp {Number(u.tarif_per_hari).toLocaleString('id-ID')}</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-green-50 text-green-700">{u.status_unit}</span>
                    </td>
                    {punyaAksesSistem && (
                      <td className="py-3.5 px-5 text-center space-x-2">
                        <button onClick={() => { setIsEditMode(true); setFormAlat(u); setSelectedFile(null); setShowModal(true); }} className="text-gray-400 hover:text-[#D99B00] transition-colors"><Edit2 size={13} /></button>
                        <button onClick={() => handleHapusAlat(u.no_lambung)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SUB-HALAMAN 2: TABEL OPERATOR & MEKANIK */}
        {activeTab === 'pekerja' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Nama Lengkap</th>
                  <th className="py-3 px-5">Peran</th>
                  <th className="py-3 px-5">Lisensi SIO</th>
                  <th className="py-3 px-5">Gaji / Shift</th>
                  <th className="py-3 px-5 text-center">Status Tugas</th>
                  {punyaAksesSistem && <th className="py-3 px-5 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-bold text-[#1E2229]">
                {daftarPekerja.map(p => (
                  <tr key={p.id_pekerja} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-black text-gray-800">{p.nama_pekerja}</td>
                    <td className="py-3.5 px-5"><span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700 uppercase">{p.peran}</span></td>
                    <td className="py-3.5 px-5 text-gray-400 font-medium">{p.spesialisasi_sio || '-'}</td>
                    <td className="py-3.5 px-5 text-emerald-600 font-black">Rp {Number(p.gaji_per_shift).toLocaleString('id-ID')}</td>
                    {/* REVISI WARNA STATUS: SIAP (HIJAU), BERTUGAS (KUNING/EMAS), IZIN/SAKIT (MERAH) */}
<td className="py-3.5 px-5 text-center">
  <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${
    p.status_tugas === 'Siap' ? 'bg-green-100 text-green-800 border-green-200' :
    p.status_tugas === 'Bertugas' ? 'bg-amber-100 text-amber-800 border-amber-200' :
    'bg-red-100 text-red-800 border-red-200'
  }`}>
    {p.status_tugas || "Siap"}
  </span>
</td>
                    {punyaAksesSistem && (
                      <td className="py-3.5 px-5 text-center space-x-2">
                        <button 
  onClick={() => { 
    setIsEditMode(true); 
    setFormPekerja({
      id_pekerja: p.id_pekerja,
      nama_pekerja: p.nama_pekerja,
      peran: p.peran || 'Operator',
      spesialisasi_sio: p.spesialisasi_sio || '',
      gaji_per_shift: p.gaji_per_shift || '',
      status_tugas: p.status_tugas || 'Siap' // <--- Mengunci status asli database (termasuk Izin/Sakit)
    }); 
    setShowModal(true); 
  }} 
  className="text-gray-400 hover:text-[#D99B00] transition-colors"
>
  <Edit2 size={13} />
</button>
                        <button onClick={() => handleHapusPekerja(p.id_pekerja)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SUB-HALAMAN 3: TABEL MANAJEMEN PENGGUNA */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Username</th>
                  <th className="py-3 px-5">Nama Lengkap Anggota</th>
                  <th className="py-3 px-5">Hak Akses (Role)</th>
                  {punyaAksesSistem && <th className="py-3 px-5 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-bold text-[#1E2229]">
                {daftarUsers.map(usr => (
                  <tr key={usr.id_user} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-5 text-gray-400 font-mono">@{usr.username}</td>
                    <td className="py-3.5 px-5 font-black text-gray-800">{usr.nama_lengkap}</td>
                    <td className="py-3.5 px-5"><span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-700 uppercase">{usr.role}</span></td>
                    {punyaAksesSistem && (
                      <td className="py-3.5 px-5 text-center space-x-2">
                        <button onClick={() => { setIsEditMode(true); setFormUser({ id_user: usr.id_user, username: usr.username, password: '', nama_lengkap: usr.nama_lengkap, role: usr.role }); setShowModal(true); }} className="text-gray-400 hover:text-[#D99B00] transition-colors"><Edit2 size={13} /></button>
                        {usr.role !== 'Super Admin' ? (
                          <button onClick={() => handleHapusUser(usr.id_user)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                        ) : <span className="text-[10px] text-gray-300 italic">Protected</span>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================= LAYOUT WINDOW FORM MODAL ======================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-3xl w-full overflow-hidden">
            <div className="bg-[#1E2229] p-4 text-white flex items-center justify-between border-b border-[#D99B00]">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#FFB800]">{isEditMode ? '⚙️ Mode Perbaikan Data' : '✨ Registrasi Arsip Baru'}</h3>
              <button onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            {/* FORM 1: ASET ALAT BERAT (CLEAN FIXED KEY SPECIFICATION) */}
            {activeTab === 'alat' && (
              <form onSubmit={handleSubmitAlat} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 text-xs font-semibold text-gray-600">
                <div className="md:col-span-7 space-y-3.5">
                  <div><label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">No Lambung</label><input type="text" required disabled={isEditMode} placeholder="EX-01" value={formAlat.no_lambung} onChange={e => setFormAlat({...formAlat, no_lambung: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none font-black text-gray-700 disabled:opacity-40" /></div>
                  <div><label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Nama Kendaraan Alat</label><input type="text" required placeholder="Excavator CAT 320" value={formAlat.nama_alat} onChange={e => setFormAlat({...formAlat, nama_alat: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* FIXED INPUT FIELD: BEBAS DARI TYPO SPECIFICATIONS */}
                    <div>
                      <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Spesifikasi</label>
                      <input type="text" required placeholder="Bucket 1.2m3" value={formAlat.spesifikasi} onChange={e => setFormAlat({...formAlat, spesifikasi: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                    </div>
                    <div><label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Tarif / Hari (Rp)</label><input type="number" required placeholder="2000000" value={formAlat.tarif_per_hari} onChange={e => setFormAlat({...formAlat, tarif_per_hari: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" /></div>
                  </div>
                  <div><label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Status Operasional</label><select value={formAlat.status_unit} onChange={e => setFormAlat({...formAlat, status_unit: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none font-bold text-gray-700"><option value="Ready">Ready</option><option value="On-Site">On-Site</option><option value="Maintenance">Maintenance</option></select></div>
                  
                  {/* UPLOAD FILE DARI LAPTOP SYSTEM */}
                  <div>
                    <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Ambil Gambar Dari Laptop</label>
                    <div className="relative w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex items-center justify-between">
                      <span className="text-gray-400 truncate max-w-[200px] font-mono">{formAlat.foto_url || "Belum ada file..."}</span>
                      <label className="cursor-pointer bg-[#1E2229] text-[#FFB800] px-3 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1 hover:bg-black transition-all">
                        <UploadCloud size={12} />
                        Pilih Berkas Foto
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5 flex flex-col justify-between">
                  <div>
                    <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase text-center">Pratinjau Foto Pilihan</label>
                    <div className="w-full h-44 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                      {selectedFile ? (
                        <img src={URL.createObjectURL(selectedFile)} className="w-full h-full object-cover" />
                      ) : formAlat.foto_url ? (
                        <img src={`/images/${formAlat.foto_url}`} className="w-full h-full object-cover" onError={(e)=>{e.target.src="https://images.unsplash.com/photo-1579294800821-694d95e86143?q=80&w=500";}} />
                      ) : <div className="text-center text-gray-400"><ImageIcon size={24} /><p className="text-[10px] mt-1">Kosong</p></div>}
                    </div>
                  </div>
                  <button type="submit" className="w-full mt-4 bg-[#1E2229] text-[#FFB800] p-3 rounded-xl font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 hover:bg-black transition-colors"><Save size={14} /><span>Simpan Perubahan</span></button>
                </div>
              </form>
            )}

            {/* FORM 2: TIM PEKERJA (BERSIH TOTAL DARI IZIN/SAKIT) */}
            {activeTab === 'pekerja' && (
              <form onSubmit={handleSubmitPekerja} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-semibold text-gray-600">
                <div className="space-y-3.5">
                  <div><label className="block mb-1 text-[9px] font-black uppercase text-gray-400">Nama Lengkap Personil</label><input type="text" required placeholder="Budi Santoso" value={formPekerja.nama_pekerja} onChange={e => setFormPekerja({...formPekerja, nama_pekerja: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" /></div>
                  <div><label className="block mb-1 text-[9px] font-black uppercase text-gray-400">Klasifikasi Peran</label><select value={formPekerja.peran} onChange={e => setFormPekerja({...formPekerja, peran: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none font-bold text-gray-700"><option value="Operator">Operator</option><option value="Mekanik">Mekanik</option></select></div>
                  <div><label className="block mb-1 text-[9px] font-black uppercase text-gray-400">Lisensi Surat SIO</label><input type="text" placeholder="SIO Kelas I Excavator" value={formPekerja.spesialisasi_sio} onChange={e => setFormPekerja({...formPekerja, spesialisasi_sio: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" /></div>
                </div>
                <div className="space-y-3.5 flex flex-col justify-between">
                  <div className="space-y-3.5">
                    <div><label className="block mb-1 text-[9px] font-black uppercase text-gray-400">Gaji Per Shift (Rp)</label><input type="number" required placeholder="250000" value={formPekerja.gaji_per_shift} onChange={e => setFormPekerja({...formPekerja, gaji_per_shift: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none font-black text-emerald-600" /></div>
                    <div>
  <label className="block mb-1 text-[9px] font-black uppercase text-gray-400">Status Tugas</label>
  <select 
    value={formPekerja.status_tugas} 
    onChange={e => setFormPekerja({...formPekerja, status_tugas: e.target.value})} 
    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none font-bold text-gray-700"
  >
    <option value="Siap">Siap</option>
    <option value="Bertugas">Bertugas</option>
    <option value="Izin/Sakit">Izin/Sakit</option> 
  </select>
</div>
                  </div>
                  <button type="submit" className="w-full bg-[#1E2229] text-[#FFB800] p-3 rounded-xl font-black uppercase tracking-wider flex items-center justify-center space-x-1.5"><Save size={14} /><span>Simpan Profil</span></button>
                </div>
              </form>
            )}

            {/* FORM 3: MANAJEMEN PENGGUNA */}
            {activeTab === 'users' && (
              <form onSubmit={handleSubmitUser} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-semibold text-gray-600">
                <div className="space-y-3.5">
                  <div><label className="block mb-1 text-[9px] font-black uppercase text-gray-400">Username</label><input type="text" required disabled={isEditMode} placeholder="username_staf" value={formUser.username} onChange={e => setFormUser({...formUser, username: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" /></div>
                  <div><label className="block mb-1 text-[9px] font-black uppercase text-gray-400">Kata Sandi Akun</label><input type="text" placeholder="Password murni" value={formUser.password} onChange={e => setFormUser({...formUser, password: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none font-mono" /></div>
                </div>
                <div className="space-y-3.5 flex flex-col justify-between">
                  <div className="space-y-3.5">
                    <div><label className="block mb-1 text-[9px] font-black uppercase text-gray-400">Nama Lengkap</label><input type="text" required placeholder="Nama Staf Kantor" value={formUser.nama_lengkap} onChange={e => setFormUser({...formUser, nama_lengkap: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" /></div>
                    <div><label className="block mb-1 text-[9px] font-black uppercase text-gray-400">Level Hak Akses (Role)</label><select value={formUser.role} onChange={e => setFormUser({...formUser, role: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none font-bold text-gray-700"><option value="Super Admin">Super Admin</option><option value="Admin">Admin</option><option value="Finance">Finance</option><option value="Lapangan">Lapangan</option><option value="Mekanik">Mekanik</option></select></div>
                  </div>
                  <button type="submit" className="w-full bg-[#1E2229] text-[#FFB800] p-3 rounded-xl font-black uppercase tracking-wider flex items-center justify-center space-x-1.5"><Save size={14} /><span>Kunci Hak Akses</span></button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}