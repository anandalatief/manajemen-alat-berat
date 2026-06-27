-- =========================================================================
-- SKEMA DATABASE UNTUK SUPABASE (POSTGRESQL)
-- Sistem Manajemen Rental Alat Berat
-- =========================================================================

-- Hapus tabel jika sudah ada (untuk reset bersih)
DROP TABLE IF EXISTS workshop_maintenance CASCADE;
DROP TABLE IF EXISTS surat_jalan CASCADE;
DROP TABLE IF EXISTS log_harian_alat CASCADE;
DROP TABLE IF EXISTS transaksi_rental CASCADE;
DROP TABLE IF EXISTS alat_berat CASCADE;
DROP TABLE IF EXISTS pekerja CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- --------------------------------------------------------
-- FUNGSI & TRIGGER UNTUK ON UPDATE CURRENT_TIMESTAMP
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------
-- 1. TABEL: users
-- --------------------------------------------------------
CREATE TABLE users (
  id_user SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- 2. TABEL: pekerja
-- --------------------------------------------------------
CREATE TABLE pekerja (
  id_pekerja SERIAL PRIMARY KEY,
  nama_pekerja VARCHAR(100) NOT NULL,
  peran VARCHAR(50) NOT NULL,
  spesialisasi_sio VARCHAR(100) DEFAULT NULL,
  gaji_per_shift DECIMAL(12,2) NOT NULL,
  status_tugas VARCHAR(50) DEFAULT 'Siap'
);

-- --------------------------------------------------------
-- 3. TABEL: alat_berat
-- --------------------------------------------------------
CREATE TABLE alat_berat (
  no_lambung VARCHAR(20) NOT NULL PRIMARY KEY,
  nama_alat VARCHAR(100) NOT NULL,
  spesifikasi TEXT DEFAULT NULL,
  tarif_per_hari DECIMAL(12,2) NOT NULL,
  status_unit VARCHAR(50) DEFAULT 'Ready',
  foto_url VARCHAR(255) DEFAULT 'default-unit.jpg',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Pasang trigger update otomatis pada tabel alat_berat
CREATE TRIGGER update_alat_berat_modtime 
BEFORE UPDATE ON alat_berat 
FOR EACH ROW 
EXECUTE FUNCTION update_modified_column();

-- --------------------------------------------------------
-- 4. TABEL: transaksi_rental
-- --------------------------------------------------------
CREATE TABLE transaksi_rental (
  id_kontrak VARCHAR(30) NOT NULL PRIMARY KEY,
  no_lambung VARCHAR(20) NOT NULL REFERENCES alat_berat(no_lambung) ON DELETE RESTRICT,
  id_operator INT NOT NULL REFERENCES pekerja(id_pekerja) ON DELETE RESTRICT,
  penyewa VARCHAR(150) NOT NULL,
  alamat_site_bebas TEXT NOT NULL,
  pic_lapangan VARCHAR(100) NOT NULL,
  no_whatsapp_pic VARCHAR(20) NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  tanggal_kembali_riil DATE DEFAULT NULL,
  total_hari_sewa INT NOT NULL,
  total_harga_kontrak DECIMAL(15,2) NOT NULL,
  uang_muka_dp INT DEFAULT 0,
  sisa_pembayaran INT DEFAULT 0,
  status_pembayaran VARCHAR(50) DEFAULT 'Belum Bayar',
  status_transaksi VARCHAR(50) DEFAULT 'Booking',
  id_user_input INT NOT NULL REFERENCES users(id_user) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- 5. TABEL: log_harian_alat
-- --------------------------------------------------------
CREATE TABLE log_harian_alat (
  id_log SERIAL PRIMARY KEY,
  id_kontrak VARCHAR(30) NOT NULL REFERENCES transaksi_rental(id_kontrak) ON DELETE CASCADE,
  tanggal_log DATE NOT NULL,
  hm_pakai_hari_ini INT NOT NULL,
  liter_bbm DECIMAL(6,2) NOT NULL,
  biaya_bbm_nota DECIMAL(12,2) NOT NULL,
  catatan_lapangan TEXT DEFAULT NULL
);

-- --------------------------------------------------------
-- 6. TABEL: surat_jalan
-- --------------------------------------------------------
CREATE TABLE surat_jalan (
  id_surat_jalan SERIAL PRIMARY KEY,
  id_kontrak VARCHAR(30) NOT NULL REFERENCES transaksi_rental(id_kontrak) ON DELETE CASCADE,
  nama_supir_towing VARCHAR(100) NOT NULL,
  ongkos_angkut_towing DECIMAL(12,2) NOT NULL,
  hm_awal INT NOT NULL,
  hm_akhir INT DEFAULT NULL,
  tanggal_keluar DATE NOT NULL,
  tanggal_masuk DATE DEFAULT NULL,
  status_mobilisasi VARCHAR(50) DEFAULT 'Mobilisasi'
);

-- --------------------------------------------------------
-- 7. TABEL: workshop_maintenance
-- --------------------------------------------------------
CREATE TABLE workshop_maintenance (
  id_perbaikan SERIAL PRIMARY KEY,
  no_lambung VARCHAR(20) NOT NULL REFERENCES alat_berat(no_lambung) ON DELETE RESTRICT,
  id_mekanik INT NOT NULL REFERENCES pekerja(id_pekerja) ON DELETE RESTRICT,
  tanggal_kerusakan DATE DEFAULT NULL,
  deskripsi_kerusakan TEXT NOT NULL,
  tindakan_perbaikan TEXT NOT NULL,
  biaya_sparepart DECIMAL(12,2) NOT NULL,
  status_perbaikan VARCHAR(50) DEFAULT 'Proses',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tanggal_selesai DATE DEFAULT NULL
);

-- Pasang trigger update otomatis pada tabel workshop_maintenance
CREATE TRIGGER update_workshop_modtime 
BEFORE UPDATE ON workshop_maintenance 
FOR EACH ROW 
EXECUTE FUNCTION update_modified_column();


-- =========================================================================
-- INPUT DATA SEED / AWAL (MIGRASI DARI MYSQL DUMP)
-- =========================================================================

-- Seed: users
INSERT INTO users (id_user, username, password, nama_lengkap, role, created_at) VALUES
(1, '1', '1', 'Ananda', 'Super Admin', '2026-06-07 15:19:39'),
(6, 'anandalatief', 'anandalatief123', 'Ananda Latief', 'Super Admin', '2026-06-23 05:12:48'),
(7, 'sitiaminah', 'sitiaminah123', 'Siti Aminah', 'Admin', '2026-06-23 05:15:49'),
(8, 'dewilestari', 'dewilestari123', 'Dewi Lestari', 'Finance', '2026-06-23 05:16:13'),
(9, 'rianhidayat', 'rianhidayat123', 'Rian Hidayat', 'Lapangan', '2026-06-23 05:16:35'),
(10, 'jokowahyudi', 'jokowahyudi123', 'Joko Wahyudi', 'Mekanik', '2026-06-23 05:16:56');

-- Seed: pekerja
INSERT INTO pekerja (id_pekerja, nama_pekerja, peran, spesialisasi_sio, gaji_per_shift, status_tugas) VALUES
(1, 'Budi Santoso', 'Operator', 'SIO Kelas I Alat Berat Excavator', 250000.00, 'Siap'),
(2, 'Agus Wijaya', 'Operator', 'SIO Kelas II Bulldozer Riau', 270000.00, 'Siap'),
(3, 'Hendro Utama', 'Mekanik', 'Sertifikasi Ahli Sistem Hidrolik & Engine', 300000.00, 'Siap'),
(6, 'Rina Marlina', 'Operator', 'SIO Kelas III Dump Truck', 240000.00, 'Siap'),
(7, 'Joko Prasetyo', 'Mekanik', 'Sertifikasi Elektrik & Diesel	', 320000.00, 'Siap'),
(8, 'Andi Saputra', 'Operator', 'SIO Kelas I Wheel Loader', 260000.00, 'Siap'),
(9, 'Dedi Kurniawan', 'Operator', 'SIO Kelas II Crane', 290000.00, 'Siap'),
(10, 'Wahyu Hidayat', 'Mekanik', 'Sertifikasi Sistem Transmisi', 310000.00, 'Siap'),
(11, 'Lina Kartika', 'Operator', 'SIO Kelas I Forklift', 230000.00, 'Siap');

-- Seed: alat_berat
INSERT INTO alat_berat (no_lambung, nama_alat, spesifikasi, tarif_per_hari, status_unit, foto_url, updated_at) VALUES
('ADT-04', 'Articulated Dump Truck', 'Volvo A40G, muatan 40 ton, 450 HP.', 4500000.00, 'Ready', '1780905074029-941905076.jpg', '2026-06-08 07:51:14'),
('AP-13', 'Asphalt Paver', 'Volvo ABG7820, lebar paving 6 m, 250 HP.', 7000000.00, 'Ready', '1780905930209-759205743.jpg', '2026-06-09 00:23:43'),
('BD-02', 'Bulldozer', 'Caterpillar D6, blade 3.5 m³, 200 HP, 18 ton.', 5000000.00, 'Ready', '1780904865186-103659348.jpg', '2026-06-23 07:23:15'),
('CC-10', 'Crawler Crane', '	Kobelco 7150, kapasitas 150 ton, boom 60 m.', 11000000.00, 'Ready', '1780905413504-152802970.jpg', '2026-06-08 07:56:53'),
('CL-07', 'Crawler Loader', 'Komatsu D75, bucket 2 m³, 190 HP, 20 ton.', 4500000.00, 'Ready', '1780905858993-799424178.jpg', '2026-06-09 07:14:45'),
('CP-12', 'Concrete Pump Truck', 'Putzmeister BSF 36, boom 36 m, 400 HP.', 8000000.00, 'Ready', '1780905510101-940353821.jpg', '2026-06-08 07:58:30'),
('DR-16', 'Drilling Rig', 'Bauer BG28, kedalaman 70 m, 600 HP.', 13000000.00, 'Ready', '1780906044360-814519938.jpg', '2026-06-09 02:25:45'),
('DT-03', 'Dump Truck', 'Hino 500, muatan 25 ton, 280 HP.', 4000000.00, 'Ready', '1780904992328-623341717.jpg', '2026-06-23 07:29:47'),
('EX-01', 'Excavator', 'Komatsu PC200, bucket 1 m³, 165 HP, 20 ton.', 3500000.00, 'Ready', '1780904749246-833340105.jpg', '2026-06-23 07:29:12'),
('FL-17', 'Forklift', 'Toyota 8FD, kapasitas 5 ton, 50 HP.', 3500000.00, 'Ready', '1780905538180-260465853.jpg', '2026-06-23 06:25:02'),
('FW-20', 'Forwarder', 'Komatsu 895, muatan 20 ton, 300 HP.', 2500000.00, 'Ready', '1780906131132-612589754.jpg', '2026-06-09 07:46:51'),
('HV-19', 'Harvester', 'John Deere S780, lebar kerja 10 m, 473 HP.', 2000000.00, 'Ready', '1780905566803-307943700.jpg', '2026-06-09 02:03:13'),
('MG-05', '	Motor Grader', 'Komatsu GD655, blade 4.2 m, 220 HP.', 6000000.00, 'Ready', '1780905185907-951501562.jpg', '2026-06-23 07:26:58'),
('MT-11', '	Concrete Mixer Truck', 'Mercedes-Benz Arocs, drum 10 m³, 400 HP.', 4500000.00, 'Ready', '1780905478206-260144687.jpg', '2026-06-08 07:57:58'),
('PD-15', 'Pile Driver', 'Junttan PMx22, kapasitas tiang 30 m, 500 kNm.', 12000000.00, 'Ready', '1780906018621-652723002.JPG', '2026-06-08 23:58:45'),
('RC-22', 'Roller/Compactor', 'Bomag BW213, drum 2.1 m, 150 HP, 12 ton.', 1800000.00, 'Ready', '1780905686957-548207462.jpg', '2026-06-09 00:35:14'),
('RR-14', 'Road Reclaimer', 'Caterpillar RM500, lebar kerja 2.4 m, 540 HP.', 8500000.00, 'Ready', '1780905984262-707098.jpg', '2026-06-08 23:53:10'),
('SC-08', 'Scraper', 'Caterpillar 621K, kapasitas 24 ton, 400 HP.', 6500000.00, 'Ready', '1780905893756-325500497.jpg', '2026-06-08 16:44:23'),
('TC-09', 'Tower Crane', 'Potain MDT 219, kapasitas 10 ton, jib 65 m.', 10000000.00, 'Ready', '1780905350555-670148836.jpg', '2026-06-08 07:55:50'),
('TR-18', 'Traktor Roda Empat Besar', 'John Deere 8400R, 400 HP, 12 ton.	', 1500000.00, 'Ready', '1780906094437-13323242.jpg', '2026-06-08 08:08:14'),
('WL-06', 'Wheel Loader', 'Caterpillar 966M, bucket 3.5 m³, 320 HP.', 5500000.00, 'Ready', '1780905283881-733561602.jpg', '2026-06-08 07:54:43'),
('WT-21', 'Water Tanker', 'Hino Ranger, kapasitas 10.000 liter, 220 HP.', 1200000.00, 'Ready', '1780906157500-206506213.jpg', '2026-06-09 04:47:40');

-- Seed: transaksi_rental
INSERT INTO transaksi_rental (id_kontrak, no_lambung, id_operator, penyewa, alamat_site_bebas, pic_lapangan, no_whatsapp_pic, tanggal_mulai, tanggal_selesai, tanggal_kembali_riil, total_hari_sewa, total_harga_kontrak, uang_muka_dp, sisa_pembayaran, status_pembayaran, status_transaksi, id_user_input, created_at) VALUES
('TRX-127523', 'MT-11', 6, 'PT. Inti Beton Pekanbaru', 'Rumbai, Pekanbaru', 'Pak Yusuf', '085299995555', '2026-06-25', '2026-06-26', NULL, 2, 9000000.00, 5000000, 4000000, 'DP', '', 1, '2026-06-23 07:02:07'),
('TRX-245866', 'FL-17', 11, 'Proyek Perumahan Garuda', 'Jl. Paus, Pekanbaru', 'Pak Rizal', '081177776666', '2026-06-26', '2026-06-28', NULL, 3, 10500000.00, 10500000, 0, 'Lunas', '', 1, '2026-06-23 07:04:05'),
('TRX-362774', 'AP-13', 8, 'CV. Aspal Riau Pratama', 'Jl. HR Soebrantas', 'Bu Wati', '081233337777', '2026-06-29', '2026-07-02', NULL, 4, 28000000.00, 10000000, 18000000, 'DP', '', 1, '2026-06-23 07:06:02'),
('TRX-427333', 'FW-20', 8, 'PT. Sawit Sumber Sejahtera', 'Lintas Timur', 'Pak Mulyono', '085244448888', '2026-07-05', '2026-07-11', NULL, 7, 17500000.00, 17500000, 0, 'Lunas', '', 1, '2026-06-23 07:07:07'),
('TRX-449379', 'EX-01', 1, 'PT. Riau Bangun Utama', 'Jl. Arifin Ahmad, Pekanbaru', 'Pak Darmawan', '081275001111', '2026-06-01', '2026-06-04', NULL, 4, 14000000.00, 7000000, 7000000, 'DP', 'Selesai', 1, '2026-06-23 06:50:49'),
('TRX-582711', 'BD-02', 2, 'CV. Kontraktor Jaya', 'Kawasan Industri Tenayan', 'Bu Melani', '085265002222', '2026-06-02', '2026-06-13', NULL, 12, 60000000.00, 45000000, 15000000, 'DP', 'Selesai', 1, '2026-06-23 06:53:02'),
('TRX-600064', 'WT-21', 11, 'Dinas PU Pekanbaru', 'Jl. Diponegoro', 'Pak Gatot', '081355559999', '2026-07-08', '2026-07-12', NULL, 5, 6000000.00, 0, 6000000, 'Belum Bayar', '', 1, '2026-06-23 07:10:00'),
('TRX-657010', 'TC-09', 9, 'PT. Megah Bangun Riau', 'Jl. Sudirman', 'Bu Maya', '081166660000', '2026-07-01', '2026-07-15', NULL, 15, 150000000.00, 50000000, 100000000, 'DP', '', 1, '2026-06-23 07:10:57'),
('TRX-676780', 'DT-03', 6, 'PT. Riau Mandiri', 'Jl. SM Amin, Pekanbaru', 'Pak Hendra', '081377773333', '2026-06-15', '2026-06-19', NULL, 5, 20000000.00, 0, 20000000, 'Belum Bayar', 'Selesai', 1, '2026-06-23 06:54:36'),
('TRX-937413', 'MG-05', 2, 'CV. Bumi Lancang Kuning', 'Kulim, Pekanbaru', 'Bu Sari', '081266664444', '2026-06-20', '2026-06-22', NULL, 3, 18000000.00, 18000000, 0, 'Lunas', 'Selesai', 1, '2026-06-23 06:58:57');

-- Seed: log_harian_alat
INSERT INTO log_harian_alat (id_log, id_kontrak, tanggal_log, hm_pakai_hari_ini, liter_bbm, biaya_bbm_nota, catatan_lapangan) VALUES
(9, 'TRX-449379', '2026-06-01', 8, 40.00, 600000.00, 'Mobilisasi unit ke site.'),
(10, 'TRX-449379', '2026-06-02', 7, 35.00, 525000.00, 'Operasional standar di site.'),
(11, 'TRX-582711', '2026-06-03', 8, 45.00, 675000.00, 'Perataan lahan industri.'),
(12, 'TRX-582711', '2026-06-05', 8, 45.00, 675000.00, 'Area kerja kering, progres maksimal.'),
(13, 'TRX-676780', '2026-06-16', 9, 30.00, 450000.00, 'Pengangkutan tanah urug.'),
(14, 'TRX-937413', '2026-06-21', 7, 35.00, 525000.00, 'Perataan jalan akses utama.'),
(15, 'TRX-127523', '2026-06-25', 6, 25.00, 375000.00, 'Pengecoran beton site Rumbai.'),
(16, 'TRX-449379', '2026-06-01', 8, 40.00, 600000.00, 'Mobilisasi unit ke site.'),
(17, 'TRX-449379', '2026-06-02', 7, 35.00, 525000.00, 'Penggalian pondasi utama.'),
(18, 'TRX-449379', '2026-06-03', 8, 40.00, 600000.00, 'Pembersihan sisa galian.'),
(19, 'TRX-449379', '2026-06-04', 6, 30.00, 450000.00, 'Demobilisasi unit.'),
(20, 'TRX-582711', '2026-06-02', 8, 45.00, 675000.00, 'Persiapan lahan industri.'),
(21, 'TRX-582711', '2026-06-05', 9, 50.00, 750000.00, 'Perataan tanah keras.'),
(22, 'TRX-582711', '2026-06-10', 7, 40.00, 600000.00, 'Pekerjaan finishing area.'),
(23, 'TRX-676780', '2026-06-15', 10, 40.00, 600000.00, 'Angkutan material material tanah.'),
(24, 'TRX-676780', '2026-06-18', 9, 35.00, 525000.00, 'Pengangkutan limbah konstruksi.'),
(25, 'TRX-937413', '2026-06-20', 8, 40.00, 600000.00, 'Perataan jalan akses.'),
(26, 'TRX-937413', '2026-06-22', 7, 35.00, 525000.00, 'Pemadatan jalan.'),
(27, 'TRX-127523', '2026-06-25', 6, 30.00, 450000.00, 'Pengecoran beton lantai.'),
(28, 'TRX-245866', '2026-06-26', 8, 20.00, 300000.00, 'Loading material gudang.'),
(29, 'TRX-245866', '2026-06-28', 7, 18.00, 270000.00, 'Unloading peralatan berat.'),
(30, 'TRX-362774', '2026-06-29', 8, 50.00, 750000.00, 'Penyebaran aspal panas.'),
(31, 'TRX-362774', '2026-07-01', 9, 55.00, 825000.00, 'Pemadatan aspal di jalur utama.'),
(32, 'TRX-427333', '2026-07-05', 8, 40.00, 600000.00, 'Pengangkutan log kayu.'),
(33, 'TRX-427333', '2026-07-10', 9, 45.00, 675000.00, 'Pemuatan ke truk besar.'),
(34, 'TRX-600064', '2026-07-08', 6, 25.00, 375000.00, 'Penyiraman jalan berdebu.'),
(35, 'TRX-657010', '2026-07-01', 5, 40.00, 600000.00, 'Ereksi kolom utama.'),
(36, 'TRX-657010', '2026-07-10', 8, 60.00, 900000.00, 'Pemasangan baja WF struktur.');

-- Seed: surat_jalan
INSERT INTO surat_jalan (id_surat_jalan, id_kontrak, nama_supir_towing, ongkos_angkut_towing, hm_awal, hm_akhir, tanggal_keluar, tanggal_masuk, status_mobilisasi) VALUES
(37, 'TRX-449379', 'CV. Lancang Kuning Towing', 1500000.00, 340, 1000, '2026-05-31', '2026-06-05', ''),
(38, 'TRX-582711', 'PT. Riau Angkutan Perkasa', 1800000.00, 5000, 6000, '2026-06-01', '2026-06-14', ''),
(39, 'TRX-676780', 'CV. Towing Lintas Sumatera', 1000000.00, 28800, 32100, '2026-06-14', '2026-06-20', ''),
(40, 'TRX-937413', 'PT. Jaya Logistik Pekanbaru', 1600000.00, 4567, 6544, '2026-06-19', '2026-06-23', ''),
(41, 'TRX-127523', 'CV. Mitra Angkut Alat', 1200000.00, 5467, 11677, '2026-06-24', '2026-06-27', ''),
(42, 'TRX-245866', 'CV. Lancang Kuning Towing', 800000.00, 7473, NULL, '2026-06-25', NULL, 'Mobilisasi'),
(43, 'TRX-362774', 'PT. Riau Angkutan Perkasa', 1700000.00, 4545, NULL, '2026-06-28', NULL, 'Mobilisasi'),
(44, 'TRX-427333', 'CV. Towing Lintas Sumatera', 1100000.00, 4435, NULL, '2026-07-04', NULL, 'Mobilisasi'),
(45, 'TRX-600064', 'PT. Jaya Logistik Pekanbaru', 90000.00, 5647, NULL, '2026-07-07', NULL, 'Mobilisasi'),
(46, 'TRX-657010', 'CV. Mitra Angkut Alat', 4000000.00, 4653, NULL, '2026-06-29', NULL, 'Mobilisasi');

-- Seed: workshop_maintenance
INSERT INTO workshop_maintenance (id_perbaikan, no_lambung, id_mekanik, tanggal_kerusakan, deskripsi_kerusakan, tindakan_perbaikan, biaya_sparepart, status_perbaikan, updated_at, tanggal_selesai) VALUES
(56, 'EX-01', 3, '2026-06-05', 'Kebocoran sil hidrolik arm.', 'Ganti seal kit hidrolik.', 1500000.00, 'Selesai', '2026-06-23 07:59:21', '2026-06-06'),
(57, 'BD-02', 7, '2026-06-14', 'Overheat saat operasional.', 'Pembersihan radiator.', 850000.00, 'Selesai', '2026-06-23 07:59:21', '2026-06-15'),
(58, 'MG-05', 10, '2026-06-23', 'Transmisi kasar.', 'Pemeriksaan sistem transmisi.', 2200000.00, 'Proses', '2026-06-23 07:59:21', NULL),
(59, 'DT-03', 3, '2026-06-20', 'Lampu depan mati.', 'Perbaikan jalur kabel.', 300000.00, 'Selesai', '2026-06-23 07:59:21', '2026-06-20'),
(60, 'WL-06', 7, '2026-06-22', 'Kampas rem menipis.', 'Penggantian kampas rem set.', 1200000.00, 'Selesai', '2026-06-23 07:59:21', '2026-06-23');


-- =========================================================================
-- RESET INTERNAL SERIAL SEQUENCES
-- Untuk mensinkronkan nilai auto-increment seq post-insert seed data
-- =========================================================================
SELECT setval(pg_get_serial_sequence('users', 'id_user'), COALESCE(max(id_user), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('pekerja', 'id_pekerja'), COALESCE(max(id_pekerja), 1)) FROM pekerja;
SELECT setval(pg_get_serial_sequence('surat_jalan', 'id_surat_jalan'), COALESCE(max(id_surat_jalan), 1)) FROM surat_jalan;
SELECT setval(pg_get_serial_sequence('log_harian_alat', 'id_log'), COALESCE(max(id_log), 1)) FROM log_harian_alat;
SELECT setval(pg_get_serial_sequence('workshop_maintenance', 'id_perbaikan'), COALESCE(max(id_perbaikan), 1)) FROM workshop_maintenance;
