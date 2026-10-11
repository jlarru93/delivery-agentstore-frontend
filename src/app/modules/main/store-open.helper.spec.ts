import { StatusOpenStoreBean } from "./data";
import { buildOpenStoreRequest, canCloseAllDay, closeHint, confirmQuestion, getBackendMessage } from "./store-open.helper";

describe('store-open.helper', () => {
  const store = (isOpen: boolean, hasMoreSlotsToday?: boolean): StatusOpenStoreBean => ({ id: 12, name: 'Jon', isOpen: isOpen, hasMoreSlotsToday: hasMoreSlotsToday });

  describe('canCloseAllDay (casilla "Cerrar todo el día")', () => {
    it('aparece solo al cerrar y cuando quedan más tramos hoy', () => {
      expect(canCloseAllDay(store(true, true))).toBe(true);
    });
    it('no aparece si no quedan más tramos', () => {
      expect(canCloseAllDay(store(true, false))).toBe(false);
    });
    it('no aparece si el backend no informó hasMoreSlotsToday (versión anterior del backend)', () => {
      expect(canCloseAllDay(store(true))).toBe(false);
    });
    it('no aparece al abrir', () => {
      expect(canCloseAllDay(store(false, true))).toBe(false);
    });
    it('no falla sin tienda', () => {
      expect(canCloseAllDay(null)).toBe(false);
      expect(canCloseAllDay(undefined)).toBe(false);
    });
  });

  describe('buildOpenStoreRequest', () => {
    it('abrir: status true y sin alcance', () => {
      expect(buildOpenStoreRequest(store(false, true), false)).toEqual({ id: 12, status: true });
      expect(buildOpenStoreRequest(store(false, true), true)).toEqual({ id: 12, status: true });
    });
    it('cerrar con más tramos y casilla sin marcar: solo este tramo (SLOT)', () => {
      expect(buildOpenStoreRequest(store(true, true), false)).toEqual({ id: 12, status: false, scope: 'SLOT' });
    });
    it('cerrar con más tramos y casilla marcada: todo el día (DAY)', () => {
      expect(buildOpenStoreRequest(store(true, true), true)).toEqual({ id: 12, status: false, scope: 'DAY' });
    });
    it('cerrar sin más tramos: todo el día (DAY), aunque la casilla haya quedado marcada o no', () => {
      expect(buildOpenStoreRequest(store(true, false), false)).toEqual({ id: 12, status: false, scope: 'DAY' });
      expect(buildOpenStoreRequest(store(true, false), true)).toEqual({ id: 12, status: false, scope: 'DAY' });
    });
    it('cerrar sin dato de hasMoreSlotsToday: todo el día, igual que las versiones anteriores', () => {
      expect(buildOpenStoreRequest(store(true), false)).toEqual({ id: 12, status: false, scope: 'DAY' });
    });
  });

  describe('textos del diálogo', () => {
    it('pregunta según el estado actual', () => {
      expect(confirmQuestion(store(true))).toBe('¿Cerrar la tienda?');
      expect(confirmQuestion(store(false))).toBe('¿Abrir la tienda?');
      expect(confirmQuestion(null)).toBe('');
    });
    it('la aclaración explica qué pasa según la casilla, y solo existe si hay casilla', () => {
      expect(closeHint(store(true, true), false)).toBe('La tienda se volverá a abrir automáticamente en el siguiente horario de hoy.');
      expect(closeHint(store(true, true), true)).toBe('La tienda no se abrirá de nuevo hoy.');
      expect(closeHint(store(true, false), false)).toBe('');
      expect(closeHint(store(false, true), true)).toBe('');
    });
  });

  describe('getBackendMessage', () => {
    it('lee el mensaje del cuerpo del error', () => {
      expect(getBackendMessage({ error: { messages: [{ message: 'La tienda no existe' }] } }, 'x')).toBe('La tienda no existe');
    });
    it('usa el texto por defecto si no hay mensaje', () => {
      expect(getBackendMessage({}, 'No se pudo')).toBe('No se pudo');
      expect(getBackendMessage(null, 'No se pudo')).toBe('No se pudo');
    });
  });
});
