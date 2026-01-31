import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { StoreResponse } from '../main/service/data/response';

@Component({
  selector: 'request-order',
  templateUrl: './request-order.component.html',
  styleUrls: ['./request-order.component.scss']
})
export class RequestOrderComponent implements OnInit {

  constructor(
    public sanitizer: DomSanitizer,
    private route: ActivatedRoute
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
  }

}