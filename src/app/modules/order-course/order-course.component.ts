import { Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  HostListener,
} from "@angular/core";
import { Viaje } from "./data";
import * as L from 'leaflet';
import { RequestTripService } from "../request-trip/services/request-trip.service";
import { ResponseLoadingOrder } from "../request-trip/data/response";
import { RequestGeoAutocomplete } from "src/app/directives/informacion/data/serviceGeo";
import {
  PersonalisationMarker,
  PersonalisationPolyline,
  TypeMarkers,
} from "src/app/directives/informacion/data/enumMapa";
import { OrderBean } from "../main/data";
import { ChatBean } from "src/app/chat/data.chat";
import { ChatService } from "../main/service/chat.service";
import { ChatComponent } from "src/app/chat/chat.component";
import { ChatResponse } from "../main/service/data/chat.response";
import { ChatHandler } from "../service/handlers/chat.handler";
import { StoreHandler } from "../service/handlers/store.handler";
import { OrderHandler } from "../service/handlers/order.handler";
import * as CONSTANTES from "src/app/utils/constant";
import { enumStatusOrder, enumTypePayment } from "../request-trip/data/enum";
import { environment } from "src/environments/environment";
import { AuthService } from "src/app/utils/auth.service";
import { DeliveryManRouteResponse, ResponseTrackingMotorized, RouterResponse } from "./data/response";
import { Router } from "@angular/router";
import { AlertServices } from "../service/alert.service";
import { HttpErrorResponse } from "@angular/common/http";
import { ClipboardService } from 'ngx-clipboard';
import { MessageService } from "primeng/api";
import { WokerHandler } from "../service/worker.service";

// Interfaces locales
interface LatLngLiteral {
  lat: number;
  lng: number;
}

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
  onDragEnd?:(e:any)=>void
}

@Component({
  selector: "app-order-course",
  templateUrl: "./order-course.component.html",
  styleUrls: ["./order-course.component.scss"],
  providers:[MessageService]
})
export class OrderCourseComponent implements OnInit, OnDestroy, AfterViewInit {
  showPanel = false;

  // Leaflet
  private leafletMap: L.Map;
  private leafletMarkers: L.Marker[] = [];
  private leafletPolylines: L.Polyline[] = [];
  private originIcon: L.DivIcon;
  private destinationIcon: L.DivIcon;
  private driverIcon: L.DivIcon;

  constructor(
    private requestTripService: RequestTripService,
    private chatService: ChatService,
    private chatHandler: ChatHandler,
    private storeHandler: StoreHandler,
    private orderHandler: OrderHandler,
    private mqtt: WokerHandler,
    private auth: AuthService,
    private router: Router,
    private alert:AlertServices,
    private readonly clipboardService:ClipboardService,
    private messageService: MessageService,
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
    scaledSize: { height: 50, width: 50 }
  }

  globalIconDestination: any = { 
    url: this.destinoIcon, 
    scaledSize: { height: 50, width: 50 }
  }

  globalIconDriver: any = {
    url: this.repartidorIcon, 
    scaledSize: { height: 50, width: 50 }
  }

  center: LatLngLiteral = {
    lat: environment.centermap.lat,
    lng: environment.centermap.lng,
  };

  markers: Marker[] = [
    {
      maintext: "Pucallpa",
      secondText: "Real plaza",
      lat: environment.centermap.lat,
      lng: environment.centermap.lng,
    }
  ];

  polyLines :PolyLine[] = [{ routePoints:[], color: '' }]

