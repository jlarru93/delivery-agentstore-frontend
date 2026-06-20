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

/**
 * ContactMessageHandlerService
 *
 * Puente entre el micro-frontend (iframe) y el selector nativo de contactos.
 *
 * Flujo:
 *   1. Micro-frontend manda   { type: 'PICK_CONTACT_REQUEST' }
 *   2. Este servicio abre el selector nativo via Contacts.pickContact()
 *   3. Devuelve              { type: 'PICK_CONTACT_RESULT', payload: ContactResultPayload }
 *
 * El micro-frontend maneja cada status:
 *   ok               → aplica nombre y teléfono al formulario
 *   cancelled        → silencioso (usuario cerró el picker)
 *   permission_denied → muestra mensaje de error
 *   no_phone         → muestra mensaje de error
 *
 * Ciclo de vida JIT:
 *   init()    → ngOnInit  de RequestOrderComponent
 *   destroy() → ngOnDestroy de RequestOrderComponent
 */
@Injectable({ providedIn: 'root' })
export class ContactMessageHandlerService implements OnDestroy {

  private ngZone = inject(NgZone);
  private messageHandler: ((event: MessageEvent) => void) | null = null;
  private initialized = false;

  private readonly defaultCountry: CountryCode =
    CountryCodes.find(c => c.code === 'PE') ?? CountryCodes[0];

  // ─────────────────────────────────────────────────────────────────
  // Ciclo de vida
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

      // Verificar permiso JIT — solo cuando el usuario lo pidió
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

      console.log('📒 ContactHandler: Permiso OK — abriendo selector nativo');

      // Abrir selector nativo — el usuario elige UN contacto
      const res = await Contacts.pickContact({
        projection: { name: true, phones: true }
      });

      const phones = res?.contact?.phones ?? [];
      if (phones.length === 0) {
        console.warn('📒 ContactHandler: Contacto sin teléfono');
        this.sendResult(source, { status: 'no_phone' });
        return;
      }

      // Elegir el mejor teléfono (primary > mobile > primero disponible)
      const primary = phones.find(p => p.isPrimary && p.number);
      const mobile  = phones.find(p => p.type === 'mobile' && p.number);
      const picked  = primary ?? mobile ?? phones.find(p => p.number) ?? phones[0];
      const raw     = picked?.number ?? '';

      if (!raw) {
        this.sendResult(source, { status: 'no_phone' });
        return;
      }

      // Extraer nombre (display en Android, given+family en iOS)
      const nameObj = (res?.contact as any)?.name ?? {};
      const name = (
        nameObj.display ??
        [nameObj.given, nameObj.middle, nameObj.family].filter(Boolean).join(' ') ??
        ''
      ).trim();

      // Parsear teléfono — detectar código de país o usar defaultCountry
      const { dialCode, number } = this.parsePhone(raw);

      console.log('📒 ContactHandler: OK →', { name, dialCode, number });
      this.sendResult(source, { status: 'ok', contact: { name, phone: number, dialCode } });

    } catch (err: any) {
      // El picker lanza error cuando el usuario cancela — silenciar
      console.warn('📒 ContactHandler: Cancelado o error:', err?.message ?? err);
      this.sendResult(source, { status: 'cancelled' });
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
      // Ordenar por longitud desc para que +593 gane antes que +5
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