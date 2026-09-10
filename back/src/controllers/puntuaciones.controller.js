import { crearPuntuacion } from '../services/puntuaciones.service.js';

export async function registrarPuntuacion(req, res) {
  const puntuacion = await crearPuntuacion(req.body);

  res.status(201).json({
    message: 'Puntuación registrada correctamente',
    puntuacion,
  });
}
