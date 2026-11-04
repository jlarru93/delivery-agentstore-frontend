import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StoreCase } from './support.models';
import { SupportService } from './support.service';

// Casos del local para todo el POS: el aviso "Piwi te pide respuesta" y la etiqueta CASO en los pedidos.
// Se actualiza al llegar un aviso MQTT wb/store/{storeId} (Piwi escribió, cambió la etapa o compartió un caso)
// y, de respaldo, cada 2 minutos. Con aviso nuevo suena el tono de casos (distinto al de pedidos nuevos).
@Injectable({ providedIn: 'root' })
export class CaseWatchService {

    private readonly _cases = new BehaviorSubject<StoreCase[]>([])
    readonly cases$ = this._cases.asObservable()
    private byOrder = new Map<string, StoreCase>()
    private lastByOrder = new Map<string, StoreCase>() // el más reciente del pedido, abierto o cerrado
    private timer?: ReturnType<typeof setInterval>
    private audio?: AudioContext

    constructor(private readonly support: SupportService, private readonly zone: NgZone) {}

    /** Arranca una vez con la sesión (topbar) */
    start() {
        if (this.timer) return
        this.refresh()
        this.timer = setInterval(() => this.refresh(), 120_000)
    }

    refresh() {
        this.support.cases().subscribe({
            next: resp => this.zone.run(() => {
                const cases = resp.data ?? []
                this.byOrder = new Map()
                this.lastByOrder = new Map()
                for (const c of cases) {
                    if (c.orderId && !this.lastByOrder.has(c.orderId)) this.lastByOrder.set(c.orderId, c)
                    // Solo los abiertos marcan el pedido
                    if (c.orderId && c.statusCategory !== 'DONE' && c.statusCategory !== 'CANCELLED' && !this.byOrder.has(c.orderId)) {
                        this.byOrder.set(c.orderId, c)
                    }
                }
                this._cases.next(cases)
            }),
            error: () => { /* sin casos o sin acceso: el POS sigue igual */ },
        })
    }

    /** Aviso MQTT wb/store/{id}: kind message | status | shared */
    onNotice(kind: string) {
        if (kind === 'message' || kind === 'shared') this.ring()
        this.refresh()
    }

    caseForOrder(orderId: number | string | null | undefined): StoreCase | undefined {
        return orderId == null ? undefined : this.byOrder.get(String(orderId))
    }

    /** Para el modal de la orden: la abierta si hay; si no, la última (cerrada), para que no desaparezca al cerrarla Piwi */
    lastCaseForOrder(orderId: number | string | null | undefined): StoreCase | undefined {
        return orderId == null ? undefined : this.byOrder.get(String(orderId)) ?? this.lastByOrder.get(String(orderId))
    }

    get waiting(): number {
        return this._cases.value.filter(c => c.needsYou).length
    }

    /** Tono de casos: dos notas cortas (los pedidos nuevos usan audio.mp3) */
    private ring() {
        try {
            this.audio = this.audio ?? new AudioContext()
            const ctx = this.audio
            ;[880, 660].forEach((freq, i) => {
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.type = 'sine'
                osc.frequency.value = freq
                const start = ctx.currentTime + i * 0.22
                gain.gain.setValueAtTime(0.0001, start)
                gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02)
                gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2)
                osc.connect(gain).connect(ctx.destination)
                osc.start(start)
                osc.stop(start + 0.21)
            })
        } catch {
            // Sin audio (el navegador lo bloquea hasta que el usuario toca la pantalla): solo se actualiza la lista
        }
    }
}
