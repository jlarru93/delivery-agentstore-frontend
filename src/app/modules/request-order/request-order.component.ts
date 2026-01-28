import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'request-order',
  templateUrl: './request-order.component.html',
  styleUrls: ['./request-order.component.scss']
})
export class RequestOrderComponent implements OnInit {

  constructor(public sanitizer:DomSanitizer){}

  url:SafeResourceUrl

  ngOnInit(): void {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${environment.microFront.order}?userPoolId=${environment.awsConfig.cognito.userPoolId}&userPoolWebClientId=${environment.userPoolWebClientId}`
    )
  }

}
