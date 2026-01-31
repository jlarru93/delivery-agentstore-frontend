import { AfterViewInit, Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProductService } from "src/app/demo/service/productservice";
import { OrderService } from "./service/order.service";
import { UnreadMessagesResponse } from "./service/data/response";
import { OrderBean, PaymentBean } from "./data";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import * as CONSTANTES from "src/app/utils/constant";
import { animate, style, transition, trigger } from "@angular/animations";
import { ChatResponse } from "./service/data/chat.response";
import { ChatService } from "./service/chat.service";
import { ChatBean } from "src/app/chat/data.chat";
import { AuthService } from "src/app/utils/auth.service";
import { MatDialog } from "@angular/material/dialog";
import { ChatComponent } from "src/app/chat/chat.component";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { StoreBean } from "../product/data";
import { AlertServices } from "../service/alert.service";
import { AceptOrderRequest } from "./service/data/request";
import { AudioService } from "../service/audio.service";
import { OrderRepository } from "./service/order.repository";
import { ActivatedRoute, Router } from "@angular/router";
import { ClipboardService } from "ngx-clipboard";
import { DomSanitizer } from "@angular/platform-browser";
//import { NgxPrinterService } from "ngx-printer";
@Component({
    selector: 'app-stores',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss','./cards-compact-styles.scss','cards-compact-styles.preparing.scss','cards-compact-styles.ready.scss'],
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
  export class MainComponent implements OnInit,OnDestroy,AfterViewInit {
    minutes: number = 2;
    displayOrder:boolean=false
    //products: Product[];
    orders:OrderBean[]=[]
    ordersOpen:OrderBean[]=[]
    ordersPreparing:OrderBean[]=[]
    ordersReady:OrderBean[]=[]
    ordersInRoute:OrderBean[]=[]
    ordersFinis:OrderBean[]=[]
    orderSelected:OrderBean
    readyToDmAt:number=15
    count: number = 10
    readyToDmMinutesAt: number=0
    displayOrderReject: boolean = false

    title:string="Por Aceptar"

    modal : HTMLDialogElement
    popup : any 

    loadingButtonAcept:boolean=false
    isLoadingButtonOrderReady:boolean=false

    isDisplayOrderReadyModalConfirm:boolean = false
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

    isInitRequest:boolean=true
    ordersWithUnreadMessages: any
    isShowOrderCancel:boolean = false
    orderId:number=null

    received_by_store_method_available:string[] =["CASH","YAPE","PLIN","OTROS"]
    isLoadingReceived_by_store_method_available:boolean=false
    private visibilityChangeCallback: () => void;

    constructor(
      public dialogService: DialogService,
      private productService: ProductService,
      private orderService:OrderService,
      //private mqtt:MqttService,
      //private orderHandler:OrderHandler,
      //private storeHandler:StoreHandler,
      //private chatHandler:ChatHandler,
      private chatService:ChatService ,
      private messageService:AlertServices,
      private confirmationService: ConfirmationService,
      private dialog: MatDialog,
      private http: HttpClient,
      private auth: AuthService,
      //private dataShared:DataSharedService,
      private orderRepository:OrderRepository,
      public audioService:AudioService,
      private ngZone: NgZone,
      private router: Router,
      private route: ActivatedRoute,
      private readonly clipboardService:ClipboardService,
      private sanitizer: DomSanitizer
      ){
        
      }
    
    suscribers(){
        this.orderRepository.orders.subscribe((order)=>{
          this.orders=order
          console.log("Order:::",order)
          this.sortOrders()
          if(this.orders.length > 0){
            if (!this.audioService.audioAlreadyPlayed) {
                this.audioService.audioAlreadyPlayed = true;
                this.audioService.stopAudio()
                if(this.orders){
                  let requestBody = {
                    orderUuids: this.orders.map(order => order.uuid)
                  }
                  this.orderService.onGetUnreadMessages(requestBody).subscribe(
                    (resp) => {
                      this.ordersWithUnreadMessages = resp.data.map((um) => UnreadMessagesResponse.toBean(um))
                      this.onUpdateUnreadMessages(this.ordersOpen);
                      this.onUpdateUnreadMessages(this.ordersPreparing);
                      this.onUpdateUnreadMessages(this.ordersReady);
                      this.onUpdateUnreadMessages(this.ordersInRoute);
                      this.onUpdateUnreadMessages(this.ordersFinis);
                    },
                    (error) => {
                      this.messageService.showError('Error', error.error.messages[0].message)
                    }
                  )
                }
            } else {
              
              this.router.navigateByUrl('/')
              // Maximizar la ventana del navegador
              window.focus(); // Asegurarse de que la ventana esté enfocada
              window.scrollTo(0, 0); // Desplazar hasta la parte superior de la página
              window.innerWidth = screen.width; // Establecer el ancho de la ventana al ancho de la pantalla
              window.innerHeight = screen.height;
            }
          }
        })
        this.orderRepository.orderCancel.subscribe(order=>{
          if(order==null){return}
          const hasCancel = order.statusHistory && order.statusHistory.some(history => 
            history.status === "cancel" && 
            history.executeFor && 
            history.executeFor.userType === "user-app"
          );
          console.log("hasCancel",hasCancel)
          if (hasCancel) {
            this.isShowOrderCancel = true
            this.orderId = order.id
          } 
        })
        this.orderRepository.orderChat.subscribe((order)=>{
          console.log("this.orderRepository.orderChat.subscribe",order)
          const indexOrder=this.orders.findIndex(o=>o.id===order.id)
          this.orders[indexOrder]=order
        })
    }
    flagAudio: boolean
    fullScreenSideBar: boolean = false
    isWelcomeDialogOpen: boolean = true
    ngOnInit(): void { 
      this.suscribers();
      this.orderRepository.start()
      this.visibilityChangeCallback = this.handleVisibilityChange.bind(this);
      document.addEventListener('visibilitychange', this.visibilityChangeCallback);

      this.route.queryParams.subscribe(params => {
        // const orderId = +params['order'] || 0; 
        // if (orderId) {
        //     this.orderRepository.getOrderById(orderId).subscribe((order: OrderBean) => {
        //         this.openOrderDialog(order);
        //     });
        // }
    });

      this.idStore= JSON.parse(localStorage.getItem('lstIdStore'))
      this.flagAudio = JSON.parse(localStorage.getItem('audioEnabled'))
      //this.messageService.showSuccess( 'Success',  'Message Content');
      
      //this.productService.getProductsWithOrdersSmall().then(data => this.products = data);
      //if(this.idStore)
      //this.getOrders()
      /*this.set_interval = setInterval(()=>{
        if(this.idStore)
        this.getOrders()
      },30000)*/
      /*this.mqtt._onConnect.subscribe((isConnect)=>{
        if(isConnect){
          this.isMqttConnect=isConnect
          this.mqttListener()
          this.validOrdersSubscribe()
        }
      })*/
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

    onUpdateUnreadMessages(orders: any[]){
      for (let order of orders) {
        let matchingResponse = this.ordersWithUnreadMessages.find((item) => item.uuid === order.uuid);
        if (matchingResponse) {
          order.messagesNoReadTotal = matchingResponse.messagesNoReadTotal;
        }
      }
    }

    handleVisibilityChange(): void {
      if (!document.hidden) {
        // Aquí colocarías la lógica para verificar si la acción que desencadena el enfoque ha ocurrido
        // Por ejemplo, podrías verificar si hay nuevos mensajes o alguna otra condición relevante
  
        // Si se cumple la condición, intenta enfocar la ventana
        this.ngZone.runOutsideAngular(() => {
          window.focus();
        });
      }
    }

    ngOnDestroy(): void {
        document.removeEventListener('visibilitychange', this.visibilityChangeCallback);
        //this.orderRepository.destroy()
        this.orderRepository.stop()
    }
    getUserData(){
      this.userName=this.auth.getParameterToken('name')
      this.userId=Number(this.auth.getParameterToken('id'))
    }

    requestAudioPermission() {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          console.log('Permiso de audio concedido');
          // Puedes continuar con la lógica de tu aplicación que involucre audio aquí
        })
        .catch(error => {
          console.log('Error al obtener el permiso de audio:', error);
          // Puedes manejar el error de alguna manera (por ejemplo, mostrando un mensaje al usuario)
        });
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
      //console.log("ngAfterViewInit")
      //this.orderRepository.start()
      const accordionContent = document.querySelectorAll(".accordion-item");
      
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

    /*validOrdersSubscribe(){
      if(this.isMqttConnect && this.isDoneGetOrders){
        this.orders.forEach((order)=>{
          this.subscribeOrder(order.uuid)
          this.subscribeChat(order.uuid)
        })
      }
    }*/

    isButtonEnabled: boolean = false
    
  /*getOrders() {
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
      let soundIt=false
      ord.forEach((order) => {        
        let indexOrderExists = this.orders.findIndex(o => o.id == order.id)
        if (indexOrderExists != -1) {
          this.orders[indexOrderExists] = order
          if(!this.isInitRequest && order.status===CONSTANTES.OPEN_ORDER_STATUS){
            soundIt=true
          }
        } else {
          this.orders.push(order)
        }
      })
      if(soundIt){
        if(this.flagAudio == null){
          this.isIconUp = false
        } else {
          this.isIconUp = true
        }
        this.audioService.onPlayAudio()
      }
      this.isInitRequest=false
      this.orders=this.orders.filter((da) => item.includes(da.store.id))
      console.log(ord)
      this.sortOrders()
      this.isDoneGetOrders = true
      //this.validOrdersSubscribe()

      if (this.orderSelected?.status == 'inStore') {
        this.isButtonEnabled = true;
      } else {
        this.isButtonEnabled = false;
      }
    })
  }*/
    mqttListener(){
      /*this.orderHandler._data.subscribe((asyncData)=>{
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
              if(!this.isInitRequest && orderMqtt.status===CONSTANTES.OPEN_ORDER_STATUS){
                if(this.flagAudio == null){
                  this.isIconUp = false
                } else {
                  this.isIconUp = true
                }
                this.audioService.onPlayAudio()
              }
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
            if(!this.isInitRequest && orderMqtt.status===CONSTANTES.OPEN_ORDER_STATUS){
              if(this.flagAudio == null){
                this.isIconUp = false
              } else {
                this.isIconUp = true
              }
              this.audioService.onPlayAudio()
            }
          }else{
            this.orders[indexOrder]=orderMqtt
          }
          
          this.sortOrders()
          //this.subscribeOrder(orderMqtt.uuid)
          //this.subscribeChat(orderMqtt.uuid)
          this.isIconUp = true
          this.interval_active_color = setInterval(() => {
            this.cambiarColor()
          }, 1000)
        }
      })*/
      /*this.chatHandler._data.subscribe((asyncData)=>{
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
      })*/
    }

    stopAudio(){
      this.audioService.stopAudio();
      //this.isIconUp = false
      //clearInterval(this.interval_active_color)
    }
    priceValueFormat: string[] = []
    totalPriceValueFormat : string
    payment: PaymentBean
    paymentName: string
    storeDataStorage: StoreBean

    openOrderDialog(order:OrderBean){
      this.orderSelected=order
      this.displayOrder=true
    }

    onCloseOrderDetail(){
      this.displayOrder = false
      this.flagOpenReceiptDialog = false
      this.router.navigate([], { queryParams: { order: null }, queryParamsHandling: 'merge' });
    }

    /**
     * Editar orden de comercio (SendAndReciveStore)
     * Solo disponible si no tiene motorizado asignado
     */
    editCommerceOrder(order: OrderBean) {
      if (!order.canEdit()) {
        this.messageService.showInfo( 'No editable', 'Esta orden ya tiene motorizado asignado. Contacte a CallCenter para modificarla.');
        return;
      }
      
      // Navegar al micro-frontend de edición de órdenes
      // TODO: Ajustar URL según ambiente (dev/qa/prod)
      const microFrontendUrl = `/order/edit/${order.uuid}`;
      this.router.navigate([microFrontendUrl]);
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
      this.ordersFinis = this.orders.filter((order)=>order.statusForAgentStore==CONSTANTES.DONE_ORDER_STATUS).reverse()
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
        this.orderRepository.aceptOder(orderRequest.uuid,orderRequest.readyToDmAt).subscribe((resp)=>{
          this.displayOrder=false
          this.loadingButtonAcept=false
          this.messageService.showSuccess('', 'Operación realizado con exito')
        },(error)=>{
          this.messageService.showError('Error', error.error.messages[0].message)
          this.loadingButtonAcept=false
        })
      } else {
        if(!this.flagOpenReceiptDialog){
          this.messageService.showWarning('', 'Por favor revise el comprobante de pago primero, Dar click en el boton del ojo')
          this.loadingButtonAcept = false
          this.openDialogScreenShoot()
        } else {
          this.orderRepository.aceptOder(orderRequest.uuid,orderRequest.readyToDmAt).subscribe((resp)=>{
            this.displayOrder=false
            this.loadingButtonAcept=false
            this.messageService.showSuccess('', 'Operación realizado con exito')
          },(error)=>{
            this.messageService.showError('Error', error.error.messages[0].message)
            this.loadingButtonAcept=false
          })
        }
      }

    }
    readyOrder(){
      const order=this.orderSelected
      this.loadingButtonAcept=true
      this.isLoadingButtonOrderReady=true
      var body:AceptOrderRequest
      if(order.isPickUpStore){
        body={uuid:order.uuid,status:CONSTANTES.DONE_ORDER_STATUS} as AceptOrderRequest
      }else{
        body={uuid:order.uuid,status:CONSTANTES.READY_ORDER_STATUS} as AceptOrderRequest
      }
      this.orderRepository.readyOder(order.uuid,body).subscribe((resp)=>{
        this.displayOrder=false
        this.loadingButtonAcept=false
        this.isLoadingButtonOrderReady=false
        this.isDisplayOrderReadyModalConfirm=false
        this.messageService.showSuccess('', 'Operación realizado con exito')
      },(error)=>{
        this.messageService.showError('Error', error.error.messages[0].message)
        this.loadingButtonAcept=false
        this.isLoadingButtonOrderReady=false
      })
    }

    loadingButtonCancel: boolean = false
    cancelOrder(comment: string){

      if(this.accordionIndex == 6 && this.otherReasonOrder == ''){
        this.messageService.showError('', 'Por favor llene la casilla con el motivo del rechazo de orden')
      } else {

        let orderRequest=JSON.parse(JSON.stringify(this.orderSelected)) as OrderBean
        this.loadingButtonCancel=true
        this.orderRepository.cancelOrder(orderRequest.uuid,comment).subscribe((resp) => {
          this.displayOrderReject = false
          this.loadingButtonCancel = false
          this.displayOrder = false
          this.isDisplayOrderReadyModalConfirm=false
          this.messageService.showSuccess('Exito',  'Orden : '+resp.id+' cancelada' );
        }, (error:HttpErrorResponse) => {
          this.displayOrderReject = false
          this.loadingButtonCancel = false
          this.messageService.showError( 'Error' , error.message );
        })
      }

    }

    giveOrderToDriver(){

    }

  
    /*subscribeOrder(orderUuid:string){
      this.mqtt.subscribe("order/"+orderUuid)
    }
    subscribeChat(orderUuid:string){
      this.mqtt.subscribe("chat/"+orderUuid)
    }*/

    onIncrement(){
      this.readyToDmAt += 5;
      this.readyToDmMinutesAt +=5;
    }
    onDecrement() {
      console.log(this.readyToDmAt)
      console.log(this.readyToDmMinutesAt)
      if(this.readyToDmAt >=0 && this.readyToDmMinutesAt >= 5){
        this.readyToDmAt -= 5;
        this.readyToDmMinutesAt -=5;
      }
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
          this.messageService.showError('Error', error.error.messages[0].message)
        })
    }
    sendMessage(message:ChatBean){
      console.log("message",message)
      this.chatService.sendMessage(ChatBean.toRequest(message)).subscribe((resp)=>{
        
      },
      (error)=>{
        this.messageService.showError('Error', error.error.messages[0].message)
      })
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
      const tiempoCreacion = new Date(createdAt * 1000);
      const diferencia = tiempoActual.getTime() - tiempoCreacion.getTime();

      const hoursDifference = Math.floor(diferencia / (1000 * 60 * 60));
      const minutesDifference = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60)); 

      const res = `${hoursDifference}h ${minutesDifference}`.toString(); 
      return res;
    }

    calculateTimeOrderEnd(createdAt: number) {
      const tiempoCreacion = new Date(createdAt * 1000);
      
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      
      const formattedDate = new Intl.DateTimeFormat('es-ES', options).format(tiempoCreacion);
      
      return formattedDate;
    }

  loadingButtonUpdateTime : boolean = false

  updateTimes(item: OrderBean) {
    this.loadingButtonUpdateTime = true
    console.log("ITEM:::",item.readyToDmMinutesAt)
    var json = {
      uuid: item.uuid,
      readyToDmAt: this.orderSelected.createdAt + (this.readyToDmMinutesAt * 60),
      readyToDmMinutesAt: this.readyToDmMinutesAt
    }

    if(this.readyToDmMinutesAt >= item.readyToDmMinutesAt){
      this.orderRepository.updateReadyToDm(json).subscribe((response) => {
        setTimeout(() => {
          this.displayOrder = false
        }, 1500);
       
        const indexOrderPreparing = this.ordersPreparing.findIndex(order => order.id == item.id)
        const indexOrderReady = this.ordersReady.findIndex(order => order.id == item.id)
  
        if(indexOrderPreparing !== -1){
          this.ordersPreparing[indexOrderPreparing].readyToDmMinutesAt = this.readyToDmMinutesAt;
        } else {
          this.ordersReady[indexOrderReady].readyToDmMinutesAt = this.readyToDmMinutesAt;
        }
        this.loadingButtonUpdateTime = false
        console.log(response)
        this.messageService.showSuccess('', 'El tiempo estimada modificado')
      }, (error) => {
        this.messageService.showError('Error', error.error.messages[0].message)
        this.loadingButtonUpdateTime = false
      })
    }
    else{
      this.messageService.showError('Error', 'El tiempo de preparacion debe ser mayor que el tiempo actual')
      this.loadingButtonUpdateTime = false
    }
  }
  isSelfManagedOrderLoading: boolean = false

  selfManagedOrder(item: OrderBean){
    this.isSelfManagedOrderLoading = true
    this.orderRepository.selfManagedOrder(item.uuid).subscribe((respons)=>{
      console.log(respons)
      setTimeout(() => {
        this.displayOrder = false
      }, 1500);
      //this.getOrders()
      this.messageService.showSuccess('', 'Orden Autogestionado')
      this.isSelfManagedOrderLoading = false
    },(error:HttpErrorResponse)=>{
      if(error.status==400){
        error.error.messages.forEach(element => {
          this.messageService.showError('Error',element.message)
        });
      }else{
        this.messageService.showError('Error',error.message)
      }
      console.log(error)
      this.isSelfManagedOrderLoading = false
    })
  }

  isFinishOrderLoading: boolean = false
  
  finishOrder(item: OrderBean){
    this.isFinishOrderLoading = true
    var json={
      status:"done",
      uuid:item.uuid
    }
    this.orderRepository.updateStatus(item.uuid,json).subscribe((respons)=>{
      console.log(respons)
      setTimeout(() => {
        this.displayOrder = false
      }, 1500);
      //this.getOrders()
      this.messageService.showSuccess('', 'Orden Terminado')
      this.isFinishOrderLoading = false
    },(error:HttpErrorResponse)=>{
      if(error.status==400){
        error.error.messages.forEach(element => {
          this.messageService.showError('Error',element.message)
        });
      }else{
        this.messageService.showError('Error',error.message)
      }
      this.isFinishOrderLoading = false
      console.log(error)
    })
  }

  accordionIndex: number = 0
  onTabOpen(event) {
    
    this.accordionIndex = event.index;
  }

  onDownloadLoading: boolean = false
  onDownloadScrenshoot(imagenURL){
    this.onDownloadLoading = true
    this.onSaveScreenShoot(imagenURL)
    
  }
  onSaveScreenShoot(imagenURL){
    const urlImagen = imagenURL;
    const nombreArchivo = 'screen_shoot.jpg';
    const link = document.createElement('a');
    link.href = urlImagen;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.onDownloadLoading = false
  }
  onGetDocumentType(type){
    let documentType: string
    switch (type) {
      case 'CC' : documentType = 'Cédula'; break;
      case 'CE' : documentType = 'Carnet de extranjería'; break;
    }
    return documentType
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
  copyClipBoard(value:string){
    this.clipboardService.copy(value)
    this.messageService.showSuccess('', 'copiado!')
  }

  changeReceivedByStoreMethodAvailable(){
    const uuid=this.orderSelected.uuid;
    const received_by_store_method=this.orderSelected.payment.method.received_by_store_method;
    this.isLoadingReceived_by_store_method_available=true
    this.orderService.updateReceivedByStoreMethodAvailable(uuid,received_by_store_method).subscribe(
      (resp)=>{
        this.isLoadingReceived_by_store_method_available=false
        this.messageService.showSuccess('', 'Se Actualizo recepción de dinero')
      },
      (error)=>{
        this.isLoadingReceived_by_store_method_available=false
        if(error.status==400){
          error.error.messages.forEach(element => {
          this.messageService.showError('Error',element.message)
        });
        }else{
          this.messageService.showError('Error',error.message)
        }
      }
    )
  }


  /**
   * Obtiene solo el primer nombre del cliente
   */
  getFirstName(order: OrderBean): string {
    // Para órdenes de comercio, usar addresses[1].receptorName
    const clientName = order.getClientName();
    if (clientName) {
      // Extraer solo el primer nombre
      const firstName = clientName.split(' ')[0];
      return firstName || 'Cliente';
    }
    return order?.user?.name || 'Cliente';
  }

  /**
   * Obtiene la clase CSS según el tiempo transcurrido
   */
  getTimeClass(createdAt: number): string {
    const minutes = this.getMinutesSinceCreation(createdAt);
    if (minutes >= 30) return 'time-urgent';
    if (minutes >= 15) return 'time-warning';
    return 'time-normal';
  }

  /**
   * Calcula minutos desde creación
   */
  getMinutesSinceCreation(createdAt: number): number {
    const now = new Date().getTime();
    const created = new Date(createdAt * 1000).getTime();
    return Math.floor((now - created) / (1000 * 60));
  }

  /**
   * Obtiene el icono SVG según el método de pago
   */
  getPaymentIcon(order: OrderBean) {
    const method = order?.payment?.method?.type?.toUpperCase() || 'CASH';
    const aplication= order?.payment?.method.name
    const icons = {
      'CASH': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="Efectivo">
        <rect x="2" y="5" width="20" height="14" rx="3" fill="#16A085"/>
        <rect x="4" y="7" width="16" height="10" rx="2" fill="#1ABC9C"/>
        <text x="12" y="14" text-anchor="middle" font-size="6.5" font-family="Arial, Helvetica, sans-serif" fill="#ECFDF5" font-weight="bold">S/</text>
      </svg>`,
      
      'YAPE': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="24" height="24" aria-label="Yape billetera electrónica" role="img">
        <defs>
          <linearGradient id="yapeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#6B21A8"/>
            <stop offset="100%" stop-color="#9333EA"/>
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="240" height="240" rx="48" fill="url(#yapeGradient)"/>
        <circle cx="128" cy="78" r="34" fill="#2DD4BF"/>
        <text x="128" y="88" text-anchor="middle" font-size="36" font-weight="700" font-family="Arial Rounded MT Bold, Arial, Helvetica, sans-serif" fill="#6B21A8">S/</text>
        <text x="128" y="198" text-anchor="middle" font-size="88" font-weight="700" font-family="Arial Rounded MT Bold, Arial, Helvetica, sans-serif" fill="#FFFFFF">yape</text>
      </svg>`,
      
      'PLIN': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 260" width="24" height="24" aria-label="Plin billetera electrónica" role="img">
        <defs>
          <linearGradient id="plinGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#2F80ED"/>
            <stop offset="100%" stop-color="#00E5C0"/>
          </linearGradient>
        </defs>
        <path d="M70 40 C20 70, 10 150, 60 190 C90 220, 150 240, 210 215 C250 200, 280 160, 270 120 C260 70, 210 20, 140 20 C110 20, 90 25, 70 40 Z" fill="url(#plinGradient)"/>
        <text x="150" y="155" text-anchor="middle" font-size="92" font-weight="700" font-family="Arial Rounded MT Bold, Arial, Helvetica, sans-serif" fill="#FFFFFF">plin</text>
        <circle cx="166" cy="95" r="9.5" fill="#FF4DA6"/>
      </svg>`,
      
      'CARD': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-label="Tarjeta de crédito" role="img">
        <rect x="2" y="5" width="20" height="14" rx="3" fill="#2563EB"/>
        <rect x="2" y="8" width="20" height="3" fill="#1E40AF"/>
        <rect x="6" y="12" width="4.5" height="3.2" rx="0.6" fill="#FACC15"/>
        <rect x="6.8" y="12.6" width="2.9" height="2" rx="0.4" fill="#FDE68A"/>
        <rect x="12" y="13.2" width="6" height="1.2" rx="0.6" fill="#E0E7FF"/>
      </svg>`,
      
      'POS': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-label="Tarjeta de crédito" role="img">
        <rect x="2" y="5" width="20" height="14" rx="3" fill="#2563EB"/>
        <rect x="2" y="8" width="20" height="3" fill="#1E40AF"/>
        <rect x="6" y="12" width="4.5" height="3.2" rx="0.6" fill="#FACC15"/>
        <rect x="6.8" y="12.6" width="2.9" height="2" rx="0.4" fill="#FDE68A"/>
        <rect x="12" y="13.2" width="6" height="1.2" rx="0.6" fill="#E0E7FF"/>
      </svg>`,
      
      'BANK': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-label="Transferencia bancaria" role="img">
        <path d="M4 10L12 5L20 10V12H4V10Z" fill="#2563EB"/>
        <rect x="5" y="12" width="2.5" height="6" fill="#1E40AF"/>
        <rect x="8.75" y="12" width="2.5" height="6" fill="#1E40AF"/>
        <rect x="12.5" y="12" width="2.5" height="6" fill="#1E40AF"/>
        <rect x="16.25" y="12" width="2.5" height="6" fill="#1E40AF"/>
        <rect x="4" y="18" width="16" height="2" rx="1" fill="#1E40AF"/>
        <path d="M7 9H13L11.5 7.5" stroke="#E0E7FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M17 14H11L12.5 15.5" stroke="#E0E7FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>`,
      
      'CREDIT': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-label="Crédito del comercio - Ya cobrado" role="img">
        <!-- Fondo circular naranja -->
        <circle cx="12" cy="12" r="11" fill="#F97316"/>
        <!-- Tienda/Comercio -->
        <path d="M6 10V17H18V10" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <!-- Techo de tienda -->
        <path d="M4 10L12 5L20 10" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Puerta -->
        <rect x="10" y="13" width="4" height="4" fill="white" rx="0.5"/>
        <!-- Check de cobrado -->
        <circle cx="17" cy="7" r="4" fill="#22C55E"/>
        <path d="M15 7L16.5 8.5L19 5.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>`
    };

    if(method=="CREDIT"){
      return this.sanitizer.bypassSecurityTrustHtml(icons['CREDIT']);
    }
    if(method=="CASH"){
      return this.sanitizer.bypassSecurityTrustHtml(icons['CASH']);
    }
    if(method=="E-WALLET" && aplication=="Yape"){
      return this.sanitizer.bypassSecurityTrustHtml(icons['YAPE']);
    }
    if(method=="E-WALLET" && aplication?.toLowerCase()=="plin"){
      return this.sanitizer.bypassSecurityTrustHtml(icons['PLIN']);
    }
    if(method=="BANK"){
      return this.sanitizer.bypassSecurityTrustHtml(icons['BANK']);
    }
    if(method=="CARD"){
      return this.sanitizer.bypassSecurityTrustHtml(icons['CARD']);
    }

    return this.sanitizer.bypassSecurityTrustHtml(icons['CASH']);
  }

  /**
   * Obtiene el label del método de pago
   */
  getPaymentLabel(order: OrderBean): string {
    const method = order?.payment?.method?.type?.toUpperCase() || 'CASH';
    const aplication = order?.payment?.method?.name;
    
    if (method === 'E-WALLET') {
      if (aplication === 'Yape') return 'YAPE';
      if (aplication?.toLowerCase() === 'plin') return 'PLIN';
      return aplication || 'BILLETERA';
    }
    
    const labels = {
      'CASH': 'EFECTIVO',
      'CARD': 'TARJETA',
      'POS': 'POS',
      'BANK': 'TRANSFERENCIA',
      'CREDIT': 'CRÉDITO COMERCIO',
      'PAY_IN_STORE': 'PAGO EN TIENDA'
    };
    return labels[method] || 'EFECTIVO';
  }

  /**
   * Abre WhatsApp con el número del cliente
   */
  openWhatsApp(phoneNumber: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (phoneNumber) {
      const url = `https://wa.me/${phoneNumber}`;
      window.open(url, '_blank');
    }
  }
}