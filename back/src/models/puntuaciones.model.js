import { pool } from '../config/database.js';

export async function insertarPuntuacion({
  jugador_id,
  videojuego_id,
  puntuacion,
}) {
  const [result] = await pool.execute(
    `INSERT INTO puntuaciones (jugador_id, videojuego_id, puntuacion)
     VALUES (?, ?, ?)`,
    [jugador_id, videojuego_id, puntuacion],
  );

  const [rows] = await pool.execute(
    `SELECT id, jugador_id, videojuego_id, puntuacion, fecha
     FROM puntuaciones WHERE id = ?`,
    [result.insertId],
  );

  return rows[0];
}
