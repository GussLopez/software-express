import { insertarPuntuacion } from '../models/puntuaciones.model.js';

const MAX_INT = 2147483647;

export async function crearPuntuacion(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw Object.assign(
      new Error('Envía jugador_id, videojuego_id y puntuacion en un objeto JSON'),
      { status: 400 },
    );
  }

  for (const campo of ['jugador_id', 'videojuego_id']) {
    if (
      !Number.isInteger(body[campo]) ||
      body[campo] < 1 ||
      body[campo] > MAX_INT
    ) {
      throw Object.assign(
        new Error(`${campo} debe ser un entero entre 1 y ${MAX_INT}`),
        { status: 400 },
      );
    }
  }

  if (
    !Number.isInteger(body.puntuacion) ||
    body.puntuacion < 0 ||
    body.puntuacion > MAX_INT
  ) {
    throw Object.assign(
      new Error(`puntuacion debe ser un entero entre 0 y ${MAX_INT}`),
      { status: 400 },
    );
  }

  try {
    return await insertarPuntuacion({
      jugador_id: body.jugador_id,
      videojuego_id: body.videojuego_id,
      puntuacion: body.puntuacion,
    });
  } catch (error) {
    // Las claves foráneas verifican la existencia al insertar, sin carreras.
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      throw Object.assign(
        new Error('El jugador y el videojuego deben existir'),
        { status: 400 },
      );
    }

    throw error;
  }
}
