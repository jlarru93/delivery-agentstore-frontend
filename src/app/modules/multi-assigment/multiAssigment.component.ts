import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-invoice',
  templateUrl: './multiAssigment.component.html',
  styleUrls: ['./multiAssigment.component.scss']
})
export class MultiAssigmentComponent implements OnInit {

  constructor(public sanitizer:DomSanitizer){}

  url:SafeResourceUrl

  ngOnInit(): void {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${environment.microFront.multipleAssignment}`
    )
  }

}
