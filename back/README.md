# Backend Express + MySQL

Base inicial para arrancar el servidor y conectar con MySQL.

## Estructura

```text
src/
  app.js              # Configuración de Express
  index.js            # Arranque y cierre del servidor
  config/
    env.js            # Variables de entorno
    database.js       # Pool y comprobación de conexión a MySQL
```

## Ejecutar

Requiere Node.js 22 o superior y MySQL disponible.

1. Ejecuta `npm install` desde `back`.
2. Configura `.env` siguiendo `.env.example`, conservando tus credenciales.
   La base de datos y el usuario deben existir en MySQL.
3. Ejecuta `npm run dev` para desarrollo o `npm start` para el arranque normal.

El servidor escucha en el puerto indicado en `PORT` (4000 por defecto) después
 de verificar la conexión a MySQL. Si la conexión falla, informa el error y termina.

Esta base no incluye endpoints, modelos, servicios ni creación de tablas.
