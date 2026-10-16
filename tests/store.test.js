import test from 'node:test';
import assert from 'node:assert/strict';
import {
  seed, reducer, interventionStatus, todayISO, addDays,
  RECEIPT_CHECKS, equipmentEvents, STORAGE_KEY, loadState, persistState,
} from '../src/store.js';

const advance = (state, payload) => reducer(state, { type: 'ADVANCE_REQUEST', payload: { id: 'req-eco-002', ...payload } });
const receiptState = () => {
  let state = advance(seed(), { technicalJustification: 'Ecógrafo portátil compatible con los transductores requeridos.', budget: 85000 });
  return advance(state, { supplier: 'Proveedor de demostración', quotedPrice: 82000, purchaseOrder: 'OC-DEMO-002', approval: 'Aprobada (simulada)' });
};
const receipt = {
  checklist: Object.fromEntries(Object.keys(RECEIPT_CHECKS).map(key => [key, true])),
  brand: 'SonoMed (ficticia)', model: 'SD-300P', serial: 'DEMO-002', equipmentCode: 'ECO-002',
};

test('la demostración tiene un ecógrafo con historial, vencimiento y calibración próxima', () => {
  const state = seed();
  assert.equal(state.equipment.find(e => e.code === 'ECO-001').status, 'Operativo');
  assert.equal(interventionStatus(state.interventions.find(i => i.id === 'int-eco-done')), 'Completado');
  assert.equal(interventionStatus(state.interventions.find(i => i.id === 'int-eco-overdue')), 'Vencido');
  assert.equal(state.interventions.find(i => i.id === 'int-eco-cal').scheduledAt, addDays(12));
});

test('el vencimiento se calcula con la fecha consultada y no con un estado guardado', () => {
  const intervention = { scheduledAt: '2026-10-16', status: 'Pendiente' };
  assert.equal(interventionStatus(intervention, '2026-10-16'), 'Pendiente');
  assert.equal(interventionStatus(intervention, '2026-10-17'), 'Vencido');
  assert.equal(interventionStatus({ ...intervention, status: 'Completado' }, '2026-10-17'), 'Completado');
});

test('completar el preventivo vencido elimina su alerta y conserva el resultado', () => {
  const initial = seed();
  const item = initial.interventions.find(i => i.id === 'int-eco-overdue');
  const state = reducer(initial, { type: 'SAVE_INTERVENTION', payload: { ...item, status: 'Completado', executedAt: todayISO(), result: 'Pruebas conformes.', returnOperational: true } });
  const completed = state.interventions.find(i => i.id === item.id);
  assert.equal(interventionStatus(completed), 'Completado');
  assert.equal(completed.result, 'Pruebas conformes.');
  assert.equal(initial.interventions.find(i => i.id === item.id).status, 'Pendiente', 'el reductor no debe mutar el estado anterior');
  assert.ok(equipmentEvents(state, item.equipmentId).some(e => e.action.includes('Pruebas conformes.')));
});

test('no se puede completar una intervención sin equipo o resultado', () => {
  const state = seed();
  assert.throws(() => reducer(state, { type: 'SAVE_INTERVENTION', payload: { equipmentId: 'ausente', status: 'Completado' } }), /equipo válido/);
  const item = state.interventions.find(i => i.id === 'int-eco-overdue');
  assert.throws(() => reducer(state, { type: 'SAVE_INTERVENTION', payload: { ...item, status: 'Completado', executedAt: todayISO(), result: '' } }), /resultado/);
});

test('un correctivo cambia el equipo a mantenimiento y permite devolverlo a operativo', () => {
  let state = reducer(seed(), { type: 'SAVE_INTERVENTION', payload: { id: 'correctivo-prueba', equipmentId: 'eq-eco-001', type: 'Mantenimiento correctivo', scheduledAt: todayISO(), responsible: 'Ingeniería Clínica', status: 'Pendiente', markMaintenance: true } });
  assert.equal(state.equipment.find(e => e.id === 'eq-eco-001').status, 'En mantenimiento');
  state = reducer(state, { type: 'SAVE_INTERVENTION', payload: { id: 'correctivo-prueba', status: 'Completado', executedAt: todayISO(), result: 'Sensor sustituido y pruebas conformes.', returnOperational: true } });
  assert.equal(state.equipment.find(e => e.id === 'eq-eco-001').status, 'Operativo');
});

