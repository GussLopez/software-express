# Backend Express + MySQL

Backend con Express, ES modules y MySQL. Incluye RF01: registro de jugadores.

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

## Pruebas

Ejecuta `npm test`. Las pruebas HTTP usan el servidor Express con consultas MySQL
simuladas y cubren registro, validaciones, duplicados, JSON inválido y errores.
