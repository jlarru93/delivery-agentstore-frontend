import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StoreResponse } from '../main/service/data/response';
import { ShareLocationService, SharedLocationData } from '../service/share-location.service';

@Component({
  selector: 'request-order',
  templateUrl: './request-order.component.html',
  styleUrls: ['./request-order.component.scss']
})
export class RequestOrderComponent implements OnInit, OnDestroy {

  url: SafeResourceUrl | null = null;

  private messageListener: (event: MessageEvent) => void;
  private queryParamsSub: Subscription;
  private sharedLocationSub: Subscription;

  constructor(
    public sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router,
    private shareLocation: ShareLocationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Caso 1: llegó por navegación con queryParams
    this.queryParamsSub = this.route.queryParams.subscribe(params => {
      this.reloadIframe(params);
    });

    // Caso 2: ya estábamos aquí, Subject emite directamente
    this.sharedLocationSub = this.shareLocation.sharedLocation$.subscribe(locationData => {
      console.log('[RequestOrder] Share recibido vía Subject:', locationData);
      const params = this.shareLocation.buildQueryParams(locationData);
      this.reloadIframe(params);
    });

    this.setupMessageListener();
  }

  ngOnDestroy(): void {
    this.queryParamsSub?.unsubscribe();
    this.sharedLocationSub?.unsubscribe();
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Destruye y recrea el iframe forzando change detection
  // ─────────────────────────────────────────────────────────────────

  private reloadIframe(params: any): void {
    const newUrl = this.buildIframeUrl(params);

    // 1. Destruir iframe del DOM y forzar que Angular lo detecte
    this.url = null;
    this.cdr.detectChanges();

    // 2. En el siguiente tick reasignar y volver a detectar
    setTimeout(() => {
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(newUrl);
      this.cdr.detectChanges();
    }, 50);
  }

  private buildIframeUrl(params: any): string {
    const store = JSON.parse(localStorage.getItem('storeBean')) as StoreResponse;
    const brandIdSelected = store.brand.id;

    const uuid              = params['uuid']              || null;
    const sharedLat         = params['sharedLat']         || null;
    const sharedLng         = params['sharedLng']         || null;
    const sharedLocationUrl = params['sharedLocationUrl'] || null;

    let iframeUrl = `${environment.microFront.order}`
      + `?userPoolId=${environment.awsConfig.cognito.userPoolId}`
      + `&userPoolWebClientId=${environment.userPoolWebClientId}`
      + `&brandIdSelected=${brandIdSelected}`;

    if (uuid) {
      iframeUrl += `&uuid=${uuid}`;
    }

    if (sharedLat && sharedLng) {
      iframeUrl += `&sharedLat=${sharedLat}&sharedLng=${sharedLng}`;
      console.log('[ShareTarget] Coordenadas al micro-frontend:', sharedLat, sharedLng);
    } else if (sharedLocationUrl) {
      iframeUrl += `&sharedLocationUrl=${encodeURIComponent(sharedLocationUrl)}`;
      console.log('[ShareTarget] URL al micro-frontend:', sharedLocationUrl);
    }

    console.log('[RequestOrder] Iframe URL:', iframeUrl);
    return iframeUrl;
  }

  // ─────────────────────────────────────────────────────────────────
  // Mensajes del micro-frontend
  // ─────────────────────────────────────────────────────────────────

  private setupMessageListener(): void {
    this.messageListener = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;

      switch (event.data.type) {
        case 'NAVIGATE_TO_ORDERS':
        case 'NAVIGATE_BACK':
        case 'CLOSE_MICROFRONTEND':
          this.router.navigate(['/']);
          break;
      }
    };
    window.addEventListener('message', this.messageListener);
  }
}