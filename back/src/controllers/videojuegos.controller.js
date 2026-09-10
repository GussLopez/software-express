import { crearVideojuego } from '../services/videojuegos.service.js';

export async function registrarVideojuego(req, res) {
  const videojuego = await crearVideojuego(req.body);

  res.status(201).json({
    message: 'Videojuego registrado correctamente',
    videojuego,
  });
}
