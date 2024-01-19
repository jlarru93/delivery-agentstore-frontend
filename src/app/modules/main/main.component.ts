import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ConfirmationService, MessageService } from 'primeng/api';
import { Product } from "src/app/demo/domain/product";
import { ProductService } from "src/app/demo/service/productservice";
import { OrderHandler } from "../service/handlers/order.handler";
//import { MqttService } from "../service/mqtt.service";
import { OrderService } from "./service/order.service";
import { OrderResponse } from "./service/data/response";
import { OrderBean, PaymentBean } from "./data";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
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
import { ChatComponent } from "src/app/chat/chat.component";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { dataSharedService } from "../service/data-shared.service";
import { StoreBean } from "../product/data";
import { setHours, setMinutes, setSeconds } from "ngx-bootstrap/chronos/utils/date-setters";
import { AlertServices } from "../service/alert.service";
import { AceptOrderRequest } from "./service/data/request";
import { interval } from "rxjs";
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
    ordersInRoute:OrderBean[]=[]
    ordersFinis:OrderBean[]=[]
    orderSelected:OrderBean
    readyToDmAt:number=10
    count: number = 10
    readyToDmMinutesAt: number=0
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
    userId: number = 123
    set_interval ?: any

    ref: DynamicDialogRef | undefined;
    idStore:any[]=[]

    isIconUp: boolean = false
    otherReasonOrder: string = ""

    activoColor: boolean = true
    interval_active_color?: any

    constructor(
      public dialogService: DialogService,
      private productService: ProductService,
      private orderService:OrderService,
      private mqtt:MqttService,
      private orderHandler:OrderHandler,
      private storeHandler:StoreHandler,
      private chatHandler:ChatHandler,
      private chatService:ChatService ,
      private messageService:AlertServices,
      private confirmationService: ConfirmationService,
      private dialog: MatDialog,
      private http: HttpClient,
      private auth: AuthService,
      private dataShared:dataSharedService
      ){
        this.dataShared.listStore$.subscribe((data:any)=>{          
          this.idStore=data
          this.getOrders()
        })
      }
    

    ngOnInit(): void { 
      this.idStore= JSON.parse(localStorage.getItem('lstIdStore'))
      this.messageService.showSuccess( 'Success',  'Message Content');
      console.log("MAIN")
      this.productService.getProductsWithOrdersSmall().then(data => this.products = data);
      if(this.idStore)
      this.getOrders()
      this.set_interval = setInterval(()=>{
        if(this.idStore)
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
      this.http.get('../../../assets/styles/print-template.component.scss', {responseType: 'text'}).subscribe(
        styleSheet => {
          this.styleString = styleSheet
        }
      )

      this.interval_active_color = setInterval(() => {
        this.cambiarColor()
      }, 1000)
    }
    ngOnDestroy(): void {
        clearInterval(this.set_interval)
    }
    getUserData(){
      this.userName=this.auth.getParameterToken('name')
      this.userId=Number(this.auth.getParameterToken('id'))
    }

    imagenURL: string = ''

    dialogScreenshoot: boolean = false
    openDialogScreenShoot() {

      this.dialogScreenshoot = true

      // const dialogRef = this.dialog.open(ModalComponent, {
      //   data: {imagenURL: this.imagenURL}
      // });

     this.flagOpenReceiptDialog = true
  
      // dialogRef.afterClosed().subscribe(result => {
      //   console.log('Diálogo cerrado');
      // });

    }

    cambiarColor() {
      this.activoColor = !this.activoColor;
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

    isButtonEnabled: boolean = false
    
  getOrders() {
    var item = this.idStore.map(i => Number(i))
    this.orderService.getOrders(this.idStore).subscribe((resp) => {
     var ord =  resp.data.map((it) => {
        let order = OrderResponse.toBean(it)
        let currentOrden = this.orders.find((or) => or.id == it.id)
        if (currentOrden) {
          order.messagesChat = currentOrden.messagesChat
          order.showButton = currentOrden.showButton;
        }

        return order
      })
      ord.forEach((order) => {        
        let indexOrderExists = this.orders.findIndex(o => o.id == order.id)
        if (indexOrderExists != -1) {
          this.orders[indexOrderExists] = order
        } else {
          this.orders.push(order)
        }
      })
      this.orders=this.orders.filter((da) => item.includes(da.store.id))
      console.log(ord)
      this.sortOrders()
      this.isDoneGetOrders = true
      this.validOrdersSubscribe()

      if (this.orderSelected?.status == 'inStore') {
        this.isButtonEnabled = true;
      } else {
        this.isButtonEnabled = false;
      }
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
            if(orderIndex==-1){
              this.orders.push(orderMqtt)
            }else{
              this.orders[orderIndex]=orderMqtt
            }
            
          }
          this.sortOrders()
        }

      })
      this.storeHandler._data.subscribe((asyncData)=>{
        if(asyncData){
          console.log("Store",asyncData)
          let orderMqtt=OrderResponse.toBean(asyncData.data)
          let indexOrder=this.orders.findIndex(o=>o.id==orderMqtt.id)
          if(indexOrder==-1){
            this.orders.push(orderMqtt)
          }else{
            this.orders[indexOrder]=orderMqtt
          }
          
          this.sortOrders()
          this.subscribeOrder(orderMqtt.uuid)
          this.subscribeChat(orderMqtt.uuid)
          this.isIconUp = true
          this.interval_active_color = setInterval(() => {
            this.cambiarColor()
          }, 1000)
        }
      })
      this.chatHandler._data.subscribe((asyncData)=>{
        if(asyncData && asyncData.data.uuid){
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

    stopAudio(){
      this.storeHandler.stopAudio();
      this.isIconUp = false
      clearInterval(this.interval_active_color)
    }
    priceValueFormat: string[] = []
    totalPriceValueFormat : string
    payment: PaymentBean
    paymentName: string
    storeDataStorage: StoreBean

    openOrderDialog(order:OrderBean){
      this.orderSelected=order
      if(this.orderSelected.readyToDmAt){
        this.readyToDmAt=this.orderSelected.readyToDmAt
      }else{
        this.readyToDmAt=10
      }
      
      if(this.orderSelected.readyToDmMinutesAt){
        this.readyToDmMinutesAt = this.orderSelected.readyToDmMinutesAt
      } else {
        this.readyToDmMinutesAt = 0
      }
      
      this.displayOrder=true

      this.storeDataStorage = JSON.parse(localStorage.getItem('storeBean'))

      // this.orderService.getOrders().subscribe((resp)=>{
      //   if(this.orderSelected.status == 'inStore'){
      //     this.isButtonEnabled = true;
      //   } else {
      //     this.isButtonEnabled = false;
      //   }
      // })

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
      //this.paymentName = this.payment.method.type.toUpperCase() + methodName
      this.paymentName = this.onGetMethodType(this.payment.method.type)
      setTimeout(() => {
        var button2 = document.getElementById('btnOnClicked')
        button2.click()
      }, 500)
    }

    onGetMethodType(method: string){
      let methodConverted: string
      switch(method){
        case 'CARD' : methodConverted = 'Tarjeta de crédito'; break;
        case 'CASH' : methodConverted = 'Efectivo'; break;
        case 'BANK' : methodConverted = 'Cuenta bancaria'; break;
        case 'E-WALLET' : methodConverted = 'Billetera electrónica'; break;
        case 'PAYMENT-BUTTON' : methodConverted = 'PSE' ; break
      }
      return methodConverted 
    }

    isOpenDialogMethodImg: boolean = false
    DialogMethodImg(){
      this.isOpenDialogMethodImg = true
    }

    sortOrders(){
      this.ordersOpen=this.orders.filter((order)=>order.statusForAgentStore==CONSTANTES.OPEN_ORDER_STATUS &&  this.dmStatusOkay(order))
      this.ordersPreparing=this.orders.filter((order)=>order.statusForAgentStore==CONSTANTES.PREPARING_ORDER_STATUS &&  this.dmStatusOkay(order))
      this.ordersReady=this.orders.filter((order)=>order.statusForAgentStore==CONSTANTES.READY_ORDER_STATUS &&  this.dmStatusOkay(order))
      this.ordersInRoute=this.orders.filter((order)=>(order.statusForAgentStore==CONSTANTES.IN_ROUTE_ORDER_STATUS))
      this.ordersFinis = this.orders.filter((order)=>order.statusForAgentStore==CONSTANTES.DONE_ORDER_STATUS)
    }

    dmStatusOkay(order:OrderBean){
      let dmStatusOkay=false
      if(order?.deliveryMan){
        dmStatusOkay=order.deliveryMan.status=='toStore' || order.deliveryMan.status=='inStore' 
      }else{
        dmStatusOkay=true
      }
      return dmStatusOkay
    }

    flagOpenReceiptDialog: boolean = false

    aceptOrder(){
      let orderRequest=JSON.parse(JSON.stringify(this.orderSelected)) as OrderBean
      orderRequest.readyToDmAt=this.readyToDmAt
      this.loadingButtonAcept=true

      if(['CARD','CASH','PAY_IN_STORE','PAYMENT-BUTTON'].includes(orderRequest.payment.method.type)){
        this.orderService.aceptOder(orderRequest.id.toString(),orderRequest.readyToDmAt).subscribe((resp)=>{
          this.displayOrder=false
          this.loadingButtonAcept=false
        },()=>{
  
          this.loadingButtonAcept=false
        },()=>{
        })
      } else {
        if(!this.flagOpenReceiptDialog){
          this.messageService.showWarning('', 'Por favor revise el comprobante de pago primero')
          this.loadingButtonAcept = false
        } else {
          this.orderService.aceptOder(orderRequest.id.toString(),orderRequest.readyToDmAt).subscribe((resp)=>{
            this.displayOrder=false
            this.loadingButtonAcept=false
          },()=>{
    
            this.loadingButtonAcept=false
          },()=>{
          })
        }
      }

    }
    readyOrder(){
      const order=this.orderSelected
      this.loadingButtonAcept=true
      var body:any
      if(order.isPickUpStore){
        body={status:CONSTANTES.DONE_ORDER_STATUS} as AceptOrderRequest
      }else{
        body={status:CONSTANTES.READY_ORDER_STATUS} as AceptOrderRequest
      }
      this.orderService.readyOder(order.id.toString(),body).subscribe((resp)=>{
        this.displayOrder=false
        this.loadingButtonAcept=false
      },()=>{

        this.loadingButtonAcept=false
      },()=>{
      })
    }

    loadingButtonCancel: boolean = false
    cancelOrder(comment: string){

      if(this.accordionIndex == 6 && this.otherReasonOrder == ''){
        this.messageService.showError('', 'Por favor llene la casilla con el motivo del rechazo de orden')
      } else {

        let orderRequest=JSON.parse(JSON.stringify(this.orderSelected)) as OrderBean
        this.loadingButtonCancel=true
        this.orderService.cancelOrder(orderRequest.id.toString(),comment).subscribe((resp) => {
          this.orders=this.orders.filter((order)=>order.id!=orderRequest.id)
          this.sortOrders()
          this.displayOrderReject = false
          this.loadingButtonCancel = false
          this.displayOrder = false
          this.messageService.showSuccess('Exito',  'Orden cancelado' );
        }, (error:HttpErrorResponse) => {
          this.displayOrderReject = false
          this.loadingButtonCancel = false
          this.messageService.showError( 'Error' , error.message );
        })
      }

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
      this.readyToDmMinutesAt +=5;
    }
    onDecrement() {
      this.readyToDmAt -= 5;
      this.readyToDmMinutesAt -=5;
    }
    
    accordionContent: any
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

    openDialogDenyOrder(){
      this.displayOrderReject = true
      this.otherReasonOrder
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
    

    hideChatComponent(order:OrderBean){
      order.showButton =  !order.showButton;
    }

    @ViewChild(ChatComponent) chatComponent!: ChatComponent;

    getMessages(order:OrderBean){
      console.log("mensajess",this.messagesChat)
      this.messagesChat=[]
      order.isLoadingChat=true
      this.chatService.getMessage(order.uuid).subscribe(
        (resp)=>{
          order.isLoadingChat=false
          order.messagesChat= resp.data.map((message)=>ChatResponse.toBean(message))
          //this.chatComponent.scrollToBottom()
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
     tiempoReadyToDmAt:string
     ReadyToDmAt:string
    formatearTiempo(timestamp: number): string {
      const fecha = new Date(timestamp * 1000);
      const horas = fecha.getHours();
      const minutos = fecha.getMinutes();
      const segundos = fecha.getSeconds();
      let tiempoFormateado = `${this.agregarCeros(horas)}:${this.agregarCeros(minutos)}:${this.agregarCeros(segundos)}`;
      this.tiempoReadyToDmAt=`${this.agregarCeros(horas)}:${this.agregarCeros(minutos)}:${this.agregarCeros(segundos)}`
      if(!this.ReadyToDmAt){
        this.ReadyToDmAt=this.tiempoReadyToDmAt
      }
      // Agregar designación AM/PM
      if (horas >= 12) {
        tiempoFormateado += ' PM';
      } else {
        tiempoFormateado += ' AM';
      }
    
      return tiempoFormateado;
    }

    styleString: string = '';
    
    agregarCeros(valor: number): string {
      return valor < 10 ? `0${valor}` : valor.toString();
    }

    printToPDF(){
      const printArea: HTMLElement = document.getElementById('pdf');
      const printWindow = window.open('','PRINT')!;
      printWindow.document.write(`<html><head><style>${this.styleString}</style></head><body>${printArea.innerHTML}</body></html>`)
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      },1000) 
    }

    sendMessageWhatsApp(phoneNumber: string){
      const url = `https://wa.me/${phoneNumber}`;
      window.open(url, '_blank');
    }

    calculateTime(createdAt: number) {
      const tiempoActual = new Date();
      const tiempoCreacion = new Date(createdAt*1000);
      const diferencia = (tiempoActual.getTime() - tiempoCreacion.getTime());
      const daysDifference = Math.floor(diferencia / (1000 * 60 * 60 * 24));
      const hoursDifference = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesDifference = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
      var day= daysDifference>0?daysDifference+'d ':''
      var res = (day+' '+hoursDifference+'h '+minutesDifference).toString()
      return res;
    }

  updateTimes(item: OrderBean) {
    // var [hora, minuto, segundo] = this.ReadyToDmAt.split(':');
    // var newDate = new Date()
    // newDate.setHours(+hora);
    // newDate.setMinutes(+minuto);
    // newDate.setSeconds(+segundo);

    var json = {
      uuid: item.uuid,
      readyToDmAt: this.orderSelected.createdAt + (this.readyToDmMinutesAt * 60),
      readyToDmMinutesAt: this.readyToDmMinutesAt
    }

    this.orderService.UpdateReadyToDm(json).subscribe((response) => {
      setTimeout(() => {
        this.displayOrder = false
      }, 1500);
      console.log(response)
      this.messageService.showSuccess('', 'El tiempo estimada modificado')
    }, (error: HttpErrorResponse) => {
      this.messageService.showSuccess('Error', error.message)
    })
  }
  selfManagedOrder(item: OrderBean){
    this.orderService.selfManagedOrder(item.uuid).subscribe((respons)=>{
      console.log(respons)
      setTimeout(() => {
        this.displayOrder = false
      }, 1500);
      this.getOrders()
      this.messageService.showSuccess('', 'Orden Autogestionado')
    },(error:HttpErrorResponse)=>{
      if(error.status==400){
        error.error.messages.forEach(element => {
          this.messageService.showError('Error',element.message)
        });
      }else{
        this.messageService.showError('Error',error.message)
      }
      console.log(error)
    })
  }

  
  finishOrder(item: OrderBean){
    var json={
      status:"done"
    }
    this.orderService.UpdateStatus(item.id,json).subscribe((respons)=>{
      console.log(respons)
      setTimeout(() => {
        this.displayOrder = false
      }, 1500);
      this.getOrders()
      this.messageService.showSuccess('', 'Orden Terminado')
    },(error:HttpErrorResponse)=>{
      if(error.status==400){
        error.error.messages.forEach(element => {
          this.messageService.showError('Error',element.message)
        });
      }else{
        this.messageService.showError('Error',error.message)
      }
      console.log(error)
    })
  }

  accordionIndex: number = 0
  onTabOpen(event) {
    
    this.accordionIndex = event.index;
  }
}