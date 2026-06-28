require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db'); // Koneksi database berbasis callback bawaanmu
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURATION MULTER: Menyimpan file upload langsung ke folder public/images proyek React
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../public/images');
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// API UNTUK PROSES UPLOAD FOTO UNIT ALAT BERAT
app.post('/api/upload-foto', upload.single('foto'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Gagal upload, file tidak ditemukan." });
    return res.json({ filename: req.file.filename });
});

// =========================================================================
// 1. APIS TABEL: ALAT BERAT (CRUD)
// =========================================================================
app.get('/api/alat-berat', (req, res) => {
    db.query("SELECT * FROM alat_berat ORDER BY updated_at DESC", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(result);
    });
});

app.post('/api/alat-berat', (req, res) => {
    const { no_lambung, nama_alat, spesifikasi, tarif_per_hari, status_unit, foto_url } = req.body;
    const sql = "INSERT INTO alat_berat (no_lambung, nama_alat, spesifikasi, tarif_per_hari, status_unit, foto_url) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [no_lambung, nama_alat, spesifikasi, tarif_per_hari, status_unit, foto_url], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ message: "DATA SUKSES: Aset alat berat baru berhasil didaftarkan!" });
    });
});

app.put('/api/alat-berat/:no_lambung', (req, res) => {
    const { no_lambung } = req.params;
    const { nama_alat, spesifikasi, tarif_per_hari, status_unit, foto_url } = req.body;
    const sql = "UPDATE alat_berat SET nama_alat = ?, spesifikasi = ?, tarif_per_hari = ?, status_unit = ?, foto_url = ? WHERE no_lambung = ?";
    db.query(sql, [nama_alat, spesifikasi, tarif_per_hari, status_unit, foto_url, no_lambung], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ message: `REVISI SUKSES: Data armada ${no_lambung} diperbarui!` });
    });
});

app.delete('/api/alat-berat/:no_lambung', (req, res) => {
    const { no_lambung } = req.params;
    db.query("DELETE FROM alat_berat WHERE no_lambung = ?", [no_lambung], (err) => {
        if (err) {
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ message: "PROTEKSI DATA: Unit ini tidak boleh dihapus karena memiliki riwayat sewa aktif!" });
            }
            return res.status(500).json({ error: err.message });
        }
        return res.json({ message: `HAPUS SUKSES: Unit ${no_lambung} berhasil dihapus!` });
    });
});

// =========================================================================
// 2. APIS TABEL: PEKERJA (CRUD)
// =========================================================================
app.get('/api/pekerja', (req, res) => {
    db.query("SELECT * FROM pekerja ORDER BY id_pekerja DESC", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(result);
    });
});

app.post('/api/pekerja', (req, res) => {
    const { nama_pekerja, peran, spesialisasi_sio, gaji_per_shift, status_tugas } = req.body;
    const sql = "INSERT INTO pekerja (nama_pekerja, peran, spesialisasi_sio, gaji_per_shift, status_tugas) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [nama_pekerja, peran, spesialisasi_sio, gaji_per_shift, status_tugas], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ message: "DATA SUKSES: Personel lapangan baru terdaftar!" });
    });
});

app.put('/api/pekerja/:id_pekerja', (req, res) => {
    const { id_pekerja } = req.params;
    const { nama_pekerja, peran, spesialisasi_sio, gaji_per_shift, status_tugas } = req.body;
    const sql = "UPDATE pekerja SET nama_pekerja = ?, peran = ?, spesialisasi_sio = ?, gaji_per_shift = ?, status_tugas = ? WHERE id_pekerja = ?";
    db.query(sql, [nama_pekerja, peran, spesialisasi_sio, gaji_per_shift, status_tugas, id_pekerja], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ message: `REVISI SUKSES: Profil pekerja ID #${id_pekerja} berhasil diperbarui!` });
    });
});

app.delete('/api/pekerja/:id_pekerja', (req, res) => {
    const { id_pekerja } = req.params;
    db.query("DELETE FROM pekerja WHERE id_pekerja = ?", [id_pekerja], (err) => {
        if (err) {
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ message: "PROTEKSI DATA: Pekerja tidak bisa dihapus karena terikat kontrak aktif!" });
            }
            return res.status(500).json({ error: err.message });
        }
        return res.json({ message: `HAPUS SUKSES: Data pekerja ID #${id_pekerja} dihapus!` });
    });
});

// =========================================================================
// 3. APIS TABEL: USERS (CRUD)
// =========================================================================
app.get('/api/users', (req, res) => {
    db.query("SELECT id_user, username, nama_lengkap, role, created_at FROM users ORDER BY id_user ASC", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(result);
    });
});

app.post('/api/users', (req, res) => {
    const { username, password, nama_lengkap, role } = req.body;
    db.query("INSERT INTO users (username, password, nama_lengkap, role) VALUES (?, ?, ?, ?)", [username, password, nama_lengkap, role], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ message: "DATA SUKSES: Akun kredensial baru dikunci!" });
    });
});

app.put('/api/users/:id_user', (req, res) => {
    const { id_user } = req.params;
    const { username, password, nama_lengkap, role } = req.body;
    let sql = "UPDATE users SET username = ?, nama_lengkap = ?, role = ? WHERE id_user = ?";
    let params = [username, nama_lengkap, role, id_user];
    if (password && password.trim() !== "") {
        sql = "UPDATE users SET username = ?, password = ?, nama_lengkap = ?, role = ? WHERE id_user = ?";
        params = [username, password, nama_lengkap, role, id_user];
    }
    db.query(sql, params, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ message: `REVISI SUKSES: Hak akses user ID #${id_user} diperbarui!` });
    });
});

