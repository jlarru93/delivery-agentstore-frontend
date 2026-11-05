import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Subscription, firstValueFrom } from 'rxjs';
import { skip } from 'rxjs/operators';
import { CaseWatchService } from '../case-watch.service';
import { CaseFile, CaseFileRequest, StoreCaseDetail } from '../support.models';
import { SupportService } from '../support.service';

// Detalle de una incidencia: calificación del cliente, etapas, conversación con Piwi, archivos y respuesta.
// Se usa en "Casos" (panel lateral) y en el modal de la orden (vista "Incidencia"). Se recarga solo cuando llega un
// aviso del local (CaseWatchService: MQTT wb/store/{id}) y, de respaldo, cada 30 s mientras está a la vista.
@Component({
    selector: 'app-case-thread',
    templateUrl: './case-thread.component.html',
    styleUrls: ['./case-thread.component.scss'],
    providers: [MessageService],
})
export class CaseThreadComponent implements OnInit, OnChanges, OnDestroy {
    @Input() code: string | null = null
    // En el modal de la orden el pedido ya se ve arriba: no se repite
    @Input() showOrder = true

    readonly maxFileMb = 10
    readonly accept = 'image/jpeg,image/png,image/webp,image/heic,application/pdf'

    detail: StoreCaseDetail | null = null
    replyText = ''
    replyFiles: File[] = []
    sending = false

    private subscription?: Subscription
    private timer?: ReturnType<typeof setInterval>

    constructor(
        private readonly support: SupportService,
        private readonly watch: CaseWatchService,
        private readonly toast: MessageService,
    ) {}

    ngOnInit(): void {
        // El primer valor es el estado actual: solo interesan los avisos nuevos
        this.subscription = this.watch.cases$.pipe(skip(1)).subscribe(() => this.refresh())
        this.timer = setInterval(() => {
            if (document.visibilityState === 'visible' && !this.sending) this.refresh()
        }, 30_000)
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['code']) {
            this.detail = null
            this.replyText = ''
            this.replyFiles = []
            this.refresh()
        }
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe()
        if (this.timer) clearInterval(this.timer)
    }

    private refresh() {
        const code = this.code
        if (!code) return
        this.support.detail(code).subscribe({
            next: resp => { if (code === this.code) this.detail = resp.data },
            error: err => this.fail(err),
        })
    }

    async sendReply() {
        if (!this.detail || this.replyText.trim().length < 2 || this.sending) return
        this.sending = true
        try {
            const files: CaseFileRequest[] = []
            for (const file of this.replyFiles) files.push(await firstValueFrom(this.support.upload(file)))
            await firstValueFrom(this.support.reply(this.detail.code, this.replyText.trim(), files))
            this.toast.add({ severity: 'success', summary: 'Respuesta enviada a Piwi' })
            this.replyText = ''
            this.replyFiles = []
            this.watch.refresh() // la lista y este detalle se recargan
        } catch (err) {
            this.fail(err)
        } finally {
            this.sending = false
        }
    }

    pick(event: Event) {
        const input = event.target as HTMLInputElement
        for (const file of Array.from(input.files ?? [])) {
            if (this.replyFiles.length >= 5) {
                this.toast.add({ severity: 'warn', summary: 'Hasta 5 archivos por mensaje' })
                break
            }
            if (file.size > this.maxFileMb * 1024 * 1024) {
                this.toast.add({ severity: 'warn', summary: `${file.name} pesa más de ${this.maxFileMb} MB` })
                continue
            }
            this.replyFiles.push(file)
        }
        input.value = ''
    }

    removeFile(index: number) {
        this.replyFiles.splice(index, 1)
    }

    entryAuthor(kind: string): string {
        return kind === 'TEAM' ? 'Piwi' : kind === 'YOU' ? 'Tu local' : ''
    }

    images(d: StoreCaseDetail): CaseFile[] {
        return d.files.filter(f => f.kind === 'IMAGE')
    }

    documents(d: StoreCaseDetail): CaseFile[] {
        return d.files.filter(f => f.kind !== 'IMAGE')
    }

    fileAuthor(f: CaseFile): string {
        const by = f.by ?? (f.fromYou ? 'YOU' : 'PIWI')
        return ({ YOU: 'Tu local', DRIVER: 'Motorizado', USER: 'Cliente' } as Record<string, string>)[by] ?? 'Piwi'
    }

    reportAuthor(by: string): string {
        return ({ YOU: 'Lo que reportaste', DRIVER: 'Lo que reportó el motorizado', USER: 'Lo que reportó el cliente' } as Record<string, string>)[by]
            ?? 'Lo que registró Piwi'
    }

    private fail(err: any) {
        const message = err?.error?.messages?.[0]?.message ?? err?.error?.meta?.messages?.[0]?.message ?? 'No pudimos completar la acción'
        this.toast.add({ severity: 'error', summary: message })
    }
}
