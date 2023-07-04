import { Component, OnDestroy, OnInit } from "@angular/core";
import { ConfirmationService, MessageService } from 'primeng/api';
import { Product } from "src/app/demo/domain/product";
import { ProductService } from "src/app/demo/service/productservice";
import { OrderHandler } from "../service/handlers/order.handler";
//import { MqttService } from "../service/mqtt.service";
import { OrderService } from "./service/order.service";
import { OrderResponse } from "./service/data/response";
import { OrderBean, PaymentBean } from "./data";
import { DialogService } from "primeng/dynamicdialog";
import { OrderDialogComponent } from "./dialog/orderDialog.component";
import * as CONSTANTES from "src/app/utils/constant";
import { MqttService } from "../service/mqtt.service";
import { StoreHandler } from "../service/handlers/store.handler";
import { animate, style, transition, trigger } from "@angular/animations";
import { ChatHandler } from "../service/handlers/chat.handler";
import { ChatResponse } from "./service/data/chat.response";
import { ChatService } from "./service/chat.service";
import { ChatBean } from "src/app/chat/data.chat";
import { AuthService } from "src/app/utils/auth.service";
import { MatDialog } from "@angular/material/dialog";
import { ModalComponent } from "src/app/modal/modal.component";
@Component({
    selector: 'app-stores',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    providers: [ConfirmationService, MessageService,DialogService],
    animations: [
      trigger(
        'enterAnimation', [
          transition(':enter', [
            style({transform: 0.9, opacity: 0}),
            animate('100ms ease-out', style({transform: 0.9, opacity: 1}))
          ]),
          transition(':leave', [
            style({transform: 0.9, opacity: 1}),
            animate('100ms ease-in', style({transform: 0.9, opacity: 0}))
          ])
        ]
      )
    ],
  })
  export class MainComponent implements OnInit,OnDestroy {
    minutes: number = 2;
    displayOrder:boolean=false
    products: Product[];
    orders:OrderBean[]=[]
    ordersOpen:OrderBean[]=[]
    ordersPreparing:OrderBean[]=[]
    ordersReady:OrderBean[]=[]
    orderSelected:OrderBean
    readyToDmAt:number=10
    count: number = 10

    displayOrderReject: boolean = false

    title:string="Aceptar"

    modal : HTMLDialogElement
    popup : any 

    loadingButtonAcept:boolean=false
    //valid that mqtt and ordes is ready to subscribe
    isMqttConnect:boolean=false
    isDoneGetOrders:boolean=false

    messagesChat:ChatBean[]=[]
    isLoadingChat:boolean=false
    userName="usuario"
    userId="123"
    set_interval ?: any
    constructor(
      public dialogService: DialogService,
      private productService: ProductService,
      private orderService:OrderService,
      private mqtt:MqttService,
      private orderHandler:OrderHandler,
      private storeHandler:StoreHandler,
      private chatHandler:ChatHandler,
      private chatService:ChatService ,
      private messageService: MessageService,
      private confirmationService: ConfirmationService,
      private dialog: MatDialog,
      private auth: AuthService){}
    ngOnInit(): void { 
      this.messageService.add({severity:'success', summary: 'Success', detail: 'Message Content'});
      console.log("MAIN")
      this.productService.getProductsWithOrdersSmall().then(data => this.products = data);
      this.getOrders()
      this.set_interval = setInterval(()=>{
        this.getOrders()
      },30000)
      this.mqtt._onConnect.subscribe((isConnect)=>{
        if(isConnect){
          this.isMqttConnect=isConnect
          this.mqttListener()
          this.validOrdersSubscribe()
        }
      })
      this.getUserData()
    }
    ngOnDestroy(): void {
        clearInterval(this.set_interval)
    }
    getUserData(){
      this.userName=this.auth.getParameterToken('name')
      this.userId=this.auth.getParameterToken('id')
    }

    imagenURL: string = ''
    openDialog(): void {
      const dialogRef = this.dialog.open(ModalComponent, {
        data: {imagenURL: this.imagenURL}
      });
  
      dialogRef.afterClosed().subscribe(result => {
        console.log('Diálogo cerrado');
      });
    }

    ngAfterViewInit(){
      const accordionContent = document.querySelectorAll(".accordion-item");
      console.log('selector', accordionContent)
      accordionContent.forEach((item, index) => {
        let header = item.querySelector(".header") as HTMLElement | null;
        header.addEventListener("click", ()=> {
          item.classList.toggle("open");

          let description = item.querySelector(".accordion-description") as HTMLElement | null;
          if(item.classList.contains('open')){
            description.style.height = `${description.scrollHeight}px`
          } else {
            description.style.height = "0px"
            header.style.borderBottom = '0px'
          }
        })
      })
    }

    validOrdersSubscribe(){
      if(this.isMqttConnect && this.isDoneGetOrders){
        this.orders.forEach((order)=>{
          this.subscribeOrder(order.uuid)
          this.subscribeChat(order.uuid)
        })
      }
    }

    getOrders(){
      this.orderService.getOrders().subscribe((resp)=>{
        this.orders=resp.data.map((it)=>OrderResponse.toBean(it))
        this.sortOrders()
        this.isDoneGetOrders=true
        this.validOrdersSubscribe()
      })
    }
    mqttListener(){
      this.orderHandler._data.subscribe((asyncData)=>{
        if(asyncData){
          if(asyncData.data.status === CONSTANTES.CANCEL_ORDER_STATUS){
            let find_order :any = this.orders.findIndex(item => item.uuid === asyncData.data.uuid)
            let find_order_open :any = this.ordersOpen.findIndex(item => item.uuid === asyncData.data.uuid)
            this.orders.splice(find_order,1)
            // this.ordersOpen.splice(find_order_open,1)
          }else {
            let orderMqtt=OrderResponse.toBean(asyncData.data)
            let orderIndex=this.orders.findIndex((order)=>order.id === orderMqtt.id)
            this.orders[orderIndex]=orderMqtt
            console.log(orderMqtt)
          }
          this.sortOrders()
        }

      })
      this.storeHandler._data.subscribe((asyncData)=>{
        if(asyncData){
          
          let orderMqtt=OrderResponse.toBean(asyncData.data)
          this.orders.push(orderMqtt)
          this.sortOrders()
          this.subscribeOrder(orderMqtt.uuid)
          this.subscribeChat(orderMqtt.uuid)
        }
      })
      this.chatHandler._data.subscribe((asyncData)=>{
        if(asyncData){
          let messageBean=ChatResponse.toBean(asyncData.data)
          
          let orderIndex=this.orders.findIndex((order)=>order.uuid==messageBean.uuidOrder)
          console.log("orderIndex",orderIndex)
          console.log("this.orders[orderIndex]",this.orders[orderIndex])
          this.orders[orderIndex].messagesNoReadTotal++

          let indexMessage=this.orders[orderIndex].messagesChat.findIndex((message)=>message.uuid==messageBean.uuid)
          console.log("indexMessage",indexMessage)
          if(indexMessage>0){
            console.log("this.orders[orderIndex].messagesChat[indexMessage]",this.orders[orderIndex].messagesChat[indexMessage])
            this.orders[orderIndex].messagesChat[indexMessage]=messageBean
          }else{
            console.log("this.orders[orderIndex].messagesChat",this.orders[orderIndex])
            this.orders[orderIndex].messagesChat.push(messageBean)
          }
        }
      })
    }
    priceValueFormat: string[] = []
    totalPriceValueFormat : string
    payment: PaymentBean
    paymentName: string

    openOrderDialog(order:OrderBean){
      this.orderSelected=order
      if(this.orderSelected.readyToDmAt){
        this.readyToDmAt=this.orderSelected.readyToDmAt
      }else{
        this.readyToDmAt=10
      }
      
      this.displayOrder=true

      this.orderSelected.products.forEach(element => {
        let priceformat = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(element.price.value)
        this.priceValueFormat.push(priceformat)
      })

      let totalPrice = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(this.orderSelected.total)
      this.totalPriceValueFormat = totalPrice

      this.payment = this.orderSelected.payment

      this.imagenURL = this.payment?.method?.url
      let methodName=this.payment.method.name?.toUpperCase()
      methodName=methodName?methodName:""
      this.paymentName = this.payment.method.type.toUpperCase() + methodName

      setTimeout(() => {
        var button2 = document.getElementById('btnOnClicked')
        button2.click()
      }, 500)
    }

    isOpenDialogMethodImg: boolean = false
    DialogMethodImg(){
      this.isOpenDialogMethodImg = true
    }

    sortOrders(){
      this.ordersOpen=this.orders.filter((order)=>order.status==CONSTANTES.OPEN_ORDER_STATUS &&  this.dmStatusOkay(order))
      this.ordersPreparing=this.orders.filter((order)=>order.status==CONSTANTES.PREPARING_ORDER_STATUS &&  this.dmStatusOkay(order))
      this.ordersReady=this.orders.filter((order)=>order.status==CONSTANTES.READY_ORDER_STATUS &&  this.dmStatusOkay(order))
    }

    dmStatusOkay(order:OrderBean){
      let dmStatusOkay=false
      if(order.deliveryMan){
        dmStatusOkay=order.deliveryMan.status=='toStore' || order.deliveryMan.status=='inStore' 
      }else{
        dmStatusOkay=true
      }
      return dmStatusOkay
    }

    aceptOrder(){
      let orderRequest=JSON.parse(JSON.stringify(this.orderSelected)) as OrderBean
      orderRequest.readyToDmAt=this.readyToDmAt
      this.loadingButtonAcept=true
      this.orderService.aceptOder(orderRequest.id.toString(),orderRequest.readyToDmAt).subscribe((resp)=>{
        this.displayOrder=false
        this.loadingButtonAcept=false
      },()=>{

        this.loadingButtonAcept=false
      },()=>{
      })
    }
    readyOrder(){
      const order=this.orderSelected
      this.loadingButtonAcept=true
      this.orderService.readyOder(order.id.toString()).subscribe((resp)=>{
        this.displayOrder=false
        this.loadingButtonAcept=false
      },()=>{

        this.loadingButtonAcept=false
      },()=>{
      })
    }
    giveOrderToDriver(){

    }

  
    subscribeOrder(orderUuid:string){
      this.mqtt.subscribe("order/"+orderUuid)
    }
    subscribeChat(orderUuid:string){
      this.mqtt.subscribe("chat/"+orderUuid)
    }

    onIncrement(){
      this.readyToDmAt += 5;
    }
    onDecrement() {
      this.readyToDmAt -= 5;
    }
    accordionContent: any
    accordionFunction(){
      
      const accordionContent = document.querySelectorAll(".accordion-item");
      accordionContent.forEach((item, index) => {
        let header = item.querySelector(".header") as HTMLElement | null;
        header.addEventListener("click", ()=> {
          item.classList.toggle("open");

          let description = item.querySelector(".accordion-description") as HTMLElement | null;
          let gridheader = item.querySelector(".grid-quantity") as HTMLElement | null;
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

    openDialogDenyOrder(){
      this.displayOrderReject = true
      this.selectedTab = false
    }

    selectedTab: boolean
    closeModalOrder(){
      this.displayOrderReject = false
      this.selectedTab = false
    }
    
    toggleDisplayDiv(order:OrderBean) {  
      order.showButton =  !order.showButton;
      if(order.showButton){
        order.messagesNoReadTotal=0
        this.getMessages(order)
      }
    }
    getMessages(order:OrderBean){
      console.log("mensajess",this.messagesChat)
      this.messagesChat=[]
      order.isLoadingChat=true
      this.chatService.getMessage(order.uuid).subscribe(
        (resp)=>{
          order.isLoadingChat=false
          order.messagesChat= resp.data.map((message)=>ChatResponse.toBean(message))
        },
        (error)=>{
          order.isLoadingChat=false
        })
    }
    sendMessage(message:ChatBean){
      console.log("message",message)
      this.chatService.sendMessage(ChatBean.toRequest(message)).subscribe((resp)=>{
        
      },
      (error)=>{})
    }
}