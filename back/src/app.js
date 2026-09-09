import express from 'express';
import jugadoresRoutes from './routes/jugadores.routes.js';
import errorHandler from './middlewares/error.middleware.js';

const app = express();
app.use(express.json());
app.use('/api/jugadores', jugadoresRoutes);
app.use(errorHandler);

export default app;
