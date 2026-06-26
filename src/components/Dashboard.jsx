import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, Activity, Zap, TrendingUp, Database, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState({ 
    stat: { ready: 0, onsite: 0, maintenance: 0 }, 
    fin: { pendapatan_tunai: 0, total_beban: 0, laba_bersih_nyata: 0 }, 
    proyek: [] 
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [r1, r2, r3] = await Promise.all([
          axios.get('http://localhost:5000/api/dashboard-stat'),
          axios.get('http://localhost:5000/api/neraca-keuangan'),
          axios.get('http://localhost:5000/api/aktifitas-proyek')
        ]);
        setData({ stat: r1.data, fin: r2.data, proyek: r3.data });
      } catch (err) { console.error("Sync Error:", err); }
    };
    load();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-slate-900 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">PUSAT KENDALI OPERASIONAL</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">Telemetri Real-time & Manajemen Aset Terintegrasi</p>
        </div>
        <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-[10px] font-black uppercase text-slate-500 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> System Operational
        </div>
      </div>
      

      {/* KPI GRID - DENSITY ORIENTED */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <KPIBox title="Revenue Stream" val={data.fin.pendapatan_tunai} icon={<Wallet />} />
        <KPIBox title="Operational Cost" val={data.fin.total_beban} icon={<Activity />} />
        <KPIBox title="Net Profit" val={data.fin.laba_bersih_nyata} icon={<TrendingUp />} />
{/* Ganti bagian Total Asset Control dengan kode ini */}
<div className="bg-slate-900 p-6 rounded-2xl flex flex-col justify-center text-white shadow-lg">
    <p className="text-[9px] font-black uppercase opacity-60">Total Asset Control</p>
    <p className="text-xl font-black mt-1 text-white">
        {Number(data.stat.ready) + Number(data.stat.onsite) + Number(data.stat.maintenance)}
        <span className="text-[10px] font-medium opacity-50 ml-1">Units</span>
    </p>
</div>
      </div>

      {/* MAIN CONTENT - COMPACT DATA LAYOUT */}
      <div className="grid grid-cols-12 gap-6">
        {/* FLEET STATUS WIDGET */}
        <div className="col-span-4 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-8 tracking-widest">Indikator Integritas Armada</h3>
            <div className="space-y-6">
                <FleetBar label="Ready Units" count={data.stat.ready} color="bg-amber-500" />
                <FleetBar label="On-Site Ops" count={data.stat.onsite} color="bg-blue-600" />
                <FleetBar label="Maintenance" count={data.stat.maintenance} color="bg-rose-500" />
            </div>
        </div>

        {/* DYNAMIC ACTIVITY TRACKER */}
        <div className="col-span-8 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-widest">Monitor Situs Operasi Aktif</h3>
            <div className="space-y-3">
                {data.proyek.length > 0 ? data.proyek.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-1.5 h-10 ${item.status === 'On-Track' ? 'bg-emerald-500' : 'bg-amber-500'} rounded-full`}></div>
                            <div>
                                <p className="text-xs font-black uppercase">{item.site}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{item.units} Units Allocated</p>
                            </div>
                        </div>
                        <div className="text-[9px] font-black uppercase px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-inner">{item.status}</div>
                    </div>
                )) : <div className="text-center py-10 text-[10px] font-bold text-slate-300 uppercase italic">No active projects detected...</div>}
            </div>
        </div>
      </div>
    </div>
  );
}

const KPIBox = ({ title, val, icon }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-gray-50 rounded-xl text-gray-400">{icon}</div>
        <div>
            <p className="text-[9px] font-black uppercase text-gray-400">{title}</p>
            <p className="text-sm font-black text-slate-800">
                {/* Menggunakan NumberFormat untuk format Rupiah yang detail */}
                {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0
                }).format(val || 0)}
            </p>
        </div>
    </div>
);

const FleetBar = ({ label, count, color }) => (
    <div>
        <div className="flex justify-between text-[9px] font-black uppercase mb-2 text-slate-500"><span>{label}</span><span>{count} Units</span></div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className={`${color} h-full rounded-full transition-all duration-500`} style={{width: '75%'}}></div>
        </div>
    </div>
);