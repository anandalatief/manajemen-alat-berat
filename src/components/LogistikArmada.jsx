import React, { useState, useEffect } from 'react';
import { Truck, Clipboard, Save, ArrowUpRight, ArrowDownLeft, Edit3, Trash2, X } from 'lucide-react';
import axios from 'axios';

export default function LogistikArmada() {
  const [tickets, setTickets] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [listAlat, setListAlat] = useState([]); // <--- Tambahkan ini
  const [activeTab, setActiveTab] = useState('keluar');

  // State Kontrol Modal Edit
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // State Form Mobilisasi (Keluar) Sesuai Database Fisik
  const [formKeluar, setFormKeluar] = useState({
    id_kontrak: '', tanggal_keluar: '', nama_supir_towing: '', ongkos_angkut_towing: '', hm_awal: ''
  });

  // State Form Demobilisasi (Masuk Pool) Sesuai Database Fisik
  const [formKembali, setFormKembali] = useState({
    id_kontrak: '', tanggal_masuk: '', hm_akhir: ''
  });

  const muatDataInisial = async () => {
    try {
      const [resTrx, resSurat, resAlat] = await Promise.all([
        axios.get('http://localhost:5000/api/transaksi'),
        axios.get('http://localhost:5000/api/surat-jalan'),
        axios.get('http://localhost:5000/api/alat-berat') // <--- Tambahkan ini
      ]);

      setContracts(resTrx.data);
      setTickets(resSurat.data);
      setListAlat(resAlat.data); // <--- Tambahkan ini

      setFormKeluar(f => ({ ...f, id_kontrak: '' }));
      setFormKembali(f => ({ ...f, id_kontrak: '' }));
    } catch (err) {
      console.error("Gagal memuat logistik:", err);
    }
  };

  useEffect(() => { muatDataInisial(); }, []);

  const handleMobilisasi = async (e) => {
    e.preventDefault();
    if (!formKeluar.id_kontrak) return alert("Silakan pilih kontrak terlebih dahulu!");
    try {
      const payloadAmanKeluar = {
        ...formKeluar,
        tanggal_keluar: formKeluar.tanggal_keluar ? String(formKeluar.tanggal_keluar).substring(0, 10) : null
      };

      const respon = await axios.post('http://localhost:5000/api/surat-jalan', payloadAmanKeluar);
      alert(respon.data.message);
      setFormKeluar({ id_kontrak: '', tanggal_keluar: '', nama_supir_towing: '', ongkos_angkut_towing: '', hm_awal: '' });
      muatDataInisial();
    } catch (err) {
      alert("Gagal menerbitkan surat jalan keluar");
    }
  };

  const handleDemobilisasi = async (e) => {
    e.preventDefault();
    if (!formKembali.id_kontrak) return alert("Silakan pilih kontrak yang akan dikembalikan!");
    try {
      const payloadAmanMasuk = {
        ...formKembali,
        tanggal_masuk: formKembali.tanggal_masuk ? String(formKembali.tanggal_masuk).substring(0, 10) : null
      };

      const respon = await axios.put(`http://localhost:5000/api/surat-jalan-kembali/${formKembali.id_kontrak}`, payloadAmanMasuk);
      alert(respon.data.message);
      setFormKembali({ id_kontrak: '', tanggal_masuk: '', hm_akhir: '' });
      muatDataInisial();
    } catch (err) {
      alert("Gagal memproses surat pengembalian");
    }
  };

  const handleHapusManifes = async (id_surat_jalan, id_kontrak) => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan manifes perjalanan ini?")) return;
    try {
      const respon = await axios.delete(`http://localhost:5000/api/surat-jalan/${id_surat_jalan}/${id_kontrak}`);
      alert(respon.data.message);
      muatDataInisial();
    } catch (err) {
      alert("Gagal membatalkan manifes logistik.");
    }
  };

  const handleSimpanEditManifes = async (e) => {
    e.preventDefault();
    try {
      const payloadAman = {
        ...editForm,
        tanggal_keluar: editForm.tanggal_keluar ? String(editForm.tanggal_keluar).substring(0, 10) : null,
        tanggal_masuk: editForm.tanggal_masuk ? String(editForm.tanggal_masuk).substring(0, 10) : null
      };

      const respon = await axios.put(`http://localhost:5000/api/surat-jalan/${editForm.id_surat_jalan}`, payloadAman);
      
      if (editForm.status_mobilisasi === 'Demobilisasi') {
        await axios.put(`http://localhost:5000/api/surat-jalan-kembali/${editForm.id_kontrak}`, {
          tanggal_masuk: payloadAman.tanggal_masuk,
          hm_akhir: Number(editForm.hm_akhir) || 0
        });
      }

      alert(respon.data.message || "Data manifes berhasil diperbarui!");
      setIsEditMode(false);
      setEditForm(null);
      muatDataInisial();
    } catch (err) {
      alert("Gagal memperbarui data manifes secara global.");
    }
  };

  const formatTanggal = (dateStr) => {
    if (!dateStr) return "-";
    return String(dateStr).substring(0, 10);
  };

  // Letak: Di dalam komponen LogistikArmada, sebelum bagian 'return'
