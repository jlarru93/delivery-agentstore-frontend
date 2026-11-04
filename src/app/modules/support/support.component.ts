import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription, firstValueFrom } from 'rxjs';
import { CaseWatchService } from './case-watch.service';
import { CaseFileRequest, StoreCase, StoreOption, SupportCategory } from './support.models';
import { SupportService } from './support.service';

// Casos del local en el POS (Mesa de ayuda de Piwi):
//   - "Mis casos": lo que Piwi compartió con el local y lo que reportó, con lo que Piwi espera de él marcado.
//   - Detalle: etapas, conversación con Piwi (solo lo dirigido al comercio) y respuesta con fotos.
//   - "Reportar un problema": entra a la Mesa de ayuda a nombre del local.
// La lista viene de CaseWatchService (aviso MQTT wb/store/{id} y respaldo cada 2 minutos). ?code= abre un caso.
@Component({
    selector: 'app-support',
    templateUrl: './support.component.html',
    styleUrls: ['./support.component.scss'],
    providers: [MessageService],
})
export class SupportComponent implements OnInit, OnDestroy {
    readonly maxFileMb = 10
    readonly accept = 'image/jpeg,image/png,image/webp,image/heic,application/pdf'

    tab = 0
    cases: StoreCase[] = []
    loading = true
    stores: StoreOption[] = []
    storeId: number | null = null

    // Detalle
    // Detalle (app-case-thread en el panel lateral)
    openCode: string | null = null
    isDetailOpen = false

    // Reportar
    categories: { label: string, value: string }[] = []
    categoryCode: string | null = null
    orderId: number | null = null
    title = ''
    body = ''
    newFiles: File[] = []
    creating = false

    private subscription?: Subscription

    constructor(
        private readonly support: SupportService,
        private readonly watch: CaseWatchService,
        private readonly route: ActivatedRoute,
        private readonly toast: MessageService,
    ) {}

    ngOnInit(): void {
        this.subscription = this.watch.cases$.subscribe(cases => {
            this.cases = cases
            this.loading = false
        })
        this.watch.start()
        this.watch.refresh()
        this.support.stores().subscribe({
            next: resp => {
                this.stores = resp.data
                this.storeId = this.stores[0]?.id ?? null
            },
        })
        this.support.categories().subscribe({
            next: resp => this.categories = resp.data.map((c: SupportCategory) => ({
                label: c.parent ? `${c.parent} · ${c.name}` : c.name, value: c.code,
            })),
        })
        const code = this.route.snapshot.queryParamMap.get('code')
        if (code) this.open(code)
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe()
    }

    get waiting(): number {
        return this.cases.filter(c => c.needsYou).length
    }

    load() {
        this.watch.refresh()
    }

    // ── Detalle ──

    open(code: string) {
        this.openCode = code
        this.isDetailOpen = true
    }

    // ── Reportar un problema ──

    get canCreate(): boolean {
        return !!this.storeId && this.title.trim().length >= 5 && this.body.trim().length >= 5 && !this.creating
    }

    async create() {
        if (!this.canCreate) return
        this.creating = true
        try {
            const files = await this.uploadAll(this.newFiles)
            const resp = await firstValueFrom(this.support.create({
                storeId: this.storeId!, categoryCode: this.categoryCode, orderId: this.orderId,
                title: this.title.trim(), body: this.body.trim(), files,
            }))
            this.toast.add({ severity: 'success', summary: `Incidencia ${resp.data.code} registrada`,
                detail: 'Piwi lo revisará y te responderá aquí.', life: 6000 })
            this.categoryCode = this.orderId = null
            this.title = this.body = ''
            this.newFiles = []
            this.tab = 0
            this.watch.refresh()
            this.open(resp.data.code)
        } catch (err) {
            this.fail(err)
        } finally {
            this.creating = false
        }
    }

    // ── Archivos ──

    pick(event: Event, target: File[]) {
        const input = event.target as HTMLInputElement
        for (const file of Array.from(input.files ?? [])) {
            if (target.length >= 5) {
                this.toast.add({ severity: 'warn', summary: 'Hasta 5 archivos por mensaje' })
                break
            }
            if (file.size > this.maxFileMb * 1024 * 1024) {
                this.toast.add({ severity: 'warn', summary: `${file.name} pesa más de ${this.maxFileMb} MB` })
                continue
            }
            target.push(file)
        }
        input.value = ''
    }

    removeFile(target: File[], index: number) {
        target.splice(index, 1)
    }

    private async uploadAll(files: File[]): Promise<CaseFileRequest[]> {
        const uploaded: CaseFileRequest[] = []
        for (const file of files) {
            uploaded.push(await firstValueFrom(this.support.upload(file)))
        }
        return uploaded
    }

    // ── Vista ──

    statusClass(c: { statusCategory: string, needsYou?: boolean }): string {
        if (c.needsYou || c.statusCategory === 'WAITING') return 'waiting'
        if (c.statusCategory === 'DONE') return 'done'
        if (c.statusCategory === 'CANCELLED') return 'cancelled'
        return 'open'
    }

    private fail(err: any) {
        const message = err?.error?.messages?.[0]?.message ?? err?.error?.meta?.messages?.[0]?.message ?? 'No pudimos completar la acción'
        this.toast.add({ severity: 'error', summary: message })
    }
}
