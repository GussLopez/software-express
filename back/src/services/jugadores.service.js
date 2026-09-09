import { insertarJugador } from '../models/jugadores.model.js';

export async function crearJugador(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw Object.assign(
      new Error('Envía nombre, gamertag y correo en un objeto JSON'),
      { status: 400 },
    );
  }

  const jugador = {};

  for (const [campo, limite] of Object.entries({
    nombre: 100,
    gamertag: 50,
    correo: 150,
  })) {
    if (typeof body[campo] !== 'string' || !body[campo].trim()) {
      throw Object.assign(
        new Error(`${campo} es obligatorio y debe ser texto`),
        { status: 400 },
      );
    }

    jugador[campo] = body[campo].trim();

    if ([...jugador[campo]].length > limite) {
      throw Object.assign(
        new Error(`${campo} no debe superar ${limite} caracteres`),
        { status: 400 },
      );
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(jugador.correo)) {
    throw Object.assign(new Error('El correo electrónico no es válido'), {
      status: 400,
    });
  }

  try {
    return await insertarJugador(jugador);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw Object.assign(new Error('El gamertag ya está registrado'), {
        status: 409,
      });
    }

    throw error;
  }
}