const listKontrakBelumKirim = contracts.filter(c => {
  const stat = String(c.status_transaksi || '').trim().toLowerCase();
  const sudahAdaManifes = tickets.some(t => t.id_kontrak === c.id_kontrak);
  
  // LOGIKA BARU: 
  // Hanya tampilkan jika status 'aktif'/'ready', belum ada manifes, DAN status bukan 'jalan'/'on-site'
  return (stat === 'aktif' || stat === 'ready' || stat === '') && !sudahAdaManifes && stat !== 'jalan' && stat !== 'on-site';
});

  const listKontrakSedangJalan = contracts.filter(c => {
    const stat = String(c.status_transaksi || '').trim().toLowerCase();
    return stat === 'jalan' || stat === 'on-site';
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6 space-y-5 max-w-screen-2xl mx-auto text-xs font-semibold text-gray-600">
      <div>
        <h2 className="text-sm font-black text-[#1E2229] uppercase tracking-wide">Manajemen Logistik & sirkulasi Fleet</h2>
        <p className="text-xs text-gray-400">Penerbitan manifes keberangkatan unit ke lapangan (Mobilisasi) & kepulangan armada ke pool (Demobilisasi).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FORM KONTROL (KIRI) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1.5 rounded-xl border">
            <button
              type="button"
              onClick={() => setActiveTab('keluar')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'keluar' ? 'bg-[#1E2229] text-[#FFB800] shadow' : 'text-gray-500'}`}
            >
              <ArrowUpRight size={12} /> Mobilisasi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('kembali')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'kembali' ? 'bg-[#1E2229] text-[#FFB800] shadow' : 'text-gray-500'}`}
            >
              <ArrowDownLeft size={12} /> Demobilisasi
            </button>
          </div>

          {activeTab === 'keluar' ? (
            <form onSubmit={handleMobilisasi} className="bg-gray-50/60 p-4 rounded-xl border space-y-3">
              <h3 className="font-black text-gray-700 uppercase tracking-wide flex items-center border-b pb-1.5"><Truck size={13} className="mr-1 text-blue-500" /> Manifes Keluar Pool</h3>
              <div>
                <label className="block text-[9px] uppercase text-gray-400 font-bold mb-1">Pilih ID Kontrak</label>
                <select 
                  value={formKeluar.id_kontrak} 
                  onChange={e => setFormKeluar({...formKeluar, id_kontrak: e.target.value})} 
                  className="w-full p-2 bg-white border rounded-lg font-bold text-gray-700 focus:outline-none text-xs"
                >
                  <option value="">-- Pilih Antrean Kontrak --</option>
                  {listKontrakBelumKirim.map(c => {
  const idTampil = c.id_kontrak.includes('-') ? c.id_kontrak.split('-')[1] : c.id_kontrak;
  // Cari nama alat dari listAlat berdasarkan no_lambung kontrak
  const alat = listAlat.find(a => a.no_lambung === c.no_lambung);
  const display = alat ? `${c.no_lambung} - ${alat.nama_alat}` : c.no_lambung;

  return (
    <option key={c.id_kontrak} value={c.id_kontrak}>
      #{idTampil} - {c.penyewa || 'Tanpa Nama'} (Unit: {display})
    </option>
  );
})}
                </select>
              </div>
              <div><label className="block text-[9px] uppercase text-gray-400 font-bold mb-1">Tanggal Keluar Pool</label><input type="date" required value={formKeluar.tanggal_keluar} onChange={e => setFormKeluar({...formKeluar, tanggal_keluar: e.target.value})} className="w-full p-2 bg-white border rounded-lg focus:outline-none text-xs" /></div>
              <div><label className="block text-[9px] uppercase text-gray-400 font-bold mb-1">Vendor Truk Towing</label><input type="text" required placeholder="Contoh: Andra Towing" value={formKeluar.nama_supir_towing} onChange={e => setFormKeluar({...formKeluar, nama_supir_towing: e.target.value})} className="w-full p-2 bg-white border rounded-lg focus:outline-none text-xs" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-[9px] uppercase text-gray-400 font-bold mb-1">Ongkos Towing (Rp)</label><input type="number" required placeholder="0" value={formKeluar.ongkos_angkut_towing} onChange={e => setFormKeluar({...formKeluar, ongkos_angkut_towing: e.target.value})} className="w-full p-2 bg-white border rounded-lg focus:outline-none font-bold text-xs" /></div>
                <div><label className="block text-[9px] uppercase text-gray-400 font-bold mb-1">HM Awal Mesin</label><input type="number" required placeholder="0" value={formKeluar.hm_awal} onChange={e => setFormKeluar({...formKeluar, hm_awal: e.target.value})} className="w-full p-2 bg-white border rounded-lg focus:outline-none font-mono text-xs" /></div>
              </div>
              <button type="submit" disabled={listKontrakBelumKirim.length === 0} className="w-full bg-[#1E2229] disabled:bg-gray-300 text-[#FFB800] disabled:text-gray-400 p-2.5 rounded-lg font-black uppercase text-[10px] shadow flex items-center justify-center space-x-1"><Clipboard size={12} /> <span>Validasi Keberangkatan</span></button>
            </form>
          ) : (
            <form onSubmit={handleDemobilisasi} className="bg-amber-50/40 p-4 rounded-xl border border-amber-200 space-y-3">
              <h3 className="font-black text-amber-800 uppercase tracking-wide flex items-center border-b border-amber-200 pb-1.5"><Truck size={13} className="mr-1 text-amber-600" /> Manifes Kembali Pool</h3>
              <div>
                <label className="block text-[9px] uppercase text-amber-700 font-bold mb-1">Pilih Unit Sedang On Site</label>
                <select 
                  value={formKembali.id_kontrak} 
                  onChange={e => setFormKembali({...formKembali, id_kontrak: e.target.value})} 
                  className="w-full p-2 bg-white border border-amber-200 rounded-lg font-bold text-gray-700 focus:outline-none text-xs"
                >
                  <option value="">-- Pilih Unit Kembali Pool --</option>
                  {listKontrakSedangJalan.map(c => {
  const idTampil = c.id_kontrak.includes('-') ? c.id_kontrak.split('-')[1] : c.id_kontrak;
  // Cari nama alat dari listAlat
  const alat = listAlat.find(a => a.no_lambung === c.no_lambung);
  const display = alat ? `${c.no_lambung} - ${alat.nama_alat}` : c.no_lambung;

  return (
    <option key={c.id_kontrak} value={c.id_kontrak}>
      #{idTampil} - {c.penyewa} (Unit: {display})
    </option>
  );
})}
                </select>
              </div>
              <div><label className="block text-[9px] uppercase text-amber-700 font-bold mb-1">Tanggal Masuk Pool</label><input type="date" required value={formKembali.tanggal_masuk} onChange={e => setFormKembali({...formKembali, tanggal_masuk: e.target.value})} className="w-full p-2 bg-white border border-amber-200 rounded-lg focus:outline-none text-xs" /></div>
              <div><label className="block text-[9px] uppercase text-amber-700 font-bold mb-1">HM Akhir Mesin</label><input type="number" required placeholder="0" value={formKembali.hm_akhir} onChange={e => setFormKembali({...formKembali, hm_akhir: e.target.value})} className="w-full p-2 bg-white border border-amber-200 rounded-lg focus:outline-none font-mono font-bold text-xs" /></div>
              <button type="submit" disabled={listKontrakSedangJalan.length === 0} className="w-full bg-[#1E2229] disabled:bg-gray-300 text-[#FFB800] disabled:text-gray-400 p-2.5 rounded-lg font-black uppercase text-[10px] shadow flex items-center justify-center space-x-1"><Save size={12} /> <span>Konfirmasi Unit Kembali</span></button>
            </form>
          )}
        </div>

        {/* TABEL MONITORING (KANAN) */}
        <div className="lg:col-span-8 overflow-x-auto border border-gray-100 rounded-xl shadow-inner">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#1E2229] text-white uppercase text-[9px] font-black">
              <tr>
                <th className="p-2.5 pl-3">ID Kontrak</th>
                <th className="p-2.5">Armada & Alat Berat</th>
                <th className="p-2.5">Manifes Mobilisasi (Kirim)</th>
                <th className="p-2.5">Manifes Demobilisasi (Pulang)</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-semibold text-gray-700 bg-white text-[11px]">
              {tickets.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-400 italic">Belum ada sirikulasi logistik armada...</td></tr>
              ) : (
                tickets.map(t => {
  const k = contracts.find(x => x.id_kontrak === t.id_kontrak) || {};
  const a = listAlat.find(x => x.no_lambung === k.no_lambung);
  const infoUnit = a ? `${k.no_lambung} - ${a.nama_alat}` : (k.no_lambung || 'Unit N/A');
  
  return (
    <tr key={t.id_surat_jalan} className="hover:bg-gray-50/50 transition-colors">
      <td className="p-2.5 pl-3 font-black text-[#1E2229]">#{t.id_kontrak?.split('-')[1] || t.id_kontrak}</td>
      <td className="p-2.5">
        <div className="font-black text-amber-700">{infoUnit}</div>
        <div className="text-[10px] text-gray-400 font-medium">Klien: {k.penyewa || '-'}</div>
      </td>
      {/* ... sisanya (kolom manifes, status, aksi) biarkan seperti kode aslimu ... */}
                      <td className="p-2.5">
                        <div className="font-bold">{t.nama_supir_towing || 'Tanpa Vendor'}</div>
                        <div className="text-[10px] text-gray-400">Keluar: {formatTanggal(t.tanggal_keluar)}</div>
                        <div className="text-[10px] text-red-600 font-bold">Rp {Number(t.ongkos_angkut_towing || 0).toLocaleString('id-ID')}</div>
                        <div className="text-[10px] text-blue-600 font-mono"> {t.hm_awal || 0} HM</div>
                      </td>
                      <td className="p-2.5">
                        {(!t.tanggal_masuk || t.status_mobilisasi === 'Mobilisasi') ? (
                          <span className="text-gray-400 italic text-[10px]">Unit di site proyek...</span>
                        ) : (
                          <>
                            <div className="text-[10px] text-gray-800 font-bold">Armada Kembali Pool</div>
                            <div className="text-[10px] text-gray-400">Masuk: {formatTanggal(t.tanggal_masuk)}</div>
                            <div className="text-[10px] text-emerald-600 font-mono">⏱{t.hm_akhir || 0} HM (Akhir)</div>
                          </>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${t.status_mobilisasi === 'Demobilisasi' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'}`}>
                          {t.status_mobilisasi || 'Mobilisasi'}
                        </span>
                      </td>
                      <td className="p-2.5 text-center space-x-2">
                        <button 
                          type="button" 
                          onClick={() => { 
                            const ambilTglMurni = (str) => (str ? String(str).substring(0, 10) : '');
                            setEditForm({ 
                              ...t, 
                              status_mobilisasi: t.status_mobilisasi || 'Mobilisasi', 
                              tanggal_keluar: ambilTglMurni(t.tanggal_keluar), 
                              tanggal_masuk: ambilTglMurni(t.tanggal_masuk)
                            }); 
                            setIsEditMode(true); 
                          }}
                          className="text-gray-400 hover:text-amber-500"
                          title="Edit Manifes"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleHapusManifes(t.id_surat_jalan, t.id_kontrak)} 
                          className="text-gray-400 hover:text-red-500"
                          title="Batalkan Manifes"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL REVISI MANIFES SURAT JALAN */}
      {isEditMode && editForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden border border-gray-300">
            <div className="p-4 bg-[#1E2229] text-white flex justify-between items-center border-b border-[#FFB800]">
              <h3 className="font-black uppercase tracking-wider text-xs text-[#FFB800]">Koreksi Manifes Surat Jalan</h3>
              <button type="button" onClick={() => { setIsEditMode(false); setEditForm(null); }} className="text-white hover:text-red-400"><X size={16}/></button>
            </div>
            
            <form onSubmit={handleSimpanEditManifes} className="p-4 space-y-3.5 text-xs font-semibold text-gray-600">
              <div>
                <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Vendor Truk Towing</label>
                <input type="text" required value={editForm.nama_supir_towing || ''} onChange={e => setEditForm({...editForm, nama_supir_towing: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Ongkos Towing (Rp)</label>
                  <input type="number" required value={editForm.ongkos_angkut_towing || 0} onChange={e => setEditForm({...editForm, ongkos_angkut_towing: Number(e.target.value)})} className="w-full p-2 bg-gray-50 border rounded-lg font-bold" />
                </div>
                <div>
                  <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">HM Awal Mesin</label>
                  <input type="number" required value={editForm.hm_awal || 0} onChange={e => setEditForm({...editForm, hm_awal: Number(e.target.value)})} className="w-full p-2 bg-gray-50 border rounded-lg font-mono" />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Tanggal Keluar</label>
                <input type="date" required value={editForm.tanggal_keluar || ''} onChange={e => setEditForm({...editForm, tanggal_keluar: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
              </div>

              <div>
                <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Ubah Status Perjalanan</label>
                <select 
                  value={editForm.status_mobilisasi} 
                  onChange={e => setEditForm({...editForm, status_mobilisasi: e.target.value})}
                  className="w-full p-2 bg-gray-50 border rounded-lg font-bold text-gray-700 text-xs focus:outline-none"
                >
                  <option value="Mobilisasi">Mobilisasi (Masih di Lapangan)</option>
                  <option value="Demobilisasi">Demobilisasi (Sudah Pulang ke Pool)</option>
                </select>
              </div>

              {editForm.status_mobilisasi === 'Demobilisasi' && (
                <div className="border-t pt-3 space-y-3.5 border-dashed border-amber-300">
                  <div>
                    <label className="block mb-1 text-[9px] font-black text-amber-700 uppercase">Tanggal Masuk Pool</label>
                    <input type="date" required value={editForm.tanggal_masuk || ''} onChange={e => setEditForm({...editForm, tanggal_masuk: e.target.value})} className="w-full p-2 bg-amber-50/30 border border-amber-200 rounded-lg font-bold" />
                  </div>
                  <div>
                    <label className="block mb-1 text-[9px] font-black text-amber-700 uppercase">HM Akhir Mesin</label>
                    <input type="number" required value={editForm.hm_akhir || 0} onChange={e => setEditForm({...editForm, hm_akhir: Number(e.target.value)})} className="w-full p-2 bg-amber-50/30 border border-amber-200 rounded-lg font-mono font-bold" />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <button type="button" onClick={() => { setIsEditMode(false); setEditForm(null); }} className="flex-1 p-2 bg-gray-100 rounded-lg font-bold">Batal</button>
                <button type="submit" className="flex-1 p-2 bg-[#1E2229] text-[#FFB800] rounded-lg font-black uppercase shadow">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}