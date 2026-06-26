import React, { useState } from 'react';
import { ShieldCheck, User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

export default function Login({ onLoginSukses }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Fitur Baru: State untuk menyalakan/mematikan sensor mata intip password
  const [tampilkanPassword, setTampilkanPassword] = useState(false);
  // Fitur Baru: Status loading untuk mematikan tombol saat proses API berjalan
  const [sedangMemuat, setSedangMemuat] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validasi Frontend: Cegah spasi kosong atau isian manipulasi
    if (!username.trim() || !password.trim()) {
      alert("⚠️ VALIDASI: Kolom Username dan Kata Sandi wajib diisi!");
      return;
    }

    setSedangMemuat(true);
    try {
      const respon = await axios.post('http://localhost:5000/api/login', { 
        username: username.trim(), 
        password: password 
      });
      
      if (respon.data.sukses) {
        onLoginSukses(respon.data.user);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.message);
      } else {
        alert("❌ KONEKSI GAGAL: Server backend offline atau tidak merespons.");
      }
    } finally {
      setSedangMemuat(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#14161D] flex items-center justify-center p-4 relative overflow-hidden font-sans antialiased text-white">
      {/* Ornamen Estetis Background Industrial Core */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#FFB800]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#D99B00]/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-sm bg-[#1E2229] rounded-2xl shadow-2xl border border-gray-800/80 p-8 space-y-6 relative z-10 transition-all duration-300 hover:border-gray-700">
        
        {/* HEADER LOGO */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-br from-[#FFB800] to-[#D99B00] rounded-xl flex items-center justify-center text-[#111] mx-auto shadow-md shadow-yellow-500/10">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-base font-black uppercase tracking-wider text-gray-100">Portal Otentikasi</h2>
          <p className="text-[11px] text-gray-500 font-medium">Sistem Informasi Pengendalian Kontrak & Finansial</p>
        </div>

        {/* INPUT FORM */}
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold text-gray-400">
          <div>
            <label className="block mb-1 text-[9px] font-black uppercase tracking-wide text-gray-500">Username Akun</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-3.5 text-gray-500" />
              <input 
                type="text" 
                disabled={sedangMemuat}
                required 
                placeholder="Masukkan username" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                className="w-full p-3 pl-9 bg-[#14161D] border border-gray-800 rounded-xl text-gray-200 focus:outline-none focus:border-[#FFB800] transition-all font-medium disabled:opacity-50" 
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-[9px] font-black uppercase tracking-wide text-gray-500">Kata Sandi</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-3.5 text-gray-500" />
              <input 
                type={tampilkanPassword ? "text" : "password"} 
                disabled={sedangMemuat}
                required 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 pl-9 pr-10 bg-[#14161D] border border-gray-800 rounded-xl text-gray-200 focus:outline-none focus:border-[#FFB800] transition-all font-mono disabled:opacity-50" 
              />
              {/* TOMBOL MATA INTIP PASSWORD BARU */}
              <button
                type="button"
                disabled={sedangMemuat}
                onClick={() => setTampilkanPassword(!tampilkanPassword)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300 transition-colors focus:outline-none"
              >
                {tampilkanPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* BUTTON LOGIN DENGAN PROTEKSI LOCK LOADING */}
          <button 
            type="submit" 
            disabled={sedangMemuat}
            className="w-full mt-2 bg-gradient-to-r from-[#FFB800] to-[#D99B00] text-[#111] p-3.5 rounded-xl font-black uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all duration-150 transform active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
          >
            <span>{sedangMemuat ? "Memproses Verifikasi..." : "Masuk ke Workspace"}</span>
            {!sedangMemuat && <ArrowRight size={14} />}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-800/60">
          <p className="text-[9px] text-gray-600 font-black tracking-widest uppercase">Dilindungi Kendali Akses Berbasis Peran</p>
        </div>
      </div>
    </div>
  );
}