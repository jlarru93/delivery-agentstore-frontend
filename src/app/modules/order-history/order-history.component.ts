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
    { name: 'Cancelado', value: 'cancel '},
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



  messages: any[] = [
    { 
      uuid : "0d0d3958-28c1-4057-8b8f-6dd2296a7dfa", 
      uuidOrder : "53163d28-a3fa-4208-8c16-4b64772db343", 
      user : { 
          id : 60, 
          name : "Delivery Man", 
          type : "delivery-man" 
      }, 
      store : { 
          id : 16, 
          name : "tambo Salguero" 
      }, 
      body : "Hey User!", 
      readUser : [ 
          { 
              id : 11, 
              name : "Fulano de tal", 
              type : "delivery-man", 
              background: 'red',
              readedAt: 1685927914 
          }, 
          { 
              id : 14, 
              name : "Pepito de los palotes", 
              type : "user", 
              background: 'blue',
              readedAt : 1685927914 
          } 
      ], 
      createdAt : 1685927914 
    },
    { 
      uuid : "0d0d3958-28c1-4057-8b8f-677adad899ad63", 
      uuidOrder : "53163d28-a3fa-4208-8c16-4b64772db343", 
      user : { 
          id : 14, 
          name : "Cristhian Angel Ticclla Espinoza", 
          type : "agent-store" 
      }, 
      store : { 
          id : 16, 
          name : "tambo Salguero" 
      }, 
      body : "Hi Delivery Man", 
      readUser : [ 
          { 
              id : 60, 
              name : "Fulano de tal", 
              type : "delivery-man", 
              readedAt: 1685927914,
              background:'red'
          }, 
          { 
              id : 60, 
              name : "Pepito de los palotes", 
              type : "user", 
              readedAt : 1685927914,
              background:'blue' 
          } 
      ], 
      createdAt : 1685927914 
    },
    { 
      uuid : "0d0d3958-28c1-4057-8b8f-6dd2296a7dfa", 
      uuidOrder : "53163d28-a3fa-4208-8c16-4b64772db343", 
      user : { 
          id : 60, 
          name : "Delivery Man", 
          type : "delivery-man" 
      }, 
      store : { 
          id : 16, 
          name : "tambo Salguero" 
      }, 
      body : "Your order is ready", 
      readUser : [ 
          { 
              id : 11, 
              name : "Fulano de tal", 
              type : "delivery-man", 
              readedAt: 1685927914,
              background:'blue' 
          }, 
          { 
              id : 14, 
              name : "Pepito de los palotes", 
              type : "user", 
              readedAt : 1685927914,
              background:'blue' 
          } 
      ], 
      createdAt : 1685927914 
    },
    { 
      uuid : "0d0d3958-28c1-4057-8b8f-6dd2296a7dfa", 
      uuidOrder : "53163d28-a3fa-4208-8c16-4b64772db343", 
      user : { 
          id : 60, 
          name : "Delivery Man", 
          type : "delivery-man" 
      }, 
      store : { 
          id : 16, 
          name : "tambo Salguero" 
      }, 
      body : "The estimated time is 1 hours. I'll call you when I arrive.", 
      readUser : [ 
          { 
              id : 11, 
              name : "Fulano de tal", 
              type : "delivery-man", 
              readedAt: 1685927914,
              background:'blue' 
          }, 
          { 
              id : 14, 
              name : "Pepito de los palotes", 
              type : "user", 
              readedAt : 1685927914,
              background:'blue' 
          } 
      ], 
      createdAt : 1685927914 
    },
    { 
      uuid : "0d0d3958-28c1-4057-8b8f-677adad899ad63", 
      uuidOrder : "53163d28-a3fa-4208-8c16-4b64772db343", 
      user : { 
          id : 14, 
          name : "Cristhian Angel Ticclla Espinoza", 
          type : "agent-store" 
      }, 
      store : { 
          id : 16, 
          name : "tambo Salguero" 
      }, 
      body : "Great!. I'll be waiting", 
      readUser : [ 
          { 
              id : 60, 
              name : "Fulano de tal", 
              type : "delivery-man", 
              readedAt: 1685927914,
              background:'blue' 
          }, 
          { 
              id : 60, 
              name : "Pepito de los palotes", 
              type : "user", 
              readedAt : 1685927914,
              background:'blue' 
          } 
      ], 
      createdAt : 1685927914 
    },
    { 
      uuid : "0d0d3958-28c1-4057-8b8f-677adad899ad63", 
      uuidOrder : "53163d28-a3fa-4208-8c16-4b64772db343", 
      user : { 
          id : 60, 
          name : "Cristhian Angel Ticclla Espinoza", 
          type : "agent-store" 
      }, 
      store : { 
          id : 16, 
          name : "tambo Salguero" 
      }, 
      body : "Great...", 
      readUser : [ 
      ], 
      createdAt : 1685927914 
    },
    { 
      uuid : "0d0d3958-28c1-4057-8b8f-677adad899ad63", 
      uuidOrder : "53163d28-a3fa-4208-8c16-4b64772db343", 
      user : { 
          id : 14, 
          name : "Cristhian Angel Ticclla Espinoza", 
          type : "agent-store" 
      }, 
      store : { 
          id : 16, 
          name : "tambo Salguero" 
      }, 
      body : "Ok!", 
      readUser : [], 
      createdAt : 1685927914
    },
  ]

  @ViewChild('endOfChat') endOfChat!: ElementRef

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

  userId: any
  ngOnInit(): void {
    let userName=this.auth.getParameterToken('name')
    let id=this.auth.getParameterToken('id')
    this.userId=Number(id)

    this.items = [
      {label: 'Abierto', icon: 'pi pi-check-circle'},
      {label: 'En proceso', icon: 'pi pi-forward'},
      {label: 'Terminado', icon: 'pi pi-thumbs-up-fill'},
      {label: 'Cancelado', icon: 'pi pi-times'},
    ];

    // this.images = [
    //   {
    //     previewImageSrc: "https://delivery-app-imagenes.s3.amazonaws.com/user/complaints/2a4ce450-de22-11ed-a7f2-0b01f4204c06.jpg",
    //     thumbnailImageSrc: "https://delivery-app-imagenes.s3.amazonaws.com/user/complaints/2a4ce450-de22-11ed-a7f2-0b01f4204c06.jpg",
    //     alt: "Evidencia 1",
    //     title: "Evidencia 1"
    //   },
    //   {
    //     previewImageSrc: "https://www.rincondelgordo.pe/276-large_default/inca-kola-500ml.jpg",
    //     thumbnailImageSrc: https://www.rincondelgordo.pe/276-large_default/inca-kola-500ml.jpg",
    //     alt: "Evidencia 2,
    //     title: "Evidencia 2"
    //   },
    //   {
    //     previewImageSrc: "https://images.pexels.com/photos/13627457/pexels-photo-13627457.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    //     thumbnailImageSrc: "https://images.pexels.com/photos/13627457/pexels-photo-13627457.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    //     alt: "Description for Image 3",
    //     title: "Title 3"
    //   }
    // ]
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
    this.scrollToBottom()

    return this.images
  }

  sendMessage(){
    const message:string = this.messageControl.value.toString();
    if(message){
      let messageBody:any =
      { 
        uuid : "0d0d3958-28c1-4057-8b8f-677adad899ad63", 
        uuidOrder : "53163d28-a3fa-4208-8c16-4b64772db343", 
        user : { 
            id :  Number(this.userId), 
            name : 'Jhon', 
            type : "agent-store"
        }, 
        store : { 
            id : 0, 
            name : '' 
        }, 
        body : message, 
        readUser : [], 
        createdAt : Date.now()
      }
      this.messages.push(messageBody)
      this.messageControl.setValue('')
      this.scrollToBottom()
    }
  }

  scrollToBottom(){
    setTimeout(() => {
      if(this.endOfChat){
        this.endOfChat.nativeElement.scrollIntoView({behavior: "smooth"})
      }
    }, 10)
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