app.delete('/api/users/:id_user', (req, res) => {
    const { id_user } = req.params;
    db.query("SELECT role FROM users WHERE id_user = ?", [id_user], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length > 0 && rows[0].role === 'Super Admin') {
            return res.status(400).json({ message: "AKSES DITOLAK: Akun 'Super Admin' tidak boleh dihapus!" });
        }
        db.query("DELETE FROM users WHERE id_user = ?", [id_user], (errDel) => {
            if (errDel) return res.status(500).json({ error: errDel.message });
            return res.json({ message: "HAPUS SUKSES: Akun staf berhasil dicabut!" });
        });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query("SELECT id_user, username, nama_lengkap, role FROM users WHERE username = ? AND password = ?", [username, password], (err, rows) => {
        if (err) return res.status(500).json(err);
        if (rows.length > 0) return res.json({ sukses: true, user: rows[0] });
        else return res.status(401).json({ sukses: false, message: "LOGIN GAGAL!" });
    });
});

// =========================================================================
// 4. APIS INTI: MANAJEMEN RENTAL (GET, POST & PUT EDIT/BATAL - CALLBACK STYLE)
// =========================================================================
// =========================================================================
// API GET TRANSAKSI (PENGUNCIAN TANGGAL RENTAL DIREK DARI QUERY MYSQL)
// =========================================================================
app.get('/api/transaksi', (req, res) => {
    const sqlTransaksiAkurat = `
        SELECT 
            id_kontrak,
            no_lambung,
            id_operator,
            penyewa,
            alamat_site_bebas,
            pic_lapangan,
            no_whatsapp_pic,
            TO_CHAR(tanggal_mulai, 'YYYY-MM-DD') AS tanggal_mulai,
            TO_CHAR(tanggal_selesai, 'YYYY-MM-DD') AS tanggal_selesai,
            total_hari_sewa,
            total_harga_kontrak,
            uang_muka_dp,
            sisa_pembayaran,
            status_pembayaran,
            status_transaksi,
            id_user_input,
            created_at
        FROM transaksi_rental 
        ORDER BY created_at DESC
    `;

    db.query(sqlTransaksiAkurat, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(result);
    });
});

app.post('/api/transaksi', (req, res) => {
    const {
        no_lambung, id_operator, penyewa, alamat_site_bebas, pic_lapangan, no_whatsapp_pic,
        tanggal_mulai, tanggal_selesai, total_hari_sewa, total_harga_kontrak, uang_muka_dp, sisa_pembayaran, status_pembayaran
    } = req.body;

    const status_transaksi = 'Aktif';
    const id_kontrak = `TRX-${Date.now().toString().slice(-6)}`;

    // Amankan string tanggal dari gangguan offset jam timezone
    const tglMulaiMurni = tanggal_mulai ? String(tanggal_mulai).substring(0, 10) : null;
    const tglSelesaiMurni = tanggal_selesai ? String(tanggal_selesai).substring(0, 10) : null;

    // 🎯 REVISI 1: Masukkan kolom DP, sisa_pembayaran, dan status_pembayaran ke query INSERT
    const sqlInsert = `
        INSERT INTO transaksi_rental 
        (id_kontrak, no_lambung, id_operator, penyewa, alamat_site_bebas, pic_lapangan, no_whatsapp_pic, tanggal_mulai, tanggal_selesai, total_hari_sewa, total_harga_kontrak, uang_muka_dp, sisa_pembayaran, status_pembayaran, status_transaksi, id_user_input, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
    `;

    db.query(sqlInsert, [
        id_kontrak, no_lambung, id_operator, penyewa, alamat_site_bebas, pic_lapangan, no_whatsapp_pic,
        tglMulaiMurni, tglSelesaiMurni, total_hari_sewa, total_harga_kontrak, 
        Number(uang_muka_dp) || 0, Number(sisa_pembayaran) || 0, status_pembayaran || 'Belum Bayar', status_transaksi
    ], (errInsert) => {
        if (errInsert) {
            console.error("SQL Eror:", errInsert.message);
            return res.status(500).json({ error: "Gagal menyimpan kontrak ke database." });
        }

        // 🎯 REVISI 2: AUTOMATION STATUS UNIT LANGSUNG SAAT POST ORDER BARU
        // Kita bandingkan rentang tanggal sewa murni terhadap tanggal hari ini (WIB)
        const hariIniStr = new Date().toLocaleDateString('sv-SE'); // Menghasilkan format murni YYYY-MM-DD sesuai komputer lokal
        const waktuHariIni = new Date(hariIniStr + "T00:00:00").getTime();
        const waktuMulaiSewa = new Date(tglMulaiMurni + "T00:00:00").getTime();

        // Jika hari ini sudah masuk atau melewati tanggal mulai sewa (misal sewa tgl 3, hari ini tgl 5), langsung set On-Site
        const statusUnitBaru = waktuHariIni >= waktuMulaiSewa ? 'On-Site' : 'Ready';
        const statusPekerjaBaru = waktuHariIni >= waktuMulaiSewa ? 'Bertugas' : 'Siap';

        // Jalankan query update fisik ke tabel master aset dan pekerja
        db.query("UPDATE alat_berat SET status_unit = ? WHERE no_lambung = ?", [statusUnitBaru, no_lambung]);
        db.query("UPDATE pekerja SET status_tugas = ? WHERE id_pekerja = ?", [statusPekerjaBaru, id_operator]);

        return res.json({ message: `Kontrak berhasil divalidasi. Unit ${no_lambung} telah diperbarui dengan status [${statusUnitBaru}]` });
    });
});

