import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
      "http://localhost:4202/"
    )
  }

}
