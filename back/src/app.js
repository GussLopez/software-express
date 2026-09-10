import express from 'express';
import jugadoresRoutes from './routes/jugadores.routes.js';
import videojuegosRoutes from './routes/videojuegos.routes.js';
import puntuacionesRoutes from './routes/puntuaciones.routes.js';
import errorHandler from './middlewares/error.middleware.js';

const app = express();
app.use(express.json());
app.use('/api/jugadores', jugadoresRoutes);
app.use('/api/videojuegos', videojuegosRoutes);
app.use('/api/puntuaciones', puntuacionesRoutes);
app.use(errorHandler);

export default app;
