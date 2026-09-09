# API Express + MySQL

Requiere Node.js 22 o superior y una instancia de MySQL para usar la base de datos.

## Inicio

Desde `back`:

```sh
npm install
```

Copia las variables de `.env.example` a `.env` y completa las credenciales de tu
instancia de MySQL. Si ya tienes un `.env`, conserva sus valores y agrega los que
falten. La base indicada en `DB_NAME` y el usuario deben existir en MySQL;
la aplicación no crea bases ni tablas automáticamente.

```sh
npm run dev
```

Para ejecutar sin recarga automática: `npm start`.

## Estructura

```text
src/
  app.js                    # Express y middlewares
  index.js                  # Inicio y cierre del servidor
  config/
    env.js                  # Variables de entorno
    database.js             # Pool de conexiones MySQL
  routes/                   # URLs y controladores asociados
  controllers/              # Solicitudes y respuestas HTTP
  services/                 # Lógica de negocio
  models/                   # Consultas a MySQL
  middlewares/              # Errores y rutas inexistentes
```

Cada recurso nuevo puede seguir el flujo `routes → controllers → services → models`.
Registra sus rutas en `src/routes/index.js`. Los modelos usan el pool de
`config/database.js`; para valores enviados por el cliente utiliza parámetros:
`pool.execute('SELECT * FROM productos WHERE id = ?', [id])`.

## Comprobar la API

- `GET http://localhost:4000/api/health`: devuelve `200` si la API está activa.
- `GET http://localhost:4000/api/health/db`: ejecuta `SELECT 1`; devuelve `200`
  si MySQL responde o `503` si falta configuración o no hay conexión.
- Las rutas inexistentes devuelven `404` en JSON.

La API puede iniciar sin MySQL disponible. El pool abre conexiones cuando se
ejecuta una consulta. `.env` está excluido de Git; `.env.example` solo contiene
la plantilla de configuración.
