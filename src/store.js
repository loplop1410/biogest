export const SERVICES = ['Diagnóstico por Imágenes', 'Unidad de Cuidados Intensivos', 'Centro Quirúrgico', 'Emergencia', 'Hospitalización', 'Laboratorio Clínico', 'Consulta Externa'];
export const EQUIPMENT_STATUSES = ['Operativo', 'En mantenimiento', 'Fuera de servicio', 'Dado de baja'];
export const PRIORITIES = ['Baja', 'Media', 'Alta', 'Crítica'];
export const INTERVENTION_TYPES = ['Mantenimiento preventivo', 'Mantenimiento correctivo', 'Calibración'];
export const STAGES = ['Necesidad', 'Evaluación', 'Adquisición', 'Recepción', 'Inventario'];
export const LIFECYCLE = ['Necesidad médica', 'Evaluación y planeamiento', 'Adquisición', 'Recepción', 'Sostenimiento', 'Disposición final'];
export const RECEIPT_CHECKS = { documentation: 'Documentación completa', accessories: 'Accesorios recibidos', functional: 'Pruebas funcionales satisfactorias', safety: 'Condiciones de seguridad verificadas', record: 'Acta de recepción registrada' };
export const STORAGE_KEY = 'biogest-demo-v1';

export function todayISO() {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  return `${p.find(x => x.type === 'year').value}-${p.find(x => x.type === 'month').value}-${p.find(x => x.type === 'day').value}`;
}
export function addDays(days, base = todayISO()) {
  const d = new Date(`${base}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10);
}
export function formatDate(value) {
  if (!value) return '—';
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '—';
}
export const money = value => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(Number(value) || 0);
export const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
export function interventionStatus(item, date = todayISO()) { return item.status === 'Completado' ? 'Completado' : item.scheduledAt < date ? 'Vencido' : 'Pendiente'; }
export function upcomingInterventions(state, days = 30) { const today = todayISO(), until = addDays(days); return state.interventions.filter(i => interventionStatus(i) !== 'Completado' && i.scheduledAt >= today && i.scheduledAt <= until).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)); }
export function equipmentEvents(state, id) { return state.events.filter(e => e.entityId === id || (e.entityType === 'intervention' && state.interventions.some(i => i.id === e.entityId && i.equipmentId === id)) || (e.entityType === 'request' && state.equipment.some(q => q.id === id && q.requestId === e.entityId))).sort((a, b) => b.date.localeCompare(a.date)); }

export function seed() {
  const today = todayISO();
  const equipment = [
    { id: 'eq-eco-001', code: 'ECO-001', name: 'Ecógrafo Doppler', brand: 'SonoMed (ficticia)', model: 'SD-500', serial: 'SM-250315-001', service: 'Diagnóstico por Imágenes', acquiredAt: '2025-03-15', installedAt: '2025-03-20', supplier: 'MedTech Perú (ficticio)', warrantyUntil: '2027-03-15', status: 'Operativo', notes: 'Datos de demostración. Garantía de 24 meses.' },
    { id: 'eq-mon-002', code: 'MON-002', name: 'Monitor multiparámetro', brand: 'VitalCare (ficticia)', model: 'VC-12', serial: 'VC-2025-092', service: 'Unidad de Cuidados Intensivos', acquiredAt: '2025-06-10', installedAt: '2025-06-12', supplier: 'Equipos Clínicos SAC (ficticio)', warrantyUntil: '2027-06-10', status: 'Operativo' },
    { id: 'eq-ven-003', code: 'VEN-003', name: 'Ventilador mecánico', brand: 'RespiraMed (ficticia)', model: 'RM-800', serial: 'RM-2024-031', service: 'Unidad de Cuidados Intensivos', acquiredAt: '2024-08-05', installedAt: '2024-08-08', supplier: 'MedTech Perú (ficticio)', warrantyUntil: '2026-08-05', status: 'En mantenimiento' },
    { id: 'eq-bom-004', code: 'BOM-004', name: 'Bomba de infusión', brand: 'InfuLife (ficticia)', model: 'IL-200', serial: 'IL-2025-088', service: 'Emergencia', acquiredAt: '2025-04-22', installedAt: '2025-04-23', supplier: 'Salud Integral SAC (ficticio)', warrantyUntil: '2027-04-22', status: 'Operativo' },
    { id: 'eq-def-005', code: 'DEF-005', name: 'Desfibrilador bifásico', brand: 'CardioPlus (ficticia)', model: 'CP-360', serial: 'CP-2024-044', service: 'Centro Quirúrgico', acquiredAt: '2024-09-16', installedAt: '2024-09-17', supplier: 'Equipos Clínicos SAC (ficticio)', warrantyUntil: '2026-09-16', status: 'Operativo' },
    { id: 'eq-ele-006', code: 'ELE-006', name: 'Electrocardiógrafo', brand: 'CardioPlus (ficticia)', model: 'ECG-12', serial: 'CP-2023-016', service: 'Consulta Externa', acquiredAt: '2023-05-15', installedAt: '2023-05-17', supplier: 'Salud Integral SAC (ficticio)', warrantyUntil: '2025-05-15', status: 'Fuera de servicio' },
  ];
  const interventions = [
    { id: 'int-eco-done', equipmentId: 'eq-eco-001', type: 'Mantenimiento preventivo', scheduledAt: addDays(-100), executedAt: addDays(-100), responsible: 'Ing. Luis Mendoza (demo)', status: 'Completado', observations: 'Inspección de transductores, limpieza y revisión eléctrica.', result: 'Equipo conforme y operativo.' },
    { id: 'int-eco-overdue', equipmentId: 'eq-eco-001', type: 'Mantenimiento preventivo', scheduledAt: addDays(-7), executedAt: '', responsible: 'Ingeniería Clínica', status: 'Pendiente', observations: 'Revisión semestral y limpieza de filtros.', result: '' },
    { id: 'int-eco-cal', equipmentId: 'eq-eco-001', type: 'Calibración', scheduledAt: addDays(12), executedAt: '', responsible: 'Metrología Clínica SAC (ficticio)', status: 'Pendiente', observations: 'Validación de parámetros con fantoma de ultrasonido.', result: '' },
    { id: 'int-ven', equipmentId: 'eq-ven-003', type: 'Mantenimiento correctivo', scheduledAt: today, executedAt: '', responsible: 'RespiraMed (ficticia)', status: 'Pendiente', observations: 'Revisión del sensor de flujo.', result: '', markMaintenance: true },
    { id: 'int-mon', equipmentId: 'eq-mon-002', type: 'Mantenimiento preventivo', scheduledAt: addDays(6), executedAt: '', responsible: 'Ingeniería Clínica', status: 'Pendiente', observations: 'Verificación de alarmas y sensores.', result: '' },
    { id: 'int-def', equipmentId: 'eq-def-005', type: 'Calibración', scheduledAt: addDays(24), executedAt: '', responsible: 'Ingeniería Clínica', status: 'Pendiente', observations: 'Ensayo de descarga y verificación de energía.', result: '' },
  ];
  const requests = [{ id: 'req-eco-002', name: 'Ecógrafo Doppler portátil', service: 'Diagnóstico por Imágenes', reason: 'Incremento de demanda de estudios ecográficos y atención a pie de cama.', priority: 'Alta', clinicalJustification: 'Reducir tiempos de espera y facilitar estudios en pacientes con movilidad limitada.', estimatedCost: 85000, stage: 'Evaluación', technicalJustification: '', budget: 85000, observations: '', supplier: 'MedTech Perú (ficticio)', quotedPrice: 82000, purchaseOrder: '', approval: 'Pendiente', checklist: {}, brand: 'SonoMed (ficticia)', model: 'SD-300P', serial: '', equipmentCode: 'ECO-002', createdAt: addDays(-3) }];
  const events = equipment.map(e => ({ id: `ev-${e.id}`, entityType: 'equipment', entityId: e.id, date: `${e.installedAt}T12:00:00Z`, action: 'Equipo registrado e instalado · demostración' }));
  events.push({ id: 'ev-eco-done', entityType: 'intervention', entityId: 'int-eco-done', date: `${addDays(-100)}T12:00:00Z`, action: 'Mantenimiento preventivo completado. Equipo conforme y operativo.' });
  events.push({ id: 'ev-req-created', entityType: 'request', entityId: 'req-eco-002', date: `${addDays(-3)}T12:00:00Z`, action: 'Necesidad médica registrada · demostración' });
  events.push({ id: 'ev-req-evaluation', entityType: 'request', entityId: 'req-eco-002', date: `${addDays(-2)}T12:00:00Z`, action: 'Solicitud enviada a evaluación. Aprobación gerencial pendiente.' });
  return { equipment, interventions, requests, events };
}

const required = (value, label) => { if (value === undefined || value === null || !String(value).trim()) throw new Error(`Completa ${label}.`); };
const requireFields = (object, fields) => fields.forEach(([key, label]) => required(object[key], label));
const validCost = (value, label) => { if (!Number.isFinite(Number(value)) || Number(value) < 0) throw new Error(`${label} debe ser un importe válido mayor o igual a cero.`); };
const validDate = (value, label) => { required(value, label); if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(new Date(`${value}T12:00:00Z`).getTime())) throw new Error(`${label} no es válida.`); };
function event(state, entityType, entityId, action) { return { ...state, events: [...state.events, { id: uid('ev'), entityType, entityId, date: new Date().toISOString(), action }] }; }

export function reducer(state, action) {
  const p = action.payload || {};
  switch (action.type) {
    case 'RESET': return seed();
    case 'SAVE_EQUIPMENT': {
      const previous = state.equipment.find(e => e.id === p.id);
      const e = { ...previous, ...p, id: previous?.id || p.id || uid('eq') };
      requireFields(e, [['code', 'el código patrimonial'], ['name', 'el nombre del equipo'], ['brand', 'la marca'], ['model', 'el modelo'], ['serial', 'el número de serie'], ['service', 'el servicio'], ['supplier', 'el proveedor']]);
      validDate(e.acquiredAt, 'La fecha de adquisición'); validDate(e.installedAt, 'La fecha de instalación'); validDate(e.warrantyUntil, 'La fecha de garantía');
      if (state.equipment.some(q => q.id !== e.id && q.code.toLowerCase() === e.code.trim().toLowerCase())) throw new Error('Ya existe un equipo con ese código patrimonial.');
      if (state.equipment.some(q => q.id !== e.id && q.serial.toLowerCase() === e.serial.trim().toLowerCase())) throw new Error('Ya existe un equipo con ese número de serie.');
      if (previous?.status === 'Dado de baja' && e.status !== 'Dado de baja') throw new Error('Un equipo dado de baja no puede reactivarse.');
      if (!previous && e.status === 'Dado de baja') throw new Error('Registra el equipo y utiliza Disposición final para darlo de baja.');
      if (previous && e.status !== previous.status) throw new Error('Cambia el estado mediante una intervención o una disposición final.');
      e.status = previous?.status || (EQUIPMENT_STATUSES.includes(e.status) ? e.status : 'Operativo');
      e.code = e.code.trim(); e.serial = e.serial.trim();
      return event({ ...state, equipment: previous ? state.equipment.map(q => q.id === e.id ? e : q) : [...state.equipment, e] }, 'equipment', e.id, previous ? 'Ficha técnica actualizada' : 'Equipo registrado en inventario');
    }
    case 'SAVE_INTERVENTION': {
      const previous = state.interventions.find(i => i.id === p.id);
      const i = { ...previous, ...p, id: previous?.id || p.id || uid('int') };
      const e = state.equipment.find(q => q.id === i.equipmentId);
      if (!e) throw new Error('Selecciona un equipo válido para la intervención.');
      if (e.status === 'Dado de baja') throw new Error('No se pueden registrar o modificar intervenciones de un equipo dado de baja.');
      if (previous && previous.equipmentId !== i.equipmentId) throw new Error('No se puede cambiar el equipo de una intervención registrada.');
      requireFields(i, [['type', 'el tipo de intervención'], ['responsible', 'el responsable o proveedor']]);
      if (!INTERVENTION_TYPES.includes(i.type)) throw new Error('Selecciona un tipo de intervención válido.');
      validDate(i.scheduledAt, 'La fecha programada');
      i.status = i.status === 'Completado' ? 'Completado' : 'Pendiente';
      if (i.status === 'Completado') {
        validDate(i.executedAt, 'La fecha de ejecución'); required(i.result, 'el resultado de la intervención');
        if (i.executedAt > todayISO()) throw new Error('La ejecución no puede tener una fecha futura.');
      } else { i.executedAt = ''; }
      let equipment = state.equipment;
      if (i.type === 'Mantenimiento correctivo' && i.markMaintenance && i.status !== 'Completado') equipment = equipment.map(q => q.id === e.id ? { ...q, status: 'En mantenimiento' } : q);
      if (i.status === 'Completado' && i.returnOperational) {
        const unresolved = state.interventions.some(q => q.id !== i.id && q.equipmentId === e.id && q.type === 'Mantenimiento correctivo' && q.markMaintenance && interventionStatus(q) !== 'Completado');
        if (unresolved) throw new Error('Hay otro mantenimiento correctivo activo. Complétalo antes de devolver el equipo a operativo.');
        equipment = equipment.map(q => q.id === e.id ? { ...q, status: 'Operativo' } : q);
      }
      return event({ ...state, equipment, interventions: previous ? state.interventions.map(q => q.id === i.id ? i : q) : [...state.interventions, i] }, 'intervention', i.id, `${i.type} ${i.status === 'Completado' ? 'completado' : previous ? 'actualizado' : 'programado'}${i.status === 'Completado' ? `: ${i.result}` : ''}`);
    }
    case 'SAVE_REQUEST': {
      const previous = state.requests.find(r => r.id === p.id);
      if (previous?.stage === 'Inventario') throw new Error('La solicitud ya fue incorporada al inventario.');
      const r = { ...previous, ...p, id: previous?.id || p.id || uid('req'), stage: previous?.stage || 'Necesidad', createdAt: previous?.createdAt || todayISO() };
      requireFields(r, [['name', 'el nombre del equipo'], ['service', 'el servicio solicitante'], ['reason', 'el motivo de necesidad'], ['priority', 'la prioridad'], ['clinicalJustification', 'la justificación clínica']]);
      validCost(r.estimatedCost, 'El costo estimado');
      r.checklist = { ...previous?.checklist, ...p.checklist }; r.approval = r.approval || 'Pendiente';
      return event({ ...state, requests: previous ? state.requests.map(q => q.id === r.id ? r : q) : [...state.requests, r] }, 'request', r.id, previous ? 'Solicitud actualizada' : 'Necesidad médica registrada');
    }
    case 'ADVANCE_REQUEST': {
      const previous = state.requests.find(r => r.id === p.id);
      if (!previous) throw new Error('No se encontró la solicitud.');
      if (previous.stage === 'Inventario') throw new Error('Esta solicitud ya tiene un equipo en inventario.');
      const r = { ...previous, ...p, id: previous.id, stage: previous.stage, checklist: { ...previous.checklist, ...p.checklist } };
      let equipment = state.equipment;
      if (r.stage === 'Evaluación') { required(r.technicalJustification, 'la justificación técnica'); validCost(r.budget, 'El presupuesto estimado'); }
      if (r.stage === 'Adquisición') {
        requireFields(r, [['supplier', 'el proveedor'], ['purchaseOrder', 'la orden de compra']]); validCost(r.quotedPrice, 'El precio cotizado');
        if (r.approval !== 'Aprobada (simulada)') throw new Error('Registra la aprobación gerencial simulada para continuar. No representa una autorización real.');
      }
      if (r.stage === 'Recepción') {
        if (!Object.keys(RECEIPT_CHECKS).every(k => r.checklist[k] === true)) throw new Error('Completa los cinco requisitos del checklist de recepción.');
        if (state.equipment.some(e => e.requestId === r.id)) throw new Error('La recepción de esta solicitud ya fue registrada.');
        const code = (r.equipmentCode || `BIO-${String(state.equipment.length + 1).padStart(3, '0')}`).trim();
        if (state.equipment.some(e => e.code.toLowerCase() === code.toLowerCase())) throw new Error('El código patrimonial de recepción ya existe. Elige otro código.');
        required(r.brand, 'la marca del equipo recibido'); required(r.model, 'el modelo del equipo recibido'); required(r.serial, 'el número de serie recibido');
        if (state.equipment.some(e => e.serial.toLowerCase() === r.serial.trim().toLowerCase())) throw new Error('Ya existe un equipo con ese número de serie.');
        const acquiredAt = r.acquiredAt || todayISO(), installedAt = r.installedAt || todayISO(), warrantyUntil = r.warrantyUntil || addDays(730);
        validDate(acquiredAt, 'La fecha de adquisición'); validDate(installedAt, 'La fecha de instalación'); validDate(warrantyUntil, 'La fecha de garantía');
        const e = { id: uid('eq'), code, name: r.name, brand: r.brand, model: r.model, serial: r.serial.trim(), service: r.service, acquiredAt, installedAt, supplier: r.supplier, warrantyUntil, status: 'Operativo', requestId: r.id };
        equipment = [...equipment, e]; r.equipmentId = e.id;
      }
      const next = STAGES[STAGES.indexOf(r.stage) + 1];
      if (!next) throw new Error('La etapa actual no permite avanzar.');
      r.stage = next;
      let result = event({ ...state, equipment, requests: state.requests.map(q => q.id === r.id ? r : q) }, 'request', r.id, next === 'Inventario' ? 'Recepción verificada e incorporación automática al inventario' : `Avance a ${next}${previous.stage === 'Adquisición' ? ' · aprobación gerencial SIMULADA, sin autorización real' : ''}`);
      if (next === 'Inventario') result = event(result, 'equipment', r.equipmentId, 'Equipo recibido, verificado e incorporado al inventario');
      return result;
    }
    case 'DISPOSE_EQUIPMENT': {
      const e = state.equipment.find(q => q.id === p.equipmentId);
      if (!e) throw new Error('Selecciona un equipo válido.');
      if (e.status === 'Dado de baja') throw new Error('Este equipo ya está dado de baja.');
      validDate(p.date, 'La fecha de baja'); required(p.reason, 'el motivo de baja');
      if (p.date > todayISO()) throw new Error('La fecha de baja no puede ser futura.');
      const disposed = { ...e, status: 'Dado de baja', disposal: { date: p.date, reason: p.reason, observations: p.observations || '' } };
      return event({ ...state, equipment: state.equipment.map(q => q.id === e.id ? disposed : q) }, 'equipment', e.id, `Baja definitiva: ${p.reason}${p.observations ? `. ${p.observations}` : ''}`);
    }
    default: return state;
  }
}

export function validateAction(state, action) { try { reducer(state, action); return null; } catch (error) { return error.message; } }
export function loadState() { try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (saved && ['equipment', 'requests', 'interventions', 'events'].every(k => Array.isArray(saved[k]))) return saved; } catch { /* Start safely if local data is invalid. */ } return seed(); }
export function persistState(state) { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
