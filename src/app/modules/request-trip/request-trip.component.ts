import { AfterViewInit, Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import { LatLngLiteral, MouseEvent } from "src/agm/core";
import { StoreService } from "../main/service/store.service";
import { PersonalisationMarker, PersonalisationPolyline, TypeMarkers} from "src/app/directives/informacion/data/enumMapa";
import { Viaje } from "../order-course/data";
import { RequestGeoAutocomplete } from "src/app/directives/informacion/data/serviceGeo";
import { RequestMotorizedOrigin, RequestOrderPayment, RequestTrip} from "./data/request";
import * as UtilModalViaje from "./util-modal-viaje-corporate";
import { RequestTripService } from "./services/request-trip.service";
import { ResponseLoadingOrder, ResponseMotorizedOrigin } from "./data/response";
import { LoadingMotorizedComponent } from "./dialog/loading-motorized/loading-motorized.component";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { environment } from "src/environments/environment";
import { AlertServices } from "../service/alert.service";
import { StoreTripResponse } from "../main/service/data/response";
import { dataSharedService } from "../service/data-shared.service";
import { MenuService } from "src/app/app.menu.service";

interface PolyLine{
  routePoints:RoutePoint[]
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
  selector: "app-request-trip",
  templateUrl: "./request-trip.component.html",
  styleUrls: ["./request-trip.component.scss"],
  providers: [DialogService],
})
export class RequestTripComponent implements OnInit, AfterViewInit {
  @ViewChild("search") searchElementRef: ElementRef;
  origenIcon: any =
    "assets/empresas/" +
    environment.NAME_COMPANY +
    environment.MARKERS.ORIGEN.URL;
  destinoIcon: any =
    "assets/empresas/" +
    environment.NAME_COMPANY +
    environment.MARKERS.DESTINO.URL;
  referenciaIcon: any = "assets/images/busqueda/referencia.svg";
  imgLogo: any = "assets/images/656.png";

  userPhone: string;
  userAttributes: any;

