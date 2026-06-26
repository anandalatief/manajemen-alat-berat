import React, { useState, useEffect } from 'react';
import { Fuel, Save, Edit3, Trash2, X } from 'lucide-react';
import axios from 'axios';

export default function AktivitasHarian() {
  const [logs, setLogs] = useState([]);
  const [listAlat, setListAlat] = useState([]);
  const [contracts, setContracts] = useState([]);
  
  // State Kontrol Modal Edit Log
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const [form, setForm] = useState({ 
    id_kontrak: '', tanggal_log: '', hm_pakai_hari_ini: '', liter_bbm: '', biaya_bbm_nota: '', catatan_lapangan: 'Aman' 
  });

  const muatDataHarian = async () => {
    try {
      const [resTrx, resLog, resAlat] = await Promise.all([
  axios.get('http://localhost:5000/api/transaksi'),
  axios.get('http://localhost:5000/api/log-harian'),
  axios.get('http://localhost:5000/api/alat-berat') // <-- Tambahkan ini
]);
setListAlat(resAlat.data || []); // <-- Tambahkan ini

      setContracts(resTrx.data);
      setLogs(resLog.data);

      const unitSedangKerja = resTrx.data.filter(c => {
        const stat = String(c.status_transaksi || '').trim().toLowerCase();
        return stat === 'jalan' || stat === 'on-site';
      });

      if (unitSedangKerja.length > 0) {
        setForm(f => ({ ...f, id_kontrak: unitSedangKerja[0].id_kontrak }));
      } else {
        setForm(f => ({ ...f, id_kontrak: '' }));
      }
    } catch (err) { 
      console.error("Gagal memuat aktivitas harian:", err); 
    }
  };

  useEffect(() => { muatDataHarian(); }, []);

  const handleSimpanLog = async (e) => {
    e.preventDefault();
    if (!form.id_kontrak) return alert("Tidak ada antrean kontrak unit on-site yang aktif untuk dilaporkan!");
    
    try {
      const payloadLogAman = {
        ...form,
        tanggal_log: form.tanggal_log ? String(form.tanggal_log).substring(0, 10) : null
      };

      const respon = await axios.post('http://localhost:5000/api/log-harian', payloadLogAman);
      alert(respon.data.message);
      
      setForm(f => ({
        ...f,
        tanggal_log: '',
        hm_pakai_hari_ini: '',
        liter_bbm: '',
        biaya_bbm_nota: '',
        catatan_lapangan: 'Aman'
      }));
      muatDataHarian();
    } catch (err) { 
      alert("Gagal menyimpan log harian"); 
    }
  };

  // Handler Hapus/Batal Log Laporan
  const handleHapusLog = async (id_log) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus laporan operasional harian ini?")) return;
    try {
      const respon = await axios.delete(`http://localhost:5000/api/log-harian/${id_log}`);
      alert(respon.data.message);
      muatDataHarian();
    } catch (err) {
      alert("Gagal menghapus catatan log harian.");
    }
  };

  // Handler Submit Perubahan Edit Log Larian
  const handleSimpanEditLog = async (e) => {
    e.preventDefault();
    try {
      const payloadAmanEdit = {
        ...editForm,
        tanggal_log: editForm.tanggal_log ? String(editForm.tanggal_log).substring(0, 10) : null
      };

      const respon = await axios.put(`http://localhost:5000/api/log-harian/${editForm.id_log}`, payloadAmanEdit);
      alert(respon.data.message);
      setIsEditMode(false);
      setEditForm(null);
      muatDataHarian();
    } catch (err) {
      alert("Gagal memperbarui catatan log harian.");
    }
  };

  const listUnitOnSite = contracts.filter(c => {
    const stat = String(c.status_transaksi || '').trim().toLowerCase();
    
    if (stat === 'jalan' || stat === 'on-site') return true;
    
    if (stat === 'aktif') {
      const hariIniStr = new Date().toLocaleDateString('sv-SE');
      const waktuHariIni = new Date(hariIniStr + "T00:00:00").getTime();
      const tglMulaiMurni = String(c.tanggal_mulai || '').substring(0, 10);
      const waktuMulaiSewa = new Date(tglMulaiMurni + "T00:00:00").getTime();
      return waktuHariIni >= waktuMulaiSewa;
    }
    return false;
  });

  const formatTanggalLog = (dateStr) => {
    if (!dateStr) return "-";
    return String(dateStr).substring(0, 10);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6 space-y-5 animate-fadeIn max-w-screen-2xl mx-auto text-xs font-semibold text-gray-600">
      <div>
        <h2 className="text-sm font-black text-[#1E2229] uppercase tracking-wide">Log Aktivitas Operasional Harian</h2>
        <p className="text-xs text-gray-400 font-medium">Pengawasan jam kerja mesin pengawas (HM) harian dan akumulasi pengisian BBM solar armada lapangan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PANEL INPUT LAPORAN (KIRI) */}
        <form onSubmit={handleSimpanLog} className="lg:col-span-4 bg-gray-50/60 p-4 rounded-xl border border-gray-200 space-y-3 text-xs font-semibold text-gray-600">
          <h3 className="font-black text-gray-700 uppercase tracking-wide flex items-center border-b pb-1.5"><Fuel size={14} className="mr-1.5 text-amber-500" /> Pencatatan Operasional</h3>
          
          <div>
            <label className="block text-[9px] uppercase text-gray-400 font-bold mb-1">Pilih ID Kontrak Bertugas (On-Site)</label>
            <select 
  value={form.id_kontrak} 
  onChange={e => setForm({...form, id_kontrak: e.target.value})} 
  className="w-full p-2 bg-white border border-gray-200 rounded-lg font-bold text-gray-700 focus:outline-none text-xs"
