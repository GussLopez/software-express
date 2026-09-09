import { pool } from '../config/database.js';

export async function insertarJugador({ nombre, gamertag, correo }) {
  const [result] = await pool.execute(
    'INSERT INTO jugadores (nombre, gamertag, correo) VALUES (?, ?, ?)',
    [nombre, gamertag, correo],
  );

  const [rows] = await pool.execute(
    'SELECT id, nombre, gamertag, correo, fecha_registro FROM jugadores WHERE id = ?',
    [result.insertId],
  );

  return rows[0];
}
