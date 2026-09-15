import { Router } from 'express';
import {
  consultarVideojuegos,
  registrarVideojuego,
} from '../controllers/videojuegos.controller.js';

const router = Router();
router.get('/', consultarVideojuegos);
router.post('/', registrarVideojuego);

export default router;
