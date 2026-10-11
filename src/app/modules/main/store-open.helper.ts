import { StatusOpenStoreBean } from "./data";
import { OpenStoreRequest } from "./service/data/request";

/**
 * Reglas del diálogo "Opciones de la tienda" (abrir / cerrar), sin dependencias de Angular para poder probarlas.
 */

/** La casilla "Cerrar todo el día" solo aparece al cerrar y si quedan más tramos hoy. */
export function canCloseAllDay(store: StatusOpenStoreBean | null | undefined): boolean {
    return !!store && store.isOpen === true && store.hasMoreSlotsToday === true
}

/**
 * Solicitud que se envía al confirmar.
 *  - Abrir: sin alcance.
 *  - Cerrar con quedan más tramos y la casilla sin marcar: SLOT (solo este tramo).
 *  - Cerrar en cualquier otro caso (casilla marcada o no quedan más tramos): DAY.
 */
export function buildOpenStoreRequest(store: StatusOpenStoreBean, closeAllDay: boolean): OpenStoreRequest {
    const closing = store.isOpen === true
    const request: OpenStoreRequest = { id: store.id, status: !closing }
    if (closing) {
        request.scope = canCloseAllDay(store) && !closeAllDay ? 'SLOT' : 'DAY'
    }
    return request
}

export function confirmQuestion(store: StatusOpenStoreBean | null | undefined): string {
    if (!store) return ''
    return store.isOpen ? '¿Cerrar la tienda?' : '¿Abrir la tienda?'
}

/** Aclaración bajo la casilla: qué pasará según lo marcado. */
export function closeHint(store: StatusOpenStoreBean | null | undefined, closeAllDay: boolean): string {
    if (!canCloseAllDay(store)) return ''
    return closeAllDay
        ? 'La tienda no se abrirá de nuevo hoy.'
        : 'La tienda se volverá a abrir automáticamente en el siguiente horario de hoy.'
}

/** Mensaje de error del backend (el cuerpo de un error es { idTransaction, messages: [{ message }] }). */
export function getBackendMessage(error: any, fallback: string): string {
    const body = error && error.error
    const messages = (body && body.messages) || (body && body.meta && body.meta.messages)
    const first = messages && messages[0] && messages[0].message
    return typeof first === 'string' && first.length > 0 ? first : fallback
}
