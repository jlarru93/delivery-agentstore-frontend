import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-product-micro',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  providers: [MessageService]
})
export class ProductComponent implements OnInit {

  url: SafeResourceUrl
  constructor(
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.sanitizarUrl();
  }



  sanitizarUrl() {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${environment.microFront.product}product/?userPoolId=${environment.awsConfig.cognito.userPoolId}&userPoolWebClientId=${environment.userPoolWebClientId}`
    );
    console.log("this.url",this.url)
  }
}
