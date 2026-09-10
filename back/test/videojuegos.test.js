import { test, before, after, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import app from '../src/app.js';
import { pool } from '../src/config/database.js';

let server;
let base;
const datos = { nombre: 'Tekken', genero: 'Peleas' };

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}/api/videojuegos`;
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

test('registra un videojuego, limpia espacios y usa el ID de MySQL', async () => {
  const registrado = { id: 7, ...datos };
  const execute = mock.method(pool, 'execute', async (sql, params) => {
    if (sql.startsWith('INSERT')) {
      assert.equal(
        sql,
        'INSERT INTO videojuegos (nombre, genero) VALUES (?, ?)',
      );
      assert.deepEqual(params, Object.values(datos));
      return [{ insertId: 7 }];
    }

    assert.equal(sql, 'SELECT id, nombre, genero FROM videojuegos WHERE id = ?');
    assert.deepEqual(params, [7]);
    return [[registrado]];
  });
  const res = await post({
    nombre: '  Tekken  ',
    genero: '  Peleas  ',
    id: 99,
  });

  assert.equal(res.status, 201);
  assert.deepEqual(await res.json(), {
    message: 'Videojuego registrado correctamente',
    videojuego: registrado,
  });
  assert.equal(execute.mock.callCount(), 2);
});

test('rechaza campos inválidos antes de consultar MySQL', async () => {
  const execute = mock.method(pool, 'execute', async () => {
    throw new Error('No debe consultar');
  });
  const invalidos = [null, [], {}, 'texto', 123];

  for (const [campo, limite] of Object.entries({ nombre: 100, genero: 50 })) {
    for (const valor of [undefined, '', '   ', 123, {}, [], 'a'.repeat(limite + 1)]) {
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

test('acepta los límites y pasa caracteres SQL como parámetros', async () => {
  const casos = [
    { nombre: 'a'.repeat(100), genero: 'b'.repeat(50) },
    { nombre: "Juego'); DROP TABLE videojuegos; --", genero: 'Acción' },
  ];
  let actual;

  mock.method(pool, 'execute', async (sql, params) => {
    if (sql.startsWith('INSERT')) {
      assert.equal(sql.includes(actual.nombre), false);
      assert.deepEqual(params, [actual.nombre, actual.genero]);
      return [{ insertId: 8 }];
    }

    return [[{ id: 8, ...actual }]];
  });

  for (actual of casos) {
    const res = await post(actual);

    assert.equal(res.status, 201);
    assert.deepEqual((await res.json()).videojuego, { id: 8, ...actual });
  }
});

test('devuelve 409 cuando el nombre ya existe', async () => {
  mock.method(pool, 'execute', async () => {
    throw Object.assign(new Error('Duplicate entry'), { code: 'ER_DUP_ENTRY' });
  });
  const res = await post(datos);

  assert.equal(res.status, 409);
  assert.deepEqual(await res.json(), {
    message: 'Ya existe un videojuego con ese nombre',
  });
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
