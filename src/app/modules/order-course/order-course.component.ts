import { Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
} from "@angular/core";
import { Viaje } from "./data";
import { LatLngLiteral, MouseEvent } from "src/agm/core";
import { RequestTripService } from "../request-trip/services/request-trip.service";
import {
  AddressResponseLoadingOrder,
  ResponseLoadingOrder,
  ResponseOrderPayment,
} from "../request-trip/data/response";
import { RequestGeoAutocomplete } from "src/app/directives/informacion/data/serviceGeo";
import {
  PersonalisationMarker,
  PersonalisationPolyline,
  TypeMarkers,
} from "src/app/directives/informacion/data/enumMapa";
import * as UtilModalViaje from "../request-trip/util-modal-viaje-corporate";
import { OrderBean } from "../main/data";
import { ChatBean } from "src/app/chat/data.chat";
import { ChatService } from "../main/service/chat.service";
import { ChatComponent } from "src/app/chat/chat.component";
import { ChatResponse } from "../main/service/data/chat.response";
import { ChatHandler } from "../service/handlers/chat.handler";
import { OrderResponse } from "../main/service/data/response";
import { StoreHandler } from "../service/handlers/store.handler";
import { OrderHandler } from "../service/handlers/order.handler";
import * as CONSTANTES from "src/app/utils/constant";
import { MqttService } from "../service/mqtt.service";
import { enumStatusOrder, enumTypePayment } from "../request-trip/data/enum";
import { environment } from "src/environments/environment";
import { AuthService } from "src/app/utils/auth.service";
import { DeliveryManRouteResponse, ResponseTrackingMotorized, RouterResponse } from "./data/response";
import { Router } from "@angular/router";
import { AlertServices } from "../service/alert.service";
import { HttpErrorResponse } from "@angular/common/http";

class PolyLine{
  routePoints:RoutePoint[]
  color: string
  text?: string
}
interface RoutePoint {
  lat: number;
  lng: number;
}

interface Marker {
  lat: number;
  lng: number;
  label?: string;
  maintext?: string;
  secondText?: string;
  iconUrl?:string
  isDraggable?:boolean
  onDragEnd?:(e:MouseEvent)=>void
}