app.put('/api/transaksi/:id_kontrak', (req, res) => {
    const { id_kontrak } = req.params;
    const {
        no_lambung, id_operator, penyewa, alamat_site_bebas, pic_lapangan, no_whatsapp_pic,
        tanggal_mulai, tanggal_selesai, total_hari_sewa, total_harga_kontrak,
        uang_muka_dp, sisa_pembayaran, status_pembayaran, status_transaksi
    } = req.body;

    db.query("SELECT no_lambung, id_operator, status_transaksi FROM transaksi_rental WHERE id_kontrak = ?", [id_kontrak], (errCheck, rows) => {
        if (errCheck) return res.status(500).json({ error: errCheck.message });
        if (rows.length === 0) return res.status(404).json({ message: "Kontrak tidak ditemukan." });

        const dataLama = rows[0];

        // 🎯 FIX UTAMA: Amankan tanggal saat proses edit simpan data sewa
        const tglMulaiMurni = tanggal_mulai ? String(tanggal_mulai).substring(0, 10) : null;
        const tglSelesaiMurni = tanggal_selesai ? String(tanggal_selesai).substring(0, 10) : null;

        const sqlUpdate = `
            UPDATE transaksi_rental SET 
                no_lambung = ?, id_operator = ?, penyewa = ?, alamat_site_bebas = ?, 
                pic_lapangan = ?, no_whatsapp_pic = ?, tanggal_mulai = ?, tanggal_selesai = ?, 
                total_hari_sewa = ?, total_harga_kontrak = ?, uang_muka_dp = ?, 
                sisa_pembayaran = ?, status_pembayaran = ?, status_transaksi = ?
            WHERE id_kontrak = ?
        `;

        db.query(sqlUpdate, [
            no_lambung, id_operator, penyewa, alamat_site_bebas, pic_lapangan, no_whatsapp_pic,
            tglMulaiMurni, tglSelesaiMurni, total_hari_sewa, total_harga_kontrak,
            uang_muka_dp, sisa_pembayaran, status_pembayaran, status_transaksi, id_kontrak
        ], (errUpdate) => {
            if (errUpdate) return res.status(500).json({ error: errUpdate.message });

            if (status_transaksi === 'Batal' && dataLama.status_transaksi !== 'Batal') {
                db.query("UPDATE alat_berat SET status_unit = 'Ready' WHERE no_lambung = ?", [dataLama.no_lambung]);
                db.query("UPDATE pekerja SET status_tugas = 'Siap' WHERE id_pekerja = ?", [dataLama.id_operator]);
                return res.json({ message: `KONTRAK BATAL: Kontrak ${id_kontrak} dibatalkan. Status armada & operator dilepas!` });
            }

            const hariIniStr = new Date().toISOString().split('T')[0];
            const waktuHariIni = new Date(hariIniStr + "T00:00:00").getTime();
            const waktuMulaiSewa = new Date(tglMulaiMurni + "T00:00:00").getTime();

            const statusUnitBaru = waktuHariIni >= waktuMulaiSewa ? 'On-Site' : 'Ready';
            const statusPekerjaBaru = waktuHariIni >= waktuMulaiSewa ? 'Bertugas' : 'Siap';

            if (dataLama.no_lambung !== no_lambung) {
                db.query("UPDATE alat_berat SET status_unit = 'Ready' WHERE no_lambung = ?", [dataLama.no_lambung]);
                db.query("UPDATE alat_berat SET status_unit = ? WHERE no_lambung = ?", [statusUnitBaru, no_lambung]);
            }
            if (dataLama.id_operator !== id_operator) {
                db.query("UPDATE pekerja SET status_tugas = 'Siap' WHERE id_pekerja = ?", [dataLama.id_operator]);
                db.query("UPDATE pekerja SET status_tugas = ? WHERE id_pekerja = ?", [statusPekerjaBaru, id_operator]);
            }

            return res.json({ message: `KONTRAK UPDATED: Perubahan data kontrak ${id_kontrak} berhasil disimpan!` });
        });
    });
});

// =========================================================================
// 5. APIS OPERASIONAL LAINNYA (DASHBOARD, SURAT JALAN, LOG, MAINTENACE, DLL)
// =========================================================================
app.get('/api/dashboard-stat', (req, res) => { 
    // Query ini secara eksplisit hanya menjumlahkan baris dengan status yang valid
    const sql = `
        SELECT 
            SUM(CASE WHEN status_unit = 'Ready' THEN 1 ELSE 0 END) AS ready, 
            SUM(CASE WHEN status_unit = 'On-Site' THEN 1 ELSE 0 END) AS onsite, 
            SUM(CASE WHEN status_unit = 'Maintenance' THEN 1 ELSE 0 END) AS maintenance 
        FROM alat_berat
        WHERE status_unit IN ('Ready', 'On-Site', 'Maintenance')
    `;
    db.query(sql, (err, rows) => { 
        if (err) return res.status(500).json(err); 
        return res.json({ 
            ready: rows[0].ready || 0, 
            onsite: rows[0].onsite || 0, 
            maintenance: rows[0].maintenance || 0 
        }); 
    }); 
});

