import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
} from "@angular/core";
import { Viaje } from "./data";
import { MouseEvent } from "src/agm/core";
import { RequestTripService } from "../request-trip/services/request-trip.service";
import {
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
    private mqtt: MqttService
  ) {}

  list_order: ResponseLoadingOrder[] = [];
  idClient?: string;
  center: any = {
    lat: 10.96854,
    lng: -74.78132,
  };
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
    longitude: -76.9928316,
    latitude: -12.1251109,
  };
  ngAfterViewInit() {}
  isMqttConnect: boolean = false;
  isDoneGetOrders: boolean = false;

  async ngOnInit() {
    this.initMapViewAfter = true;
    // this.idClient = this.dataMaestra.user?.uuid
    // this.onIntervalServiceCourseTab()
    this.suscriptionWebSocket();
    await this.onOrderCourseIntervalSubscription(0);
    this.mqtt._onConnect.subscribe((isConnect) => {
      if (isConnect) {
        this.isMqttConnect = isConnect;
        this.mqttListener();
        this.validOrdersSubscribe();
      }
    });
  }
  validOrdersSubscribe() {
    if (this.isMqttConnect && this.isDoneGetOrders) {
      this.list_order.forEach((order) => {
        this.subscribeOrder(order.uuid);
        this.subscribeChat(order.uuid);
      });
    }
  }
  mqttListener() {
    this.orderHandler._data.subscribe((asyncData) => {
      debugger
      if (asyncData) {
        if (asyncData.data.status === CONSTANTES.CANCEL_ORDER_STATUS) {
          let find_order: any = this.list_order.findIndex(
            (item) => item.uuid === asyncData.data.uuid
          );
          // let find_order_open :any = this.ordersOpen.findIndex(item => item.uuid === asyncData.data.uuid)
          this.list_order.splice(find_order, 1);
          // this.ordersOpen.splice(find_order_open,1)
        } else {
          let orderMqtt = OrderResponse.toBean(asyncData.data);
          let orderIndex = this.orders.findIndex(
            (order) => order.id === orderMqtt.id
          );
          let order_response : ResponseLoadingOrder = new ResponseLoadingOrder()
          order_response.deliveryMan = orderMqtt.deliveryMan
          order_response.createdAt = orderMqtt.createdAt
          order_response.deliveryPrice = orderMqtt.deliveryPrice
          order_response.id = orderMqtt.id
          order_response.uuid = orderMqtt.uuid
          // order_response.addresses = orderMqtt. 
          order_response.order_name = this.onPaymentGroup(orderMqtt.payment.method.type )
          let status = orderMqtt.deliveryMan
          ? orderMqtt.deliveryMan.status
          : orderMqtt.status;
          order_response.order_name = this.onPaymentGroup(orderMqtt.payment.method.type )
          this.list_order[orderIndex] = order_response;
          console.log(orderMqtt);
        }
        this.sortOrders();
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
    }, 3000);
  }
  async onOrderCourseIntervalSubscription(index: number) {
    await this.onSearchMotorizedOrderSubscription();
    this.interval_motorized_order = setInterval(() => {
      this.onSearchMotorizedOrderSubscription();
    }, 3000);
  }
  ngOnDestroy(): void {
    clearInterval(this.interval_motorized_order);
    // if (this.suscripcionTopic) {
    //   this.webSocketMqtt.ususcribeSuscription(this.suscripcionTopic.id!);
    // }
  }
  onClearMap() {
    this.polilyneRuta = [];
    this.lstPosiciones = [];
    this.lstPosicionConductor = [];
  }
  onTabClose(envios: any) {
    this.onClearMap();
    this.flagAccordion = false;
    this.onOrderCourseInterval(envios.index);
    clearInterval(this.set_interval_driver);
  }
  flagAccordion: boolean = false;
  async onTapOpen(envios: any, flagAccordion: boolean) {
    clearInterval(this.set_interval_driver);
    this.flagAccordion = true;
    this.onClearMap();
    // await this.onGetRouteServiceShared(select_service)
    // this.onUpdatePosicion(select_service)
    // this.getServiceRouteAssigned(select_service.id)
    clearInterval(this.interval_motorized_order);
    this.onViewOrder(envios.index);
  }
  onViewOrder(index: number) {
    let select_service: ResponseLoadingOrder = this.list_order[index];
    this.onChangePolyline(select_service);
    this.onUpdateDriver(select_service);
  }
  onChangePolyline(item: ResponseLoadingOrder) {}
  updatePosition(select_service: ResponseLoadingOrder) {
    var lstPosiciones: PersonalisationMarker[] = [];
    lstPosiciones.push(
      UtilModalViaje.fnDetalleViaje(
        new google.maps.LatLng(
          select_service.addresses[0].location.coordinates[0],
          select_service.addresses[0].location.coordinates[1]
        ),
        true,
        "Origen",
        TypeMarkers.ORIGEN,
        true,
        1,
        false
      )
    );
    if (select_service.addresses.length > 1) {
      lstPosiciones.push(
        UtilModalViaje.fnDetalleViaje(
          new google.maps.LatLng(
            select_service.addresses[1].location.coordinates[0],
            select_service.addresses[1].location.coordinates[1]
          ),
          true,
          "Destino",
          TypeMarkers.DESTINO,
          true,
          1,
          false
        )
      );
    }

    this.lstPosiciones = lstPosiciones;
  }
  async onSearchMotorizedOrder() {
    await this.requestTripService
      .onLoadingMotorizedService()
      .subscribe((data) => {
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
          this.list_order.push(order);
        });
        this.isDoneGetOrders = true;
      });
  }
  async onSearchMotorizedOrderSubscription() {
    await this.requestTripService
      .onLoadingMotorizedService()
      .subscribe((data) => {
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
  private onStatusGroup(status: string) {
    let order : string = ''
    switch (status) {
      case enumStatusOrder.preparingOrder:
        order = "El local está preparando tu orden";
        break;
      case enumStatusOrder.toStore:
        order = "Te estas dirigiendo al local";
        break;
      case enumStatusOrder.inStore:
        order = "Llegue al local";
        break;
      case enumStatusOrder.reciveDelivery:
        order = "Recibi el pedido";
        break;
      case enumStatusOrder.toHome:
        order = "Estas en camino a entregar el pedido";
        break;
      case enumStatusOrder.nearHome:
        order = "Estas cerca del destino";
        break;
      case enumStatusOrder.inHome:
        order = "Has llegado a la puerta del cliente";
        break;
      case enumStatusOrder.orderReady:
        order = "El pedido esta listo para recoger";
        break;
      default:
        break;
    }
    return order
  }

  btnCancelViaje(item: ResponseLoadingOrder) {
    this.requestTripService.onCancelOrderService(item.uuid).subscribe(
      (data) => {
        alert("Se canceló la orden");
        this.onSearchMotorizedOrder();
        this.onClearMap();
      },
      (error) => {
        alert("Ocurrió un error");
      }
    );
    // this.cancelViaje.emit(item)
  }
  async onUpdateDriver(item: ResponseLoadingOrder) {
    let lstPosiciones: PersonalisationMarker[] = [];
    await this.requestTripService
      .onViewTrackingMotorizedService(item.uuid)
      .subscribe((viaje) => {
        if (viaje.data.position) {
          let tittle = viaje.data.deliveryMan.name;
          lstPosiciones.push(
            this.fnDetalleViajeLabelListServiceWeb(
              new google.maps.LatLng(
                viaje.data.position.lat,
                viaje.data.position.lng
              ),
              tittle,
              -1,
              "",
              "",
              true
            )
          );
          this.onUpdateIntervalDriver(item);
          this.lstPosicionConductor = lstPosiciones;
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
  async onUpdateDriverPullRequest(item: ResponseLoadingOrder) {
    let lstPosiciones: PersonalisationMarker[] = [];
    await this.requestTripService
      .onViewTrackingMotorizedService(item.uuid)
      .subscribe((viaje) => {
        if (viaje.data.position) {
          let tittle = viaje.data.deliveryMan.name;
          lstPosiciones.push(
            this.fnDetalleViajeLabelListServiceWeb(
              new google.maps.LatLng(
                viaje.data.position.lat,
                viaje.data.position.lng
              ),
              tittle,
              -1,
              "",
              "",
              true
            )
          );

          this.lstPosicionConductor = lstPosiciones;
        } else {
          this.onClearMap();
        }
        this.updatePosition(item);
      });

    // let lstPosiciones = cloneDeep(
    //   this.fnLstPosicionesByDriver(
    //     this.enviosServicio,
    //     )
    //   )
    // this.lstPosiciones.emit(lstPosiciones)
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
  updateLstViajesV2(position_element: number, element: any) {
    // let viaje : Viaje = fnInitObjViajeOpe(element);
    // console.log("antes de entrar a updateElementViaje")
    // console.log(viaje)
    // this.updateElementViaje(position_element, viaje);
    // // this.orderArray()
  }
  validateFiltrosElement(element: Viaje) {}
  flagBuscandoConductor: boolean = true;

  //#region  push
  suscriptionWebSocket() {
    // this.webSocketMqtt.suscribeSuscription(this).then((data) => {
    //   this.suscripcionTopic = data;
    // }).catch((error) => {
    //   console.log(error);
    // })
  }
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
}
