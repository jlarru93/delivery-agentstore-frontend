import { Component, OnInit, ViewChild } from '@angular/core';
import { ComplaintReportService } from './service/complaint-report.service';
import { ComplaintBean, OrderBean, PaymentBean } from './data';
import { MessageService } from 'primeng/api';
import { OrderResponse } from './service/data/response';
import { Image } from 'src/app/demo/domain/image';
import { ChatBean } from 'src/app/chat/data.chat';
import { ChatComponent } from 'src/app/chat/chat.component';
import { ChatService } from '../main/service/chat.service';
import { ChatResponse } from '../main/service/data/chat.response';
import { MqttService } from '../service/mqtt.service';
import { ChatHandler } from '../service/handlers/chat.handler';
import { AuthService } from 'src/app/utils/auth.service';

export const STATUS = {
  REJECT: 'reject',
  DONE: 'done',
  INPROCESS: 'inProcess'
} as const;

@Component({
  selector: 'app-complaint-report',
  templateUrl: './complaint-report.component.html',
  styleUrls: ['./complaint-report.component.scss'],
  providers: [MessageService]
})


export class ComplaintReportComponent implements OnInit {

  orders: OrderBean[]
  messagesChat:ChatBean[]=[]

  isDialogComplaintDetailOpen: boolean = false
  isDialogOrderDetailOpen: boolean = false
  loadingResults: boolean = false
  orderSelected:OrderBean
  complaintOrder: ComplaintBean
  isMqttConnect:boolean=false

  userName="usuario"
  userId: number = 123
  
  payment: PaymentBean
  paymentName: string

  items: any[]

  constructor(
    private auth : AuthService,
    private service: ComplaintReportService,
    private chatService: ChatService,
    private messageService: MessageService,
    private mqtt: MqttService,
    private chatHandler:ChatHandler,
  ) { }

  ngOnInit(): void {
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
    this.getOrdersComplaints()
    this.getUserData()
    this.getStatusSplitButton()
  }

  getUserData(){
    this.userName=this.auth.getParameterToken('name')
    this.userId=Number(this.auth.getParameterToken('id'))
  }

  mqttListener() {
    this.chatHandler._data.subscribe((asyncData)=>{
      if(asyncData){
        let messageBean=ChatResponse.toBean(asyncData.data)
        
        let orderHistory=this.orders.filter((orderHistory)=>orderHistory.complaint).find((orderHistory)=>orderHistory.uuid==messageBean.uuidOrder)
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

  OpenDialogOrderDetail(order: OrderBean){
    this.isDialogOrderDetailOpen = true
    this.orderSelected=order
    this.payment = this.orderSelected.payment

    // this.imagenURL = this.payment?.method?.url
    let methodName=this.payment.method.name?.toUpperCase()
    methodName=methodName?methodName:""
    this.paymentName = this.payment.method.type.toUpperCase() + methodName

    setTimeout(() => {
      var button2 = document.getElementById('btnOnClicked')
      button2.click()
    }, 500)
  }

  getStatusSplitButton(){
    return this.items = [
      {label: 'En proceso', icon: 'pi pi-forward' , command: () => { this.onUpdateStatus('inProcess') }},
      {label: 'Terminado', icon: 'pi pi-thumbs-up-fill', command: () => { this.onUpdateStatus('done') }},
      {label: 'Rechazar', icon: 'pi pi-times', command: () => { this.onUpdateStatus('reject') }},
    ];
  }


  labelStatus: string

  onUpdateStatus(statusOrder: string){

    if(this.complaintStatus === STATUS.REJECT && (statusOrder === STATUS.DONE || statusOrder === STATUS.INPROCESS)){
      this.messageService.add({severity:'error', summary: 'Error', detail: 'No puede volver al estado anterior'});
    } else if (this.complaintStatus === STATUS.DONE && statusOrder === STATUS.INPROCESS){
      this.messageService.add({severity:'error', summary: 'Error', detail: 'No puede volver al estado anterior'});
    } else {
      let body = {
        status: statusOrder
      }
      this.service.updateComplaintStatus(this.complaintOrder.uuid, body).subscribe(
        (resp) => {
          this.messageService.add({severity:'success', summary: 'Satisfactorio', detail: 'El estado ha sido actualizado'});
          this.complaintStatus = resp.data.status
          this.labelStatus = this.getStatus(resp.data.status)
        }
      )
    }


  }

  getOrdersComplaints(){
    this.loadingResults = true
    this.service.getOrderComplaints().subscribe(
      (resp: any) => {
        this.orders = resp.data.map((it) => OrderResponse.toBean(it))
        this.loadingResults = false
        this.suscribeChat(this.orders)
      }
    )
  }

  suscribeChat(orderHistories:OrderBean[]){
    console.log("orderHistories.filter((orderHistory)=>orderHistory.complaint)",orderHistories.filter((orderHistory)=>orderHistory.complaint))
    orderHistories.filter((orderHistory)=>orderHistory.complaint).forEach((orderHistory)=>{
      this.mqtt.subscribe("chat/"+orderHistory.uuid)
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

  orderUuidtoSend: string
  complaintStatus: string
  images: Image[] = []

  OpenDialogComplaintDetail(complaint: ComplaintBean, orderUuid: string){
    this.isDialogComplaintDetailOpen = true;
    this.orderUuidtoSend = orderUuid
    this.getMessages(complaint, orderUuid)
    this.complaintOrder = complaint;
    this.labelStatus = this.getStatus(complaint.status)
    this.complaintStatus = complaint.status
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

  accordionFunction(){
      
    const accordionContent = document.querySelectorAll(".accordion-item");
    accordionContent.forEach((item, index) => {
      let header = item.querySelector(".header") as HTMLElement | null;
      let description = item.querySelector(".accordion-description") as HTMLElement | null;
      let gridheader = item.querySelector(".grid-quantity") as HTMLElement | null;

      item.classList.add("open");

      description.style.height = `${description.scrollHeight}px`;
      description.style.paddingTop = '10px';
      gridheader.style.borderBottom = '1px solid #EEF2F6';

      header.addEventListener("click", ()=> {
        item.classList.toggle("open");


        if(item.classList.contains('open')){
          description.style.height = `${description.scrollHeight}px`
          description.style.paddingTop = '10px'
          gridheader.style.borderBottom = '1px solid #EEF2F6'
        } else {
          description.style.height = "0px"
          header.style.borderBottom = '0px'
          description.style.paddingTop = '0px'
          gridheader.style.borderBottom = '0px'
        }
      })
    })
  }

}