// =========================================================================
// API GET SURAT JALAN (PENGUNCIAN FORMAT TEKS DIREK DARI QUERY MYSQL)
// =========================================================================
app.get('/api/surat-jalan', (req, res) => { 
    // Kita panggil semua kolom secara spesifik, dan bungkus tanggal dengan DATE_FORMAT agar menjadi string murni
    const sqlLogistikAkurat = `
        SELECT 
            id_surat_jalan,
            id_kontrak,
            nama_supir_towing,
            ongkos_angkut_towing,
            hm_awal,
            hm_akhir,
            status_mobilisasi,
            TO_CHAR(tanggal_keluar, 'YYYY-MM-DD') AS tanggal_keluar,
            TO_CHAR(tanggal_masuk, 'YYYY-MM-DD') AS tanggal_masuk
        FROM surat_jalan 
        ORDER BY id_surat_jalan DESC
    `;

    db.query(sqlLogistikAkurat, (err, result) => { 
        if (err) return res.status(500).json({ error: err.message }); 
        return res.json(result); 
    }); 
});

app.post('/api/surat-jalan', (req, res) => { 
    const { id_kontrak, nama_supir_towing, ongkos_angkut_towing, hm_awal, tanggal_keluar } = req.body; 
    const tglKeluarMurni = tanggal_keluar ? String(tanggal_keluar).substring(0, 10) : null;
    const hariIni = new Date().toISOString().split('T')[0]; // Mendapatkan tanggal hari ini (YYYY-MM-DD)

    db.query("SELECT no_lambung FROM transaksi_rental WHERE id_kontrak = ?", [id_kontrak], (err, rows) => {
        if (err || rows.length === 0) return res.status(500).json({ error: "Kontrak tidak ditemukan." });
        const { no_lambung } = rows[0];

        const sqlInsert = `INSERT INTO surat_jalan (id_kontrak, nama_supir_towing, ongkos_angkut_towing, hm_awal, tanggal_keluar, status_mobilisasi) VALUES (?, ?, ?, ?, ?, 'Mobilisasi')`;

        db.query(sqlInsert, [id_kontrak, nama_supir_towing, Number(ongkos_angkut_towing) || 0, Number(hm_awal) || 0, tglKeluarMurni], (err) => { 
            if (err) return res.status(500).json({ error: err.message }); 
            
            // Logika baru: Cek apakah tanggal keberangkatan adalah hari ini atau sudah lewat
            // Letak: Di dalam app.post('/api/surat-jalan'), di dalam callback query INSERT
if (tglKeluarMurni <= hariIni) {
    // Tanggal sudah tiba/hari ini: Paksa ubah ke status On-Site
    db.query("UPDATE transaksi_rental SET status_transaksi = 'Jalan' WHERE id_kontrak = ?", [id_kontrak]); 
    db.query("UPDATE alat_berat SET status_unit = 'On-Site' WHERE no_lambung = ?", [no_lambung]); 
    return res.json({ message: "BERHASIL: Mobilisasi sukses, status unit kini ON-SITE." });
} else {
    // Tanggal masih di masa depan: JANGAN ubah status unit (biarkan Ready)
    return res.json({ message: "BERHASIL: Surat jalan dibuat. Status unit tetap Ready sampai jadwal tiba." });
}
        }); 
    });
});

// RUTE BARU: Menangani pencatatan unit kembali ke pool (Demobilisasi)
app.put('/api/surat-jalan-kembali/:id_kontrak', (req, res) => {
    const { id_kontrak } = req.params;
    const { tanggal_masuk, hm_akhir } = req.body;
    
    // Pastikan tanggal dipotong ke format YYYY-MM-DD
    const tglMasukMurni = tanggal_masuk ? String(tanggal_masuk).substring(0, 10) : null;
    const hariIni = new Date().toISOString().split('T')[0]; // Mendapatkan tanggal 2026-06-09

    db.query("SELECT no_lambung, id_operator FROM transaksi_rental WHERE id_kontrak = ?", [id_kontrak], (errFind, rows) => {
        if (errFind || rows.length === 0) return res.status(404).json({ message: "Data tidak ditemukan." });

        const { no_lambung, id_operator } = rows[0];

        // 1. Simpan data tanggal masuk ke database
        const sqlUpdateLogistik = `
            UPDATE surat_jalan SET 
                tanggal_masuk = ?, 
                hm_akhir = ?, 
                status_mobilisasi = 'Demobilisasi'
            WHERE id_kontrak = ?
        `;

        db.query(sqlUpdateLogistik, [tglMasukMurni, hm_akhir, id_kontrak], (errUpdate) => {
            if (errUpdate) return res.status(500).json({ error: errUpdate.message });

            // 2. LOGIKA PENGUNCIAN:
            // Jika tanggal masuk <= hari ini (misal tgl 9), maka ubah ke Ready
            // Jika tanggal masuk > hari ini (misal tgl 10), maka unit tetap 'Jalan' / 'On-Site'
            if (tglMasukMurni <= hariIni) {
                db.query("UPDATE transaksi_rental SET status_transaksi = 'Selesai' WHERE id_kontrak = ?", [id_kontrak]);
                db.query("UPDATE alat_berat SET status_unit = 'Ready' WHERE no_lambung = ?", [no_lambung]);
                db.query("UPDATE pekerja SET status_tugas = 'Siap' WHERE id_pekerja = ?", [id_operator]);
                
                return res.json({ message: "DEMOBILISASI: Unit telah kembali, status sudah READY." });
            } else {
                // Unit masih dalam perjalanan kembali / menunggu tanggal
                return res.json({ message: "BERHASIL: Data kepulangan dicatat. Status unit tetap 'On-Site' sampai tanggal tiba." });
            }
        });
    });
});

