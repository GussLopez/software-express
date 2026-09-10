import { Router } from 'express';
import {
  consultarJugadores,
  registrarJugador,
} from '../controllers/jugadores.controller.js';

const router = Router();
router.get('/', consultarJugadores);
router.post('/', registrarJugador);

export default router;
