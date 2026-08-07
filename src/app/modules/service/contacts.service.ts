import { Injectable, NgZone, OnDestroy, inject } from '@angular/core';
import { Contacts } from '@capacitor-community/contacts';
import { CountryCode, CountryCodes } from '../../utils/country-codes';

export interface PickedContact {
  name: string;
  phone: string;    // número limpio sin código de país
  dialCode: string; // e.g. "+51"
}

export type ContactResultPayload =
  | { status: 'ok';               contact: PickedContact }
  | { status: 'cancelled' }
  | { status: 'permission_denied' }
  | { status: 'no_phone' };

@Injectable({ providedIn: 'root' })
export class ContactMessageHandlerService implements OnDestroy {

  private ngZone = inject(NgZone);
  private messageHandler: ((event: MessageEvent) => void) | null = null;
  private initialized = false;

  /**
   * TRUE mientras el picker nativo de contactos está abierto.
   * El AppComponent lo lee en appStateChange para evitar que el resume
   * de la app (al volver del picker) dispare push.init() innecesariamente.
   *
   * Uso en app.component.ts:
   *
   *   App.addListener('appStateChange', async ({ isActive }) => {
   *     if (isActive) {
   *       if (this.contactHandler.isPickerOpen) return; // ← ignorar resume del picker
   *       await this.push.init();
   *       await this.push.checkPendingOrder();
   *     }
   *   });
   */
  isPickerOpen = false;

  private readonly defaultCountry: CountryCode =
    CountryCodes.find(c => c.code === 'PE') ?? CountryCodes[0];

  // ─────────────────────────────────────────────────────────────────
  // Ciclo de vida JIT
  // ─────────────────────────────────────────────────────────────────

  init(): void {
    if (this.initialized) return;
    this.messageHandler = this.handleMessage.bind(this);
    window.addEventListener('message', this.messageHandler);
    this.initialized = true;
    console.log('📒 ContactHandler: Inicializado');
  }

  destroy(): void {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
      this.initialized = false;
      console.log('📒 ContactHandler: Destruido');
    }
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  // ─────────────────────────────────────────────────────────────────
  // Escucha mensajes del micro-frontend
  // ─────────────────────────────────────────────────────────────────

  private handleMessage(event: MessageEvent): void {
    if (!event.data || typeof event.data !== 'object') return;
    if (event.data.type !== 'PICK_CONTACT_REQUEST') return;

    const source = event.source as Window;
    if (!source) return;

    console.log('📒 ContactHandler: Solicitud recibida');
    this.ngZone.run(() => this.openNativePicker(source));
  }

  // ─────────────────────────────────────────────────────────────────
  // Selector nativo
  // ─────────────────────────────────────────────────────────────────

  private async openNativePicker(source: Window): Promise<void> {
    try {
      console.log('📒 ContactHandler: Abriendo picker...');

      // Verificar permiso JIT
      const perm = await Contacts.checkPermissions();
      console.log('📒 ContactHandler: Permiso actual:', perm);

      if (perm.contacts !== 'granted') {
        const req = await Contacts.requestPermissions();
        console.log('📒 ContactHandler: Permiso solicitado:', req);

        if (req.contacts !== 'granted' && req.contacts !== 'limited') {
          console.warn('📒 ContactHandler: Permiso denegado');
          this.sendResult(source, { status: 'permission_denied' });
          return;
        }
      }

      // ── Señalizar que la app va a background por el picker ──────────────
      // Esto evita que appStateChange en app.component.ts dispare push.init()
      // cuando el usuario vuelva después de elegir un contacto.
      this.isPickerOpen = true;

      console.log('📒 ContactHandler: Permiso OK — abriendo selector nativo');

      const res = await Contacts.pickContact({
        projection: { name: true, phones: true }
      });

      const phones = res?.contact?.phones ?? [];
      if (phones.length === 0) {
        console.warn('📒 ContactHandler: Contacto sin teléfono');
        this.sendResult(source, { status: 'no_phone' });
        return;
      }

      const primary = phones.find(p => p.isPrimary && p.number);
      const mobile  = phones.find(p => p.type === 'mobile' && p.number);
      const picked  = primary ?? mobile ?? phones.find(p => p.number) ?? phones[0];
      const raw     = picked?.number ?? '';

      if (!raw) {
        this.sendResult(source, { status: 'no_phone' });
        return;
      }

      const nameObj = (res?.contact as any)?.name ?? {};
      const name = (
        nameObj.display ??
        [nameObj.given, nameObj.middle, nameObj.family].filter(Boolean).join(' ') ??
        ''
      ).trim();

      const { dialCode, number } = this.parsePhone(raw);

      console.log('📒 ContactHandler: OK →', { name, dialCode, number });
      this.sendResult(source, { status: 'ok', contact: { name, phone: number, dialCode } });

    } catch (err: any) {
      console.warn('📒 ContactHandler: Cancelado o error:', err?.message ?? err);
      this.sendResult(source, { status: 'cancelled' });
    } finally {
      // ── Siempre limpiar la bandera al terminar ───────────────────────────
      // Pequeño delay para asegurar que appStateChange ya procesó el resume
      // antes de que volvamos a habilitar push.init() en futuros resumes.
      setTimeout(() => { this.isPickerOpen = false; }, 500);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────

  private parsePhone(raw: string): { dialCode: string; number: string } {
    const cleaned = raw.replace(/[\s\-()\u00A0]/g, '');
    const withPlus = cleaned.startsWith('+')
      ? cleaned
      : cleaned.startsWith('00')
        ? '+' + cleaned.substring(2)
        : cleaned;

    if (withPlus.startsWith('+')) {
      const sorted = [...CountryCodes].sort((a, b) => b.dial_code.length - a.dial_code.length);
      const matched = sorted.find(c => withPlus.startsWith(c.dial_code));
      if (matched) {
        return {
          dialCode: matched.dial_code,
          number: withPlus.substring(matched.dial_code.length).replace(/\D/g, '')
        };
      }
    }

    return {
      dialCode: this.defaultCountry.dial_code,
      number: cleaned.replace(/\D/g, '')
    };
  }

  private sendResult(source: Window, payload: ContactResultPayload): void {
    source.postMessage({ type: 'PICK_CONTACT_RESULT', payload }, '*');
  }
}