>
  {listUnitOnSite.length === 0 ? (
    <option value="">-- Tidak ada armada di lapangan --</option>
  ) : (
    <>
      <option value="">-- Pilih Armada --</option>
      {listUnitOnSite.map(c => {
        const idTampil = c.id_kontrak && c.id_kontrak.includes('-') ? c.id_kontrak.split('-')[1] : c.id_kontrak;
        
        // LOGIKA GABUNGAN UNTUK DROPDOWN
        const alat = listAlat.find(a => a.no_lambung === c.no_lambung);
        const displayUnit = alat ? `${c.no_lambung} - ${alat.nama_alat}` : c.no_lambung;

        return (
          <option key={c.id_kontrak} value={c.id_kontrak}>
            #{idTampil} - {c.penyewa} ({displayUnit})
          </option>
        );
      })}
    </>
  )}
</select>
          </div>

          <div>
            <label className="block text-[9px] uppercase text-gray-400 font-bold mb-1">Tanggal Hari Operasional</label>
            <input type="date" required value={form.tanggal_log} onChange={e => setForm({...form, tanggal_log: e.target.value})} className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] uppercase text-gray-400 font-bold mb-1">HM Terpakai (Jam)</label>
              <input type="number" required placeholder="Contoh: 8" value={form.hm_pakai_hari_ini} onChange={e => setForm({...form, hm_pakai_hari_ini: e.target.value})} className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:outline-none font-mono" />
            </div>
            <div>
              <label className="block text-[9px] uppercase text-gray-400 font-bold mb-1">Solar Diisi (Liter)</label>
              <input type="number" required placeholder="Contoh: 60" value={form.liter_bbm} onChange={e => setForm({...form, liter_bbm: e.target.value})} className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:outline-none font-mono" />
            </div>
          </div>

          <div>
            <label className="block text-[9px] uppercase text-gray-400 font-bold mb-1">Total Pengeluaran Uang Solar (Rp)</label>
            <input type="number" required placeholder="870000" value={form.biaya_bbm_nota} onChange={e => setForm({...form, biaya_bbm_nota: e.target.value})} className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:outline-none font-bold" />
          </div>

          <div>
            <label className="block text-[9px] uppercase text-gray-400 font-bold mb-1">Catatan Keadaan Lapangan</label>
            <input type="text" placeholder="Contoh: Aman, cuaca cerah" value={form.catatan_lapangan} onChange={e => setForm({...form, catatan_lapangan: e.target.value})} className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:outline-none" />
          </div>

          <button 
            type="submit" 
            disabled={listUnitOnSite.length === 0}
            className="w-full bg-[#1E2229] disabled:bg-gray-300 text-[#FFB800] disabled:text-gray-400 p-2.5 rounded-lg font-black uppercase text-[11px] shadow flex items-center justify-center space-x-1.5 transition-all hover:bg-[#2D333F]"
          >
            <Save size={12} />
            <span>Simpan Laporan Harian</span>
          </button>
        </form>

        {/* MONITORING TABEL LAPORAN LOG + COMBAT BUTTONS (KANAN) */}
        <div className="lg:col-span-8 overflow-x-auto border border-gray-100 rounded-xl shadow-inner">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#1E2229] text-white uppercase text-[9px] font-black">
              <tr>
                <th className="p-3 pl-4">Tanggal Log</th>
                <th className="p-3">ID Kontrak</th>
                <th className="p-3">Durasi Kerja</th>
                <th className="p-3">Pengeluaran Solar</th>
                <th className="p-3">Kondisi Lapangan</th>
                <th className="p-3 pr-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-semibold text-gray-700 bg-white text-[11px]">
  {logs.length === 0 ? (
    <tr><td colSpan="6" className="p-6 text-center text-gray-400 italic">Belum ada laporan aktivitas harian masuk...</td></tr>
  ) : (
    logs.map(l => {
      const idTampilTable = l.id_kontrak && l.id_kontrak.includes('-') ? l.id_kontrak.split('-')[1] : l.id_kontrak;
      
      // 🎯 MENCARI DATA KONTRAK & ALAT UNTUK DITAMPILKAN
      const k = contracts.find(x => x.id_kontrak === l.id_kontrak) || {};
      const alat = listAlat.find(a => a.no_lambung === k.no_lambung);
      const infoUnit = alat ? `${k.no_lambung || 'N/A'} - ${alat.nama_alat}` : (k.no_lambung || 'Unit N/A');

      return (
        <tr key={l.id_log} className="hover:bg-gray-50/50 transition-colors">
          <td className="p-3 pl-4 font-black text-[#1E2229]">{formatTanggalLog(l.tanggal_log)}</td>
          
          {/* 🎯 KOLOM GABUNGAN NO LAMBUNG & NAMA ALAT */}
          <td className="p-3">
            <div className="font-black text-amber-700">{infoUnit}</div>
            <div className="text-[10px] text-gray-400 font-mono font-bold">#{idTampilTable}</div>
          </td>
          
          <td className="p-3 font-bold text-blue-600 font-mono">⏱{l.hm_pakai_hari_ini} HM</td>
          <td className="p-3">
            <div className="font-bold text-gray-800">{l.liter_bbm} Liter</div>
            <div className="text-[10px] text-red-600 font-black">Rp {Number(l.biaya_bbm_nota || 0).toLocaleString('id-ID')}</div>
          </td>
          <td className="p-3 text-gray-500 font-medium max-w-[120px] truncate" title={l.catatan_lapangan}>
            {l.catatan_lapangan || 'Aman'}
          </td>
          <td className="p-3 pr-4 text-center space-x-2.5">
            {/* Tombol Aksi tetap sama */}
            <button type="button" onClick={() => { setEditForm({ ...l, tanggal_log: formatTanggalLog(l.tanggal_log) }); setIsEditMode(true); }} className="text-gray-400 hover:text-amber-500" title="Revisi Log"><Edit3 size={13} /></button>
            <button type="button" onClick={() => handleHapusLog(l.id_log)} className="text-gray-400 hover:text-red-500" title="Hapus Laporan"><Trash2 size={13} /></button>
          </td>
        </tr>
      );
    })
  )}
