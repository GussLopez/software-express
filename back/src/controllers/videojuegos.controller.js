import { crearVideojuego, obtenerVideojuegos } from '../services/videojuegos.service.js';

export async function consultarVideojuegos(req, res) {
  const videojuegos = await obtenerVideojuegos();

  res.status(200).json({ videojuegos });
}

export async function registrarVideojuego(req, res) {
  const videojuego = await crearVideojuego(req.body);

  res.status(201).json({
    message: 'Videojuego registrado correctamente',
    videojuego,
  });
}