app.get('/api/log-harian', (req, res) => { 
    db.query("SELECT * FROM log_harian_alat ORDER BY tanggal_log DESC", (err, result) => { 
        if (err) return res.status(500).json(err); 
        return res.json(result); 
    }); 
});

app.post('/api/log-harian', (req, res) => { 
    const { id_kontrak, tanggal_log, hm_pakai_hari_ini, liter_bbm, biaya_bbm_nota, catatan_lapangan } = req.body; 
    db.query(`INSERT INTO log_harian_alat (id_kontrak, tanggal_log, hm_pakai_hari_ini, liter_bbm, biaya_bbm_nota, catatan_lapangan) VALUES (?, ?, ?, ?, ?, ?)`, [id_kontrak, tanggal_log, hm_pakai_hari_ini, liter_bbm, biaya_bbm_nota, catatan_lapangan], (err) => { 
        if (err) return res.status(500).json(err); 
        return res.json({ message: "Log Aktivitas Harian Disimpan!" }); 
    }); 
});




app.get('/api/grafik-keuangan', (req, res) => { 
    db.query("SELECT TO_CHAR(tanggal_mulai, 'Mon') AS bulan, SUM(total_harga_kontrak) AS Pemasukan, SUM(total_harga_kontrak) AS LabaBersih FROM transaksi_rental WHERE status_transaksi != 'Batal' GROUP BY TO_CHAR(tanggal_mulai, 'Mon'), EXTRACT(MONTH FROM tanggal_mulai) ORDER BY EXTRACT(MONTH FROM tanggal_mulai) ASC", (err, rows) => { 
        if (err) return res.status(500).json(err); 
        if (rows.length === 0) return res.json([{ name: 'Jan', Pemasukan: 0, Pengeluaran: 0, LabaBersih: 0 }]); 
        return res.json(rows.map(i => ({ name: i.bulan, Pemasukan: parseFloat(i.Pemasukan), Pengeluaran: 0, LabaBersih: parseFloat(i.LabaBersih) }))); 
    }); 
});

// =========================================================================
// API EDIT SURAT JALAN (PENGUNCIAN TEKS STRIP TIMEZONE DATABASE)
// =========================================================================
app.put('/api/surat-jalan/:id_surat_jalan', (req, res) => {
    const { id_surat_jalan } = req.params;
    const { nama_supir_towing, ongkos_angkut_towing, hm_awal, tanggal_keluar, tanggal_masuk, hm_akhir } = req.body;

    const tglKeluarMurni = tanggal_keluar ? String(tanggal_keluar).substring(0, 10) : null;
    const tglMasukMurni = tanggal_masuk ? String(tanggal_masuk).substring(0, 10) : null;
    const hariIni = new Date().toISOString().split('T')[0]; // Mendapatkan tanggal hari ini (YYYY-MM-DD)

    // 1. Ambil id_kontrak terlebih dahulu
    db.query("SELECT id_kontrak FROM surat_jalan WHERE id_surat_jalan = ?", [id_surat_jalan], (err, rows) => {
        if (err || rows.length === 0) return res.status(404).json({ message: "Surat jalan tidak ditemukan." });
        
        const { id_kontrak } = rows[0];
        
        // 2. Update data surat jalan
        const sqlUpdate = `UPDATE surat_jalan SET nama_supir_towing=?, ongkos_angkut_towing=?, hm_awal=?, tanggal_keluar=?, tanggal_masuk=?, hm_akhir=? WHERE id_surat_jalan=?`;
        
        db.query(sqlUpdate, [nama_supir_towing, ongkos_angkut_towing, hm_awal, tglKeluarMurni, tglMasukMurni, hm_akhir, id_surat_jalan], (errUpdate) => {
            if (errUpdate) return res.status(500).json({ error: errUpdate.message });
            
            // 3. Logika sinkronisasi status: 
            // Hanya ubah ke 'On-Site' jika tanggal keberangkatan adalah hari ini atau masa lalu.
            if (tglKeluarMurni && tglKeluarMurni <= hariIni) {
                db.query("UPDATE transaksi_rental SET status_transaksi = 'Jalan' WHERE id_kontrak = ?", [id_kontrak]);
                db.query("UPDATE alat_berat SET status_unit = 'On-Site' WHERE no_lambung = (SELECT no_lambung FROM transaksi_rental WHERE id_kontrak = ?)", [id_kontrak], (errUpdateAlat) => {
                    if (errUpdateAlat) console.error("Gagal sinkronisasi status alat:", errUpdateAlat);
                });
                return res.json({ message: "REVISI SUKSES: Data diperbarui & unit kini berstatus ON-SITE." });
            } 
            
            // Jika tanggal masa depan, unit tetap di status sebelumnya (tidak dipaksa On-Site)
            return res.json({ message: "REVISI SUKSES: Data surat jalan diperbarui (Jadwal di masa depan)." });
        });
    });
});