@Component({
  selector: "app-order-course",
  templateUrl: "./order-course.component.html",
  styleUrls: ["./order-course.component.scss"],
})
export class OrderCourseComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private requestTripService: RequestTripService,
    private chatService: ChatService,
    private chatHandler: ChatHandler,
    private storeHandler: StoreHandler,
    private orderHandler: OrderHandler,
    private mqtt: MqttService,
    private auth: AuthService,
    private router: Router,
    private alert:AlertServices
  ) {}


  origenIcon: any =
    "assets/empresas/" +
    environment.NAME_COMPANY +
    environment.MARKERS.ORIGEN.URL;

  destinoIcon: any =
    "assets/empresas/" +
    environment.NAME_COMPANY +
    environment.MARKERS.DESTINO.URL;
  referenciaIcon: any = "assets/images/busqueda/referencia.svg";

  repartidorIcon: any =
    "assets/empresas/" +
    environment.NAME_COMPANY +
    environment.MARKERS.CONDUCTOR.URL;

  globalIconOrigin: any = { 
    url: this.origenIcon, 
    scaledSize: {
      height: 50, 
      width: 50
    }
  }

  globalIconDestination: any = { 
    url: this.destinoIcon, 
    scaledSize: {
      height: 50, 
      width: 50
    }
  }

  globalIconDriver: any = {
    url: this.repartidorIcon, 
    scaledSize: {
      height: 50, 
      width: 50
    }
  }

  center: LatLngLiteral = {
    lat: 10.96854,
    lng: -74.78132,
  };

  markers: Marker[] = [
    {
      maintext: "Barranquilla",
      secondText: "Hotel atrium",
      lat: 10.96854,
      lng: -74.78132,
      iconUrl: 'none'
    }
  ];

  polyLines :PolyLine[] = [
    {
      routePoints:[],
      color: ''
    }
  ]

  zoom = 17;

  list_order: ResponseLoadingOrder[] = [];
  idClient?: string;
  // center: any = {
  //   lat: 10.96854,
  //   lng: -74.78132,
  // };
  activeState: boolean[] = [true, false, false];
  interval_motorized_order?: any;
  marker?: any = {
    maintext: "Barranquilla",
    secondText: "Hotel atrium",
    lat: 10.96854,
    lng: -74.78132,
  };
  polyline_order?: PersonalisationPolyline[] = [];
  lstPosiciones: PersonalisationMarker[] = [];
  lstPosicionConductor: PersonalisationMarker[] = [];
  polilyneRuta: PersonalisationPolyline[] = [];
  minutosEstimados?: Date = undefined;
  metrosEstimados?: number = undefined;
  initMapViewAfter?: boolean;
  flagInitMap: boolean = false;
  viaje: Viaje = new Viaje();
  ordersOpen: OrderBean[] = [];
  ordersPreparing: OrderBean[] = [];
  ordersReady: OrderBean[] = [];
  //   coberturePosition: RequestGeoAutocomplete = {
  //     key_word: "",
  //     longitude: -74.78132,
  //     latitude: 10.96854,
  //   };
  coberturePosition: RequestGeoAutocomplete = {
    key_word: "",
    longitude: environment.centermap.lng,
    latitude: environment.centermap.lat,
  };

  userId: any

  

  ngAfterViewInit() {}
  isMqttConnect: boolean = false;
  isDoneGetOrders: boolean = false;

  async ngOnInit() {
    this.initMapViewAfter = true;
    await this.onOrderCourseIntervalSubscription(0);
    this.mqtt._onConnect.subscribe((isConnect) => {
      if (isConnect) {
        this.isMqttConnect = isConnect;
        this.mqttListener();
        this.validOrdersSubscribe();
      }
    });
    let id=this.auth.getParameterToken('id')
    this.userId = Number(id)
  }

  ngOnDestroy(): void {
    clearInterval(this.interval_motorized_order);
    clearInterval(this.set_interval_driver );
    // if (this.suscripcionTopic) {
    //   this.webSocketMqtt.ususcribeSuscription(this.suscripcionTopic.id!);
    // }
  }

  validOrdersSubscribe() {
    if (this.isMqttConnect && this.isDoneGetOrders) {
      this.list_order.forEach((order) => {
        this.subscribeOrder(order.uuid);
        this.subscribeChat(order.uuid);
      });
    }
  }
  hideChatComponent(order:ResponseLoadingOrder){
    order.showButton =  !order.showButton;
  }
  
  mqttListener() {
    this.orderHandler._data.subscribe((asyncData) => {
      if (asyncData) {
        if (asyncData.data.status === CONSTANTES.CANCEL_ORDER_STATUS) {
          let find_order: any = this.list_order.findIndex(
            (item) => item.uuid === asyncData.data.uuid
          );
          // let find_order_open :any = this.ordersOpen.findIndex(item => item.uuid === asyncData.data.uuid)
          this.list_order.splice(find_order, 1);
          // this.ordersOpen.splice(find_order_open,1)
        } else {
          let orderMqtt = (asyncData.data);
          let orderIndex = this.list_order.findIndex(
            (order) => order.id === orderMqtt.id
          );
          let order_response : ResponseLoadingOrder = new ResponseLoadingOrder()
          let status_validation = orderMqtt.deliveryMan
          ? orderMqtt.deliveryMan.status
          : orderMqtt.status;
          let find_order: any = this.list_order.findIndex(
            (item) => item.uuid === asyncData.data.uuid
          );
          if (status_validation == enumStatusOrder.done) {
            this.list_order.splice(find_order, 1);
          } else {
            order_response.deliveryMan = orderMqtt.deliveryMan
            order_response.createdAt = orderMqtt.createdAt
            order_response.deliveryPrice = orderMqtt.deliveryPrice
            order_response.id = orderMqtt.id
            order_response.uuid = orderMqtt.uuid
            let status = orderMqtt.deliveryMan
            ? orderMqtt.deliveryMan.status
            : orderMqtt.status;
            order_response.status_order = this.onStatusGroup(status);
            order_response.status_order_color = this.onStatusGroupColor(status)
            order_response.addresses = orderMqtt.addresses

            order_response.payment = {
              amount :  {
                value : orderMqtt.payment.amount.value,
              },
              method :{
                type :  orderMqtt.payment.method.type,
              },
              id : orderMqtt.payment.id
            }
            order_response.order_name = this.onPaymentGroup(orderMqtt.payment.method.type )

            this.list_order[orderIndex].addresses =  this.list_order[orderIndex].addresses  ? order_response.addresses : [];
            this.list_order[orderIndex].createdAt = order_response.createdAt;
            this.list_order[orderIndex].deliveryMan = order_response.deliveryMan;
            this.list_order[orderIndex].deliveryPrice = order_response.deliveryPrice;
            this.list_order[orderIndex].id = order_response.id;
            this.list_order[orderIndex].order_name = order_response.order_name;
            this.list_order[orderIndex].payment = order_response.payment;
            this.list_order[orderIndex].readyToDmAt = order_response.readyToDmAt;
            this.list_order[orderIndex].status = order_response.status;
            this.list_order[orderIndex].status_order = order_response.status_order;
            this.list_order[orderIndex].total = order_response.total;
            this.list_order[orderIndex].type = order_response.type;
            this.list_order[orderIndex].user = order_response.user;
            this.list_order[orderIndex].uuid = order_response.uuid;
            this.flagAccordion = true
            console.log(orderMqtt);
          }
        
        }
        // this.sortOrders();
      }
    });

    this.chatHandler._data.subscribe((asyncData) => {
      if (asyncData && asyncData.data.uuid) {
        let messageBean = ChatResponse.toBean(asyncData.data);

        let orderIndex = this.list_order.findIndex(
          (order) => order.uuid == messageBean.uuidOrder
        );
        console.log("orderIndex", orderIndex);
        console.log("this.orders[orderIndex]", this.list_order[orderIndex]);
        this.list_order[orderIndex].messagesNoReadTotal++;

        let indexMessage = this.list_order[orderIndex].messagesChat.findIndex(
          (message) => message.uuid == messageBean.uuid
        );
        console.log("indexMessage", indexMessage);
        if (indexMessage > 0) {
          console.log(
            "this.orders[orderIndex].messagesChat[indexMessage]",
            this.list_order[orderIndex].messagesChat[indexMessage]
          );
          this.list_order[orderIndex].messagesChat[indexMessage] = messageBean;
        } else {
          console.log(
            "this.orders[orderIndex].messagesChat",
            this.list_order[orderIndex]
          );
          this.list_order[orderIndex].messagesChat.push(messageBean);
        }
      }
    });
  }
  subscribeOrder(orderUuid: string) {
    this.mqtt.subscribe("order/" + orderUuid);
  }
  subscribeChat(orderUuid: string) {
    this.mqtt.subscribe("chat/" + orderUuid);
  }

  sortOrders() {
    this.ordersOpen = this.orders.filter(
      (order) =>
        order.status == CONSTANTES.OPEN_ORDER_STATUS && this.dmStatusOkay(order)
    );
    this.ordersPreparing = this.orders.filter(
      (order) =>
        order.status == CONSTANTES.PREPARING_ORDER_STATUS &&
        this.dmStatusOkay(order)
    );
    this.ordersReady = this.orders.filter(
      (order) =>
        order.status == CONSTANTES.READY_ORDER_STATUS &&
        this.dmStatusOkay(order)
    );
  }
  dmStatusOkay(order: OrderBean) {
    let dmStatusOkay = false;
    if (order.deliveryMan) {
      dmStatusOkay =
        order.deliveryMan.status == "toStore" ||
        order.deliveryMan.status == "inStore";
    } else {
      dmStatusOkay = true;
    }
    return dmStatusOkay;
  }
  async onOrderCourseInterval(index: number) {
    await this.onSearchMotorizedOrder();
    this.interval_motorized_order = setInterval(() => {
      this.onSearchMotorizedOrder();
    }, 30000);
  }
  async onOrderCourseIntervalSubscription(index: number) {
    await this.onSearchMotorizedOrderSubscription();
    this.interval_motorized_order = setInterval(() => {
      this.onSearchMotorizedOrderSubscription();
    }, 30000);
  }
 
  onClearMap() {
    this.polilyneRuta = [];
    this.lstPosiciones = [];
    this.lstPosicionConductor = [];
  }
  onTabClose(envios: any) {
    this.onClearMap();
    this.flagAccordion = false;
    //this.onOrderCourseInterval(envios.index);
    clearInterval(this.set_interval_driver);
  }
  flagAccordion: boolean = false;
  async onTapOpen(envios: any, flagAccordion: boolean) {
    
    this.polyLines=[]
    clearInterval(this.set_interval_driver);
    this.flagAccordion = true;
    this.onClearMap();
    // await this.onGetRouteServiceShared(select_service)
    // this.onUpdatePosicion(select_service)
    // this.getServiceRouteAssigned(select_service.id)
    //clearInterval(this.interval_motorized_order);
    this.onViewOrder(envios.index);
  }
  onViewOrder(index: number) {
    let select_service: ResponseLoadingOrder = this.list_order[index];
    this.onChangePolyline(select_service);
    this.onUpdateDriver(select_service);
  }
  onChangePolyline(item: ResponseLoadingOrder) {}

  updatePosition(select_service: ResponseLoadingOrder) {

    this.markers = []
    var newMarkers: Marker
    select_service.addresses.forEach((element,i) => {
      if(i==0){
         newMarkers = {
          lat: element.location.coordinates[1],
          lng: element.location.coordinates[0],
          iconUrl: this.globalIconOrigin,
          label: 'Origen',
          isDraggable: false,
        }
        this.markers.push(newMarkers)
      }else{
        newMarkers = {
          lat: element.location.coordinates[1],
          lng: element.location.coordinates[0],
          iconUrl: this.globalIconDestination,
          label: 'Destino',
          isDraggable: false,
        }
        this.markers.push(newMarkers)
      }
    });    
    this.centrarMapa()

    // var lstPosiciones: PersonalisationMarker[] = [];
    // lstPosiciones.push(
    //   UtilModalViaje.fnDetalleViaje(
    //     new google.maps.LatLng(
    //       select_service.addresses[0].location.coordinates[1],
    //       select_service.addresses[0].location.coordinates[0]
    //     ),
    //     true,
    //     "Origen",
    //     TypeMarkers.ORIGEN,
    //     false,
    //     1,
    //     false
    //   )
    // );
    // if (select_service.addresses.length > 1) {
    //   lstPosiciones.push(
    //     UtilModalViaje.fnDetalleViaje(
    //       new google.maps.LatLng(
    //         select_service.addresses[1].location.coordinates[1],
    //         select_service.addresses[1].location.coordinates[0]
    //       ),
    //       true,
    //       "Destino",
    //       TypeMarkers.DESTINO,
    //       false,
    //       1,
    //       false
    //     )
    //   );
    // }

    // this.lstPosiciones = lstPosiciones;
  }

  updatePositionDriver(item: ResponseTrackingMotorized){
    const newMarkersDriver: Marker = {
      lat: item.position.lat,
      lng: item.position.lng,
      //lat: select_service.addresses[0].location.coordinates[1],
      //lng: select_service.addresses[0].location.coordinates[0],
      iconUrl: this.globalIconDriver,
      label: 'Repartidor',
      isDraggable: false,
    }
    this.markers[2] = newMarkersDriver
  }

  centrarMapa() { 
    if (this.markers.length >= 2) { 

      const centerLat = (this.markers[0].lat + this.markers[1].lat ) / 2;
      const centerLng = (this.markers[0].lng + this.markers[1].lng) / 2;

      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(this.markers[0].lat, this.markers[0].lng),
        new google.maps.LatLng(this.markers[1].lat, this.markers[1].lng)
      );
      const zoom = this.calcularNivelDeZoom(distance);

      console.log('distancia_ ', distance)

      this.center = { lat: centerLat, lng: centerLng };
      this.zoom = zoom;
      console.log('zoom_ ', zoom)

    } 
  } 

  calcularNivelDeZoom(distance: number): number{
    // Puedes ajustar estos valores según tus preferencias
    if (distance < 1000) {
      return 20; // Zoom más cercano si la distancia es corta
    } else if (distance < 5000) {
      return 15; // Zoom intermedio para distancias medianas
    } else {
      return 11; // Zoom más alejado si la distancia es larga
    }
  }

  selectedTabs: { [key: string]: boolean } = {};
  async onSearchMotorizedOrder() {
    await this.requestTripService.onLoadingMotorizedService().subscribe((data) => {
      debugger
        const selectedTabsBackup = { ...this.selectedTabs };
        this.list_order = [];
        data.data.forEach((element) => {
          let order = new ResponseLoadingOrder();
          const timestamp = element.createdAt;
          const date = new Date(timestamp * 1000); // Multiplica por 1000 para convertir segundos a milisegundos
          const year = date.getUTCFullYear();
          const month = date.getUTCMonth() + 1; // Los meses en JavaScript son base 0 (enero = 0)
          const day = date.getUTCDate();
          const hours = date.getUTCHours();
          const minutes = date.getUTCMinutes();
          const seconds = date.getUTCSeconds();
          const formattedDate = `${year}-${month < 10 ? "0" : ""}${month}-${
            day < 10 ? "0" : ""
          }${day} ${hours}:${minutes}:${seconds}`;
          order = element;
          order.date_string = formattedDate;
          let status = element.deliveryMan
          ? element.deliveryMan.status
          : element.status;
          order.order_name = this.onPaymentGroup(element.payment.method.type )
          order.status_order = this.onStatusGroup(status);
          order.status_order_color = this.onStatusGroupColor(status)
          order.user = element.user
          order.deliveryMan = element.deliveryMan;
          order.addresses = element.addresses;
          order.total = element.total;
          order.payment = element.payment;
          order.id = element.id 
          order.uuid = element.uuid
          // order.showButton = false

          this.selectedTabs[order.uuid] = selectedTabsBackup[order.uuid];

          this.list_order.push(order);
        });
        this.isDoneGetOrders = true;
      });
  }
  async onSearchMotorizedOrderSubscription() {
    await this.requestTripService.onLoadingMotorizedService().subscribe((data) => {
        this.list_order = [];
        data.data.forEach((element) => {
          let order = new ResponseLoadingOrder();
          const timestamp = element.createdAt;
          const date = new Date(timestamp * 1000); // Multiplica por 1000 para convertir segundos a milisegundos
          const year = date.getUTCFullYear();
          const month = date.getUTCMonth() + 1; // Los meses en JavaScript son base 0 (enero = 0)
          const day = date.getUTCDate();
          const hours = date.getUTCHours();
          const minutes = date.getUTCMinutes();
          const seconds = date.getUTCSeconds();
          const formattedDate = `${year}-${month < 10 ? "0" : ""}${month}-${
            day < 10 ? "0" : ""
          }${day} ${hours}:${minutes}:${seconds}`;
          order.date_string = formattedDate;
          let status = element.deliveryMan
            ? element.deliveryMan.status
            : element.status;
          order.order_name = this.onPaymentGroup(element.payment.method.type )
          order.status_order = this.onStatusGroup(status);
          order.status_order_color = this.onStatusGroupColor(status)
          console.log('status', status)
          order.user = element.user
          order.deliveryMan = element.deliveryMan;
          order.addresses = element.addresses;
          order.total = element.total;
          order.payment = element.payment;
          order.id = element.id 
          order.uuid = element.uuid
          // order.showButton = false
          order.createdAt = element.createdAt
          order.detail = element.detail
          order.productPrice = element.productPrice
          order.readyToDmAt = element.readyToDmAt
          order.isOrderCalendar = element.isOrderCalendar
          order.store=element.store
          order.isCheckedStore=element.isCheckedStore??false
          this.list_order.push(order);
        });
        this.isDoneGetOrders = true;
        this.validOrdersSubscribe();
      });
  }
  orders: OrderBean[] = [];
  link_href_shared_service?: string;
  list_marker?: any = [];
  private onPaymentGroup(payment : string){
    let order : string = ''
    switch (payment) {
      case enumTypePayment.CASH:
          order = 'Efectivo'
        break;
      case enumTypePayment.CREDIT:
        order = 'Crédito'
      break;
       
      default:
        break;
  }
  return order

  }
  statusColor: string
  private onStatusGroup(status: string) {
    let order : string = ''
    switch (status) {
      case enumStatusOrder.preparingOrder://verde
        order = "El local está preparando tu orden";
        this.statusColor = '#689f38'
        break;
      case enumStatusOrder.toStore://amarillo
        order = "Te estás dirigiendo al local";
        this.statusColor = '#fbc02d'
        break;
      case enumStatusOrder.inStore://amarillo
        order = "Llegué al local";
        this.statusColor = '#fbc02d'
        break;
      case enumStatusOrder.reciveDelivery://amarillo
        order = "Recibí el pedido";
        this.statusColor = '#fbc02d'
        break;
      case enumStatusOrder.toHome://amarillo
        order = "Estás en camino a entregar el pedido";
        this.statusColor = '#fbc02d'
        break;
      case enumStatusOrder.nearHome://amarillo
        order = "Estás cerca del destino";
        this.statusColor = '#fbc02d'
        break;
      case enumStatusOrder.inHome://verde
        order = "Has llegado a la puerta del cliente";
        this.statusColor = '#689f38'
        break;
      case enumStatusOrder.orderReady://azul
        order = "El pedido está listo para recoger";
        this.statusColor = '#0747A6'
        break;
        case enumStatusOrder.reciveOrderDeliveryMan://amarillo
          order = "El repartidor tiene el pedido";
          this.statusColor = '#fbc02d'
          break;
      default:
        break;
    }
    return order
  }

  private onStatusGroupColor(status: string) {
    let orderStatusColor : string = ''
    switch (status) {
      case enumStatusOrder.preparingOrder://verde
        orderStatusColor = '#689f38'
        break;
      case enumStatusOrder.toStore://amarillo
        orderStatusColor = '#fbc02d'
        break;
      case enumStatusOrder.inStore://amarillo
        orderStatusColor = '#fbc02d'
        break;
      case enumStatusOrder.reciveDelivery://amarillo
        orderStatusColor = '#fbc02d'
        break;
      case enumStatusOrder.toHome://amarillo
        orderStatusColor = '#fbc02d'
        break;
      case enumStatusOrder.nearHome://amarillo
        orderStatusColor = '#fbc02d'
        break;
      case enumStatusOrder.inHome://verde
        orderStatusColor = '#689f38'
        break;
      case enumStatusOrder.orderReady://azul
        orderStatusColor = '#0747A6'
        break;
        case enumStatusOrder.reciveOrderDeliveryMan://amarillo
          orderStatusColor = '#fbc02d'
          break;
      default:
        break;
    }
    return orderStatusColor
  }

  btnCancelViaje(item: ResponseLoadingOrder) {
    this.requestTripService.onCancelOrderService(item.uuid).subscribe(
      (data) => {
        this.alert.showSuccess('',"Se canceló la orden");
        this.onSearchMotorizedOrder();
        this.onClearMap();
      },
      (error:HttpErrorResponse) => {
        console.log(error.message)
        if(error.status==400){
          this.alert.showError('',error.error.messages[0].message);
        }else{
          this.alert.showError('',"Ocurrió un error");
        }
      }
    );
    // this.cancelViaje.emit(item)
  }
  async onUpdateDriver(item: ResponseLoadingOrder) {
    let lstPosiciones: PersonalisationMarker[] = [];
    await this.requestTripService.onViewTrackingMotorizedService(item.uuid).subscribe((viaje) => {
      
        if (viaje.data) {
          if(viaje.data.position){
            let tittle = viaje.data.deliveryMan.name;
            lstPosiciones.push( this.fnDetalleViajeLabelListServiceWeb(new google.maps.LatLng(viaje.data.position.lat,viaje.data.position.lng),tittle,-1, "","",true));
            this.lstPosicionConductor = lstPosiciones;
          }
          this.onUpdateIntervalDriver(item);
        } else {
          this.onClearMap();
          this.updatePosition(item);
        }
      });

    // let lstPosiciones = cloneDeep(
    //   this.fnLstPosicionesByDriver(
    //     this.enviosServicio,
    //     )
    //   )
    // this.lstPosiciones.emit(lstPosiciones)
  }
  set_interval_driver: any;
  onUpdateIntervalDriver(item: ResponseLoadingOrder) {
    
    this.onUpdateDriverPullRequest(item);
    this.set_interval_driver = setInterval(() => {
      this.onUpdateDriverPullRequest(item);
    }, 20000);
  }
  viajeTracking : ResponseTrackingMotorized
  async onUpdateDriverPullRequest(item: ResponseLoadingOrder) {
    let lstPosiciones: PersonalisationMarker[] = [];
    await this.requestTripService.onViewTrackingMotorizedService(item.uuid).subscribe((viaje) => {
        this.viajeTracking = viaje.data
        if (viaje.data) {
          // let tittle = viaje.data.deliveryMan.name;
          // lstPosiciones.push(
          //   this.fnDetalleViajeLabelListServiceWeb(
          //     new google.maps.LatLng(
          //       viaje.data.position.lat,
          //       viaje.data.position.lng
          //     ),
          //     tittle,
          //     -1,
          //     "",
          //     "",
          //     true
          //   )
          // );

          // this.lstPosicionConductor = lstPosiciones;

          this.polyLines=[]
        
          const polySuggested=this.drawPolyline(viaje.data.suggestedRoute)
          if(polySuggested){
            this.polyLines.push(polySuggested)
          }
          var polyDeliveryMan=[]
          if(viaje.data.deliveryManRoute){
            polyDeliveryMan=viaje.data.deliveryManRoute.map((dmr)=>this.drawPolylineDeliveryMan(dmr))
          }
          
          this.polyLines=[...this.polyLines,...polyDeliveryMan]

        } else {
          this.onClearMap();
        }
        this.updatePosition(item);
        if(this.viajeTracking.position){
          this.updatePositionDriver(this.viajeTracking)
        }
      });

    // let lstPosiciones = cloneDeep(
    //   this.fnLstPosicionesByDriver(
    //     this.enviosServicio,
    //     )
    //   )
    // this.lstPosiciones.emit(lstPosiciones)
  }

  drawPolyline(overviewPolyline?: RouterResponse):PolyLine{  
    if(overviewPolyline){
      let polySuggestedRoute:PolyLine=new PolyLine()
      polySuggestedRoute.color=overviewPolyline.color
      polySuggestedRoute.routePoints=overviewPolyline.polyline
      return polySuggestedRoute;
    }
    return null;
  }

  drawPolylineDeliveryMan(overviewPolyline: DeliveryManRouteResponse){
    if(overviewPolyline){
      let polySuggestedRoute:PolyLine=new PolyLine()
      polySuggestedRoute.color=overviewPolyline.color
      polySuggestedRoute.routePoints=overviewPolyline.polyline
      polySuggestedRoute.text=overviewPolyline.deliveryMan.name
      return polySuggestedRoute;
    }
    return null;
  }

  fnDetalleViajeLabelListServiceWeb(
    latLng: google.maps.LatLng,
    tittle: string,
    isEstado: number,
    labelSelector: string,
    id: any,
    view_screen_map?: boolean
  ): PersonalisationMarker {
    let detalle: PersonalisationMarker = new PersonalisationMarker();

    detalle.posicion = latLng;
    detalle.showTittle = true;
    detalle.tittle = tittle;
    detalle.tipoMarker = TypeMarkers.CONDUCTOR;
    detalle.isDragable = false;
    // detalle.selector = ColorStatusLablelMarker.STATUS_DRIVER + isEstado;
    // detalle.labelSelector = labelSelector + '';
    detalle.idEstado = isEstado;
    // detalle.estado = ValorComparativo.ESTADO_CONDUCTOR;
    detalle.showInfowindow = true;
    detalle.typeServicesId = id;
    detalle.infoWindow = new google.maps.InfoWindow({
      content: "<b> " + "   " + tittle + "</b> ",
    });
    detalle.view_screen_map = view_screen_map ? view_screen_map : false;
    return detalle;
  }
  onUpdatePosicion(item: Viaje) {
    // this.update_position.emit(item)
  }
  viajeOpen: any;
  searchAutomatic: boolean = true;
  flagBuscandoConductor: boolean = true;
  mapClicked($event: MouseEvent) {
    (this.marker.lat = $event.coords.lat),
      (this.marker.lng = $event.coords.lng);
  }
  toggleDisplayDiv(order: ResponseLoadingOrder) {
    order.showButton = !order.showButton;
    if (order.showButton) {
      order.messagesNoReadTotal = 0;
      this.getMessages(order);
    }
  }
  messagesChat: ChatBean[] = [];
  @ViewChild(ChatComponent) chatComponent!: ChatComponent;

  getMessages(order: ResponseLoadingOrder) {
    console.log("mensajess", this.messagesChat);
    this.messagesChat = [];
    order.isLoadingChat = true;
    this.chatService.getMessage(order.uuid).subscribe(
      (resp) => {
        order.isLoadingChat = false;
        order.messagesChat = resp.data.map((message) =>
          ChatResponse.toBean(message)
        );
        this.chatComponent.scrollToBottom();
      },
      (error) => {
        order.isLoadingChat = false;
      }
    );
  }
  sendMessage(message: ChatBean) {
    console.log("message", message);
    this.chatService.sendMessage(ChatBean.toRequest(message)).subscribe(
      (resp) => {},
      (error) => {}
    );
  }

  redirectOrderTrip(order: any){
    localStorage.setItem('edit-trip', JSON.stringify(order))
    this.router.navigate(['/request-trip'])
  }

  filterOrder: any

  orderCourseOptions: any[] = [
    { name: 'Regular', value: false },
    { name: 'Express', value: true }
];
}