  zoom = 17;
  list_order: ResponseLoadingOrder[] = [];
  orderSelected: ResponseLoadingOrder;
  reasonCancelOrder:string=""
  idClient?: string;
  activeState: boolean[] = [true, false, false];
  interval_motorized_order?: any;
  marker?: any = {
    maintext: "Pucallpa",
    secondText: "Real Plaza",
    lat: environment.centermap.lat,
    lng: environment.centermap.lng
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
  coberturePosition: RequestGeoAutocomplete = {
    key_word: "",
    longitude: environment.centermap.lng,
    latitude: environment.centermap.lat,
  };
  userId: any
  received_by_store_method_available:string[] =["CASH","YAPE","PLIN","OTROS"]
  isLoadingReceived_by_store_method_available:boolean=false

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    const width = (event.target as Window).innerWidth;
    if (width > 991 && this.showPanel) {
      this.showPanel = false;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initLeafletMap();
    }, 500);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval_motorized_order);
    clearInterval(this.set_interval_driver);
    if (this.leafletMap) {
      this.leafletMap.remove();
    }
  }

  // Crear icono PIN personalizado con imagen dentro
  private createPinIcon(iconUrl: string, color: string): L.DivIcon {
    return L.divIcon({
      className: 'custom-pin-marker',
      html: `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));
        ">
          <div style="
            width: 46px;
            height: 46px;
            background: #fff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 4px solid ${color};
          ">
            <img src="${iconUrl}" alt="marker" style="
              width: 26px;
              height: 26px;
              transform: rotate(45deg);
              object-fit: contain;
            " />
          </div>
          <div style="
            width: 10px;
            height: 10px;
            background: ${color};
            border-radius: 50%;
            margin-top: -6px;
            border: 2px solid #fff;
          "></div>
        </div>
      `,
      iconSize: [50, 65],
      iconAnchor: [25, 65],
      popupAnchor: [0, -65]
    });
  }

  private initLeafletMap(): void {
    if (this.leafletMap) return;

    // Crear iconos personalizados con forma de PIN
    this.originIcon = this.createPinIcon(this.origenIcon, '#47AC34');
    this.destinationIcon = this.createPinIcon(this.destinoIcon, '#eb0045');
    this.driverIcon = this.createPinIcon(this.repartidorIcon, '#2196F3');

    this.leafletMap = L.map('leaflet-map-order', {
      center: [this.center.lat, this.center.lng],
      zoom: this.zoom,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.leafletMap);

    this.updateLeafletMarkers();
  }

  private updateLeafletMarkers(): void {
    if (!this.leafletMap) return;

    this.leafletMarkers.forEach(marker => marker.remove());
    this.leafletMarkers = [];

    this.markers.forEach((marker, index) => {
      if (!marker.lat || !marker.lng || (marker.lat === 0 && marker.lng === 0)) return;

      let icon: L.DivIcon;
      if (marker.label === 'Repartidor') {
        icon = this.driverIcon;
      } else if (index === 0) {
        icon = this.originIcon;
      } else {
        icon = this.destinationIcon;
      }

      const leafletMarker = L.marker([marker.lat, marker.lng], {
        icon: icon,
        draggable: marker.isDraggable ?? false
      }).addTo(this.leafletMap);

      if (marker.label) {
        leafletMarker.bindPopup(marker.label);
      }

      this.leafletMarkers.push(leafletMarker);
    });

    this.updateLeafletPolylines();
  }

  private updateLeafletPolylines(): void {
    if (!this.leafletMap) return;

    this.leafletPolylines.forEach(polyline => polyline.remove());
    this.leafletPolylines = [];

    this.polyLines.forEach(polyLine => {
      if (polyLine.routePoints && polyLine.routePoints.length > 0) {
        const points: L.LatLngExpression[] = polyLine.routePoints.map(p => [p.lat, p.lng]);
        const leafletPolyline = L.polyline(points, {
          color: polyLine.color || '#eb0045',
          weight: 3
        }).addTo(this.leafletMap);
        this.leafletPolylines.push(leafletPolyline);
      }
    });
  }

  private centerLeafletMap(): void {
    if (!this.leafletMap || this.markers.length < 2) return;

    const validMarkers = this.markers.filter(m => m.lat && m.lng && !(m.lat === 0 && m.lng === 0));
    if (validMarkers.length < 2) return;

    const bounds = L.latLngBounds(validMarkers.map(m => [m.lat, m.lng] as L.LatLngTuple));
    this.leafletMap.fitBounds(bounds, { padding: [50, 50] });
  }

  isMqttConnect: boolean = false;
  isDoneGetOrders: boolean = false;

  async ngOnInit() {
    this.initMapViewAfter = true;
    await this.onOrderCourseIntervalSubscription(0);
    this.mqtt._onConnectAsync.subscribe((isConnect) => {
      if (isConnect) {
        this.isMqttConnect = isConnect;
        this.mqttListener();
        this.validOrdersSubscribe();
      }
    });
    let id=this.auth.getParameterToken('id')
    this.userId = Number(id)
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
          this.list_order.splice(find_order, 1);
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
              amount :  { value : orderMqtt.payment.amount.value },
              method :{ type :  orderMqtt.payment.method.type },
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
          }
        }
      }
    });

    this.chatHandler._data.subscribe((asyncData) => {
      if (asyncData && asyncData.data.uuid) {
        let messageBean = ChatResponse.toBean(asyncData.data);
        let orderIndex = this.list_order.findIndex(
          (order) => order.uuid == messageBean.uuidOrder
        );
        this.list_order[orderIndex].messagesNoReadTotal++;
        let indexMessage = this.list_order[orderIndex].messagesChat.findIndex(
          (message) => message.uuid == messageBean.uuid
        );
        if (indexMessage > 0) {
          this.list_order[orderIndex].messagesChat[indexMessage] = messageBean;
        } else {
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
      (order) => order.status == CONSTANTES.OPEN_ORDER_STATUS && this.dmStatusOkay(order)
    );
    this.ordersPreparing = this.orders.filter(
      (order) => order.status == CONSTANTES.PREPARING_ORDER_STATUS && this.dmStatusOkay(order)
    );
    this.ordersReady = this.orders.filter(
      (order) => order.status == CONSTANTES.READY_ORDER_STATUS && this.dmStatusOkay(order)
    );
  }

  dmStatusOkay(order: OrderBean) {
    let dmStatusOkay = false;
    if (order.deliveryMan) {
      dmStatusOkay = order.deliveryMan.status == "toStore" || order.deliveryMan.status == "inStore";
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
    clearInterval(this.set_interval_driver);
  }

  flagAccordion: boolean = false;
  openedOrder: any = null

  async onTapOpen(envios: any, flagAccordion: boolean) {
    const openedTabIndex = envios.index;
    this.openedOrder = this.filteredOrders[openedTabIndex];
    this.openedOrder.isSpinnerVisible = true;
    
    this.polyLines=[]
    clearInterval(this.set_interval_driver);
    this.flagAccordion = true;
    this.onClearMap();
    this.onViewOrder(envios.index);
  }

  onViewOrder(index: number) {
    let select_service: ResponseLoadingOrder = this.filteredOrders[index];
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
    this.updateLeafletMarkers();
  }

  updatePositionDriver(item: ResponseTrackingMotorized){
    const newMarkersDriver: Marker = {
      lat: item.position.lat,
      lng: item.position.lng,
      iconUrl: this.globalIconDriver,
      label: 'Repartidor',
      isDraggable: false,
    }
    this.markers[2] = newMarkersDriver
    this.updateLeafletMarkers();
  }

  centrarMapa() { 
    if (this.markers.length >= 2) { 
      const centerLat = (this.markers[0].lat + this.markers[1].lat ) / 2;
      const centerLng = (this.markers[0].lng + this.markers[1].lng) / 2;

      const latlng1 = L.latLng(this.markers[0].lat, this.markers[0].lng);
      const latlng2 = L.latLng(this.markers[1].lat, this.markers[1].lng);
      const distance = latlng1.distanceTo(latlng2);
      
      const zoom = this.calcularNivelDeZoom(distance);

      this.center = { lat: centerLat, lng: centerLng };
      this.zoom = zoom;

      if (this.leafletMap) {
        this.centerLeafletMap();
      }
    } 
  } 

  calcularNivelDeZoom(distance: number): number{
    if (distance < 1000) return 20;
    else if (distance < 5000) return 15;
    else return 11;
  }

  selectedTabs: { [key: string]: boolean } = {};
  
  async onSearchMotorizedOrder() {
    await this.requestTripService.onLoadingMotorizedService().subscribe((data) => {
        const selectedTabsBackup = { ...this.selectedTabs };
        this.list_order = [];
        data.data.forEach((element) => {
          let order = new ResponseLoadingOrder();
          const timestamp = element.createdAt;
          const date = new Date(timestamp * 1000);
          const year = date.getUTCFullYear();
          const month = date.getUTCMonth() + 1;
          const day = date.getUTCDate();
          const hours = date.getUTCHours();
          const minutes = date.getUTCMinutes();
          const seconds = date.getUTCSeconds();
          const formattedDate = `${year}-${month < 10 ? "0" : ""}${month}-${day < 10 ? "0" : ""}${day} ${hours}:${minutes}:${seconds}`;
          order = element;
          order.date_string = formattedDate;
          let status = element.deliveryMan ? element.deliveryMan.status : element.status;
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
          order.type = element.type
          this.selectedTabs[order.uuid] = selectedTabsBackup[order.uuid];
          this.list_order.push(order);
          this.filteredOrders = this.list_order
          this.filteredOrders = this.list_order.filter(order => order.type === this.filterOrder);
        });
        this.isDoneGetOrders = true;
      });
  }

  filteredOrders: any
  
  async onSearchMotorizedOrderSubscription() {
    await this.requestTripService.onLoadingMotorizedService().subscribe((data) => {
        this.list_order = [];
        data.data.forEach((element) => {
          let order = new ResponseLoadingOrder();
          const timestamp = element.createdAt;
          const date = new Date(timestamp * 1000);
          const year = date.getUTCFullYear();
          const month = date.getUTCMonth() + 1;
          const day = date.getUTCDate();
          const hours = date.getUTCHours();
          const minutes = date.getUTCMinutes();
          const seconds = date.getUTCSeconds();
          const formattedDate = `${year}-${month < 10 ? "0" : ""}${month}-${day < 10 ? "0" : ""}${day} ${hours}:${minutes}:${seconds}`;
          order.date_string = formattedDate;
          let status = element.deliveryMan ? element.deliveryMan.status : element.status;
          order.order_name = this.onPaymentGroup(element.payment.method.type )
          order.status_order = this.onStatusGroup(status);
          order.status = element.status;
          order.status_order_color = this.onStatusGroupColor(status)
          order.user = element.user
          order.deliveryMan = element.deliveryMan;
          order.addresses = element.addresses;
          order.total = element.total;
          order.payment = element.payment;
          order.id = element.id 
          order.uuid = element.uuid
          order.createdAt = element.createdAt
          order.detail = element.detail
          order.productPrice = element.productPrice
          order.readyToDmAt = element.readyToDmAt
          order.isOrderCalendar = element.isOrderCalendar
          order.store=element.store
          order.isCheckedStore=element.isCheckedStore??false
          order.type = element.type
          order.urlTracking = element.urlTracking
          this.list_order.push(order);
          this.filteredOrders = this.list_order
          this.filteredOrders = this.list_order.filter(order => order.type === this.filterOrder);
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
      case enumTypePayment.CASH: order = 'Efectivo'; break;
      case enumTypePayment.CREDIT: order = 'Crédito'; break;
      default: break;
    }
    return order
  }

  statusColor: string

  private onStatusGroup(status: string) {
    let order : string = ''
    switch (status) {
      case enumStatusOrder.preparingOrder: order = "El local está preparando tu orden"; break;
      case enumStatusOrder.toStore: order = "Te estás dirigiendo al local"; break;
      case enumStatusOrder.inStore: order = "Llegué al local"; break;
      case enumStatusOrder.reciveDelivery: order = "Recibí el pedido"; break;
      case enumStatusOrder.toHome: order = "Estás en camino a entregar el pedido"; break;
      case enumStatusOrder.nearHome: order = "Estás cerca del destino"; break;
      case enumStatusOrder.inHome: order = "Has llegado a la puerta del cliente"; break;
      case enumStatusOrder.orderReady: order = "El pedido está listo para recoger"; break;
      case enumStatusOrder.reciveOrderDeliveryMan: order = "El repartidor tiene el pedido"; break;
      case enumStatusOrder.open: order = "Orden abierta"; break;
      case enumStatusOrder.rejectPayment: order = "Orden rechazada"; break;
      case enumStatusOrder.pendingPayment: order = "Pago pendiente"; break;
      default: break;
    }
    return order
  }

  private onStatusGroupColor(status: string) {
    let orderStatusColor : string = ''
    switch (status) {
      case enumStatusOrder.preparingOrder: orderStatusColor = '#689f38'; break;
      case enumStatusOrder.toStore: orderStatusColor = '#fbc02d'; break;
      case enumStatusOrder.inStore: orderStatusColor = '#fbc02d'; break;
      case enumStatusOrder.reciveDelivery: orderStatusColor = '#fbc02d'; break;
      case enumStatusOrder.toHome: orderStatusColor = '#fbc02d'; break;
      case enumStatusOrder.nearHome: orderStatusColor = '#fbc02d'; break;
      case enumStatusOrder.inHome: orderStatusColor = '#689f38'; break;
      case enumStatusOrder.orderReady: orderStatusColor = '#0747A6'; break;
      case enumStatusOrder.reciveOrderDeliveryMan: orderStatusColor = '#fbc02d'; break;
      case enumStatusOrder.open: orderStatusColor = '#689f38'; break;
      case enumStatusOrder.rejectPayment: orderStatusColor = "#dd1f26"; break;
      case enumStatusOrder.pendingPayment: orderStatusColor = "#A80DA3"; break;
      default: break;
    }
    return orderStatusColor
  }

  isDisplayOrderCancelModal:boolean=false
  isLoadingButtonOrderCanceling:boolean=false
  
  btnCancelViaje() {
    if(!(this.reasonCancelOrder?.trim()?.length>0)) return;

    const request = { reason: this.reasonCancelOrder }
    this.isLoadingButtonOrderCanceling=true
    this.requestTripService.onCancelOrderService(this.orderSelected.uuid,request).subscribe(
      (data) => {
        this.isLoadingButtonOrderCanceling=false
        this.isDisplayOrderCancelModal=false
        this.reasonCancelOrder=""
        this.alert.showSuccess('',"Se canceló la orden");
        this.onSearchMotorizedOrder();
        this.onClearMap();
      },
      (error:HttpErrorResponse) => {
        this.isLoadingButtonOrderCanceling=true
        if(error.status==400){
          this.alert.showError('',error.error.messages[0].message);
        }else{
          this.alert.showError('',"Ocurrió un error");
        }
      }
    );
  }
  
  async onUpdateDriver(item: ResponseLoadingOrder) {
    let lstPosiciones: PersonalisationMarker[] = [];
    await this.requestTripService.onViewTrackingMotorizedService(item.uuid).subscribe((viaje) => {
        if (viaje.data) {
          if(viaje.data.position){
            let tittle = viaje.data.deliveryMan.name;
            lstPosiciones.push(
              this.fnDetalleViajeLabelListServiceWeb(
                L.latLng(viaje.data.position.lat, viaje.data.position.lng),
                tittle, -1, "", "", true
              )
            );
            this.lstPosicionConductor = lstPosiciones;
          }
          this.onUpdateIntervalDriver(item);
        } else {
          this.onClearMap();
          this.updatePosition(item);
        }

        setTimeout(() => {
          this.openedOrder.isSpinnerVisible = false;
        }, 1500)
      });
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
    await this.requestTripService.onViewTrackingMotorizedService(item.uuid).subscribe((viaje) => {
        this.viajeTracking = viaje.data
        if (viaje.data) {
          this.polyLines=[]
          const polySuggested=this.drawPolyline(viaje.data.suggestedRoute)
          if(polySuggested) this.polyLines.push(polySuggested)
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
    latLng: L.LatLng,
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
    detalle.idEstado = isEstado;
    detalle.showInfowindow = true;
    detalle.typeServicesId = id;
    detalle.infoWindow = null;
    detalle.view_screen_map = view_screen_map ? view_screen_map : false;
    return detalle;
  }

  onUpdatePosicion(item: Viaje) {}
  viajeOpen: any;
  searchAutomatic: boolean = true;
  flagBuscandoConductor: boolean = true;
  
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
    this.messagesChat = [];
    order.isLoadingChat = true;
    this.chatService.getMessage(order.uuid).subscribe(
      (resp) => {
        order.isLoadingChat = false;
        order.messagesChat = resp.data.map((message) => ChatResponse.toBean(message));
        this.chatComponent.scrollToBottom();
      },
      (error) => {
        order.isLoadingChat = false;
      }
    );
  }

  sendMessage(message: ChatBean) {
    this.chatService.sendMessage(ChatBean.toRequest(message)).subscribe(
      (resp) => {},
      (error) => {}
    );
  }

  redirectOrderTrip(order: any){
    localStorage.setItem('edit-trip', JSON.stringify(order))
    this.router.navigate(['/request-trip'])
  }

  filterOrder: any = 'SendAndReciveStore'

  orderCourseOptions: any[] = [
    { name: 'Manual', value: 'SendAndReciveStore' },
    { name: 'App', value: 'traditional' },
    { name: 'Todos', value: 'all'}
  ];

  onFilterChange() {
    if(this.filterOrder == 'all'){
      this.filteredOrders = this.list_order
    } else {
      this.filteredOrders = this.list_order.filter(order => order.type === this.filterOrder);
    }
  }

  copyClipBoard(value:string){
    this.clipboardService.copy(value);
    this.alert.showSuccess('',"copiado!");
  }

  getFormatDate(timestamp : number){
    const date = new Date(timestamp * 1000);
    let hours = date.getHours();
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  getMinutesRemaining(unixTimestamp: number): number {
    const now = Math.floor(Date.now() / 1000);
    const secondsRemaining = unixTimestamp - now;
    return Math.floor(secondsRemaining / 60);
  }
  
  changeReceivedByStoreMethodAvailable(order: ResponseLoadingOrder){
    const received_by_store_method=order.payment.method.received_by_store_method;
    const uuid=order.uuid;
    this.requestTripService.updateReceivedByStoreMethodAvailable(uuid,received_by_store_method).subscribe(
      (resp)=>{ this.isLoadingReceived_by_store_method_available=false },
      (error)=>{ this.isLoadingReceived_by_store_method_available=false }
    )
  }
}