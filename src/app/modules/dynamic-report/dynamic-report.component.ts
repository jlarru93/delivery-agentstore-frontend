import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dynamic-report',
  templateUrl: './dynamic-report.component.html',
  styleUrls: ['./dynamic-report.component.scss']
})
export class DynamicReportComponent implements OnInit {

  constructor(public sanitizer:DomSanitizer){}

  url:SafeResourceUrl

  ngOnInit(): void {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${environment.microFront.report}?userPoolId=${environment.awsConfig.cognito.userPoolId}&userPoolWebClientId=${environment.userPoolWebClientId}`
    )
  }

}
