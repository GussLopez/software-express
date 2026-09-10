import { test, before, after, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import app from '../src/app.js';
import { pool } from '../src/config/database.js';

let server;
let base;
const datos = { nombre: 'Ana López', gamertag: 'AnaGG', correo: 'ana@example.com' };

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}/api/jugadores`;
});

afterEach(() => mock.restoreAll());

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

function post(body) {
  return fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('consulta los jugadores con todos sus campos y orden por ID', async () => {
  const jugadores = [
    { id: 1, ...datos, fecha_registro: '2026-09-09 18:00:00' },
    {
      id: 2,
      nombre: 'Luis',
      gamertag: 'LuisGG',
      correo: 'luis@example.com',
      fecha_registro: '2026-09-10 12:00:00',
    },
  ];
  const execute = mock.method(pool, 'execute', async (sql) => {
    assert.equal(
      sql,
      'SELECT id, nombre, gamertag, correo, fecha_registro FROM jugadores ORDER BY id ASC',
    );
    return [jugadores];
  });

  const res = await fetch(base);

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { jugadores });
  assert.equal(execute.mock.callCount(), 1);
});

test('devuelve una lista vacía cuando no hay jugadores registrados', async () => {
  mock.method(pool, 'execute', async () => [[]]);

  const res = await fetch(base);

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { jugadores: [] });
});

test('oculta detalles internos cuando falla la consulta de jugadores', async () => {
  mock.method(console, 'error', () => {});
  mock.method(pool, 'execute', async () => {
    throw new Error('SQL y credenciales privadas');
  });

  const res = await fetch(base);

  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { message: 'Error interno del servidor' });
});

test('registra con parámetros, limpia espacios y devuelve ID y fecha de MySQL', async () => {
  const registrado = { id: 7, ...datos, fecha_registro: '2026-09-09 18:00:00' };
  const execute = mock.method(pool, 'execute', async (sql, params) => {
    if (sql.startsWith('INSERT')) {
      assert.match(sql, /VALUES \(\?, \?, \?\)/);
      assert.deepEqual(params, Object.values(datos));
      return [{ insertId: 7 }];
    }

    assert.deepEqual(params, [7]);
    return [[registrado]];
  });
  const res = await post({
    ...datos,
    nombre: '  Ana López  ',
    id: 99,
    fecha_registro: 'incorrecta',
  });

  assert.equal(res.status, 201);
  assert.deepEqual((await res.json()).jugador, registrado);
  assert.equal(execute.mock.callCount(), 2);
});

test('rechaza campos ausentes, vacíos, tipos incorrectos, longitudes y correo inválido sin consultar MySQL', async () => {
  const execute = mock.method(pool, 'execute', async () => {
    throw new Error('No debe consultar');
  });
  const invalidos = [null, [], {}, { ...datos, correo: 'invalido' }];

  for (const [campo, limite] of Object.entries({
    nombre: 100,
    gamertag: 50,
    correo: 150,
  })) {
    for (const valor of [undefined, '', '   ', 123, {}, 'a'.repeat(limite + 1)]) {
      invalidos.push({ ...datos, [campo]: valor });
    }
  }

  for (const body of invalidos) {
    const res = await post(body);
    assert.equal(res.status, 400, JSON.stringify(body));
    assert.equal(typeof (await res.json()).message, 'string');
  }

  assert.equal(execute.mock.callCount(), 0);
});

test('devuelve 409 cuando MySQL rechaza un gamertag duplicado', async () => {
  mock.method(pool, 'execute', async () => {
    throw Object.assign(new Error('Duplicate entry'), { code: 'ER_DUP_ENTRY' });
  });
  const res = await post(datos);
  assert.equal(res.status, 409);
  assert.deepEqual(await res.json(), { message: 'El gamertag ya está registrado' });
});

test('devuelve JSON 400 para un cuerpo mal formado', async () => {
  const res = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
  });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).message, 'El cuerpo debe contener JSON válido');
});

test('oculta detalles internos cuando falla MySQL', async () => {
  mock.method(console, 'error', () => {});
  mock.method(pool, 'execute', async () => {
    throw new Error('SQL y credenciales privadas');
  });
  const res = await post(datos);
  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { message: 'Error interno del servidor' });
});
