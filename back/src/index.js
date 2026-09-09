import app from './app.js';
import env from './config/env.js';
import { pool, connectDatabase } from './config/database.js';

async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(env.port, () => {
      console.log(`Servidor iniciado en http://localhost:${env.port}`);
    });

    server.on('error', async (error) => {
      console.error('No se pudo iniciar el servidor:', error.message);
      await pool.end();
      process.exitCode = 1;
    });

    const shutdown = () => {
      server.close(async () => {
        await pool.end();
      });
    };

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  } catch (error) {
    console.error('No se pudo iniciar la aplicación:', error.message);
    await pool.end();
    process.exitCode = 1;
  }
}

startServer();
