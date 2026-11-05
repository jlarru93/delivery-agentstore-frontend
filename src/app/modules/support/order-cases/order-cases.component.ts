import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Subscription, firstValueFrom } from 'rxjs';
import { CaseWatchService } from '../case-watch.service';
import { CaseFileRequest, StoreCase, SupportCategory } from '../support.models';
import { SupportService } from '../support.service';

// Incidencias de un pedido, en el modal de la orden: todas las del pedido (abiertas primero) para ver y responder,
// y "Reportar incidencia" con el pedido ya puesto. La lista viene de CaseWatchService (MQTT, push y respaldo).
@Component({
    selector: 'app-order-cases',
    templateUrl: './order-cases.component.html',
    styleUrls: ['./order-cases.component.scss'],
    providers: [MessageService],
})
export class OrderCasesComponent implements OnInit, OnChanges, OnDestroy {
    @Input() orderId: number | null = null
    // Local del pedido (el POS puede atender más de uno); sin él, el backend usa el único local del usuario
    @Input() storeId: number | null = null
    // Abre directo en una incidencia (la que marca la tarjeta del pedido)
    @Input() startCode: string | null = null

    readonly maxFileMb = 10
    readonly accept = 'image/jpeg,image/png,image/webp,image/heic,application/pdf'

    cases: StoreCase[] = []
    selected: string | null = null
    reporting = false

    categories: { label: string, value: string }[] = []
    categoryCode: string | null = null
    title = ''
    body = ''
    files: File[] = []
    creating = false

    private subscription?: Subscription

    constructor(
        private readonly support: SupportService,
        private readonly watch: CaseWatchService,
        private readonly toast: MessageService,
    ) {}

    ngOnInit(): void {
        this.subscription = this.watch.cases$.subscribe(() => this.load())
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['orderId']) {
            this.selected = this.startCode
            this.reporting = false
            this.load()
        }
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe()
    }

    private load() {
        this.cases = this.watch.casesForOrder(this.orderId)
        if (!this.cases.some(c => c.code === this.selected)) this.selected = this.cases[0]?.code ?? null
        // Sin incidencias, el modal abre directo el formulario para reportar
        if (!this.cases.length) this.openReport()
    }

    select(code: string) {
        this.selected = code
        this.reporting = false
    }

    openReport() {
        this.reporting = true
        if (!this.categories.length) {
            this.support.categories().subscribe({
                next: resp => this.categories = resp.data.map((c: SupportCategory) => ({
                    label: c.parent ? `${c.parent} · ${c.name}` : c.name, value: c.code,
                })),
            })
        }
    }

    cancelReport() {
        if (this.cases.length) this.reporting = false
    }

    get canCreate(): boolean {
        return !!this.orderId && this.title.trim().length >= 5 && this.body.trim().length >= 5 && !this.creating
    }

    async create() {
        if (!this.canCreate) return
        this.creating = true
        try {
            const uploaded: CaseFileRequest[] = []
            for (const file of this.files) uploaded.push(await firstValueFrom(this.support.upload(file)))
            const resp = await firstValueFrom(this.support.create({
                storeId: this.storeId!, categoryCode: this.categoryCode, orderId: this.orderId,
                title: this.title.trim(), body: this.body.trim(), files: uploaded,
            }))
            this.toast.add({ severity: 'success', summary: `Incidencia ${resp.data.code} registrada`,
                detail: 'Piwi lo revisará y te responderá aquí.', life: 6000 })
            this.categoryCode = null
            this.title = this.body = ''
            this.files = []
            this.selected = resp.data.code
            this.reporting = false
            this.watch.refresh()
        } catch (err) {
            this.fail(err)
        } finally {
            this.creating = false
        }
    }

    pick(event: Event) {
        const input = event.target as HTMLInputElement
        for (const file of Array.from(input.files ?? [])) {
            if (this.files.length >= 5) {
                this.toast.add({ severity: 'warn', summary: 'Hasta 5 archivos' })
                break
            }
            if (file.size > this.maxFileMb * 1024 * 1024) {
                this.toast.add({ severity: 'warn', summary: `${file.name} pesa más de ${this.maxFileMb} MB` })
                continue
            }
            this.files.push(file)
        }
        input.value = ''
    }

    removeFile(index: number) {
        this.files.splice(index, 1)
    }

    isClosed(c: StoreCase): boolean {
        return c.statusCategory === 'DONE' || c.statusCategory === 'CANCELLED'
    }

    private fail(err: any) {
        const message = err?.error?.messages?.[0]?.message ?? err?.error?.meta?.messages?.[0]?.message ?? 'No pudimos completar la acción'
        this.toast.add({ severity: 'error', summary: message })
    }
}