test('la adquisición requiere evaluación y aprobación expresamente simulada', () => {
  assert.throws(() => advance(seed(), {}), /justificación técnica/);
  const state = advance(seed(), { technicalJustification: 'Evaluación técnica favorable.', budget: 85000 });
  assert.throws(() => advance(state, { supplier: 'Demo', quotedPrice: 82000, purchaseOrder: 'OC-DEMO', approval: 'Pendiente' }), /aprobación gerencial simulada/);
  assert.equal(receiptState().requests[0].stage, 'Recepción');
});

test('cada requisito de recepción es obligatorio y el fallo no crea un equipo', () => {
  for (const key of Object.keys(RECEIPT_CHECKS)) {
    const state = receiptState();
    assert.throws(() => advance(state, { ...receipt, checklist: { ...receipt.checklist, [key]: false } }), /cinco requisitos/);
    assert.equal(state.equipment.length, 6);
    assert.equal(state.requests[0].stage, 'Recepción');
  }
});

test('recepción completa crea un único equipo y enlaza toda su trazabilidad', () => {
  const state = advance(receiptState(), receipt);
  const request = state.requests.find(r => r.id === 'req-eco-002');
  const equipment = state.equipment.find(e => e.code === 'ECO-002');
  assert.equal(state.equipment.length, 7);
  assert.equal(request.stage, 'Inventario');
  assert.equal(request.equipmentId, equipment.id);
  assert.equal(equipment.requestId, request.id);
  assert.ok(equipmentEvents(state, equipment.id).some(e => e.action.includes('SIMULADA')));
  assert.throws(() => advance(state, receipt), /ya tiene un equipo/);
  assert.equal(state.equipment.length, 7);
});

test('recepción rechaza códigos patrimoniales y series duplicados', () => {
  const state = receiptState();
  assert.throws(() => advance(state, { ...receipt, equipmentCode: 'ECO-001' }), /código patrimonial/);
  assert.throws(() => advance(state, { ...receipt, serial: state.equipment[0].serial }), /número de serie/);
});

test('la baja es permanente, conserva el registro y bloquea nuevos mantenimientos', () => {
  const state = reducer(seed(), { type: 'DISPOSE_EQUIPMENT', payload: { equipmentId: 'eq-eco-001', date: todayISO(), reason: 'Obsolescencia técnica', observations: 'Caso ficticio.' } });
  const equipment = state.equipment.find(e => e.id === 'eq-eco-001');
  assert.equal(state.equipment.length, 6);
  assert.equal(equipment.status, 'Dado de baja');
  assert.equal(equipment.disposal.reason, 'Obsolescencia técnica');
  assert.throws(() => reducer(state, { type: 'SAVE_EQUIPMENT', payload: { ...equipment, status: 'Operativo' } }), /no puede reactivarse/);
  assert.throws(() => reducer(state, { type: 'SAVE_INTERVENTION', payload: { equipmentId: equipment.id } }), /dado de baja/);
  assert.ok(equipmentEvents(state, equipment.id).some(e => e.action.includes('Baja definitiva')));
});

test('el inventario rechaza cambios ordinarios de estado y códigos duplicados', () => {
  const state = seed();
  const equipment = state.equipment[0];
  assert.throws(() => reducer(state, { type: 'SAVE_EQUIPMENT', payload: { ...equipment, status: 'Fuera de servicio' } }), /mediante una intervención/);
  assert.throws(() => reducer(state, { type: 'SAVE_EQUIPMENT', payload: { ...equipment, id: 'nuevo', serial: 'NUEVA-SERIE' } }), /código patrimonial/);
});

test('localStorage conserva el estado y recupera una demostración si está corrupto', () => {
  const memory = new Map();
  globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
  try {
    const state = seed();
    persistState(state);
    assert.deepEqual(loadState(), state);
    memory.set(STORAGE_KEY, '{datos inválidos');
    assert.equal(loadState().equipment[0].code, 'ECO-001');
  } finally {
    delete globalThis.localStorage;
  }
});
