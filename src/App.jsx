import React, { useState } from 'react';
import { LayoutDashboard, Database, ClipboardList, Truck, CalendarDays, Wrench, Wallet, LogOut, User } from 'lucide-react';

// Impor Berkas Fitur & Halaman Login
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import MasterData from './components/MasterData';
import TransaksiRental from './components/TransaksiRental';
import LogistikArmada from './components/LogistikArmada';
import AktivitasHarian from './components/AktivitasHarian';
import WorkshopPemeliharaan from './components/WorkshopPemeliharaan';
import KeuanganLaporan from './components/KeuanganLaporan';

export default function App() {
  // State untuk menyimpan data user yang sedang aktif login
  const [userLogin, setUserLogin] = useState(null);
  const [menuAktif, setMenuAktif] = useState('Ringkasan');

  // Master semua menu sistem awal
  const seluruhMenu = [
    { nama: 'Ringkasan', ikon: <LayoutDashboard size={18} />, roles: ['Super Admin', 'Admin', 'Finance'] },
    { nama: 'Data Utama', ikon: <Database size={18} />, roles: ['Super Admin', 'Admin'] },
    { nama: 'Manajemen Rental', ikon: <ClipboardList size={18} />, roles: ['Super Admin', 'Admin'] },
    { nama: 'Logistik Armada', ikon: <Truck size={18} />, roles: ['Super Admin', 'Admin', 'Lapangan'] },
    { nama: 'Aktivitas Harian', ikon: <CalendarDays size={18} />, roles: ['Super Admin', 'Admin', 'Lapangan'] },
    { nama: 'Pemeliharaan', ikon: <Wrench size={18} />, roles: ['Super Admin', 'Admin', 'Mekanik', 'Lapangan'] },
    { nama: 'Keuangan', ikon: <Wallet size={18} />, roles: ['Super Admin', 'Admin', 'Finance'] },
  ];

  // LOGIKA UTAMA RBAC: Filter menu samping murni berdasarkan role user yang login
  const menuTersaring = seluruhMenu.filter(item => 
    userLogin && item.roles.includes(userLogin.role)
  );

  // Jika user belum sukses login, kunci aplikasi dan kunci di layar Login Portal
  if (!userLogin) {
    return <Login onLoginSukses={(user) => {
      setUserLogin(user);
      // Set default menu awal berdasarkan role saat masuk workspace
      if (user.role === 'Mekanik') setMenuAktif('Pemeliharaan');
      else if (user.role === 'Lapangan') setMenuAktif('Logistik Armada');
      else setMenuAktif('Ringkasan');
    }} />;
  }

  const renderKontenUtama = () => {
    switch (menuAktif) {
      case 'Ringkasan': return <Dashboard />;
      case 'Data Utama': return <MasterData userAktif={userLogin} />;
      case 'Manajemen Rental': return <TransaksiRental />;
      case 'Logistik Armada': return <LogistikArmada />;
      case 'Aktivitas Harian': return <AktivitasHarian />;
      case 'Pemeliharaan': return <WorkshopPemeliharaan />;
      case 'Keuangan': return <KeuanganLaporan />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F2F5] font-sans antialiased text-[#1E293B]">
      
      {/* TOPBAR */}
      <header className="h-16 w-full bg-[#1E2229] shadow-md flex items-center justify-between relative overflow-hidden border-b-2 border-[#D99B00]">
        <div className="absolute inset-y-0 left-0 flex items-center pl-6 text-[#111] font-black text-lg z-10" style={{ background: 'linear-gradient(135deg, #FFB800 0%, #D99B00 100%)', width: '35%', clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0 100%)' }}>
          <div className="flex items-center space-x-2">
            <span className="text-xl">SRF</span>
            <span className="tracking-wider uppercase text-xs font-black">Sistem Rental & Finansial</span>
          </div>
        </div>

        <div className="w-full flex items-center justify-end pr-6 h-full pl-[35%] bg-[#1E2229]">
          <div className="flex items-center space-x-4 text-white text-xs font-bold">
            <div className="flex flex-col text-right">
              <span className="text-gray-200 font-black">{userLogin.nama_lengkap}</span>
              <span className="text-[9px] text-[#FFB800] font-bold uppercase tracking-wider">{userLogin.role}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FFB800] to-[#D99B00] text-[#111] flex items-center justify-center font-black uppercase shadow-sm">
              {userLogin.username.charAt(0)}
            </div>
            <button 
              onClick={() => setUserLogin(null)} 
              className="p-1.5 bg-[#2D333F] rounded-lg border border-[#3A4252] text-gray-400 hover:text-red-400 transition-colors"
              title="Keluar Akun"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* WORKSPACE AREA */}
      <div className="flex flex-1">
        
        {/* SIDEBAR DENGAN MENU TERSARING KETAT */}
        <aside className="w-60 bg-[#1E2229] flex flex-col justify-between p-3 border-r border-[#2D333F] shadow-inner">
          <nav className="space-y-1">
            {menuTersaring.map((item) => {
              const isAktif = menuAktif === item.nama;
              return (
                <button
                  key={item.nama}
                  onClick={() => setMenuAktif(item.nama)}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-black text-xs transition-all duration-150 uppercase tracking-wider ${
                    isAktif ? 'bg-gradient-to-r from-[#FFB800] to-[#D99B00] text-[#111] shadow-lg' : 'text-gray-400 hover:bg-[#2D333F] hover:text-white'
                  }`}
                >
                  <span className={isAktif ? 'text-[#111]' : 'text-[#FFB800]'}>{item.ikon}</span>
                  <span>{item.nama}</span>
                </button>
              );
            })}
          </nav>
          <div className="p-2 text-[10px] text-gray-500 font-black uppercase tracking-widest px-4">RBAC PROTECTED ›</div>
        </aside>

        {/* WORKSPACE CONTENT CONTROLLER */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {renderKontenUtama()}
        </main>

      </div>
    </div>
  );
}