  input_visible_pickup: any;
  inputVisibleDestino: any;
  input_reference_pickup?: string;
  input_reference_destination?: string;
  input_receptorNameOrigin_pickup?:string
  is_disabled_pickup: boolean = true;
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
    }
  ];
  lstPosiciones: PersonalisationMarker[] = [];
  lstPosicionConductor: PersonalisationMarker[] = [];
  //Mapa
  idDragable: boolean = true;
  polilyneRuta: PersonalisationPolyline[] = [];
  minutosEstimados?: Date = undefined;
  metrosEstimados?: number = undefined;
  initMapViewAfter: boolean = false;
  flagInitMap: boolean = false;
  viaje: Viaje = new Viaje();
  // barrnaquilla
  // coberturePosition: RequestGeoAutocomplete = {
  //   key_word: "",
  //   longitude: -74.78132,
  //   latitude: 10.96854,
  // };
  coberturePosition: RequestGeoAutocomplete = {
      key_word: "",
      longitude: -76.9928316,
      latitude: -12.1251109,
    };
  polyline_order?: PersonalisationPolyline[] = [];
  //agm-map
  polyLines :PolyLine[] = [
    {
      routePoints:[]
    }
  ]
  creadDate:Date= new Date()
  minDate:Date= new Date()
  selectedStore:StoreTripResponse
  storesAvailable:StoreTripResponse[]
  uuid_price ?: string
  originMobilePhone: string
  destinationMobilePhone: string
  destinationReceptorName: string
  dataStorePhone: string
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
  activeIndexCalendar: number = 0
  stateOptions: any[];
  method_payment = "efectivo";
  amount?: number = 0;
  cashAmount?: number = 0;
  request_trip: RequestTrip = new RequestTrip();
  ref?: DynamicDialogRef;
  editTripData: any
  validationPhoneStore: string
  nroViaje: number = 0;
  geocoder: google.maps.Geocoder = new google.maps.Geocoder();
  locationData: PolyLine[]
  locationDestination: any
  lat: number 
  lng: number
  zoom = 17;
  isDraggabled: boolean
  data_driver: ResponseMotorizedOrigin[] = [];
  isCheckedStore: boolean = false
  isHiddenInput: boolean = false
  constructor(
    private storeService: StoreService,
    private requestTripService: RequestTripService,
    private dialogService: DialogService,
    private alert:AlertServices,
    private dataShared:dataSharedService,
    private appSer:MenuService
  ) {}
  ngAfterViewInit(): void {}
  ngOnInit(): void {
    // this.center = {
    //   lat: 10.96854,
    //   lng: -74.78132,
    // }
    
    this.editTripData = JSON.parse(localStorage.getItem('edit-trip'))
    if(this.editTripData) {
      this.loadDataForm()
      this.onGetLocationStore();
    } else {
      this.isDraggabled = false
      this.request_trip.readyToDmAt = 0 
      this.request_trip.addresses = [
        {
          addressStreet: "",
          alias: "",
          floor: "",
          phone: "",
          marker: "store",
          point: {
            coordinates: [0, 0],
            type: "",
          },
          sort: 1,
          reference: "",
        },
        {
          addressStreet: "",
          alias: "",
          floor: "",
          phone: "",
          marker: "store",
          point: {
            coordinates: [0, 0],
            type: "",
          },
          sort: 2,
          reference: "",
        },
      ];
      this.findAdressOrigin()
      this.findAdress();
      this.onGetLocationStore();

    }
  }
  loadDataForm(){
    this.enablePickUpInput()
    
    
    setTimeout( () => {
      this.findAdress()
      this.findAdressOrigin()
      
debugger
      this.onUpdateEditOrder(this.editTripData)
      this.input_visible_pickup = this.editTripData.addresses[0].addressStreet

      if(this.validationPhoneStore == this.editTripData.addresses[0].phone){
        this.is_disabled_pickup = true
        this.isHiddenInput = false
      } else {
        this.isCheckedStore = true
        this.is_disabled_pickup = false
        this.isHiddenInput = true
      }
      this.request_trip.isOrderCalendar=this.editTripData.isOrderCalendar
      this.input_reference_pickup = this.editTripData.addresses[0].reference
      this.originMobilePhone = this.editTripData.addresses[0].phone
      this.input_receptorNameOrigin_pickup = this.editTripData.addresses[0].receptorName

      this.inputVisibleDestino = this.editTripData.addresses[1].addressStreet
      this.input_reference_destination = this.editTripData.addresses[1].reference
      this.destinationMobilePhone = this.editTripData.addresses[1].phone
      this.destinationReceptorName = this.editTripData.addresses[1].receptorName
      this.request_trip.description = this.editTripData.detail

      this.method_payment = this.editTripData.payment.method.type
      this.cashAmount = this.editTripData.productPrice

      debugger

      this.request_trip.addresses[0].addressStreet = this.editTripData.addresses[0].addressStreet
      this.request_trip.addresses[0].phone = this.editTripData.addresses[0].phone
      this.request_trip.addresses[0].reference = this.editTripData.addresses[0].reference
      this.request_trip.addresses[0].point.type = 'Point'//this.editTripData.addresses[1].location.type

      this.request_trip.addresses[1].addressStreet = this.editTripData.addresses[1].addressStreet
      this.request_trip.addresses[1].phone = this.editTripData.addresses[1].phone
      this.request_trip.addresses[1].reference = this.editTripData.addresses[1].reference
      this.request_trip.addresses[1].point.type = 'Point'//this.editTripData.addresses[1].location.type

      this.request_trip.addresses[0].point.coordinates[1] = this.editTripData.addresses[0].location.coordinates[1]
      this.request_trip.addresses[0].point.coordinates[0] = this.editTripData.addresses[0].location.coordinates[0]

      this.request_trip.addresses[1].point.coordinates[1] = this.editTripData.addresses[1].location.coordinates[1]
      this.request_trip.addresses[1].point.coordinates[0] = this.editTripData.addresses[1].location.coordinates[0]


      if(this.editTripData.isOrderCalendar == true){
        
        this.activeIndexCalendar = 1
        
        this.creadDate = new Date(this.editTripData.readyToDmAt * 1000)
      } else {
        let differenceInSeconds = this.editTripData.readyToDmAt - this.editTripData.createdAt
        let differenceInMinutes = differenceInSeconds / 60
        this.request_trip.readyToDmAt = Math.round(differenceInMinutes)
      }
      
      this.onGetAmountOrder()
    }, 1500)
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
  async onUpdateEditOrder(item: ResponseLoadingOrder) {
    let lstPosiciones: PersonalisationMarker[] = [];
    await this.requestTripService.onViewTrackingMotorizedService(item.uuid).subscribe((viaje) => {
      if (viaje.data.position) {
        let tittle = viaje.data.deliveryMan.name;
        lstPosiciones.push(
          this.fnDetalleViajeLabelListServiceWeb(new google.maps.LatLng(viaje.data.position.lat, viaje.data.position.lng), tittle, -1, "", "", true)
        );
        this.lstPosicionConductor = lstPosiciones;
      } else {
        this.onClearMap();
        this.updatePositionOrderEdit(item);
      }
    });
  }
  updatePositionOrderEdit(select_service: ResponseLoadingOrder) {

    this.markers = []
    const newMarkersOrigin: Marker = {
      lat: select_service.addresses[0].location.coordinates[1],
      lng: select_service.addresses[0].location.coordinates[0],
      iconUrl: this.globalIconOrigin,
      label: 'Origen',
      isDraggable: false,
    }
    this.markers[0] = newMarkersOrigin

    const newMarkersDestination: Marker = {
      lat: select_service.addresses[1].location.coordinates[1],
      lng: select_service.addresses[1].location.coordinates[0],
      iconUrl: this.globalIconDestination,
      label: 'Destino',
      isDraggable: false,
    }
    this.markers[1] = newMarkersDestination
    this.centrarMapa()
  }
  onClearMap() {
    this.polilyneRuta = [];
    this.lstPosiciones = [];
    this.lstPosicionConductor = [];
  }  
  private onGetLocationStore() {
    //const storesAvailable:StoreTripResponse[]=[]
    this.appSer.getStoreByIdAgent().subscribe((store:any)=>{
      const storeId=store.data.map((sA)=>sA.store_id).join(",")
      this.storeService.onGetLocationStoreService(storeId).subscribe((resp)=>{
        this.storesAvailable=resp.data
        //console.log('resp',resp)
      })
    })
  }
  selectStore(event:any, flagInit : any){
    this.selectedStore= event.item
    const store=this.selectedStore.store
    const tripSetting=this.selectedStore.tripSetting
    
    console.log("resp.data.store",store.phone)
    
    this.validationPhoneStore = store.phone
    this.input_visible_pickup = store.addressStreet+' ('+store.fullName+')';
    this.dataStorePhone = store.phone;
    this.request_trip.addresses[0].point.type = "Point";
    this.request_trip.addresses[0].floor = "";
    this.request_trip.addresses[0].alias = "";
    this.request_trip.addresses[0].marker = "store";
    this.request_trip.addresses[0].addressStreet = this.input_visible_pickup;
    this.request_trip.addresses[0].point.coordinates = [
      store.location.coordinates[0],
      store.location.coordinates[1]
    ];

    // this.input_visible_pickup = this.marker.maintext
    this.markers[0].isDraggable=false
    this.markers[0].onDragEnd=(e)=>{
      console.log(e.coords)
    }
    this.markers[0].label = 'Origen'
    this.markers[0].iconUrl = this.globalIconOrigin
    this.markers[0].lng = store.location.coordinates[0];
    this.markers[0].lat = store.location.coordinates[1];
    this.stateOptions = tripSetting? tripSetting.paymentMethod:this.stateOptions;
    this.center = {
      lat: store.location.coordinates[1],
      lng: store.location.coordinates[0]
    }
    this.method_payment = "CREDIT";
    this.onGetMotorizedPosiitonOrigin();
    this.flagInitMap = flagInit;
    this.updatePosition();
  }
  mapClicked($event: MouseEvent) {
    (this.markers[0].lat = $event.coords.lat),
      (this.markers[0].lng = $event.coords.lng);
  }
  onChangeMapMarkers($event: any, marker: any) {
    this.flagInitMap = false;
    console.log('event--', $event)
    const elementOrigin = <HTMLInputElement>document.getElementById("txtUbicacion_origin");

    const element = <HTMLInputElement>document.getElementById("txtUbicacion");
     var geocoder = new google.maps.Geocoder;
     var latlng = {
      lat: $event.coords?.lat,
      lng: $event.coords?.lng
    };
     geocoder.geocode({
       'location': latlng
     }, (results, status)=> {
       if (status === 'OK') {
         if(marker.label == "Destino"){
           if (results[0]) {
            element.value = results[0].formatted_address;
            this.request_trip.addresses[1].point.type = "Point";
            this.request_trip.addresses[1].floor = "";
            this.request_trip.addresses[1].alias = "";
            this.request_trip.addresses[1].marker = "store";
            this.request_trip.addresses[1].addressStreet = results[0].formatted_address;
            this.request_trip.addresses[1].point.coordinates = [
              $event.coords?.lng,
              $event.coords?.lat,
            ]
            //this.updatePosition();
            this.onGetAmountOrder();
            
           } else {
            this.alert.showError('','No results found');
           }
           
        } 
        if(marker.label == "Origen"){
          if (results[0]) {
            elementOrigin.value = results[0].formatted_address;
            this.request_trip.addresses[0].point.type = "Point";
            this.request_trip.addresses[0].floor = "";
            this.request_trip.addresses[0].alias = "";
            this.request_trip.addresses[0].marker = "store";
            this.request_trip.addresses[0].addressStreet = results[0].formatted_address;
            this.request_trip.addresses[0].point.coordinates = [
              $event.coords?.lng,
              $event.coords?.lat,
            ]
            //this.updatePosition();
            this.onGetAmountOrder();
           } else {
            this.alert.showInfo('','No results found');
           }
        }
       } else {
        this.alert.showInfo('','Geocoder failed due to: ' + status);
       }
     });


  }
   autocompleteOri: google.maps.places.Autocomplete
  findAdressOrigin() {
    //  google.maps.
    const element = <HTMLInputElement>document.getElementById("txtUbicacion_origin");
     this.autocompleteOri = new google.maps.places.Autocomplete(element, {
      types: [],
      fields: ["place_id"],
      componentRestrictions: {
        country: environment.conuntryCode,

      },
    });

    this.autocompleteOri.addListener("place_changed", () => {
      let place: any = this.autocompleteOri.getPlace().place_id;
      this.geocodePlaceIdOrigin(place);
    });
  }
  findAdress() {
    //  google.maps.
    const element = <HTMLInputElement>document.getElementById("txtUbicacion");
    const autocomplete = new google.maps.places.Autocomplete(element, {
      types: [],
      fields: ["place_id"],
      componentRestrictions: {
        country: environment.conuntryCode,
      },
    });

    autocomplete.addListener("place_changed", () => {
      let place: any = autocomplete.getPlace().place_id;
      this.geocodePlaceIdMultidestino(place);
      this.onPlaceSelected();
    });
  }
  geocodePlaceIdOrigin(placeId) {
    
    this.geocoder.geocode({ placeId: placeId }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          this.request_trip.addresses[0].addressStreet =
            results[0].formatted_address;
          this.request_trip.addresses[0].point.type = "Point";
          this.request_trip.addresses[0].floor = "";
          this.request_trip.addresses[0].alias = "";
          this.request_trip.addresses[0].marker = "store";
          this.request_trip.addresses[0].point.coordinates = [
            results[0].geometry.location.lng(),
            results[0].geometry.location.lat(),
          ];

          const newMarkers: Marker = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
            iconUrl: this.globalIconOrigin,
            label: 'Origen',
            isDraggable: true,
            onDragEnd: (e)=>{
              console.log(e.coords)
            }
          }

          this.center = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          }

          this.markers[0] = newMarkers

          // this.geocodePlaceId(place);
          this.onGetMotorizedPosiitonOrigin();
          this.updatePosition();

          if(this.request_trip.addresses[1].point.coordinates[1] && this.request_trip.addresses[1].point.coordinates[0]){
            this.onGetAmountOrder()
          }
        }
      }
    });
  }
  geocodePlaceIdMultidestino(placeId) {
    this.geocoder.geocode({ placeId: placeId }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          this.request_trip.addresses[1].point.type = "Point";
          this.request_trip.addresses[1].floor = "";
          this.request_trip.addresses[1].alias = "";
          this.request_trip.addresses[1].marker = "store";
          this.request_trip.addresses[1].addressStreet =
            results[0].formatted_address;
          this.request_trip.addresses[1].point.coordinates = [
            results[0].geometry.location.lng(),
            results[0].geometry.location.lat()
          ];
          // this.geocodePlaceId(place);


          const newMarkers: Marker = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
            iconUrl: this.globalIconDestination,
            label: 'Destino',
            isDraggable: true,
            onDragEnd: (e)=>{
              console.log(e.coords)
            }
          }

          // this.center = {
          //   lat: results[0].geometry.location.lat(),
          //   lng: results[0].geometry.location.lng(),
          // }

          this.markers[1] = newMarkers

          //this.drawPolyline()

          this.updatePosition();
          this.onGetAmountOrder();
          this.centrarMapa()
        }
      }
    });
  }
  drawPolyline(overviewPolyline: any){
    
    this.locationData = overviewPolyline
    // //this.locationDestination.push(overviewPolyline)

    // const locationArray = this.locationData.map(
    //   (l) => { return {
    //     lat:l[0],
    //     lng:l[1]
    //   } as RoutePoint}
    // );
    //   console.log('polyline', locationArray)

    this.polyLines[0].routePoints = overviewPolyline
   

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
      return 14; // Zoom más alejado si la distancia es larga
    }
  }
  private calcularZoom(bounds: google.maps.LatLngBounds): number { 
    const GLOBE_WIDTH = 256; // Ancho de la proyección de Google Maps 
    const ZOOM_MAX = 21; // Nivel de zoom máximo 
    const ZOOM_MIN = 1; // Nivel de zoom mínimo 
 
    const west = bounds.getSouthWest().lng(); 
    const east = bounds.getNorthEast().lng(); 
    const angle = east - west; 
 
    if (angle < 0) { 
      return ZOOM_MAX; // El mapa completo es visible 
    } 
 
    const zoom = Math.round( 
      Math.log(window.innerWidth * 360 / angle / GLOBE_WIDTH) / Math.LN2 
    ); 
 
    return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom)); 
  }
  updatePosition() {
    var lstPosiciones: PersonalisationMarker[] = [];
    if (this.isCheckedStore == true) {
      lstPosiciones.push(UtilModalViaje.fnDetalleViaje(new google.maps.LatLng(this.request_trip.addresses[0].point.coordinates[1],this.request_trip.addresses[0].point.coordinates[0]),true,"Origen",TypeMarkers.ORIGEN,this.isDraggabled,1,false));
    } else {
      lstPosiciones.push( UtilModalViaje.fnDetalleViaje( new google.maps.LatLng(this.markers[0].lat, this.markers[0].lng),true,"Origen",TypeMarkers.ORIGEN,this.isDraggabled,1,false));
    }
    if (this.request_trip.addresses[1].point.coordinates[0] != 0) {
      lstPosiciones.push(UtilModalViaje.fnDetalleViaje(new google.maps.LatLng( this.request_trip.addresses[1].point.coordinates[1], this.request_trip.addresses[1].point.coordinates[0] ),true,"Destino",TypeMarkers.DESTINO,true,1,false));
    }
    this.lstPosiciones = lstPosiciones;
  }
  onUpdatePositionDriver() {
    var lstPosicionConductor: PersonalisationMarker[] = [];
    if (this.data_driver) {
      lstPosicionConductor = [];
      // this.lstPosicionConductor = this.lstPosiciones.filter(item => item.tipoMarker != TypeMarkers.CONDUCTOR_LABEL)
      for (let item of this.data_driver) {
        lstPosicionConductor.push( UtilModalViaje.fnDetalleViaje(new google.maps.LatLng(item.position.point.coordinates[1]!, item.position.point.coordinates[0]!), true,"Conductor", TypeMarkers.CONDUCTOR_LABEL,false,undefined,1,false));
      }
    } else {
      lstPosicionConductor.push(new PersonalisationMarker());
    }
    this.lstPosicionConductor = lstPosicionConductor;
  }
 
  onGetMotorizedPosiitonOrigin() {
    let request: RequestMotorizedOrigin = {
      origin: {
        lat: this.request_trip.addresses[0].point.coordinates[0],
        lng: this.request_trip.addresses[0].point.coordinates[1],
      },
      payment: {
        method: {
          type: this.method_payment,
        },
      },
    };
    this.requestTripService.onGetMotorizedPositionService(request).subscribe((data) => {
      this.data_driver = data.data;
      this.onUpdatePositionDriver();
    },(error) => {
        this.alert.showError('', "Ocurrió un error");
    });
  }
  onGetAmountOrder() {
    
    let request: RequestOrderPayment = {
      origin: {
        lat: this.request_trip.addresses[0].point.coordinates[1],
        lng: this.request_trip.addresses[0].point.coordinates[0],
      },
      destination: {
        lat: this.request_trip.addresses[1].point.coordinates[1],
        lng: this.request_trip.addresses[1].point.coordinates[0],
      },
    };

    if(request.destination.lat != 0 && request.destination.lng !=0){
      this.requestTripService.onGetPaymentOrderService(request).subscribe((data) => {
          this.uuid_price = data.data.uuid
          this.amount = data.data.amount;
          // setTimeout(()=>{
            // this.polyline_order = [
            //   { coordinateEncoded: data.data.overviewPolyline },
            // ];
            this.drawPolyline(data.data.polyLine)
          // },500)
  
        },
        (error) => {
          this.alert.showError('',"Ocurrió un error al obtener la tarifa");
        }
      );

    } else {
      console.log("Debe haber un destino para calcular el precio");
    }

  }

  onChangeOrder(event:any){
    if(event.index==0){
      debugger
      this.request_trip.isOrderCalendar=false
      if(this.editTripData && this.editTripData.isOrderCalendar == true){
        if(this.editTripData){
          this.request_trip.readyToDmAt=new Date(this.editTripData.readyToDmAt*1000).getMinutes()
        }else{  
          this.request_trip.readyToDmAt=this.creadDate.getMinutes()
        }
      } else {
        this.creadDate = new Date()
      }


    }else{
      if(this.editTripData && this.editTripData.isOrderCalendar == false && this.request_trip.readyToDmAt>0){
        var fecha = new Date()
         var minutos= fecha.getMinutes()+this.request_trip.readyToDmAt
        this.creadDate= new Date(fecha.setMinutes(minutos))
      } else {
        if(this.editTripData){
          this.creadDate=new Date(this.editTripData.readyToDmAt*1000)
        }else{
          var fecha = new Date()
           var minutos= fecha.getMinutes()+this.request_trip.readyToDmAt
          this.creadDate= new Date(fecha.setMinutes(minutos))
        }
      }
      this.request_trip.isOrderCalendar=true
    }
  }
  onSaveOrder() {
    let order: RequestTrip = new RequestTrip();

    if("CASH" === this.method_payment &&  (!this.cashAmount || this.cashAmount ===0 )){
      this.alert.showError('',"monto es obligarotio cuando selecionas efectivo");
      return;
    }

    if(!this.uuid_price || this.uuid_price==''){
      this.alert.showError('',"es obligatorio generar la ruta");
      return;
    }
    const isEmptyOriginMobilePhone=!this.originMobilePhone || this.originMobilePhone.toString().trim().length==0
    const isEmpty=!this.destinationMobilePhone || this.destinationMobilePhone.toString().trim().length==0
    if(this.isCheckedStore == true && (isEmptyOriginMobilePhone && isEmpty)){
      this.alert.showError('',"es obligatorio escribir por lo menos un numero");
      return;
    }

    if ("CASH" === this.method_payment) {
      order.productPrice = this.cashAmount
    }

    order.payment = {
      method: {
        type: this.method_payment,
      },
    };
    order.uuid_price=this.uuid_price
    let fechaActual = Date.now()
    order.readyToDmAt = Number((fechaActual += this.request_trip.readyToDmAt *60 *1000).toString().substring(0,10));
    order.description = this.request_trip.description;
    order.mobile = this.request_trip.mobile;
    order.addresses = [
      {
        addressStreet: "",
        alias: "",
        floor: "",
        phone: "",
        marker: "store",
        point: {
          coordinates: [0, 0],
          type: "Point",
        },
        sort: 1,
        reference: this.input_reference_pickup,
        label : "Recojo"
      },
      {
        addressStreet: "",
        alias: "",
        floor: "",
        phone: "",
        marker: "Point",
        point: {
          coordinates: [0, 0],
          type: "Point",
        },
        sort: 2,
        reference: this.input_reference_destination,
        label : "Entrega Final",
        uuidRoutePrice : this.uuid_price
      },
    ];
    this.request_trip.addresses.forEach((item, index) => {
      if (item.sort == 1) {
        order.addresses[0].addressStreet = item.addressStreet;
        order.addresses[0].phone = this.isCheckedStore == false ? this.dataStorePhone : this.originMobilePhone.toString();
        order.addresses[0].marker = item.marker;
        order.addresses[0].alias = item.alias;
        order.addresses[0].reference = this.input_reference_pickup ? this.input_reference_pickup : '';
        order.addresses[0].floor = item.floor;
        order.addresses[0].point = item.point;
        order.addresses[0].receptorName=this.input_receptorNameOrigin_pickup ? this.input_receptorNameOrigin_pickup : '';
      } else {
        order.addresses[1].phone = this.destinationMobilePhone?.toString()??'';
        order.addresses[1].marker = item.marker;
        order.addresses[1].alias = item.alias;
        order.addresses[1].reference = this.input_reference_destination ? this.input_reference_destination : '';
        order.addresses[1].floor = item.floor;
        order.addresses[1].addressStreet = item.addressStreet;
        order.addresses[1].point = item.point;
        order.addresses[1].receptorName = this.destinationReceptorName ? this.destinationReceptorName : '';
        //order.addresses[1].uuidRoutePrice = item.uuidRoutePrice;
      }
    });
    order.isOrderCalendar=this.request_trip.isOrderCalendar
    if(this.request_trip.isOrderCalendar){
      
      order.readyToDmAt=Number(this.creadDate.getTime().toString().substring(0,10))
      
    }
    this.requestTripService.onSaveOrderService(order).subscribe((data) => {
        this.ref = this.dialogService.open(LoadingMotorizedComponent, {
          header: "Repartidor",
          data: {
            isUpdated: false
          }
        });
        // alert("Se guardó correctamente");
      },
      (error) => {
        this.alert.showError('',"Ocurrió un error");
      }
    );
    
  }

  convertToTimestamp(minutos: number): number {
    const segundos = minutos * 60;
    const timestamp = segundos * 1000; 
    return timestamp;
  }

  onUpdateOrder() {
    debugger
    let order: RequestTrip = new RequestTrip();


    if("CASH" === this.method_payment &&  (!this.cashAmount || this.cashAmount ===0 )){
      this.alert.showError('',"monto es obligarotio cuando selecionas efectivo");
      return;
    }

    if(!this.uuid_price || this.uuid_price==''){
      this.alert.showError('',"es obligatorio generar la ruta");
      return;
    }
    const isEmptyOriginMobilePhone=!this.originMobilePhone || this.originMobilePhone.toString().trim().length==0
    const isEmpty=!this.destinationMobilePhone || this.destinationMobilePhone.toString().trim().length==0
    if(this.isCheckedStore == true && (isEmptyOriginMobilePhone && isEmpty)){
      this.alert.showError('',"es obligatorio escribir por lo menos un numero");
      return;
    }

    if ("CASH" === this.method_payment) {
      order.productPrice = this.cashAmount
    }

    order.payment = {
      method: {
        type: this.method_payment,
      },
    };

    order.uuid = this.editTripData.uuid

    order.uuid_price=this.uuid_price

    
    if(this.request_trip.isOrderCalendar){
      
      order.readyToDmAt=Number(this.creadDate.getTime().toString().substring(0,10)) 
    } else {
      let readyToDmAt =  this.minutesToReadyToDm(this.request_trip.readyToDmAt,this.editTripData.createdAt );
      
      order.readyToDmAt = this.request_trip.readyToDmAt ? readyToDmAt : 0;
    }


    order.description = this.request_trip.description;
    order.mobile = this.request_trip.mobile;
    order.addresses = [
      {
        addressStreet: "",
        alias: "",
        floor: "",
        phone: "",
        marker: "store",
        point: {
          coordinates: [0, 0],
          type: "Point",
        },
        sort: 1,
        reference: this.input_reference_pickup,
        label : "Recojo"
      },
      {
        addressStreet: "",
        alias: "",
        floor: "",
        phone: "",
        marker: "point",
        point: {
          coordinates: [0, 0],
          type: "Point",
        },
        sort: 2,
        reference: this.input_reference_destination,
        label : "Entrega Final",
        uuidRoutePrice : this.uuid_price
      },
    ];

    this.request_trip.addresses.forEach((item, index) => {
      if (item.sort == 1) {
        order.addresses[0].id = this.editTripData.addresses[0].id
        order.addresses[0].addressStreet = item.addressStreet;
        order.addresses[0].phone = this.isCheckedStore == false ? this.dataStorePhone : this.originMobilePhone.toString();
        order.addresses[0].marker = item.marker;
        order.addresses[0].alias = item.alias;
        order.addresses[0].reference = this.input_reference_pickup ? this.input_reference_pickup : '';
        order.addresses[0].floor = item.floor;
        order.addresses[0].point = item.point;        
        order.addresses[0].receptorName=this.input_receptorNameOrigin_pickup ? this.input_receptorNameOrigin_pickup : '';
    
      } else {
        order.addresses[1].id = this.editTripData.addresses[1].id
        order.addresses[1].phone = this.destinationMobilePhone?.toString()??'';
        order.addresses[1].marker = item.marker;
        order.addresses[1].alias = item.alias;
        order.addresses[1].reference = this.input_reference_destination ? this.input_reference_destination : '';
        order.addresses[1].floor = item.floor;
        order.addresses[1].addressStreet = item.addressStreet;
        order.addresses[1].point = item.point;
        order.addresses[1].receptorName = this.destinationReceptorName ? this.destinationReceptorName : '';
        //order.addresses[1].uuidRoutePrice = item.uuidRoutePrice;
      }
    });
    order.isOrderCalendar=this.request_trip.isOrderCalendar
    
    
    this.requestTripService.onUpdateOrderService(order).subscribe(
      (data) => {
        this.ref = this.dialogService.open(LoadingMotorizedComponent, {
          header: "Repartidor",
          data: {
            isUpdated: true
          }
        });
        // alert("Se guardó correctamente");
      },
      (error) => {
        this.alert.showError('',"Ocurrió un error");
        
      }
    );
    
  }

  minutesToReadyToDm(addMinutes:number,create?:number){ 
    let newDate = new Date(); 
    if(create){ 
        newDate=new Date(create*1000); 
    } 
    newDate.setMinutes(newDate.getMinutes() + addMinutes); 
    return Number(newDate.getTime().toString().substring(0,10)) 
  }

  enablePickUpInput(){
    const element = <HTMLInputElement>document.getElementById("txtUbicacion_origin");    
    if(this.isCheckedStore == true){
      this.isDraggabled = true
      this.findAdressOrigin()
      this.updatePosition()
      //this.onGetLocationStore(false)
      this.is_disabled_pickup = !this.is_disabled_pickup
      this.isHiddenInput = !this.isHiddenInput
    } 
    else {
      this.is_disabled_pickup = !this.is_disabled_pickup
      this.isHiddenInput = !this.isHiddenInput
      this.input_reference_pickup = ''
      this.request_trip.mobile = null
      this.input_visible_pickup=''
      this.request_trip.addresses = [
        {
          addressStreet: "",
          alias: "",
          floor: "",
          phone: "",
          marker: "store",
          point: {
            coordinates: [0, 0],
            type: "",
          },
          sort: 1,
          reference: "",
        },
        {
          addressStreet: "",
          alias: "",
          floor: "",
          phone: "",
          marker: "store",
          point: {
            coordinates: [0, 0],
            type: "",
          },
          sort: 2,
          reference: "",
        },
      ];
      this.onGetLocationStore();
    }
  }

  isButtonDisabled: boolean = true;

  onInputChange(value: any) {
    if(value === ''){
      this.isButtonDisabled = !this.isButtonDisabled
    }
  }

  onPlaceSelected() {
    this.isButtonDisabled = !this.isButtonDisabled;
  }
  
}
