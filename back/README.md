# Backend Express + MySQL

Backend con Express, ES modules y MySQL. Incluye RF01: registro de jugadores
RF02: registro de videojuegos y RF03: registro de puntuaciones.

## Estructura

```text
src/
  app.js              # Configuración de Express
  index.js            # Arranque y cierre del servidor
  config/
    env.js            # Variables de entorno
    database.js       # Pool y comprobación de conexión a MySQL
  routes/             # Endpoint de registro
  controllers/        # Respuestas HTTP
  services/           # Validación y reglas de registro
  models/             # Consultas parametrizadas
  middlewares/        # Respuestas de error
```

## Ejecutar

Requiere Node.js 22 o superior y MySQL disponible.

1. Ejecuta `npm install` desde `back`.
2. Configura `.env` siguiendo `.env.example`, conservando tus credenciales.
   La base de datos y el usuario deben existir en MySQL.
3. Ejecuta `npm run dev` para desarrollo o `npm start` para el arranque normal.

El servidor escucha en el puerto indicado en `PORT` (4000 por defecto) después
 de verificar la conexión a MySQL. Si la conexión falla, informa el error y termina.

## RF01: registrar jugadores

La tabla `jugadores` debe existir en la base configurada en `DB_NAME`. Para una
instancia nueva, ejecuta `sql/001_create_jugadores.sql` en esa base. Es compatible
con la tabla del archivo `sql-db.sql` del reto y no inserta datos de ejemplo.

`POST /api/jugadores` con `Content-Type: application/json`:

```json
{
  "nombre": "Ana López",
  "gamertag": "AnaGG",
  "correo": "ana@example.com"
}
```

- `201`: devuelve `message` y `jugador` con `id`, `nombre`, `gamertag`, `correo`
  y `fecha_registro`. MySQL genera el ID y la fecha; no se toman del cliente.
- `400`: campos obligatorios ausentes, vacíos o inválidos, o JSON mal formado.
- `409`: gamertag ya registrado. La restricción UNIQUE de MySQL evita duplicados
  incluso en solicitudes simultáneas, según la collation de la tabla.
- `500`: error interno, sin exponer detalles de MySQL.

Se eliminan espacios al inicio y al final. Los límites son 100 caracteres para
nombre, 50 para gamertag y 150 para correo. Se comprueba el formato básico del
correo; no se exige que sea único.

## RF02: registrar videojuegos

La tabla `videojuegos` debe existir en la base configurada en `DB_NAME`. Para una
instancia nueva, ejecuta `sql/002_create_videojuegos.sql` en esa base. Respeta la
estructura del SQL del reto y no inserta datos de ejemplo.

`POST /api/videojuegos` con `Content-Type: application/json`:

```json
{
  "nombre": "Tekken",
  "genero": "Peleas"
}
```

- `201`: devuelve `message` y `videojuego` con `id`, `nombre` y `genero`.
  MySQL genera el ID; no se toma del cliente.
- `400`: nombre o género ausentes, vacíos, de tipo incorrecto o demasiado largos,
  o JSON mal formado.
- `409`: ya existe un videojuego con ese nombre. La restricción UNIQUE de MySQL
  evita duplicados incluso en solicitudes simultáneas, según la collation.
- `500`: error interno sin detalles de MySQL.

Se eliminan espacios al inicio y al final. El nombre admite hasta 100 caracteres
y el género hasta 50. El campo JSON se llama `genero`, sin tilde.

## RF03: registrar puntuaciones

Ejecuta `sql/003_create_puntuaciones.sql` en la base configurada en `DB_NAME`,
después de crear las tablas `jugadores` y `videojuegos`. El script incluye claves
foráneas y una restricción CHECK contra puntuaciones negativas (MySQL 8.0.16 o
superior). El backend también valida los valores antes de consultar MySQL.

`POST /api/puntuaciones` con `Content-Type: application/json`:

```json
{
  "jugador_id": 1,
  "videojuego_id": 2,
  "puntuacion": 950
}
```

- `201`: devuelve `message` y `puntuacion` con `id`, `jugador_id`,
  `videojuego_id`, `puntuacion` y `fecha`. MySQL genera el ID y la fecha.
- `400`: campos ausentes o inválidos, puntuación negativa, JSON mal formado,
  o jugador/videojuego inexistente.
- `500`: error interno sin detalles de MySQL.

Los tres campos deben ser números enteros JSON, no cadenas. Los IDs admiten de
1 a 2147483647 y la puntuación de 0 a 2147483647, conforme al tipo INT del SQL.
Un jugador puede registrar múltiples puntuaciones, incluso en el mismo juego.
Las claves foráneas comprueban que ambos registros existan al insertar.

## Pruebas

Ejecuta `npm test`. Las pruebas HTTP usan el servidor Express con consultas MySQL
simuladas y cubren registro, validaciones, duplicados, JSON inválido y errores.
