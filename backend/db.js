const mysql = require('mysql2');

// Konfigurasi koneksi ke phpMyAdmin
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_rental_alat',
    // Tambahkan pengaturan ini untuk mencegah pergeseran tanggal/timezone
    dateStrings: true, 
    timezone: '+07:00' 
});

db.connect((err) => {
    if (err) {
        console.error('Gagal koneksi ke MySQL:', err);
        return;
    }
    console.log('✅ Terhubung ke database MySQL: db_rental_alat dengan Timezone WIB');
});

module.exports = db;