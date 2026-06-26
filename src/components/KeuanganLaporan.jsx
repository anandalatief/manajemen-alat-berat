import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Printer, Filter } from 'lucide-react';

export default function KeuanganLaporan() {
  const [data, setData] = useState({ 
      summary: { 
          rincian: {}, 
          pendapatan_nyata: 0, 
          pendapatan_potensial: 0, 
          laba_bersih: 0 
      }, 
      logs: [] 
  });
  const [filter, setFilter] = useState({ bulan: new Date().getMonth() + 1, tahun: new Date().getFullYear() });
  const [showFilter, setShowFilter] = useState(false);

  const fetchData = async () => {
    try {
      // Kita panggil API neraca (tanpa filter)
      const resNeraca = await axios.get('http://localhost:5000/api/neraca-keuangan');
      
      // Kita panggil detail berdasarkan filter
      const resDetail = await axios.get(`http://localhost:5000/api/keuangan-detail?bulan=${filter.bulan}&tahun=${filter.tahun}`);
      
      console.log("DATA NERACA DITERIMA:", resNeraca.data);
      
      setData({ 
        summary: resNeraca.data || {}, 
        logs: resDetail.data || [] 
      });
    } catch (err) { 
      console.error("Gagal memuat data:", err); 
    }
  };

  useEffect(() => { fetchData(); }, [filter]);

  // Kalkulasi total biaya dari summary
  const totalBiaya = data.summary.beban_operasional || 0;

  // Hitung Totalan Manual dari data log untuk rekonsiliasi tabel
  const totalDebit = data.logs.filter(i => i.tipe !== 'Kredit').reduce((sum, i) => sum + (parseFloat(i.nominal) || 0), 0);
  const totalKredit = data.logs.filter(i => i.tipe === 'Kredit').reduce((sum, i) => sum + (parseFloat(i.nominal) || 0), 0);

  return (
    <div className="bg-slate-50 min-h-screen p-8 font-sans text-slate-900">
      <div className="flex justify-between items-end mb-8 border-b border-slate-300 pb-6 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Laporan Kinerja Keuangan</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Periode Laporan: {filter.bulan}/{filter.tahun}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded text-[10px] font-black uppercase hover:bg-slate-50"><Filter size={14}/> Ubah Periode</button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded text-[10px] font-black uppercase hover:bg-slate-800"><Printer size={14}/> Cetak Dokumen</button>
        </div>
      </div>

      {showFilter && (
        <div className="flex gap-4 p-6 bg-white border border-slate-200 mb-8 rounded shadow-sm print:hidden">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase">Bulan</label>
            <input type="number" className="border p-2 text-xs w-20 font-bold" value={filter.bulan} onChange={e => setFilter({...filter, bulan: e.target.value})} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase">Tahun</label>
            <input type="number" className="border p-2 text-xs w-20 font-bold" value={filter.tahun} onChange={e => setFilter({...filter, tahun: e.target.value})} />
          </div>
        </div>
      )}

      {/* KPI GRID - Kunci sinkronisasi ada di key 'pendapatan_nyata' dll */}
      {/* KPI GRID - PERBAIKAN KUNCI SESUAI DATA BACKEND */}
<div className="grid grid-cols-4 gap-6 mb-8">
  {/* Menggunakan kunci: pendapatan_tunai */}
  <KPICard 
    label="Kas Masuk (Lunas)" 
    value={`Rp ${(Number(data.summary.pendapatan_tunai) || 0).toLocaleString()}`} 
  />
  
  {/* Menggunakan kunci: pendapatan_potensial */}
  <KPICard 
    label="Kontrak Berjalan" 
    value={`Rp ${(Number(data.summary.pendapatan_potensial) || 0).toLocaleString()}`} 
  />
  
  {/* Menggunakan kunci: total_beban */}
  <KPICard 
    label="Beban Realisasi" 
    value={`Rp ${(Number(data.summary.total_beban) || 0).toLocaleString()}`} 
  />
  
  {/* Menggunakan kunci: laba_bersih_nyata */}
  <KPICard 
    label="Laba Bersih Nyata" 
    value={`Rp ${(Number(data.summary.laba_bersih_nyata) || 0).toLocaleString()}`} 
  />
</div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 bg-white p-6 border border-slate-200 shadow-sm rounded-sm">
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 border-b pb-4">Buku Besar Transaksi (Realisasi)</h3>
          <div className="h-96 overflow-y-auto">
            <table className="w-full text-[11px] border-collapse">
              <thead className="bg-slate-100 text-slate-600 uppercase sticky top-0 shadow-sm">
                <tr>
                  <th className="p-3 text-left border-b">Tanggal</th>
                  <th className="p-3 text-left border-b">Kategori</th>
                  <th className="p-3 text-left border-b">Unit</th>
                  <th className="p-3 text-right border-b">Debit (Keluar)</th>
                  <th className="p-3 text-right border-b">Kredit (Masuk)</th>
                </tr>
              </thead>
              <tbody className="divide-y font-mono">
                {data.logs.length > 0 ? data.logs.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3">{item.tanggal?.substring(0,10)}</td>
                    <td className="p-3 font-bold uppercase">{item.kategori}</td>
                    <td className="p-3 italic text-slate-600 font-bold">{item.no_lambung || 'NON-UNIT'}</td>
                    <td className="p-3 text-right font-black text-rose-700">
                      {item.tipe !== 'Kredit' ? item.nominal.toLocaleString('id-ID') : '-'}
                    </td>
                    <td className="p-3 text-right font-black text-emerald-700">
                      {item.tipe === 'Kredit' ? item.nominal.toLocaleString('id-ID') : '-'}
                    </td>
                  </tr>
                )) : <tr><td colSpan="5" className="p-6 text-center text-slate-400 italic">Tidak ada transaksi ditemukan.</td></tr>}
              </tbody>
              <tfoot className="bg-slate-50 font-black border-t-2 border-slate-300">
                <tr>
                  <td colSpan="3" className="p-3 text-right uppercase">Totalan Rekonsiliasi</td>
                  <td className="p-3 text-right text-rose-700">Rp {totalDebit.toLocaleString('id-ID')}</td>
                  <td className="p-3 text-right text-emerald-700">Rp {totalKredit.toLocaleString('id-ID')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="col-span-5 bg-white p-6 border border-slate-200 shadow-sm rounded-sm">
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 border-b pb-4">Komposisi Beban Biaya</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{name: 'Biaya', Towing: data.summary.rincian?.towing || 0, BBM: data.summary.rincian?.bbm || 0, Workshop: data.summary.rincian?.workshop || 0}]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" hide />
                <Tooltip formatter={(value) => `Rp ${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="Towing" fill="#f59e0b" />
                <Bar dataKey="BBM" fill="#ef4444" />
                <Bar dataKey="Workshop" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

const KPICard = ({ label, value }) => (
  <div className="bg-white p-6 border border-slate-200 shadow-sm rounded-sm">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <p className="text-md font-mono font-black">{value}</p>
  </div>
);