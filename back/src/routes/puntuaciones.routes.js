import { Router } from 'express';
import {
  consultarPuntuaciones,
  registrarPuntuacion,
} from '../controllers/puntuaciones.controller.js';

const router = Router();
router.get('/', consultarPuntuaciones);
router.post('/', registrarPuntuacion);

export default router;
