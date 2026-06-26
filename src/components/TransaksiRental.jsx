import React, { useState, useEffect } from 'react';
import { Save, MapPin, Phone, Calendar, FileText, User, DollarSign, Clock, Info, Edit3, XCircle } from 'lucide-react';
import axios from 'axios';

export default function TransaksiRental() {
  const [contracts, setContracts] = useState([]);
  const [listAlat, setListAlat] = useState([]);
  const [listOperator, setListOperator] = useState([]);
  
  // State UI Modals Kontrol
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null); 

  const formatTanggalSingkat = (dateStr) => {
    if (!dateStr) return "-";
    return dateStr.split('T')[0];
  };

  const dapatkanStatusRealTime = (unitNoLambung) => {
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);

    const kontrakAktifHariIni = contracts.find(k => {
      if (k.no_lambung !== unitNoLambung || k.status_transaksi === 'Batal') return false;

      const tglMulaiMurni = formatTanggalSingkat(k.tanggal_mulai).slice(0, 10);
      const tglSelesaiMurni = formatTanggalSingkat(k.tanggal_selesai).slice(0, 10);

      const tglMulai = new Date(tglMulaiMurni + "T00:00:00");
      const tglSelesai = new Date(tglSelesaiMurni + "T00:00:00");

      return hariIni >= tglMulai && hariIni <= tglSelesai;
    });

    return kontrakAktifHariIni ? "On Site" : "Ready";
  };

  // State Form Tambah Kontrak Baru
  // Di dalam komponen TransaksiRental
