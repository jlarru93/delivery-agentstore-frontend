import { ViewEncapsulation, AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-print-template',
  templateUrl: './print-template.component.html',
  styleUrls: ['./print-template.component.scss'],
  //encapsulation: ViewEncapsulation.None
})
export class PrintTemplateComponent implements OnInit, AfterViewInit {

  @Input() orderSelected: any

  constructor(
    public sanitization: DomSanitizer,
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    
  }


  @ViewChild('printSection') printSection: ElementRef;

  printThisPage(){
    const printContents = this.printSection.nativeElement.innerHTML;
    const popupWin = window.open('', '_blank', 'width=600,height=600');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Impresión</title>
        </head>
        <body onload="window.print();window.close()">
          ${printContents}
        </body>
      </html>
    `);
    popupWin.document.close();

  }

  

  getFormatDate(timestamp : number){
    const date = new Date(timestamp * 1000);

    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);

    let hours = date.getHours();
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // Si hours es 0, asigna 12 en su lugar

    const formattedDate = `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;

    return formattedDate
  }

}
