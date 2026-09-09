import { pool } from '../config/database.js';

export async function insertarVideojuego({ nombre, genero }) {
  const [result] = await pool.execute(
    'INSERT INTO videojuegos (nombre, genero) VALUES (?, ?)',
    [nombre, genero],
  );

  const [rows] = await pool.execute(
    'SELECT id, nombre, genero FROM videojuegos WHERE id = ?',
    [result.insertId],
  );

  return rows[0];
}
