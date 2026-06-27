const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("⚠️ PERINGATAN: DATABASE_URL tidak ditemukan di environment variables / file .env!");
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false // Diperlukan untuk koneksi aman ke Supabase
  }
});

// Helper untuk mengkonversi placeholder ? (MySQL) ke $1, $2, ... (PostgreSQL)
function convertPlaceholders(sql) {
  let paramIndex = 1;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let result = '';
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    
    if (char === "'" && (i === 0 || sql[i - 1] !== '\\')) {
      if (!inDoubleQuote) inSingleQuote = !inSingleQuote;
    } else if (char === '"' && (i === 0 || sql[i - 1] !== '\\')) {
      if (!inSingleQuote) inDoubleQuote = !inDoubleQuote;
    }
    
    if (char === '?' && !inSingleQuote && !inDoubleQuote) {
      result += `$${paramIndex++}`;
    } else {
      result += char;
    }
  }
  return result;
}

// Helper untuk mengecek apakah query bertipe SELECT / WITH / UNION (mengembalikan rows data)
function isSelectQuery(sql) {
  const cleanSql = sql.replace(/--.*$/gm, '').trim().toUpperCase();
  return cleanSql.startsWith('SELECT') || cleanSql.startsWith('WITH') || cleanSql.startsWith('UNION');
}

const db = {
  query: (sql, params, callback) => {
    let actualParams = params;
    let actualCallback = callback;
    
    // Jika parameter kedua adalah fungsi, berarti itu adalah callback (tanpa parameter nilai bind)
    if (typeof params === 'function') {
      actualCallback = params;
      actualParams = [];
    }

    const pgSql = convertPlaceholders(sql);

    if (actualCallback) {
      // Callback Style (digunakan di sebagian besar server.js)
      pool.query(pgSql, actualParams, (err, res) => {
        if (err) {
          // Petakan kode error foreign key violation Postgres (23503) ke format MySQL (ER_ROW_IS_REFERENCED_2)
          if (err.code === '23503') {
            err.code = 'ER_ROW_IS_REFERENCED_2';
          }
          return actualCallback(err, null);
        }
        
        const isSelect = isSelectQuery(pgSql);
        if (isSelect) {
          // mysql2 mengembalikan array rows langsung sebagai argumen kedua callback SELECT
          actualCallback(null, res.rows);
        } else {
          // mysql2 mengembalikan OkPacket untuk modifikasi data (INSERT/UPDATE/DELETE)
          actualCallback(null, { affectedRows: res.rowCount, insertId: null });
        }
      });
    } else {
      // Promise Style (digunakan untuk async/await seperti pada backend/routes/rental.js)
      return new Promise((resolve, reject) => {
        pool.query(pgSql, actualParams, (err, res) => {
          if (err) {
            if (err.code === '23503') {
              err.code = 'ER_ROW_IS_REFERENCED_2';
            }
            return reject(err);
          }
          
          const isSelect = isSelectQuery(pgSql);
          if (isSelect) {
            // mysql2 promise-based query mengembalikan array [rows, fields]
            resolve([res.rows]);
          } else {
            resolve([{ affectedRows: res.rowCount, insertId: null }]);
          }
        });
      });
    }
  },
  
  connect: (cb) => {
    pool.connect((err, client, release) => {
      if (err) {
        console.error('❌ Gagal terhubung ke PostgreSQL/Supabase:', err.message);
        if (cb) cb(err);
        return;
      }
      console.log('✅ Terhubung ke database PostgreSQL/Supabase via pg Pool');
      release();
      if (cb) cb(null);
    });
  }
};

// Hubungkan ke database saat runtime inisialisasi server untuk log visual
db.connect();

module.exports = db;