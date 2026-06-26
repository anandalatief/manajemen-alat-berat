// ISI FILE: backend/routes/rental.js
const express = require('express');
const router = express.Router();
// const db = require('../config/db'); // <-- Sesuaikan dengan path koneksi databasemu

// Ganti app.post menjadi router.post
router.post('/transaksi-rental', async (req, res) => {
  const {
    no_lambung, id_operator, penyewa, alamat_site_bebas, pic_lapangan,
    no_whatsapp_pic, tanggal_mulai, tanggal_selesai, total_hari_sewa,
    total_harga_kontrak, uang_muka_dp, id_user_input
  } = req.body;

  const sisa_pembayaran = total_harga_kontrak - uang_muka_dp;
  let status_pembayaran = 'Belum Bayar';
  if (uang_muka_dp > 0 && sisa_pembayaran > 0) status_pembayaran = 'DP';
  if (uang_muka_dp >= total_harga_kontrak) status_pembayaran = 'Lunas';

  const status_transaksi = 'Aktif';

  try {
    // Validasi Alat
    const [cekAlat] = await db.query('SELECT status_unit FROM alat_berat WHERE no_lambung = ?', [no_lambung]);
    if (cekAlat.length > 0 && cekAlat[0].status_unit !== 'Ready') {
      return res.status(400).json({ message: `Gagal! Unit ${no_lambung} sedang tidak siap.` });
    }

    // Validasi Operator
    const [cekPekerja] = await db.query('SELECT status_tugas FROM pekerja WHERE id_pekerja = ?', [id_operator]);
    if (cekPekerja.length > 0 && cekPekerja[0].status_tugas !== 'Siap') {
      return res.status(400).json({ message: `Gagal! Operator sedang tidak tersedia.` });
    }

    // Eksekusi data
    const sqlInsert = `
      INSERT INTO transaksi_rental 
      (no_lambung, id_operator, penyewa, alamat_site_bebas, pic_lapangan, no_whatsapp_pic, tanggal_mulai, tanggal_selesai, total_hari_sewa, total_harga_kontrak, uang_muka_dp, sisa_pembayaran, status_pembayaran, status_transaksi, id_user_input, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    await db.query(sqlInsert, [no_lambung, id_operator, penyewa, alamat_site_bebas, pic_lapangan, no_whatsapp_pic, tanggal_mulai, tanggal_selesai, total_hari_sewa, total_harga_kontrak, uang_muka_dp, sisa_pembayaran, status_pembayaran, status_transaksi, id_user_input]);

    await db.query('UPDATE alat_berat SET status_unit = "On-Site" WHERE no_lambung = ?', [no_lambung]);
    await db.query('UPDATE pekerja SET status_tugas = "Bertugas" WHERE id_pekerja = ?', [id_operator]);

    res.status(201).json({ message: "Kontrak Rental baru berhasil diterbitkan!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server database." });
  }
});

// GANTI baris paling bawah file backend/routes/rental.js menjadi fungsi:
module.exports = (db) => {
  
  // router.post('/transaksi-rental', async (req, res) => { ... isi kode tetap sama ... })

  return router;
};