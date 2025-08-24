import { Component, OnInit, ViewChild } from '@angular/core';
import { ComplaintReportService } from './service/complaint-report.service';
import { ComplaintBean, OrderBean, PaymentBean } from './data';
import { MenuItem, MessageService } from 'primeng/api';
import { ComplaintResponse, OrderResponse } from './service/data/response';
import { Image } from 'src/app/demo/domain/image';
import { ChatBean } from 'src/app/chat/data.chat';
import { ChatComponent } from 'src/app/chat/chat.component';
import { ChatService } from '../main/service/chat.service';
import { ChatResponse } from '../main/service/data/chat.response';
import { ChatHandler } from '../service/handlers/chat.handler';
import { AuthService } from 'src/app/utils/auth.service';
import * as CONSTANTS from 'src/app/utils/constant';
import { WokerHandler } from '../service/worker.service';

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

  items: MenuItem[]

  constructor(
    private auth : AuthService,
    private service: ComplaintReportService,
    private chatService: ChatService,
    private messageService: MessageService,
    private mqtt: WokerHandler,
    private chatHandler:ChatHandler,
  ) { }

  ngOnInit(): void {
    this.mqtt._onConnectWorker.subscribe((isConnect)=>{
      if(isConnect){
        this.isMqttConnect=isConnect
        this.mqttListener()
      }
    })
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
      {label: 'En proceso', disabled:true , icon: 'pi pi-forward' , command: () => { this.onUpdateStatus(CONSTANTS.STATUS_COMPLAINT_IN_PROCESS) }},
      {label: 'Terminado', disabled:true , icon: 'pi pi-thumbs-up-fill', command: () => { this.onUpdateStatus(CONSTANTS.STATUS_COMPLAINT_DONE) }},
      {label: 'Rechazar', disabled:true , icon: 'pi pi-times', command: () => { this.onUpdateStatus(CONSTANTS.STATUS_COMPLAINT_REJECT) }},
    ];
  }


  labelStatus: string

  onUpdateStatus(statusOrder: string){

    if(this.complaintStatus === CONSTANTS.STATUS_COMPLAINT_REJECT && (statusOrder === CONSTANTS.STATUS_COMPLAINT_DONE || statusOrder === CONSTANTS.STATUS_COMPLAINT_IN_PROCESS)){
      this.messageService.add({severity:'error', summary: 'Error', detail: 'No puede volver al estado anterior'});
    } else if (this.complaintStatus === CONSTANTS.STATUS_COMPLAINT_DONE && statusOrder === CONSTANTS.STATUS_COMPLAINT_IN_PROCESS){
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
          if(this.complaintStatus == CONSTANTS.STATUS_COMPLAINT_DONE || this.complaintStatus == CONSTANTS.STATUS_COMPLAINT_REJECT){
            this.orders = this.orders.filter(order => order.complaint.uuid !== resp.data.uuid)
            this.isDialogComplaintDetailOpen = false
          }
          this.enabledSplitbutton(resp.data.status)
          this.complaintOrder.status=resp.data.status
          this.isEnabledInputText = !(resp.data.status == CONSTANTS.STATUS_COMPLAINT_IN_PROCESS)

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
  imagesArray: string[]
  isEnabledInputText: boolean = false

  OpenDialogComplaintDetail(complaint: ComplaintBean, orderUuid: string){
    this.isDialogComplaintDetailOpen = true;
    this.enabledSplitbutton(complaint.status)
    this.orderUuidtoSend = orderUuid
    this.getMessages(complaint, orderUuid)
    this.complaintOrder = complaint;
    this.labelStatus = this.getStatus(complaint.status)
    this.complaintStatus = complaint.status
    this.imagesArray = complaint.evidence
    this.isEnabledInputText = !(complaint.status == CONSTANTS.STATUS_COMPLAINT_IN_PROCESS)
    
  }

  enabledSplitbutton(statusCurrent: string) {
    this.items.forEach((item)=>item.disabled=true)
    if(statusCurrent==CONSTANTS.STATUS_COMPLAINT_OPEN){
      this.items.forEach((item)=>{
        if(item.label=="En proceso"){
          item.disabled=false
        }
      })
    }
    if(statusCurrent==CONSTANTS.STATUS_COMPLAINT_IN_PROCESS){
      this.items.forEach((item)=>{
        if(["Terminado","Rechazar"].includes(item.label)){
          item.disabled=false
        }
      })
    }
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
