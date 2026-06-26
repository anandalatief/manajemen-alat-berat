-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 23, 2026 at 10:01 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_rental_alat`
--

-- --------------------------------------------------------

--
-- Table structure for table `alat_berat`
--

CREATE TABLE `alat_berat` (
  `no_lambung` varchar(20) NOT NULL,
  `nama_alat` varchar(100) NOT NULL,
  `spesifikasi` text DEFAULT NULL,
  `tarif_per_hari` decimal(12,2) NOT NULL,
  `status_unit` enum('Ready','On-Site','Maintenance') DEFAULT 'Ready',
  `foto_url` varchar(255) DEFAULT 'default-unit.jpg',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `alat_berat`
--

INSERT INTO `alat_berat` (`no_lambung`, `nama_alat`, `spesifikasi`, `tarif_per_hari`, `status_unit`, `foto_url`, `updated_at`) VALUES
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

-- --------------------------------------------------------

--
-- Table structure for table `log_harian_alat`
--

CREATE TABLE `log_harian_alat` (
  `id_log` int(11) NOT NULL,
  `id_kontrak` varchar(30) NOT NULL,
  `tanggal_log` date NOT NULL,
  `hm_pakai_hari_ini` int(11) NOT NULL,
  `liter_bbm` decimal(6,2) NOT NULL,
  `biaya_bbm_nota` decimal(12,2) NOT NULL,
  `catatan_lapangan` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `log_harian_alat`
--

INSERT INTO `log_harian_alat` (`id_log`, `id_kontrak`, `tanggal_log`, `hm_pakai_hari_ini`, `liter_bbm`, `biaya_bbm_nota`, `catatan_lapangan`) VALUES
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

-- --------------------------------------------------------

--
-- Table structure for table `pekerja`
--

CREATE TABLE `pekerja` (
  `id_pekerja` int(11) NOT NULL,
  `nama_pekerja` varchar(100) NOT NULL,
  `peran` enum('Operator','Mekanik') NOT NULL,
  `spesialisasi_sio` varchar(100) DEFAULT NULL,
  `gaji_per_shift` decimal(12,2) NOT NULL,
  `status_tugas` enum('Siap','Bertugas','Izin/Sakit') DEFAULT 'Siap'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pekerja`
--

INSERT INTO `pekerja` (`id_pekerja`, `nama_pekerja`, `peran`, `spesialisasi_sio`, `gaji_per_shift`, `status_tugas`) VALUES
(1, 'Budi Santoso', 'Operator', 'SIO Kelas I Alat Berat Excavator', 250000.00, 'Siap'),
(2, 'Agus Wijaya', 'Operator', 'SIO Kelas II Bulldozer Riau', 270000.00, 'Siap'),
(3, 'Hendro Utama', 'Mekanik', 'Sertifikasi Ahli Sistem Hidrolik & Engine', 300000.00, 'Siap'),
(6, 'Rina Marlina', 'Operator', 'SIO Kelas III Dump Truck', 240000.00, 'Siap'),
(7, 'Joko Prasetyo', 'Mekanik', 'Sertifikasi Elektrik & Diesel	', 320000.00, 'Siap'),
(8, 'Andi Saputra', 'Operator', 'SIO Kelas I Wheel Loader', 260000.00, 'Siap'),
(9, 'Dedi Kurniawan', 'Operator', 'SIO Kelas II Crane', 290000.00, 'Siap'),
(10, 'Wahyu Hidayat', 'Mekanik', 'Sertifikasi Sistem Transmisi', 310000.00, 'Siap'),
(11, 'Lina Kartika', 'Operator', 'SIO Kelas I Forklift', 230000.00, 'Siap');

-- --------------------------------------------------------

--
-- Table structure for table `surat_jalan`
--

