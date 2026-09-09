import { Router } from 'express';
import { registrarVideojuego } from '../controllers/videojuegos.controller.js';

const router = Router();
router.post('/', registrarVideojuego);

export default router;
