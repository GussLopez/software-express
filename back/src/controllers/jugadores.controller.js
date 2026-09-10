import { crearJugador, obtenerJugadores } from '../services/jugadores.service.js';

export async function consultarJugadores(req, res) {
  const jugadores = await obtenerJugadores();

  res.status(200).json({ jugadores });
}

export async function registrarJugador(req, res) {
  const jugador = await crearJugador(req.body);

  res.status(201).json({ message: 'Jugador registrado correctamente', jugador });
}
