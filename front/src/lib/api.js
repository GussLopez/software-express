// front/src/lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function fetchAPI(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || 'Error de conexión con el servidor');
  }

  return data;
}

export const api = {
  // RF01 & RF04: Jugadores
  getJugadores: () => fetchAPI('/jugadores'),
  createJugador: (data) => fetchAPI('/jugadores', { method: 'POST', body: JSON.stringify(data) }),

  // RF02: Videojuegos
  getVideojuegos: () => fetchAPI('/videojuegos'),
  createVideojuego: (data) => fetchAPI('/videojuegos', { method: 'POST', body: JSON.stringify(data) }),

  // RF03, RF05, RF06: Puntuaciones y Ranking
  getPuntuaciones: () => fetchAPI('/puntuaciones'),
  getRanking: (videojuegoId = '') => fetchAPI(`/puntuaciones/ranking${videojuegoId ? `?videojuego_id=${videojuegoId}` : ''}`),
  createPuntuacion: (data) => fetchAPI('/puntuaciones', { method: 'POST', body: JSON.stringify(data) }),

  // RF08: Estadísticas
  getEstadisticas: () => fetchAPI('/puntuaciones/estadisticas'),
};