// 2. API BATAL / HAPUS SURAT JALAN (Mengembalikan status transaksi & unit ke pool)
app.delete('/api/surat-jalan/:id_surat_jalan/:id_kontrak', (req, res) => {
    const { id_surat_jalan, id_kontrak } = req.params;

    // Ambil data unit dari kontrak terlebih dahulu sebelum manifes dihapus
    db.query("SELECT no_lambung, id_operator FROM transaksi_rental WHERE id_kontrak = ?", [id_kontrak], (errFind, rows) => {
        if (errFind) return res.status(500).json({ error: errFind.message });
        
        // Jalankan penghapusan manifes surat jalan
        db.query("DELETE FROM surat_jalan WHERE id_surat_jalan = ?", [id_surat_jalan], (errDel) => {
            if (errDel) return res.status(500).json({ error: errDel.message });

            // Kembalikan status transaksi rental menjadi 'Aktif' (antrean semula)
            db.query("UPDATE transaksi_rental SET status_transaksi = 'Aktif' WHERE id_kontrak = ?", [id_kontrak], () => {
                if (rows.length > 0) {
                    const { no_lambung, id_operator } = rows[0];
                    // Kembalikan unit dan pekerja menjadi Ready/Siap di pool workshop
                    db.query("UPDATE alat_berat SET status_unit = 'Ready' WHERE no_lambung = ?", [no_lambung]);
                    db.query("UPDATE pekerja SET status_tugas = 'Siap' WHERE id_pekerja = ?", [id_operator]);
                }
                res.json({ message: "MANIFES DIBATALKAN: Surat jalan dihapus, armada & status rental dikembalikan ke status antrean awal!" });
            });
        });
    });
});

// =========================================================================
// FITUR TAMBAHAN: EDIT & HAPUS LOG AKTIVITAS HARIAN
// =========================================================================

// 1. API UPDATE / EDIT DATA LOG HARIAN
app.put('/api/log-harian/:id_log', (req, res) => {
    const { id_log } = req.params;
    const { tanggal_log, hm_pakai_hari_ini, liter_bbm, biaya_bbm_nota, catatan_lapangan } = req.body;

    const tglLogMurni = tanggal_log ? String(tanggal_log).substring(0, 10) : null;

    const sqlUpdateLog = `
        UPDATE log_harian_alat SET 
            tanggal_log = ?, 
            hm_pakai_hari_ini = ?, 
            liter_bbm = ?, 
            biaya_bbm_nota = ?, 
            catatan_lapangan = ?
        WHERE id_log = ?
    `;

    db.query(sqlUpdateLog, [
        tglLogMurni, 
        Number(hm_pakai_hari_ini) || 0, 
        Number(liter_bbm) || 0, 
        Number(biaya_bbm_nota) || 0, 
        catatan_lapangan, 
        id_log
    ], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "REVISI LOG SUKSES: Laporan aktivitas harian berhasil diperbarui!" });
    });
});

// 2. API DELETE / HAPUS DATA LOG HARIAN
app.delete('/api/log-harian/:id_log', (req, res) => {
    const { id_log } = req.params;
    db.query("DELETE FROM log_harian_alat WHERE id_log = ?", [id_log], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "LOG DIHAPUS: Laporan operasional harian berhasil dibersihkan!" });
    });
});

// =========================================================================
// MODUL WORKSHOP & PEMELIHARAAN (VERSI FINAL - HAPUS SEMUA RUTE WORKSHOP LAMA SEBELUMNYA)
// =========================================================================

