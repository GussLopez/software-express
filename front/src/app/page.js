// front/src/app/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('ranking'); // ranking | jugadores | videojuegos | registrar

  // Datos provenientes de MySQL / Backend Express
  const [jugadores, setJugadores] = useState([]);
  const [videojuegos, setVideojuegos] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalJugadores: 0,
    totalVideojuegos: 0,
    totalPuntuaciones: 0,
    promedioPuntuacion: 0,
  });

  const [loading, setLoading] = useState(true);

  // RF06 & RF07: Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameFilter, setSelectedGameFilter] = useState('');

  // RF05: Retroalimentación UI (Mensajes)
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Formularios de entrada
  const [newPlayer, setNewPlayer] = useState({ nombre: '', gamertag: '', correo: '' });
  const [newGame, setNewGame] = useState({ nombre: '', genero: '' });
  const [newScore, setNewScore] = useState({ jugador_id: '', videojuego_id: '', puntuacion: '' });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    fetchRanking(selectedGameFilter);
  }, [selectedGameFilter]);

  const showNotification = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 5000);
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [jData, vData, statsData, rData] = await Promise.all([
        api.getJugadores(),
        api.getVideojuegos(),
        api.getEstadisticas().catch(() => null),
        api.getRanking(),
      ]);

      setJugadores(Array.isArray(jData) ? jData : jData.data || []);
      setVideojuegos(Array.isArray(vData) ? vData : vData.data || []);
      setRanking(Array.isArray(rData) ? rData : rData.data || []);

      if (statsData) {
        setEstadisticas({
          totalJugadores: statsData.total_jugadores ?? statsData.totalJugadores ?? 0,
          totalVideojuegos: statsData.total_videojuegos ?? statsData.totalVideojuegos ?? 0,
          totalPuntuaciones: statsData.total_puntuaciones ?? statsData.totalPuntuaciones ?? 0,
          promedioPuntuacion: statsData.puntuacion_promedio ?? statsData.promedioPuntuacion ?? 0,
        });
      }
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRanking = async (gameId) => {
    try {
      const data = await api.getRanking(gameId);
      setRanking(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Error al cargar ranking:", err);
    }
  };

  // RF07: Buscador en tiempo real de jugadores por Nombre o Gamertag
  const filteredJugadores = useMemo(() => {
    if (!searchQuery.trim()) return jugadores;
    const q = searchQuery.toLowerCase();
    return jugadores.filter(
      (j) =>
        (j.nombre && j.nombre.toLowerCase().includes(q)) ||
        (j.gamertag && j.gamertag.toLowerCase().includes(q))
    );
  }, [jugadores, searchQuery]);

  // Manejo de creación de jugadores (RF01)
  const handleCreateJugador = async (e) => {
    e.preventDefault();
    try {
      await api.createJugador(newPlayer);
      showNotification('success', '¡Jugador registrado exitosamente!');
      setNewPlayer({ nombre: '', gamertag: '', correo: '' });
      loadInitialData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // Manejo de creación de videojuegos (RF02)
  const handleCreateVideojuego = async (e) => {
    e.preventDefault();
    try {
      await api.createVideojuego(newGame);
      showNotification('success', '¡Videojuego registrado exitosamente!');
      setNewGame({ nombre: '', genero: '' });
      loadInitialData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // Manejo de registro de puntuaciones (RF03 / RF05)
  const handleCreatePuntuacion = async (e) => {
    e.preventDefault();
    if (Number(newScore.puntuacion) < 0) {
      showNotification('error', 'La puntuación no puede ser negativa');
      return;
    }
    try {
      await api.createPuntuacion({
        jugador_id: Number(newScore.jugador_id),
        videojuego_id: Number(newScore.videojuego_id),
        puntuacion: Number(newScore.puntuacion),
      });
      showNotification('success', '¡Puntuación registrada exitosamente!');
      setNewScore({ jugador_id: '', videojuego_id: '', puntuacion: '' });
      loadInitialData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Barra superior */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-600/30">
              SE
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block leading-none">Software Express</span>
              <span className="text-[10px] text-zinc-400 font-medium tracking-wide uppercase">Sistema de Torneo</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>MYSQL CONECTADO</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Banner de mensajes de éxito/error (RF05) */}
        {feedback.message && (
          <div
            className={`mb-6 p-4 rounded-xl border text-sm font-medium flex items-center justify-between transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback({ type: '', message: '' })} className="text-xs opacity-70 hover:opacity-100">
              Cerrar
            </button>
          </div>
        )}

        {/* Panel de Estadísticas (RF08) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Jugadores</p>
            <p className="text-3xl font-extrabold text-white mt-1 font-mono">{estadisticas.totalJugadores}</p>
          </div>
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Videojuegos</p>
            <p className="text-3xl font-extrabold text-white mt-1 font-mono">{estadisticas.totalVideojuegos}</p>
          </div>
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Puntuaciones</p>
            <p className="text-3xl font-extrabold text-white mt-1 font-mono">{estadisticas.totalPuntuaciones}</p>
          </div>
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Puntuación Promedio</p>
            <p className="text-3xl font-extrabold text-indigo-400 mt-1 font-mono">
              {Math.round(Number(estadisticas.promedioPuntuacion) || 0).toLocaleString()}
            </p>
          </div>
        </section>

        {/* Navegación por Pestañas */}
        <div className="flex space-x-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80 w-fit mb-8 overflow-x-auto">
          {[
            { id: 'ranking', label: 'RF06. Clasificación' },
            { id: 'jugadores', label: 'RF01/RF04/RF07. Jugadores' },
            { id: 'videojuegos', label: 'RF02. Videojuegos' },
            { id: 'registrar', label: 'RF03/RF05. Registrar Puntos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 text-sm">
            <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <span>Consultando información en MySQL...</span>
          </div>
        ) : (
          <div>
            {/* RF06: CLASIFICACIÓN / RANKING */}
            {activeTab === 'ranking' && (
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white">Tabla de Clasificación</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">Ordenada estrictamente de mayor a menor puntuación.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-zinc-400 whitespace-nowrap">Filtrar por juego:</label>
                    <select
                      value={selectedGameFilter}
                      onChange={(e) => setSelectedGameFilter(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Todos los videojuegos</option>
                      {videojuegos.map((v) => (
                        <option key={v.id} value={v.id}>{v.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase font-mono">
                        <th className="pb-3 px-2 font-semibold w-16">Pos</th>
                        <th className="pb-3 font-semibold">Jugador</th>
                        <th className="pb-3 font-semibold">Videojuego</th>
                        <th className="pb-3 font-semibold text-right">Puntuación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {ranking.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-zinc-500 text-xs">
                            No hay registros disponibles.
                          </td>
                        </tr>
                      ) : (
                        ranking.map((p, index) => (
                          <tr key={p.id || index} className="hover:bg-zinc-800/30 transition-colors">
                            <td className="py-3.5 px-2 font-mono text-xs font-bold text-zinc-500">
                              #{index + 1}
                            </td>
                            <td className="py-3.5 font-medium text-white">
                              {p.gamertag || p.jugador_nombre || p.jugador}
                            </td>
                            <td className="py-3.5 text-zinc-400 text-xs">
                              {p.videojuego_nombre || p.videojuego}
                            </td>
                            <td className="py-3.5 text-right font-mono font-bold text-indigo-400 text-base">
                              {Number(p.puntuacion || p.puntos).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* RF01, RF04, RF07: JUGADORES Y BUSCADOR */}
            {activeTab === 'jugadores' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-white">Jugadores Registrados</h2>
                      <p className="text-xs text-zinc-400 mt-0.5">Lista obtenida directamente de MySQL.</p>
                    </div>
                    {/* RF07: Buscador */}
                    <div className="w-full sm:w-64">
                      <input
                        type="text"
                        placeholder="Buscar por Nombre o Gamertag..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase font-mono">
                          <th className="pb-3 font-semibold">Gamertag</th>
                          <th className="pb-3 font-semibold">Nombre</th>
                          <th className="pb-3 font-semibold">Correo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {filteredJugadores.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="py-8 text-center text-zinc-500 text-xs">
                              No se encontraron coincidencias.
                            </td>
                          </tr>
                        ) : (
                          filteredJugadores.map((j) => (
                            <tr key={j.id} className="hover:bg-zinc-800/30 transition-colors">
                              <td className="py-3 font-semibold text-indigo-300 font-mono text-xs">{j.gamertag}</td>
                              <td className="py-3 text-white text-xs">{j.nombre}</td>
                              <td className="py-3 text-zinc-400 text-xs">{j.correo || j.email}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Formulario RF01 */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 h-fit">
                  <h3 className="text-base font-bold mb-1 text-white">Registrar Jugador</h3>
                  <p className="text-xs text-zinc-400 mb-4">El gamertag no puede repetirse.</p>
                  <form onSubmit={handleCreateJugador} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Carlos Mendoza"
                        value={newPlayer.nombre}
                        onChange={(e) => setNewPlayer({ ...newPlayer, nombre: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Gamertag / Alias *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. ShadowMaster"
                        value={newPlayer.gamertag}
                        onChange={(e) => setNewPlayer({ ...newPlayer, gamertag: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Correo Electrónico *</label>
                      <input
                        type="email"
                        required
                        placeholder="shadow@express.com"
                        value={newPlayer.correo}
                        onChange={(e) => setNewPlayer({ ...newPlayer, correo: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors shadow-md shadow-indigo-600/20"
                    >
                      Guardar Jugador
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* RF02: VIDEOJUEGOS */}
            {activeTab === 'videojuegos' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-1">Catálogo de Videojuegos</h2>
                  <p className="text-xs text-zinc-400 mb-6">Títulos habilitados en la base de datos.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {videojuegos.length === 0 ? (
                      <p className="text-zinc-500 text-xs col-span-2 py-4">No hay juegos registrados en MySQL.</p>
                    ) : (
                      videojuegos.map((v) => (
                        <div key={v.id} className="p-4 bg-zinc-950/60 border border-zinc-800/60 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-white text-sm">{v.nombre}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-indigo-300 border border-zinc-700/50">
                              {v.genero}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-zinc-600">ID: {v.id}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Formulario RF02 */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 h-fit">
                  <h3 className="text-base font-bold mb-1 text-white">Registrar Videojuego</h3>
                  <p className="text-xs text-zinc-400 mb-4">El nombre del juego debe ser único.</p>
                  <form onSubmit={handleCreateVideojuego} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Nombre del Juego *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Tekken 8"
                        value={newGame.nombre}
                        onChange={(e) => setNewGame({ ...newGame, nombre: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Género *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Peleas"
                        value={newGame.genero}
                        onChange={(e) => setNewGame({ ...newGame, genero: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors shadow-md shadow-indigo-600/20"
                    >
                      Guardar Videojuego
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* RF03 & RF05: REGISTRO DE PUNTUACIONES */}
            {activeTab === 'registrar' && (
              <div className="max-w-2xl mx-auto bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-1">Registrar Puntuación</h2>
                <p className="text-xs text-zinc-400 mb-6">Vincula un jugador existente con un videojuego y asigna los puntos.</p>

                <form onSubmit={handleCreatePuntuacion} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">1. Seleccionar Jugador *</label>
                    <select
                      required
                      value={newScore.jugador_id}
                      onChange={(e) => setNewScore({ ...newScore, jugador_id: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Seleccionar Jugador --</option>
                      {jugadores.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.gamertag} ({j.nombre})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">2. Seleccionar Videojuego *</label>
                    <select
                      required
                      value={newScore.videojuego_id}
                      onChange={(e) => setNewScore({ ...newScore, videojuego_id: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Seleccionar Juego --</option>
                      {videojuegos.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.nombre} [{v.genero}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">3. Puntuación Obtenida *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="Ej. 950 (No se permiten valores negativos)"
                      value={newScore.puntuacion}
                      onChange={(e) => setNewScore({ ...newScore, puntuacion: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-indigo-600/20 mt-2"
                  >
                    Guardar Puntuación
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}