</tbody>
          </table>
        </div>

      </div>

      {/* =========================================================================
          MODAL REVISI LOG OPRASIONAL HARIAN (ANTI BUG TIMEOUT)
          ========================================================================= */}
      {isEditMode && editForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden border border-gray-300">
            <div className="p-4 bg-[#1E2229] text-white flex justify-between items-center border-b border-[#FFB800]">
              <h3 className="font-black uppercase tracking-wider text-xs text-[#FFB800]">Koreksi Log Operasional</h3>
              <button type="button" onClick={() => { setIsEditMode(false); setEditForm(null); }} className="text-white hover:text-red-400"><X size={16}/></button>
            </div>
            
            <form onSubmit={handleSimpanEditLog} className="p-4 space-y-3.5 text-xs font-semibold text-gray-600">
              <div>
                <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Tanggal Log</label>
                <input type="date" required value={editForm.tanggal_log || ''} onChange={e => setEditForm({...editForm, tanggal_log: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">HM Terpakai (Jam)</label>
                  <input type="number" required value={editForm.hm_pakai_hari_ini || 0} onChange={e => setEditForm({...editForm, hm_pakai_hari_ini: Number(e.target.value)})} className="w-full p-2 bg-gray-50 border rounded-lg font-mono font-bold" />
                </div>
                <div>
                  <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Solar Diisi (Liter)</label>
                  <input type="number" required value={editForm.liter_bbm || 0} onChange={e => setEditForm({...editForm, liter_bbm: Number(e.target.value)})} className="w-full p-2 bg-gray-50 border rounded-lg font-mono font-bold" />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Total Biaya Solar (Rp)</label>
                <input type="number" required value={editForm.biaya_bbm_nota || 0} onChange={e => setEditForm({...editForm, biaya_bbm_nota: Number(e.target.value)})} className="w-full p-2 bg-gray-50 border rounded-lg font-bold text-gray-800" />
              </div>
              <div>
                <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Catatan Lapangan</label>
                <input type="text" value={editForm.catatan_lapangan || ''} onChange={e => setEditForm({...editForm, catatan_lapangan: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg" />
              </div>

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