import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle2, Trash2, User, Edit3, X, Calendar, FileText, DollarSign } from 'lucide-react';
import axios from 'axios';

export default function WorkshopPemeliharaan() {
  const [repairs, setRepairs] = useState([]);
  const [listAlat, setListAlat] = useState([]);
  const [listMekanik, setListMekanik] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({ 
    no_lambung: '', id_mekanik: '', tanggal_kerusakan: '', 
    deskripsi_kerusakan: '', tindakan_perbaikan: '', biaya_sparepart: '' 
  });

  const muatData = async () => {
    try {
      const [resAlat, resWork, resPekerja] = await Promise.all([
        axios.get('http://localhost:5000/api/alat-berat'),
        axios.get('http://localhost:5000/api/workshop'),
        axios.get('http://localhost:5000/api/pekerja')
      ]);
      setListAlat(resAlat.data || []);
      setRepairs(resWork.data || []);
      setListMekanik(resPekerja.data.filter(p => p.peran === 'Mekanik'));
    } catch (err) { console.error("Gagal muat data:", err); }
  };

  useEffect(() => { muatData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Kita kirim 'form' langsung. Karena input type="date" di React 
      // sudah mengirimkan format string "YYYY-MM-DD", kita tidak perlu mengubahnya.
      await axios.post('http://localhost:5000/api/workshop', form);
      
      setForm({ 
        no_lambung: '', 
        id_mekanik: '', 
        tanggal_kerusakan: '', 
        deskripsi_kerusakan: '', 
        tindakan_perbaikan: '', 
        biaya_sparepart: '' 
      });
      
      await muatData();
      alert("Data berhasil disimpan!");
    } catch (err) { 
      alert("Gagal menyimpan: " + (err.response?.data?.error || err.message)); 
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Pastikan editForm sudah memiliki tanggal yang benar (YYYY-MM-DD)
      // Karena kita menggunakan substring(0,10) di input modal, ini sudah aman.
      await axios.put(`http://localhost:5000/api/workshop/${editForm.id_perbaikan}`, editForm);
      
      setIsEditMode(false);
      muatData();
      alert("Data berhasil diupdate!");
    } catch (err) { 
      alert("Gagal update data: " + (err.response?.data?.error || err.message)); 
    }
  };

  const handleSelesaikan = async (id, no_lambung) => {
    if (!window.confirm("Konfirmasi perbaikan selesai?")) return;
    try {
      // Pastikan format tanggal kirim ke server adalah YYYY-MM-DD
      const tglSelesai = new Date().toLocaleDateString('sv-SE');
      
      const res = await axios.put(`http://localhost:5000/api/workshop-selesai/${id}`, { 
        status_perbaikan: 'Selesai', 
        updated_at: tglSelesai
      });

      console.log("Respon server:", res.data); // CEK DI F12: Apakah pesannya "Selesai"?
      
      // Update local state agar tampilan langsung berubah
      setRepairs(prev => prev.map(m => 
        m.id_perbaikan === id ? { ...m, status_perbaikan: 'Selesai', updated_at: tglSelesai } : m
      ));
      
      alert("Status berhasil diubah ke Selesai!");
    } catch (err) { 
      console.error("Error Detail:", err.response?.data);
      alert("Gagal update status: " + (err.response?.data?.error || err.message)); 
    }
  };

  const handleHapus = async (id, no_lambung) => {
    if(!window.confirm("Yakin batalkan maintenance?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/workshop/${id}/${no_lambung}`);
      muatData();
    } catch (err) { alert("Gagal batal."); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8 max-w-screen-2xl mx-auto">
      <div className="border-b border-gray-100 pb-6">
        <h2 className="text-xl font-black text-[#1E2229] uppercase tracking-tighter">Workshop & Pemeliharaan</h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Manajemen Perbaikan & Penugasan Mekanik</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <form onSubmit={handleSubmit} className="xl:col-span-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-lg space-y-6">
  <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
    <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Wrench size={18} /></div>
    <div>
      <h3 className="font-black text-xs uppercase text-gray-800 tracking-widest">Input Jadwal Maintenance</h3>
      <p className="text-[9px] text-gray-400 font-bold">Pastikan unit dalam kondisi idle/siap</p>
    </div>
  </div>

  <div className="space-y-4">
    {/* Armada Selection */}
    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Pilih Armada</label>
      <select 
        required 
        value={form.no_lambung} 
        onChange={e => setForm({...form, no_lambung: e.target.value})} 
        className="w-full p-4 bg-gray-50 border-0 rounded-2xl font-bold text-xs focus:ring-2 focus:ring-red-500"
      >
        <option value="">-- Pilih Armada (Status Ready) --</option>
        {listAlat
          .filter(a => a.status_unit === 'Ready')
          .map(a => (
            <option key={a.no_lambung} value={a.no_lambung}>
              {a.no_lambung} - {a.nama_alat} ({a.status_unit})
            </option>
          ))
        }
      </select>
    </div>

    {/* Mekanik Selection */}
    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Penugasan Mekanik</label>
      <select 
        required 
        value={form.id_mekanik} 
        onChange={e => setForm({...form, id_mekanik: e.target.value})} 
        className="w-full p-4 bg-gray-50 border-0 rounded-2xl font-bold text-xs focus:ring-2 focus:ring-red-500"
      >
        <option value="">-- Pilih Mekanik (Status Siap) --</option>
        {listMekanik
          .filter(m => m.status_tugas === 'Siap')
          .map(m => (
            <option key={m.id_pekerja} value={m.id_pekerja}>
              {m.nama_pekerja}
            </option>
          ))
        }
      </select>
    </div>

    {/* Date Input */}
    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Tanggal Kerusakan</label>
      <input type="date" required value={form.tanggal_kerusakan} onChange={e => setForm({...form, tanggal_kerusakan: e.target.value})} className="w-full p-4 bg-gray-50 border-0 rounded-2xl text-xs font-bold" />
    </div>

    {/* Details Textareas */}
    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Deskripsi Kerusakan</label>
      <textarea placeholder="Contoh: Mesin overheat saat beban penuh..." required value={form.deskripsi_kerusakan} onChange={e => setForm({...form, deskripsi_kerusakan: e.target.value})} className="w-full p-4 bg-gray-50 border-0 rounded-2xl text-xs h-20" />
    </div>

    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Tindakan Perbaikan</label>
      <textarea placeholder="Contoh: Penggantian radiator & filter..." required value={form.tindakan_perbaikan} onChange={e => setForm({...form, tindakan_perbaikan: e.target.value})} className="w-full p-4 bg-gray-50 border-0 rounded-2xl text-xs h-20" />
    </div>

    {/* Cost Input */}
    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Estimasi Biaya Sparepart (Rp)</label>
      <div className="relative">
        <DollarSign className="absolute left-4 top-4 text-gray-400" size={16} />
        <input type="number" placeholder="0" required value={form.biaya_sparepart} onChange={e => setForm({...form, biaya_sparepart: e.target.value})} className="w-full p-4 pl-10 bg-gray-50 border-0 rounded-2xl text-xs font-black text-red-600" />
      </div>
    </div>
  </div>

  <button type="submit" className="w-full bg-[#1E2229] text-[#FFB800] py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-black transition-all">
    Kunci Status Maintenance
  </button>
</form>

        <div className="xl:col-span-8 overflow-x-auto">
<table className="w-full text-left">
  <thead className="text-[10px] uppercase font-black text-gray-400 tracking-widest border-b border-gray-100">
    <tr>
      <th className="pb-4">Armada</th>
      <th className="pb-4">Periode</th>
      <th className="pb-4">Mekanik</th>
      <th className="pb-4">Detail Perbaikan</th>
      <th className="pb-4">Biaya</th>
      <th className="pb-4">Status</th>
      <th className="pb-4 text-center">Aksi</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-50">
  {repairs.length > 0 ? (
    repairs.map(m => {
      const hariIni = new Date().toLocaleDateString('sv-SE');
      
      // PERBAIKAN: Deklarasikan 'status' HANYA SEKALI
      // Ganti bagian status menjadi:
const status = m.status_perbaikan === 'Selesai' ? 'Selesai' : 
               (m.tanggal_kerusakan > hariIni ? 'Menunggu' : 'Maintenance');
      
      const alat = listAlat.find(a => a.no_lambung === m.no_lambung);
      const mekanik = listMekanik.find(p => p.id_pekerja == m.id_mekanik);
      
      return (
        <tr key={m.id_perbaikan} className="hover:bg-gray-50 transition-all text-xs">
          <td className="py-6 font-black text-amber-800">
            {m.no_lambung}
            <div className="text-[9px] text-gray-400 font-bold uppercase">{alat?.nama_alat}</div>
          </td>
          <td className="py-6 font-bold text-gray-600">
  <span className="block text-[10px]">Start: {m.tanggal_kerusakan?.substring(0,10)}</span>
  {/* Tanggal End hanya muncul jika ada isi dan statusnya Selesai */}
  {m.status_perbaikan === 'Selesai' && m.updated_at ? (
    <span className="block text-[10px] text-emerald-600">
      End: {m.updated_at?.substring(0,10)}
    </span>
  ) : (
    <span className="block text-[10px] text-gray-400">End: -</span>
  )}
</td>
          <td className="py-6 font-bold text-gray-600 flex items-center gap-2">
            <User size={14}/> {mekanik?.nama_pekerja || '-'}
          </td>
          <td className="py-6 max-w-[200px]">
            <div className="font-black text-gray-800">Keluhan:</div>
            <p className="italic text-gray-600 mb-1">{m.deskripsi_kerusakan}</p>
            <div className="font-black text-gray-800">Tindakan:</div>
            <p className="italic text-gray-600">{m.tindakan_perbaikan}</p>
          </td>
          <td className="py-6 font-black text-red-600">Rp {Number(m.biaya_sparepart).toLocaleString()}</td>
          <td className="py-6">
            <span className={`px-3 py-1 rounded-full font-black text-[9px] uppercase 
              ${status === 'Selesai' ? 'bg-emerald-50 text-emerald-600' : 
                status === 'Maintenance' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
              {status}
            </span>
          </td>
          <td className="py-6 text-center flex justify-center gap-2 mt-4">
            {status !== 'Selesai' && (
              <>
                {status === 'Maintenance' && (
                  <button onClick={() => handleSelesaikan(m.id_perbaikan, m.no_lambung)} className="text-emerald-600"><CheckCircle2 size={18}/></button>
                )}
                <button onClick={() => { setIsEditMode(true); setEditForm(m); }} className="text-blue-500"><Edit3 size={18}/></button>
                <button onClick={() => handleHapus(m.id_perbaikan, m.no_lambung)} className="text-red-400"><Trash2 size={18}/></button>
              </>
            )}
          </td>
        </tr>
      );
    })
  ) : (
    <tr><td colSpan="7" className="py-10 text-center text-gray-400 font-bold uppercase">Belum ada data workshop...</td></tr>
  )}
</tbody>
</table>

{isEditMode && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
    <form onSubmit={handleUpdate} className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="font-black text-lg uppercase text-gray-800">Revisi Perbaikan</h3>
        <button type="button" onClick={() => setIsEditMode(false)} className="text-gray-400 hover:text-black"><X size={20}/></button>
      </div>

      <div className="space-y-3 text-xs font-bold">
        <div>
          <label className="text-[10px] text-gray-400 uppercase">Armada</label>
          <select value={editForm.no_lambung} onChange={e => setEditForm({...editForm, no_lambung: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl">
            {listAlat.map(a => <option key={a.no_lambung} value={a.no_lambung}>{a.no_lambung} - {a.nama_alat}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-gray-400 uppercase">Mekanik</label>
          <select value={editForm.id_mekanik} onChange={e => setEditForm({...editForm, id_mekanik: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl">
            {listMekanik.map(m => <option key={m.id_pekerja} value={m.id_pekerja}>{m.nama_pekerja}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-gray-400 uppercase">Tanggal</label>
          <input type="date" value={editForm.tanggal_kerusakan?.substring(0,10)} onChange={e => setEditForm({...editForm, tanggal_kerusakan: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl" />
        </div>

        <div>
          <label className="text-[10px] text-gray-400 uppercase">Deskripsi Kerusakan</label>
          <textarea value={editForm.deskripsi_kerusakan} onChange={e => setEditForm({...editForm, deskripsi_kerusakan: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl h-20" />
        </div>

        <div>
          <label className="text-[10px] text-gray-400 uppercase">Tindakan</label>
          <textarea value={editForm.tindakan_perbaikan} onChange={e => setEditForm({...editForm, tindakan_perbaikan: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl h-20" />
        </div>

        <div>
          <label className="text-[10px] text-gray-400 uppercase">Biaya Sparepart</label>
          <input type="number" value={editForm.biaya_sparepart} onChange={e => setEditForm({...editForm, biaya_sparepart: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl" />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button type="submit" className="flex-1 bg-[#1E2229] text-[#FFB800] py-4 rounded-xl font-black uppercase text-xs">Simpan Revisi</button>
        <button type="button" onClick={() => setIsEditMode(false)} className="flex-1 bg-gray-100 py-4 rounded-xl font-black uppercase text-xs">Batal</button>
      </div>
    </form>
  </div>
)}

        </div>
      </div>
    </div>
  );
}