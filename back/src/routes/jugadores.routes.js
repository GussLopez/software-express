import { Router } from 'express';
import { registrarJugador } from '../controllers/jugadores.controller.js';

const router = Router();
router.post('/', registrarJugador);

export default router;
