import { crearJugador } from '../services/jugadores.service.js';

export async function registrarJugador(req, res) {
  const jugador = await crearJugador(req.body);

  res.status(201).json({ message: 'Jugador registrado correctamente', jugador });
}
