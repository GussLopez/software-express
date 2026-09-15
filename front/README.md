# GameDevOps Frontend

Frontend minimalista en Next.js para consumir el backend Express del proyecto.

## Requisitos

- Node.js instalado
- Backend funcionando en `http://localhost:4000`
- MySQL funcionando con la base de datos del backend

## Ejecutar

```powershell
npm install
npm run dev
```

Después abre `http://localhost:3000`.

## Comunicación con el backend

El frontend usa un rewrite de Next.js para enviar `/api/*` a `http://localhost:4000/api/*`.
Esto evita problemas de CORS en el navegador sin modificar el backend.

Endpoints utilizados:

- `GET /api/jugadores`
- `POST /api/jugadores`
- `POST /api/videojuegos`
- `POST /api/puntuaciones`

Los formularios respetan las validaciones del backend y muestran sus mensajes de error.
