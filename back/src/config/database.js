import mysql from 'mysql2/promise';
import env from './env.js';

const pool = mysql.createPool({
  ...env.database,
  waitForConnections: true,
  connectTimeout: 5000,
});

async function connectDatabase() {
  if (!env.database.user || !env.database.database) {
    throw new Error('Configura DB_USER y DB_NAME en .env');
  }

  const connection = await pool.getConnection();
  connection.release();
  console.log('Conexión a MySQL establecida');
}

export { pool, connectDatabase };
