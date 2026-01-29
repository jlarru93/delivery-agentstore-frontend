import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { StoreResponse } from '../main/service/data/response';

@Component({
  selector: 'request-order',
  templateUrl: './request-order.component.html',
  styleUrls: ['./request-order.component.scss']
})
export class RequestOrderComponent implements OnInit {

  constructor(public sanitizer:DomSanitizer){}

  url:SafeResourceUrl

  ngOnInit(): void {
    const store=JSON.parse(localStorage.getItem("storeBean")) as StoreResponse
    const brandIdSelected=store.brand.id
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${environment.microFront.order}?userPoolId=${environment.awsConfig.cognito.userPoolId}&userPoolWebClientId=${environment.userPoolWebClientId}&brandIdSelected=${brandIdSelected}`
    )
  }

}