const [form, setForm] = useState({
  no_lambung: '', // Kosongkan agar muncul placeholder
  id_operator: '', // Kosongkan agar muncul placeholder
  penyewa: '', 
  alamat_site_bebas: '',
  pic_lapangan: '', 
  no_whatsapp_pic: '', 
  tanggal_mulai: '', 
  tanggal_selesai: '', 
  uang_muka_dp: 0
});

  const muatDataSistem = async () => {
    try {
      const [resAlat, resPekerja, resTransaksi] = await Promise.all([
        axios.get('http://localhost:5000/api/alat-berat'),
        axios.get('http://localhost:5000/api/pekerja'),
        axios.get('http://localhost:5000/api/transaksi')
      ]);

      setListAlat(resAlat.data); 
      setListOperator(resPekerja.data.filter(p => p.peran === 'Operator'));
      setContracts(resTransaksi.data);

      
    } catch (err) {
      console.error("Gagal memuat data:", err);
    }
  };

  useEffect(() => {
    muatDataSistem();
  }, []);

  let totalHariSewa = 0;
  let totalHargaKontrak = 0;
  let sisaPembayaran = 0;
  let statusPembayaran = 'Belum Bayar';

  if (form.tanggal_mulai && form.tanggal_selesai) {
    const tgl1 = new Date(form.tanggal_mulai);
    const tgl2 = new Date(form.tanggal_selesai);
    const selisihWaktu = tgl2.getTime() - tgl1.getTime();
    
    totalHariSewa = Math.ceil(selisihWaktu / (1000 * 3600 * 24)) + 1;
    if (totalHariSewa < 0) totalHariSewa = 0;

    const alatTerpilih = listAlat.find(x => x.no_lambung === form.no_lambung);
    const tarif = alatTerpilih ? Number(alatTerpilih.tarif_per_hari) : 0;
    
    totalHargaKontrak = totalHariSewa * tarif;
    sisaPembayaran = totalHargaKontrak - Number(form.uang_muka_dp);
    if (sisaPembayaran < 0) sisaPembayaran = 0;

    if (Number(form.uang_muka_dp) > 0 && sisaPembayaran > 0) statusPembayaran = 'DP';
    if (Number(form.uang_muka_dp) >= totalHargaKontrak && totalHargaKontrak > 0) statusPembayaran = 'Lunas';
  }

  useEffect(() => {
    if (editForm && editForm.tanggal_mulai && editForm.tanggal_selesai) {
      const tgl1 = new Date(editForm.tanggal_mulai);
      const tgl2 = new Date(editForm.tanggal_selesai);
      const selisih = tgl2.getTime() - tgl1.getTime();
      
      const hari = Math.ceil(selisih / (1000 * 3600 * 24)) + 1;
      const totalHari = hari > 0 ? hari : 0;

      const alatTerpilih = listAlat.find(x => x.no_lambung === editForm.no_lambung);
      const tarif = alatTerpilih ? Number(alatTerpilih.tarif_per_hari) : 0;

      const totalHarga = totalHari * tarif;
      const sisa = Math.max(0, totalHarga - Number(editForm.uang_muka_dp || 0));

      let statusBayar = 'Belum Bayar';
      if (Number(editForm.uang_muka_dp) > 0 && sisa > 0) statusBayar = 'DP';
      if (Number(editForm.uang_muka_dp) >= totalHarga && totalHarga > 0) statusBayar = 'Lunas';

      if (
        editForm.total_hari_sewa !== totalHari ||
        editForm.total_harga_kontrak !== totalHarga ||
        editForm.sisa_pembayaran !== sisa ||
        editForm.status_pembayaran !== statusBayar
      ) {
        setEditForm(prev => ({
          ...prev,
          total_hari_sewa: totalHari,
          total_harga_kontrak: totalHarga,
          sisa_pembayaran: sisa,
          status_pembayaran: statusBayar
        }));
      }
    }
  }, [editForm?.no_lambung, editForm?.tanggal_mulai, editForm?.tanggal_selesai, editForm?.uang_muka_dp, listAlat]);

  const handleKunciKontrak = async (e) => {
    e.preventDefault();

    const tglMulaiInput = new Date(form.tanggal_mulai + "T00:00:00");
    const tglSelesaiInput = new Date(form.tanggal_selesai + "T00:00:00");

    const isBentrok = contracts.some(t => {
      if (t.status_transaksi === 'Batal') return false;

      const tglMulaiEksis = new Date(formatTanggalSingkat(t.tanggal_mulai) + "T00:00:00");
      const tglSelesaiEksis = new Date(formatTanggalSingkat(t.tanggal_selesai) + "T00:00:00");

      const rentangTabrakan = tglMulaiInput <= tglSelesaiEksis && tglSelesaiInput >= tglMulaiEksis;
      const unitSama = t.no_lambung === form.no_lambung;
      const operatorSama = Number(t.id_operator) === Number(form.id_operator);

      return rentangTabrakan && (unitSama || operatorSama);
    });

    if (isBentrok) {
      alert("JADWAL BENTROK: Unit Alat Berat atau Operator sudah terikat kontrak Aktif lain pada tanggal tersebut!");
      return; 
    }

    try {
      const payload = {
        ...form,
        total_hari_sewa: totalHariSewa,
        total_harga_kontrak: totalHargaKontrak,
        uang_muka_dp: Number(form.uang_muka_dp) || 0,
        sisa_pembayaran: sisaPembayaran,
        status_pembayaran: statusPembayaran,
        id_user_input: 1
      };

      const respon = await axios.post('http://localhost:5000/api/transaksi', payload);
      alert(respon.data.message || "Kontrak berhasil diterbitkan!");

      setForm({
        no_lambung: listAlat[0]?.no_lambung || '',
        id_operator: listOperator[0]?.id_pekerja || '',
        penyewa: '', 
        alamat_site_bebas: '', 
        pic_lapangan: '', 
        no_whatsapp_pic: '',
        tanggal_mulai: '', 
        tanggal_selesai: '', 
        uang_muka_dp: 0
      });

      muatDataSistem();
    } catch (err) {
      alert(err.response?.data?.message || "Terjadi kegagalan koneksi sistem.");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fadeIn p-2 max-w-screen-2xl mx-auto">
      
      {/* 3.1 FORM INPUT KONTRAK BARU */}
      <form onSubmit={handleKunciKontrak} className="xl:col-span-5 bg-white p-6 rounded-xl shadow-sm border border-gray-200/80 space-y-5">
        <div>
          <h2 className="text-sm font-black text-[#1E2229] uppercase tracking-wide">Form Order Rental Baru</h2>
          <p className="text-[11px] text-gray-400">Gunakan form ini untuk memilih alat berat & operator.</p>
        </div>

        <div className="space-y-3.5 border border-gray-100 rounded-lg p-4 bg-gray-50/50">
          <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5 mb-3"><Clock size={12} /> Aset & Penugasan</h4>
          <div>
            <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Pilih Armada Alat Berat</label>
            <select required value={form.no_lambung} onChange={e => setForm({...form, no_lambung: e.target.value})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg font-bold text-gray-700 text-xs focus:outline-none focus:border-[#FFB800]">
              <option value="">-- Pilih Unit --</option>
              {listAlat.map(a => (
                <option key={a.no_lambung} value={a.no_lambung}>
                  {a.no_lambung} - {a.nama_alat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Pilih Operator Penanggungjawab</label>
            <select required value={form.id_operator} onChange={e => setForm({...form, id_operator: e.target.value})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg font-bold text-gray-700 text-xs focus:outline-none focus:border-[#FFB800]">
              <option value="">-- Pilih Operator --</option>
              {listOperator.map(o => (<option key={o.id_pekerja} value={o.id_pekerja}>{o.nama_pekerja} [{o.spesialisasi_sio || 'Umum'}]</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Tanggal Mulai Sewa</label><input type="date" required value={form.tanggal_mulai} onChange={e => setForm({...form, tanggal_mulai: e.target.value})} className="w-full p-2 bg-white border border-gray-200 rounded-lg font-bold text-gray-700 text-xs focus:outline-none focus:border-[#FFB800]" /></div>
            <div><label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Tanggal Selesai Sewa</label><input type="date" required value={form.tanggal_selesai} onChange={e => setForm({...form, tanggal_selesai: e.target.value})} className="w-full p-2 bg-white border border-gray-200 rounded-lg font-bold text-gray-700 text-xs focus:outline-none focus:border-[#FFB800]" /></div>
          </div>
        </div>

        <div className="space-y-3.5 border border-gray-100 rounded-lg p-4 bg-gray-50/50">
          <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5 mb-3"><MapPin size={12} /> Informasi Klien & Situs</h4>
          <div>
            <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Nama Perusahaan Kontraktor Penyewa</label>
            <input type="text" required placeholder="PT Riau Konstruksi Mandiri" value={form.penyewa} onChange={e => setForm({...form, penyewa: e.target.value})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg font-medium text-gray-700 text-xs focus:outline-none focus:border-[#FFB800]" />
          </div>
          <div>
            <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Alamat Lokasi Site (Ketik Manual Bebas)</label>
            <div className="relative"><MapPin size={12} className="absolute left-2.5 top-3.5 text-gray-400" /><input type="text" required placeholder="Contoh: Jl. Lintas Pekanbaru-Minas" value={form.alamat_site_bebas} onChange={e => setForm({...form, alamat_site_bebas: e.target.value})} className="w-full p-2.5 pl-8 bg-white border border-gray-200 rounded-lg font-medium text-gray-700 text-xs focus:outline-none focus:border-[#FFB800]" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Nama PIC Lapangan</label><input type="text" required placeholder="Nama pengawas site" value={form.pic_lapangan} onChange={e => setForm({...form, pic_lapangan: e.target.value})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg font-medium text-gray-700 text-xs focus:outline-none focus:border-[#FFB800]" /></div>
            <div><label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">No. WhatsApp PIC</label><div className="relative"><Phone size={12} className="absolute left-2.5 top-3.5 text-gray-400" /><input type="text" required placeholder="0812" value={form.no_whatsapp_pic} onChange={e => setForm({...form, no_whatsapp_pic: e.target.value})} className="w-full p-2.5 pl-8 bg-white border border-gray-200 rounded-lg font-medium text-gray-700 text-xs focus:outline-none focus:border-[#FFB800]" /></div></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 space-y-3.5 border border-gray-100 rounded-lg p-4 bg-gray-50/50">
            <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5 mb-2"><DollarSign size={12} /> Kalkulasi Finansial</h4>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div><label className="block text-[8px] font-black text-gray-400 uppercase">Total Hari</label><div className="text-xl font-black text-[#1E2229]">{totalHariSewa} <span className="text-xs font-bold text-gray-400">Hari</span></div></div>
              <div><label className="block text-[8px] font-black text-gray-400 uppercase">Total Kontrak</label><div className="text-sm font-black text-emerald-600 mt-1">Rp {totalHargaKontrak.toLocaleString('id-ID')}</div></div>
            </div>
            <div><label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Input Uang Muka (DP) - Rp</label><input type="number" placeholder="Rp 0" value={form.uang_muka_dp === 0 ? '' : form.uang_muka_dp} onChange={e => setForm({...form, uang_muka_dp: Number(e.target.value)})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg font-black text-right text-gray-800 text-xs focus:outline-none focus:border-[#FFB800]" /></div>
          </div>
          <div className="col-span-1 space-y-3 border border-gray-100 rounded-lg p-4 bg-gray-50/50 flex flex-col justify-center items-center text-center">
            <label className="block text-[9px] font-black text-gray-400 uppercase">Sisa Bayar</label><div className="text-xs font-black text-red-600">Rp {sisaPembayaran.toLocaleString('id-ID')}</div>
            <label className="block text-[9px] font-black text-gray-400 uppercase mt-2">Status</label><span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${statusPembayaran === 'Lunas' ? 'bg-green-100 text-green-800' : statusPembayaran === 'DP' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>{statusPembayaran}</span>
          </div>
        </div>

        <button type="submit" className="w-full bg-[#1E2229] text-[#FFB800] p-3 rounded-lg font-black uppercase tracking-wider shadow-md flex items-center justify-center space-x-2 transition-all hover:bg-[#2D333F]"><Save size={15} /><span>Terbitkan & Kunci Jadwal Kontrak</span></button>
      </form>

      {/* 3.2 MONITORING TRANSAKSI KONTRAK */}
      <div className="xl:col-span-7 bg-white p-6 rounded-xl shadow-sm border border-gray-200/80">
        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2"><Calendar size={13}/> Monitoring Transaksi Kontrak Aktif</h3>
        <div className="overflow-x-auto border border-gray-100 rounded-lg shadow-inner">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1E2229] text-white uppercase tracking-wider text-[9px] font-black border-b border-gray-200">
                <th className="p-3 pl-4 text-center border-r border-gray-700/40">ID</th>
                <th className="p-3 border-r border-gray-700/40">Armada Alat Berat</th>
                <th className="p-3 border-r border-gray-700/40">Nama Penyewa</th>
                <th className="p-3 text-center border-r border-gray-700/40">Total Nilai Sewa</th>
                <th className="p-3 pr-4 text-center">Status / Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-600 bg-white text-[11px]">
              {contracts.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic font-medium">Belum ada data kontrak aktif terdaftar...</td></tr>
              ) : (
                contracts.map(c => {
                  // REVISI 1: Cari objek nama alat di master data untuk digabungkan
                  const alatEksis = listAlat.find(x => x.no_lambung === c.no_lambung);
                  const namaAlatGabung = alatEksis ? `${c.no_lambung} - ${alatEksis.nama_alat}` : c.no_lambung;

                  return (
                    <tr key={c.id_kontrak} className={`hover:bg-gray-50/50 transition-colors ${c.status_transaksi === 'Batal' ? 'bg-red-50/40 opacity-70' : ''}`}>
                      <td className="p-3 pl-4 font-black text-center text-[#1E2229] border-r border-gray-100">#{c.id_kontrak.split('-')[1] || c.id_kontrak}</td>
                      {/* REVISI 2: Render teks gabungan No Lambung & Nama Alat Berat */}
                      <td className="p-3 font-black text-amber-700 border-r border-gray-100">{namaAlatGabung}</td>
                      <td className="p-3 font-bold text-gray-800 border-r border-gray-100">{c.penyewa}</td>
                      <td className="p-3 text-center border-r border-gray-100 font-black text-emerald-700 text-xs">
                        Rp {Number(c.total_harga_kontrak || 0).toLocaleString('id-ID')}
                        <div className="text-[10px] text-gray-400 font-medium mt-1 bg-gray-50 rounded p-1 border border-gray-100/60">
                          {formatTanggalSingkat(c.tanggal_mulai)} s/d {formatTanggalSingkat(c.tanggal_selesai)}
                        </div>
                      </td>
                      <td className="p-3 text-center pr-4 flex items-center justify-center gap-2.5 min-h-[55px]">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${c.status_pembayaran === 'Lunas' ? 'bg-green-100 text-green-800' : c.status_pembayaran === 'DP' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>{c.status_pembayaran}</span>
                        <button type="button" onClick={() => setSelectedDetail(c)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Lihat Detail Transaksi"><Info size={14} /></button>
                        {c.status_transaksi !== 'Batal' && (
                          <>
                            <button type="button" onClick={() => { setEditForm({ ...c, tanggal_mulai: formatTanggalSingkat(c.tanggal_mulai), tanggal_selesai: formatTanggalSingkat(c.tanggal_selesai) }); setIsEditMode(true); }} className="p-1 text-gray-500 hover:text-amber-500 rounded"><Edit3 size={14} /></button>
                            <button type="button" onClick={async () => { if (window.confirm(`Batalkan Kontrak #${c.id_kontrak}?`)) { try { const payloadBatal = { ...c, status_transaksi: 'Batal' }; await axios.put(`http://localhost:5000/api/transaksi/${c.id_kontrak}`, payloadBatal); alert("Kontrak dibatalkan!"); muatDataSistem(); } catch (err) { alert("Gagal."); } } }} className="p-1 text-red-400 hover:text-red-600 rounded"><XCircle size={14} /></button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP DETAIL TRANSAKSI */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden text-xs font-semibold text-gray-600 border border-gray-300">
            <div className="p-4 bg-[#1E2229] text-white flex justify-between items-center">
              <h3 className="font-black uppercase tracking-wider flex items-center gap-2">Lembar Detail Kontrak #{selectedDetail.id_kontrak}</h3>
              <button type="button" onClick={() => setSelectedDetail(null)} className="font-bold text-base hover:text-red-400">✕</button>
            </div>
            
            <div className="p-5 space-y-4">
              <table className="w-full text-left border border-gray-100 rounded-lg overflow-hidden">
                <tbody>
                  {/* REVISI 3: Gabungan di Lembar Detail Pop-up */}
                  <tr className="bg-gray-50 border-b">
                    <td className="p-2.5 font-black text-gray-400 uppercase text-[9px]">Armada Berat</td>
                    <td className="p-2.5 font-black text-amber-700">
                      {selectedDetail.no_lambung} - {listAlat.find(x => x.no_lambung === selectedDetail.no_lambung)?.nama_alat || ''}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2.5 font-black text-gray-400 uppercase text-[9px]">Nama Operator</td>
                    <td className="p-2.5 font-bold text-gray-700">
                      {listOperator.find(o => Number(o.id_pekerja) === Number(selectedDetail.id_operator))?.nama_pekerja || `ID-${selectedDetail.id_operator}`}
                    </td>
                  </tr>
                  <tr className="bg-white border-b">
                    <td className="p-2.5 font-black text-gray-400 uppercase text-[9px]">Biaya Sewa / Hari</td>
                    <td className="p-2.5 font-bold text-gray-700">
                      Rp {Number(listAlat.find(x => x.no_lambung === selectedDetail.no_lambung)?.tarif_per_hari || 0).toLocaleString('id-ID')} <span className="text-[10px] text-gray-400">/ Hari</span>
                    </td>
                  </tr>
                  <tr className="bg-gray-50 border-b"><td className="p-2.5 font-black text-gray-400 uppercase text-[9px]">Nama Klien</td><td className="p-2.5 font-bold text-gray-800">{selectedDetail.penyewa}</td></tr>
                  <tr className="border-b"><td className="p-2.5 font-black text-gray-400 uppercase text-[9px]">Alamat Site</td><td className="p-2.5 text-gray-500">{selectedDetail.alamat_site_bebas}</td></tr>
                  <tr className="bg-gray-50 border-b"><td className="p-2.5 font-black text-gray-400 uppercase text-[9px]">PIC / WhatsApp</td><td className="p-2.5 font-medium">{selectedDetail.pic_lapangan || '-'} / {selectedDetail.no_whatsapp_pic || '-'}</td></tr>
                  <tr className="border-b"><td className="p-2.5 font-black text-gray-400 uppercase text-[9px]">Masa Rentang</td><td className="p-2.5 text-gray-700 font-bold">{formatTanggalSingkat(selectedDetail.tanggal_mulai)} ➔ {formatTanggalSingkat(selectedDetail.tanggal_selesai)} ({selectedDetail.total_hari_sewa} Hari)</td></tr>
                  <tr className="bg-emerald-50/40 border-b"><td className="p-2.5 font-black text-emerald-800 uppercase text-[9px]">Total Nilai Sewa</td><td className="p-2.5 font-black text-emerald-700">Rp {Number(selectedDetail.total_harga_kontrak || 0).toLocaleString('id-ID')}</td></tr>
                  <tr className="bg-amber-50/40 border-b"><td className="p-2.5 font-black text-amber-800 uppercase text-[9px]">Uang Muka (DP)</td><td className="p-2.5 font-black text-amber-700">Rp {Number(selectedDetail.uang_muka_dp || 0).toLocaleString('id-ID')}</td></tr>
                  <tr className="bg-red-50/40"><td className="p-2.5 font-black text-red-800 uppercase text-[9px]">Sisa Piutang</td><td className="p-2.5 font-black text-red-600">Rp {Number(selectedDetail.sisa_pembayaran || 0).toLocaleString('id-ID')}</td></tr>
                </tbody>
              </table>

              <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border">
                <span className="text-[9px] font-black text-gray-400 uppercase">Status Operasional:</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                  selectedDetail.status_transaksi === 'Batal' 
                    ? 'bg-red-100 text-red-800 border-red-300 line-through' 
                    : dapatkanStatusRealTime(selectedDetail.no_lambung) === 'On Site'
                      ? 'bg-orange-100 text-orange-800 border-orange-300 animate-pulse' 
                      : 'bg-green-100 text-green-800 border-green-300'
                }`}>
                  {selectedDetail.status_transaksi === 'Batal' ? 'Batal' : dapatkanStatusRealTime(selectedDetail.no_lambung)}
                </span>
              </div>

              <button type="button" onClick={() => setSelectedDetail(null)} className="w-full p-2 bg-[#1E2229] hover:bg-gray-800 text-white font-black uppercase rounded-lg tracking-wide shadow-md">Tutup Lembar Detail</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POPUP EDIT DATA SEWA */}
      {isEditMode && editForm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden text-xs font-semibold text-gray-600">
            <div className="p-4 bg-[#1E2229] text-white flex justify-between items-center">
              <h3 className="font-black uppercase tracking-wider">Revisi Kontrak #{editForm.id_kontrak}</h3>
              <button type="button" onClick={() => { setIsEditMode(false); setEditForm(null); }} className="font-bold">✕</button>
            </div>
            <form onSubmit={async (e) => { e.preventDefault(); try { await axios.put(`http://localhost:5000/api/transaksi/${editForm.id_kontrak}`, editForm); alert("Kontrak updated successfully!"); setIsEditMode(false); setEditForm(null); muatDataSistem(); } catch (err) { alert("Gagal."); } }} className="p-5 space-y-3">
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Tukar Unit Alat Berat</label>
                  <select value={editForm.no_lambung} onChange={e => setEditForm({...editForm, no_lambung: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg font-bold text-xs">
                    {listAlat.map(a => (<option key={a.no_lambung} value={a.no_lambung}>{a.no_lambung} - {a.nama_alat}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Tukar Operator</label>
                  <select value={editForm.id_operator} onChange={e => setEditForm({...editForm, id_operator: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg font-bold text-xs">
                    {listOperator.map(o => (<option key={o.id_pekerja} value={o.id_pekerja}>{o.nama_pekerja}</option>))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Tanggal Mulai Baru</label>
                  <input type="date" value={editForm.tanggal_mulai} onChange={e => setEditForm({...editForm, tanggal_mulai: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg text-xs font-bold" />
                </div>
                <div>
                  <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Tanggal Selesai Baru</label>
                  <input type="date" value={editForm.tanggal_selesai} onChange={e => setEditForm({...editForm, tanggal_selesai: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg text-xs font-bold" />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Nama Perusahaan / Penyewa</label>
                <input type="text" value={editForm.penyewa} onChange={e => setEditForm({...editForm, penyewa: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg text-xs" />
              </div>
              <div>
                <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Alamat Lokasi Site Baru</label>
                <input type="text" value={editForm.alamat_site_bebas} onChange={e => setEditForm({...editForm, alamat_site_bebas: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">Nama PIC Lapangan</label>
                  <input type="text" value={editForm.pic_lapangan || ''} onChange={e => setEditForm({...editForm, pic_lapangan: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block mb-1 text-[9px] font-black text-gray-400 uppercase">No. WhatsApp PIC</label>
                  <input type="text" value={editForm.no_whatsapp_pic || ''} onChange={e => setEditForm({...editForm, no_whatsapp_pic: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg text-xs" />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[9px] font-black text-amber-600 uppercase">Update Pembayaran DP / Uang Muka (Rp)</label>
                <input type="number" value={editForm.uang_muka_dp} onChange={e => setEditForm({...editForm, uang_muka_dp: Number(e.target.value)})} className="w-full p-2 bg-amber-50/50 border border-amber-200 rounded-lg font-black text-gray-800 text-xs" />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg grid grid-cols-2 gap-2 text-center my-2">
                <div><p className="text-[9px] font-black uppercase text-gray-400">Durasi Sewa</p><p className="font-black text-sm text-gray-800">{editForm.total_hari_sewa || 0} Hari</p></div>
                <div><p className="text-[9px] font-black uppercase text-gray-400">Total Harga Kontrak Baru</p><p className="font-black text-sm text-emerald-700">Rp {Number(editForm.total_harga_kontrak || 0).toLocaleString('id-ID')}</p></div>
                <div className="col-span-2 border-t border-amber-200/60 pt-1.5 mt-1 text-center"><span className="text-[9px] font-black uppercase text-gray-400">Sisa Tagihan Baru: </span><span className="font-black text-red-500">Rp {Number(editForm.sisa_pembayaran || 0).toLocaleString('id-ID')}</span></div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setIsEditMode(false); setEditForm(null); }} className="flex-1 p-2 bg-gray-100 rounded-lg font-bold text-xs">Kembali</button>
                <button type="submit" className="flex-1 p-2 bg-[#1E2229] text-[#FFB800] rounded-lg font-black uppercase shadow text-xs">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}