app.get('/api/workshop', (req, res) => {
    db.query("SELECT * FROM workshop_maintenance ORDER BY id_perbaikan DESC", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

app.post('/api/workshop', (req, res) => { 
    const { no_lambung, id_mekanik, tanggal_kerusakan, deskripsi_kerusakan, tindakan_perbaikan, biaya_sparepart } = req.body; 
    const tglMurni = tanggal_kerusakan ? String(tanggal_kerusakan).substring(0, 10) : null;
    const hariIni = new Date().toLocaleDateString('sv-SE');

    // 1. Validasi: Cek status saat ini DAN cek apakah sudah ada booking untuk mekanik/alat di tanggal tersebut
    const checkSql = `
        SELECT 
            (SELECT status_unit FROM alat_berat WHERE no_lambung = ?) as status_alat,
            (SELECT status_tugas FROM pekerja WHERE id_pekerja = ?) as status_mekanik,
            (SELECT COUNT(*) FROM workshop_maintenance WHERE id_mekanik = ? AND tanggal_kerusakan = ? AND status_perbaikan != 'Selesai') as booking_mekanik,
            (SELECT COUNT(*) FROM workshop_maintenance WHERE no_lambung = ? AND tanggal_kerusakan = ? AND status_perbaikan != 'Selesai') as booking_alat
    `;

    db.query(checkSql, [no_lambung, id_mekanik, id_mekanik, tglMurni, no_lambung, tglMurni], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const { status_alat, status_mekanik, booking_mekanik, booking_alat } = result[0];

        // Validasi: Status saat ini
        if (status_alat === 'On-Site') return res.status(400).json({ error: "Gagal: Armada ini sedang disewa!" });
        
        // Validasi: Double booking (cek apakah sudah ada job lain di tanggal yang sama)
        if (booking_mekanik > 0) return res.status(400).json({ error: "Gagal: Mekanik ini sudah di-booking pada tanggal tersebut!" });
        if (booking_alat > 0) return res.status(400).json({ error: "Gagal: Armada ini sudah di-booking untuk perbaikan pada tanggal tersebut!" });

        // 2. INSERT data
        const statusAwal = (tglMurni === hariIni) ? 'Maintenance' : 'Menunggu';
        const sql = "INSERT INTO workshop_maintenance (no_lambung, id_mekanik, tanggal_kerusakan, deskripsi_kerusakan, tindakan_perbaikan, biaya_sparepart, status_perbaikan) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        db.query(sql, [no_lambung, id_mekanik, tglMurni, deskripsi_kerusakan, tindakan_perbaikan, biaya_sparepart, statusAwal], (err) => { 
            if (err) return res.status(500).json({ error: err.message }); 
            
            // 3. Update status fisik HANYA JIKA hari ini
            if (tglMurni === hariIni) {
                db.query("UPDATE alat_berat SET status_unit = 'Maintenance' WHERE no_lambung = ?", [no_lambung]);
                db.query("UPDATE pekerja SET status_tugas = 'Bertugas' WHERE id_pekerja = ?", [id_mekanik]);
            }
            
            res.json({ message: "Sukses: Jadwal maintenance tersimpan!" });
        }); 
    });
});

app.put('/api/workshop/:id', (req, res) => {
    const { no_lambung, id_mekanik, tanggal_kerusakan, deskripsi_kerusakan, tindakan_perbaikan, biaya_sparepart } = req.body;
    const sql = "UPDATE workshop_maintenance SET no_lambung=?, id_mekanik=?, tanggal_kerusakan=?, deskripsi_kerusakan=?, tindakan_perbaikan=?, biaya_sparepart=? WHERE id_perbaikan=?";
    db.query(sql, [no_lambung, id_mekanik, tanggal_kerusakan, deskripsi_kerusakan, tindakan_perbaikan, biaya_sparepart, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Update berhasil" });
    });
});

app.put('/api/workshop-selesai/:id', (req, res) => {
    const { status_perbaikan, updated_at } = req.body;
    
    // Ambil ID mekanik sebelum unit status jadi Ready
    db.query("SELECT id_mekanik FROM workshop_maintenance WHERE id_perbaikan = ?", [req.params.id], (err, rows) => {
        const idMekanik = rows[0].id_mekanik;

        const sql = "UPDATE workshop_maintenance SET status_perbaikan = ?, updated_at = ? WHERE id_perbaikan = ?";
        db.query(sql, [status_perbaikan, updated_at, req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Set alat jadi Ready
            db.query("UPDATE alat_berat SET status_unit = 'Ready' WHERE no_lambung = (SELECT no_lambung FROM workshop_maintenance WHERE id_perbaikan = ?)", [req.params.id]);
            // Set mekanik jadi Siap
            db.query("UPDATE pekerja SET status_tugas = 'Siap' WHERE id_pekerja = ?", [idMekanik]);
            
            res.json({ message: "Selesai" });
        });
    });
});

app.delete('/api/workshop/:id/:no_lambung', (req, res) => {
    db.query("DELETE FROM workshop_maintenance WHERE id_perbaikan = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query("UPDATE alat_berat SET status_unit = 'Ready' WHERE no_lambung = ?", [req.params.no_lambung]);
        res.json({ message: "Dihapus" });
    });
});


// ... (kode di atas tetap sama)

