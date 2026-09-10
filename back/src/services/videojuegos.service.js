import { insertarVideojuego } from '../models/videojuegos.model.js';

export async function crearVideojuego(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw Object.assign(
      new Error('Envía nombre y genero en un objeto JSON'),
      { status: 400 },
    );
  }

  const videojuego = {};

  for (const [campo, limite] of Object.entries({
    nombre: 100,
    genero: 50,
  })) {
    if (typeof body[campo] !== 'string' || !body[campo].trim()) {
      throw Object.assign(
        new Error(`${campo} es obligatorio y debe ser texto`),
        { status: 400 },
      );
    }

    videojuego[campo] = body[campo].trim();

    if ([...videojuego[campo]].length > limite) {
      throw Object.assign(
        new Error(`${campo} no debe superar ${limite} caracteres`),
        { status: 400 },
      );
    }
  }

  try {
    return await insertarVideojuego(videojuego);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw Object.assign(
        new Error('Ya existe un videojuego con ese nombre'),
        { status: 409 },
      );
    }

    throw error;
  }
}
