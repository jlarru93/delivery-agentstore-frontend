import { ViewEncapsulation, AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from "src/environments/environment";

@Component({
  selector: 'app-print-template',
  templateUrl: './print-template.component.html',
  styleUrls: ['./print-template.component.scss'],
  //encapsulation: ViewEncapsulation.None
})
export class PrintTemplateComponent implements OnInit, AfterViewInit {

  @Input() orderSelected: any
  @Input() storeData: any

  constructor(
    public sanitization: DomSanitizer,
  ) { }

  isPriceForEachProduct: boolean = false
  isPriceForEachSubOption: boolean = false
  ngOnInit(): void {
    this.storeData.ticketKitchen.forEach(element => {
      // if(element.key == 'priceForEachProduct'){
      //   this.isPriceForEachProduct = element.value
      // }
      switch (element.key) {
        case 'priceForEachProduct' : this.isPriceForEachProduct = element.value; break;
        case 'priceForEachSubOptions': this.isPriceForEachSubOption = element.value; break;
      }
    })
    console.log('orderSelected', this.orderSelected)
  }

  ngAfterViewInit(): void {
    
  }

  formatCurrency(input:number):string{
    const numberFormat=environment.numberFormat

    const decimalPart=input.toString().split(".")[1]??""
    const entryPart=input.toString().split(".")[0]
    const decimalConfig=decimalPart.substring(0,numberFormat.decimalPlaces)
    
    const regex = /(\d)(?=(\d{3})+(?!\d))/g;
    const entryConfig=entryPart.replace(regex, '$1'+numberFormat.thousandsSeparator);
    
    let resulNumber=''
    if(decimalConfig!=''){
        resulNumber=entryConfig+numberFormat.decimalSeparator+decimalConfig
    }else{
        resulNumber=entryConfig
    }
    return resulNumber
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

  onGetMethodType(method: string){
    let methodConverted: string
    switch(method){
      case 'CARD' : methodConverted = 'Tarjeta de crédito'; break;
      case 'CASH' : methodConverted = 'Efectivo'; break;
      case 'BANK' : methodConverted = 'Cuenta bancaria'; break;
      case 'E-WALLET' : methodConverted = 'Billetera electrónica'; break;
      case 'PAYMENT-BUTTON' : methodConverted = 'PSE' ; break
      default: methodConverted; break
    }
    return methodConverted 
  }

}
