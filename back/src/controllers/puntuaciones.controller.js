import {
  crearPuntuacion,
  obtenerPuntuaciones,
} from '../services/puntuaciones.service.js';

export async function consultarPuntuaciones(req, res) {
  const puntuaciones = await obtenerPuntuaciones();

  res.status(200).json({ puntuaciones });
}

export async function registrarPuntuacion(req, res) {
  const puntuacion = await crearPuntuacion(req.body);

  res.status(201).json({
    message: 'Puntuación registrada correctamente',
    puntuacion,
  });
}
