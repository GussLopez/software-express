import { test, before, after, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import app from '../src/app.js';
import { pool } from '../src/config/database.js';

let server;
let base;
const datos = { jugador_id: 1, videojuego_id: 2, puntuacion: 950 };

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}/api/puntuaciones`;
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

test('registra con parámetros y devuelve el ID y la fecha de MySQL', async () => {
  const registrado = { id: 7, ...datos, fecha: '2026-09-09 18:00:00' };
  const execute = mock.method(pool, 'execute', async (sql, params) => {
    if (sql.startsWith('INSERT')) {
      assert.match(sql, /VALUES \(\?, \?, \?\)/);
      assert.deepEqual(params, Object.values(datos));
      return [{ insertId: 7 }];
    }

    assert.match(sql, /FROM puntuaciones WHERE id = \?/);
    assert.deepEqual(params, [7]);
    return [[registrado]];
  });
  const res = await post({ ...datos, id: 99, fecha: 'incorrecta' });

  assert.equal(res.status, 201);
  assert.deepEqual(await res.json(), {
    message: 'Puntuación registrada correctamente',
    puntuacion: registrado,
  });
  assert.equal(execute.mock.callCount(), 2);
});

test('rechaza campos inválidos y negativos sin consultar MySQL', async () => {
  const execute = mock.method(pool, 'execute', async () => {
    throw new Error('No debe consultar');
  });
  const invalidos = [null, [], {}, 'texto'];
  const valores = [undefined, null, '', '1', true, {}, [], -1, 1.5, 2147483648];

  for (const campo of ['jugador_id', 'videojuego_id', 'puntuacion']) {
    for (const valor of valores) {
      invalidos.push({ ...datos, [campo]: valor });
    }
  }

  invalidos.push({ ...datos, jugador_id: 0 }, { ...datos, videojuego_id: 0 });

  for (const body of invalidos) {
    const res = await post(body);

    assert.equal(res.status, 400, JSON.stringify(body));
    assert.equal(typeof (await res.json()).message, 'string');
  }

  assert.equal(execute.mock.callCount(), 0);
});

test('acepta cero, el máximo INT y múltiples puntuaciones del mismo jugador', async () => {
  let id = 0;
  let actual;

  mock.method(pool, 'execute', async (sql, params) => {
    if (sql.startsWith('INSERT')) {
      actual = {
        id: ++id,
        jugador_id: params[0],
        videojuego_id: params[1],
        puntuacion: params[2],
        fecha: '2026-09-09 18:00:00',
      };
      return [{ insertId: id }];
    }

    return [[actual]];
  });

  for (const puntuacion of [0, 2147483647, 950, 950]) {
    const res = await post({ ...datos, puntuacion });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.puntuacion.puntuacion, puntuacion);
    assert.equal(body.puntuacion.id, id);
  }

  assert.equal(id, 4);
});

test('devuelve 400 cuando MySQL rechaza una referencia inexistente', async () => {
  mock.method(pool, 'execute', async () => {
    throw Object.assign(new Error('Foreign key fails'), {
      code: 'ER_NO_REFERENCED_ROW_2',
    });
  });
  const res = await post(datos);

  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), {
    message: 'El jugador y el videojuego deben existir',
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
