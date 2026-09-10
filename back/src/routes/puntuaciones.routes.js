import { Router } from 'express';
import { registrarPuntuacion } from '../controllers/puntuaciones.controller.js';

const router = Router();
router.post('/', registrarPuntuacion);

export default router;
