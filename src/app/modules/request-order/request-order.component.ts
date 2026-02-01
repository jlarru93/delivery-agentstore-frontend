import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { StoreResponse } from '../main/service/data/response';

@Component({
  selector: 'request-order',
  templateUrl: './request-order.component.html',
  styleUrls: ['./request-order.component.scss']
})
export class RequestOrderComponent implements OnInit, OnDestroy {

  private messageListener: (event: MessageEvent) => void;

  constructor(
    public sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router
  ){}

  url: SafeResourceUrl

  ngOnInit(): void {
    const store = JSON.parse(localStorage.getItem("storeBean")) as StoreResponse
    const brandIdSelected = store.brand.id
    
    // Capturar uuid desde query params (para edición)
    const uuid = this.route.snapshot.queryParamMap.get('uuid');
    
    // Construir URL base
    let iframeUrl = `${environment.microFront.order}?userPoolId=${environment.awsConfig.cognito.userPoolId}&userPoolWebClientId=${environment.userPoolWebClientId}&brandIdSelected=${brandIdSelected}`;
    
    // Agregar uuid si existe (modo edición)
    if (uuid) {
      iframeUrl += `&uuid=${uuid}`;
    }
    
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(iframeUrl);
    
    // Escuchar mensajes del micro-frontend
    this.setupMessageListener();
  }

  ngOnDestroy(): void {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
    }
  }

  private setupMessageListener(): void {
    this.messageListener = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      
      const { type } = event.data;
      
      switch (type) {
        case 'NAVIGATE_TO_ORDERS':
          // Navegar al listado de órdenes (order-course)
          this.router.navigate(['/']);
          break;
        case 'NAVIGATE_BACK':
        case 'CLOSE_MICROFRONTEND':
          // Volver atrás o al dashboard
          this.router.navigate(['/']);
          break;
      }
    };
    
    window.addEventListener('message', this.messageListener);
  }

}