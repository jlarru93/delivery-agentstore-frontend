import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AuthService } from 'src/app/utils/auth.service';
import { OrderHistoryService } from './service/order-history.service';
import { OrderHistoryRequest } from './service/data/request';
import { ComplaintBean, OrderHistorBean } from './data';
import { Pagination } from 'src/app/models';
import { Image } from 'src/app/demo/domain/image';
import { MessageService } from 'primeng/api';
import { ChatBean } from 'src/app/chat/data.chat';
import { ChatService } from '../main/service/chat.service';
import { ChatResponse } from '../main/service/data/chat.response';
import { MqttService } from '../service/mqtt.service';
import { ChatHandler } from '../service/handlers/chat.handler';
import { ChatComponent } from 'src/app/chat/chat.component';
import * as CONSTANTS from 'src/app/utils/constant';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss'],
  providers: [MessageService]
})
export class OrderHistoryComponent implements OnInit {

  status: any[] = [
    { name: 'Cancelado', value: 'cancel'},
    { name: 'Terminado', value: 'done'},
    { name: 'Orden lista', value: 'orderReady'},
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

  userName="usuario"
  userId: number = 123

  messagesChat:ChatBean[]=[]
  isMqttConnect:boolean=false
  
  constructor(
    private auth : AuthService,
    private service: OrderHistoryService,
    private messageService: MessageService,
    private chatService:ChatService,
    private mqtt:MqttService,
    private chatHandler:ChatHandler,

  ) { }
 
  ngOnInit(): void {

    this.items = [
      // {label: 'Abierto', icon: 'pi pi-check-circle', command: () => { this.onUpdateStatus('open') } },
      {label: 'En proceso', icon: 'pi pi-forward' , command: () => { /*this.onUpdateStatus('inProcess')*/ }},
      {label: 'Terminado', icon: 'pi pi-thumbs-up-fill', command: () => { /*this.onUpdateStatus('done') */}},
      {label: 'Rechazar', icon: 'pi pi-times', command: () => { /*this.onUpdateStatus('reject')*/ }},
    ];

    if(this.mqtt.client.isConnected()){
      this.mqttListener()
    }else{
      this.mqtt._onConnect.subscribe((isConnect)=>{
        if(isConnect){
          this.isMqttConnect=isConnect
          this.mqttListener()
        }
      })
    }
    
    this.GetOrderHistories()
    this.getUserData()
  }
  mqttListener() {
    this.chatHandler._data.subscribe((asyncData)=>{
      if(asyncData){
        let messageBean=ChatResponse.toBean(asyncData.data)
        
        let orderHistory=this.orderHistories.filter((orderHistory)=>orderHistory.complaint).find((orderHistory)=>orderHistory.orderUuid==messageBean.uuidOrder)
        console.log("orderIndex",orderHistory)
        console.log("this.orders[orderIndex]",orderHistory)
        orderHistory.complaint.messagesNoReadTotal++

        let indexMessage=orderHistory.complaint.messagesChat.findIndex((message)=>message.uuid==messageBean.uuid)
        console.log("indexMessage",indexMessage)
        if(indexMessage>0){
          console.log("this.orders[orderIndex].messagesChat[indexMessage]",orderHistory.complaint.messagesChat[indexMessage])
          orderHistory.complaint.messagesChat[indexMessage]=messageBean
        }else{
          console.log("this.orders[orderIndex].messagesChat",orderHistory.complaint)
          orderHistory.complaint.messagesChat.push(messageBean)
          this.chatComponent.scrollToBottom()
        }
      }
    })
  }

  page: number = 1
  size: number = 10

  getUserData(){
    this.userName=this.auth.getParameterToken('name')
    this.userId=Number(this.auth.getParameterToken('id'))
  }

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
        this.suscribeChat(this.orderHistories)
      }
    )
  }

  suscribeChat(orderHistories:OrderHistorBean[]){
    console.log("orderHistories.filter((orderHistory)=>orderHistory.complaint)",orderHistories.filter((orderHistory)=>orderHistory.complaint))
    orderHistories.filter((orderHistory)=>orderHistory.complaint).forEach((orderHistory)=>{
      this.mqtt.subscribe("chat/"+orderHistory.orderUuid)
    })
  }
  complaintOrder: ComplaintBean
  labelStatus: string
  orderUuidtoSend: string
  imagesArray: string[]
  isEnabledInputText: boolean = false

  OpenDialogDetail(complaint: ComplaintBean, orderUuid: string){
    this.isDialogDetailOpen = true;
    this.orderUuidtoSend = orderUuid
    this.getMessages(complaint, orderUuid)
    this.complaintOrder = complaint;
    this.labelStatus = this.getStatus(complaint.status)
    this.imagesArray = complaint.evidence
    if(complaint.status == CONSTANTS.STATUS_COMPLAINT_IN_PROCESS ) {
      this.isEnabledInputText = false
    } else {
      this.isEnabledInputText = true
    }
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
      this.suscribeChat(this.orderHistories)
    })
  }

  getStatus(statusCode: string){
    let status : string
    switch (statusCode) {
      case 'open' : status = 'Abierto'; break;
      case 'done' : status = 'Terminado'; break;
      case 'reject' : status = 'Rechazado'; break;
      case 'inProcess' : status = 'En proceso'; break;
      case 'cancel' : status = 'Cancelado'; break;
      case 'preparingOrder' : status = 'Preparando Orden'; break;
      case 'orderReady' : status = 'Orden Lista'; break;
      default: break;
    }
    return status
  }

  onItemClick(event: any) {
    console.log(event.item); // Aquí puedes acceder a la opción seleccionada
  }

  onUpdateStatus(statusOrder: string){
    let body = {
      status: statusOrder
    }
    this.service.updateComplaintStatus(this.complaintOrder.uuid, body).subscribe(
      (resp) => {
        this.messageService.add({severity:'success', summary: 'Satisfactorio', detail: 'El estado ha sido actualizado'});
        this.labelStatus = this.getStatus(resp.data.status)
      }
    )
  }
  @ViewChild(ChatComponent) chatComponent!: ChatComponent;

  getMessages(complaint:ComplaintBean, uuidOrder: string){
    console.log("mensajess",this.messagesChat)
    this.messagesChat=[]
    complaint.isLoadingChat=true
    this.chatService.getMessage(uuidOrder).subscribe(
      (resp)=>{
        complaint.isLoadingChat=false
        complaint.messagesChat= resp.data.map((message)=>ChatResponse.toBean(message))
        this.chatComponent.scrollToBottom()
      },
      (error)=>{
        complaint.isLoadingChat=false
      })
  }

  sendMessage(message:ChatBean){
    console.log("message",message)
    this.chatService.sendMessage(ChatBean.toRequest(message)).subscribe((resp)=>{    
    },
    (error)=>{})
  }

  filterGlobal(event: any){
    console.log(event)
  }
}