CREATE TABLE `surat_jalan` (
  `id_surat_jalan` int(11) NOT NULL,
  `id_kontrak` varchar(30) NOT NULL,
  `nama_supir_towing` varchar(100) NOT NULL,
  `ongkos_angkut_towing` decimal(12,2) NOT NULL,
  `hm_awal` int(11) NOT NULL,
  `hm_akhir` int(11) DEFAULT NULL,
  `tanggal_keluar` date NOT NULL,
  `tanggal_masuk` date DEFAULT NULL,
  `status_mobilisasi` enum('Mobilisasi','Demobilisasi Selesai') DEFAULT 'Mobilisasi'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `surat_jalan`
--

INSERT INTO `surat_jalan` (`id_surat_jalan`, `id_kontrak`, `nama_supir_towing`, `ongkos_angkut_towing`, `hm_awal`, `hm_akhir`, `tanggal_keluar`, `tanggal_masuk`, `status_mobilisasi`) VALUES
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

-- --------------------------------------------------------

--
-- Table structure for table `transaksi_rental`
--

CREATE TABLE `transaksi_rental` (
  `id_kontrak` varchar(30) NOT NULL,
  `no_lambung` varchar(20) NOT NULL,
  `id_operator` int(11) NOT NULL,
  `penyewa` varchar(150) NOT NULL,
  `alamat_site_bebas` text NOT NULL,
  `pic_lapangan` varchar(100) NOT NULL,
  `no_whatsapp_pic` varchar(20) NOT NULL,
  `tanggal_mulai` date NOT NULL,
  `tanggal_selesai` date NOT NULL,
  `tanggal_kembali_riil` date DEFAULT NULL,
  `total_hari_sewa` int(11) NOT NULL,
  `total_harga_kontrak` decimal(15,2) NOT NULL,
  `uang_muka_dp` int(11) DEFAULT 0,
  `sisa_pembayaran` int(11) DEFAULT 0,
  `status_pembayaran` enum('Belum Bayar','DP','Lunas') DEFAULT 'Belum Bayar',
  `status_transaksi` enum('Booking','Jalan','Selesai','Batal') DEFAULT 'Booking',
  `id_user_input` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transaksi_rental`
--

INSERT INTO `transaksi_rental` (`id_kontrak`, `no_lambung`, `id_operator`, `penyewa`, `alamat_site_bebas`, `pic_lapangan`, `no_whatsapp_pic`, `tanggal_mulai`, `tanggal_selesai`, `tanggal_kembali_riil`, `total_hari_sewa`, `total_harga_kontrak`, `uang_muka_dp`, `sisa_pembayaran`, `status_pembayaran`, `status_transaksi`, `id_user_input`, `created_at`) VALUES
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

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `role` enum('Super Admin','Admin','Finance','Lapangan','Mekanik') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_user`, `username`, `password`, `nama_lengkap`, `role`, `created_at`) VALUES
(1, '1', '1', 'Ananda', 'Super Admin', '2026-06-07 15:19:39'),
(6, 'anandalatief', 'anandalatief123', 'Ananda Latief', 'Super Admin', '2026-06-23 05:12:48'),
(7, 'sitiaminah', 'sitiaminah123', 'Siti Aminah', 'Admin', '2026-06-23 05:15:49'),
(8, 'dewilestari', 'dewilestari123', 'Dewi Lestari', 'Finance', '2026-06-23 05:16:13'),
(9, 'rianhidayat', 'rianhidayat123', 'Rian Hidayat', 'Lapangan', '2026-06-23 05:16:35'),
(10, 'jokowahyudi', 'jokowahyudi123', 'Joko Wahyudi', 'Mekanik', '2026-06-23 05:16:56');

-- --------------------------------------------------------

--
-- Table structure for table `workshop_maintenance`
--

CREATE TABLE `workshop_maintenance` (
  `id_perbaikan` int(11) NOT NULL,
  `no_lambung` varchar(20) NOT NULL,
  `id_mekanik` int(11) NOT NULL,
  `tanggal_kerusakan` date DEFAULT NULL,
  `deskripsi_kerusakan` text NOT NULL,
  `tindakan_perbaikan` text NOT NULL,
  `biaya_sparepart` decimal(12,2) NOT NULL,
  `status_perbaikan` enum('Proses','Selesai') DEFAULT 'Proses',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `tanggal_selesai` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workshop_maintenance`
--

INSERT INTO `workshop_maintenance` (`id_perbaikan`, `no_lambung`, `id_mekanik`, `tanggal_kerusakan`, `deskripsi_kerusakan`, `tindakan_perbaikan`, `biaya_sparepart`, `status_perbaikan`, `updated_at`, `tanggal_selesai`) VALUES
(56, 'EX-01', 3, '2026-06-05', 'Kebocoran sil hidrolik arm.', 'Ganti seal kit hidrolik.', 1500000.00, 'Selesai', '2026-06-23 07:59:21', '2026-06-06'),
(57, 'BD-02', 7, '2026-06-14', 'Overheat saat operasional.', 'Pembersihan radiator.', 850000.00, 'Selesai', '2026-06-23 07:59:21', '2026-06-15'),
(58, 'MG-05', 10, '2026-06-23', 'Transmisi kasar.', 'Pemeriksaan sistem transmisi.', 2200000.00, 'Proses', '2026-06-23 07:59:21', NULL),
(59, 'DT-03', 3, '2026-06-20', 'Lampu depan mati.', 'Perbaikan jalur kabel.', 300000.00, 'Selesai', '2026-06-23 07:59:21', '2026-06-20'),
(60, 'WL-06', 7, '2026-06-22', 'Kampas rem menipis.', 'Penggantian kampas rem set.', 1200000.00, 'Selesai', '2026-06-23 07:59:21', '2026-06-23');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alat_berat`
--
ALTER TABLE `alat_berat`
  ADD PRIMARY KEY (`no_lambung`);

--
-- Indexes for table `log_harian_alat`
--
ALTER TABLE `log_harian_alat`
  ADD PRIMARY KEY (`id_log`),
  ADD KEY `id_kontrak` (`id_kontrak`);

--
-- Indexes for table `pekerja`
--
ALTER TABLE `pekerja`
  ADD PRIMARY KEY (`id_pekerja`);

--
-- Indexes for table `surat_jalan`
--
ALTER TABLE `surat_jalan`
  ADD PRIMARY KEY (`id_surat_jalan`),
  ADD KEY `id_kontrak` (`id_kontrak`);

--
-- Indexes for table `transaksi_rental`
--
ALTER TABLE `transaksi_rental`
  ADD PRIMARY KEY (`id_kontrak`),
  ADD KEY `no_lambung` (`no_lambung`),
  ADD KEY `id_operator` (`id_operator`),
  ADD KEY `id_user_input` (`id_user_input`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `workshop_maintenance`
--
ALTER TABLE `workshop_maintenance`
  ADD PRIMARY KEY (`id_perbaikan`),
  ADD KEY `no_lambung` (`no_lambung`),
  ADD KEY `id_mekanik` (`id_mekanik`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `log_harian_alat`
--
ALTER TABLE `log_harian_alat`
  MODIFY `id_log` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `pekerja`
--
ALTER TABLE `pekerja`
  MODIFY `id_pekerja` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `surat_jalan`
--
ALTER TABLE `surat_jalan`
  MODIFY `id_surat_jalan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `workshop_maintenance`
--
ALTER TABLE `workshop_maintenance`
  MODIFY `id_perbaikan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `log_harian_alat`
--
ALTER TABLE `log_harian_alat`
  ADD CONSTRAINT `log_harian_alat_ibfk_1` FOREIGN KEY (`id_kontrak`) REFERENCES `transaksi_rental` (`id_kontrak`);

--
-- Constraints for table `surat_jalan`
--
ALTER TABLE `surat_jalan`
  ADD CONSTRAINT `surat_jalan_ibfk_1` FOREIGN KEY (`id_kontrak`) REFERENCES `transaksi_rental` (`id_kontrak`);

--
-- Constraints for table `transaksi_rental`
--
ALTER TABLE `transaksi_rental`
  ADD CONSTRAINT `transaksi_rental_ibfk_1` FOREIGN KEY (`no_lambung`) REFERENCES `alat_berat` (`no_lambung`),
  ADD CONSTRAINT `transaksi_rental_ibfk_2` FOREIGN KEY (`id_operator`) REFERENCES `pekerja` (`id_pekerja`),
  ADD CONSTRAINT `transaksi_rental_ibfk_3` FOREIGN KEY (`id_user_input`) REFERENCES `users` (`id_user`);

--
-- Constraints for table `workshop_maintenance`
--
ALTER TABLE `workshop_maintenance`
  ADD CONSTRAINT `workshop_maintenance_ibfk_1` FOREIGN KEY (`no_lambung`) REFERENCES `alat_berat` (`no_lambung`),
  ADD CONSTRAINT `workshop_maintenance_ibfk_2` FOREIGN KEY (`id_mekanik`) REFERENCES `pekerja` (`id_pekerja`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