// 2. API KEUANGAN DETAIL (DIPERBAIKI: Menambahkan Pemasukan/Kredit)
app.get('/api/keuangan-detail', (req, res) => {
    const { bulan, tahun } = req.query;
    
    const sql = `
        -- PENGELUARAN (DEBIT)
        SELECT 'Workshop' as kategori, no_lambung, deskripsi_kerusakan as keterangan, biaya_sparepart as nominal, tanggal_kerusakan as tanggal, 'Debit' as tipe 
        FROM workshop_maintenance WHERE EXTRACT(MONTH FROM tanggal_kerusakan) = CAST(? AS INT) AND EXTRACT(YEAR FROM tanggal_kerusakan) = CAST(? AS INT)
        
        UNION ALL
        
        SELECT 'BBM' as kategori, (SELECT no_lambung FROM transaksi_rental WHERE transaksi_rental.id_kontrak = log_harian_alat.id_kontrak) as no_lambung, catatan_lapangan as keterangan, biaya_bbm_nota as nominal, tanggal_log as tanggal, 'Debit' as tipe 
        FROM log_harian_alat WHERE EXTRACT(MONTH FROM tanggal_log) = CAST(? AS INT) AND EXTRACT(YEAR FROM tanggal_log) = CAST(? AS INT)
        
        UNION ALL
        
        SELECT 'Towing' as kategori, (SELECT no_lambung FROM transaksi_rental WHERE transaksi_rental.id_kontrak = surat_jalan.id_kontrak) as no_lambung, 'Mobilisasi Alat Berat' as keterangan, ongkos_angkut_towing as nominal, tanggal_keluar as tanggal, 'Debit' as tipe 
        FROM surat_jalan WHERE EXTRACT(MONTH FROM tanggal_keluar) = CAST(? AS INT) AND EXTRACT(YEAR FROM tanggal_keluar) = CAST(? AS INT)
        
        UNION ALL
        
        -- PEMASUKAN (KREDIT)
        SELECT 'Pendapatan Sewa' as kategori, no_lambung, 'Pembayaran Kontrak' as keterangan, total_harga_kontrak as nominal, tanggal_mulai as tanggal, 'Kredit' as tipe 
        FROM transaksi_rental WHERE status_transaksi = 'Selesai' AND EXTRACT(MONTH FROM tanggal_selesai) = CAST(? AS INT) AND EXTRACT(YEAR FROM tanggal_selesai) = CAST(? AS INT)
    `;

    db.query(sql, [bulan, tahun, bulan, tahun, bulan, tahun, bulan, tahun], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});


app.get('/api/neraca-keuangan', (req, res) => {
    const sql = `
        SELECT 
            (SELECT COALESCE(SUM(total_harga_kontrak), 0) FROM transaksi_rental WHERE LOWER(TRIM(status_transaksi)) = 'selesai') as tunai,
            (SELECT COALESCE(SUM(total_harga_kontrak), 0) FROM transaksi_rental WHERE LOWER(TRIM(status_transaksi)) NOT IN ('selesai', 'batal')) as potensial,
            (SELECT COALESCE(SUM(biaya_sparepart), 0) FROM workshop_maintenance) as workshop,
            (SELECT COALESCE(SUM(biaya_bbm_nota), 0) FROM log_harian_alat) as bbm,
            (SELECT COALESCE(SUM(ongkos_angkut_towing), 0) FROM surat_jalan) as towing
    `;

    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const r = rows[0];
        const tunai = parseFloat(r.tunai) || 0;
        const potensi = parseFloat(r.potensial) || 0;
        const totalBeban = parseFloat(r.workshop) + parseFloat(r.bbm) + parseFloat(r.towing);

        res.json({
            pendapatan_tunai: tunai,
            pemasukan_kontrak: tunai,
            pendapatan_potensial: potensi,
            total_beban: totalBeban,
            beban_operasional: totalBeban,
            laba_bersih_nyata: (tunai - totalBeban),
            laba_bersih_murni: (tunai - totalBeban),
            rincian: { 
                workshop: parseFloat(r.workshop), 
                bbm: parseFloat(r.bbm), 
                towing: parseFloat(r.towing) 
            }
        });
    });
});


// Tambahkan endpoint ini di server.js Anda agar grafik memiliki data historis
app.get('/api/grafik-keuangan', (req, res) => {
    const sql = `
        SELECT 
            TO_CHAR(tanggal_mulai, 'Mon') as name,
            SUM(total_harga_kontrak) as Pemasukan,
            COALESCE((SELECT SUM(biaya_sparepart) FROM workshop_maintenance WHERE EXTRACT(MONTH FROM tanggal_kerusakan) = EXTRACT(MONTH FROM tanggal_mulai)), 0) as Pengeluaran,
            (SUM(total_harga_kontrak) - COALESCE((SELECT SUM(biaya_sparepart) FROM workshop_maintenance WHERE EXTRACT(MONTH FROM tanggal_kerusakan) = EXTRACT(MONTH FROM tanggal_mulai)), 0)) as LabaBersih
        FROM transaksi_rental
        GROUP BY TO_CHAR(tanggal_mulai, 'Mon'), EXTRACT(MONTH FROM tanggal_mulai)
        ORDER BY EXTRACT(MONTH FROM tanggal_mulai) ASC
    `;
    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/jadwal-sewa', (req, res) => {
    // Query yang mengambil data kontrak yang akan datang
    const sql = "SELECT tanggal_mulai as tgl, TO_CHAR(tanggal_mulai, 'Mon') as bln, penyewa as proyek, 1 as unit FROM transaksi_rental WHERE tanggal_mulai >= CURRENT_DATE LIMIT 4";
    db.query(sql, (err, rows) => res.json(rows));
});

// HAPUS SEMUA QUERY API AKTIFITAS-PROYEK LAMA DAN GANTI DENGAN INI:
app.get('/api/aktifitas-proyek', (req, res) => {
    // Mengambil dari transaksi_rental karena tabel 'proyek' tidak ada
    const sql = `
        SELECT penyewa as site, 
               COUNT(no_lambung) as units, 
               status_transaksi as status 
        FROM transaksi_rental 
        WHERE status_transaksi != 'Selesai' 
        GROUP BY penyewa, status_transaksi 
        LIMIT 3
    `;
    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});


// PERBAIKAN MAINTENANCE LOGS (Menyesuaikan kolom tabel workshop_maintenance)
app.get('/api/maintenance-logs', (req, res) => {
    // Menggunakan kolom yang ada di struktur tabel Anda: no_lambung dan deskripsi_kerusakan
    const sql = "SELECT no_lambung as unit_id, deskripsi_kerusakan as action FROM workshop_maintenance ORDER BY tanggal_kerusakan DESC LIMIT 5";
    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { 
    console.log(`Backend Server Active on Port ${PORT}`); 
});