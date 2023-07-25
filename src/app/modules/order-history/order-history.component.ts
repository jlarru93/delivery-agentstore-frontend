import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AuthService } from 'src/app/utils/auth.service';
import { OrderHistoryService } from './service/order-history.service';
import { OrderHistoryRequest } from './service/data/request';
import { ComplaintBean, OrderHistorBean } from './data';
import { Pagination } from 'src/app/models';
import { Image } from 'src/app/demo/domain/image';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {

  status: any[] = [
    { name: 'Cancelado', value: 'cancel'},
    { name: 'Terminado', value: 'done'},
    { name: 'Preparando orden', value: 'preparingOrder'}
  ]
  isDialogDetailOpen: boolean = false

  messageControl: FormControl = new FormControl('');

  images: Image[] = []

  responsiveOptions:any[] = [
    {
        breakpoint: '1024px',
        numVisible: 5
    },
    {
        breakpoint: '960px',
        numVisible: 4
    },
    {
        breakpoint: '768px',
        numVisible: 3
    },
    {
        breakpoint: '560px',
        numVisible: 1
    }
];


  items: any[]
  orderHistoryRequest: OrderHistoryRequest
  orderHistories: OrderHistorBean[]
  statusOrder: string
  orderHistoryId: number

  pagination: Pagination = { page: 1, size: 10, totalRecords: 0, totalNumberPages: 0 }

  constructor(
    private auth : AuthService,
    private service: OrderHistoryService
  ) { }

  ngOnInit(): void {

    this.items = [
      {label: 'Abierto', icon: 'pi pi-check-circle'},
      {label: 'En proceso', icon: 'pi pi-forward'},
      {label: 'Terminado', icon: 'pi pi-thumbs-up-fill'},
      {label: 'Cancelado', icon: 'pi pi-times'},
    ];

    this.GetOrderHistories()
  }

  page: number = 1
  size: number = 10


  GetOrderHistories(orderId: number = null, status: string = null){
    this.loadingResults = true
    let body = {
      orderId: orderId,
      status: status
    }
    this.service.getOrderHistories(body,this.pagination).subscribe(
      (resp: any) => {
        this.orderHistories = resp.data
        this.totalRecords = resp.meta.totalRecords
        this.loadingResults = false
      }
    )
  }

  complaintOrder: ComplaintBean
  OpenDialogDetail(complaint: ComplaintBean){
    this.isDialogDetailOpen = true;
    this.complaintOrder = complaint;

    complaint.evidence.forEach((url, index) => {
      const imageObj: Image = {
        previewImageSrc: url,
        thumbnailImageSrc: url,
        alt: `Evidencia ${index + 1}`,
        title: `Evidencia ${index + 1}`
      }
      this.images.push(imageObj)
    })

    return this.images
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

  totalRecords: number = 0;
  loadingResults: boolean = false
  async Page(event : any){
    this.loadingResults = true
    let req: any = {
      status: this.statusOrder ? this.statusOrder : null,
      orderId : this.orderHistoryId ? this.orderHistoryId : null
      
    };

    this.pagination.page = event.page + 1

    await this.service.getOrderHistories(req, this.pagination).subscribe
    ((resp: any) => {
      this.orderHistories = resp.data
      this.totalRecords = resp.meta.totalRecords
      this.loadingResults = false
    })
  }

  getStatus(statusCode: string){
    let status : string
    switch (statusCode) {
      case 'done' : status = 'Terminado'; break;
      case 'cancel' : status = 'Cancelado'; break;
      case 'preparingOrder' : status = 'Preparando Orden'; break;
      default: break;
    }
    return status
  }
}
