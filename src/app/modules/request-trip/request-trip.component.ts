import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, OnDestroy, ChangeDetectorRef} from "@angular/core";
import * as L from 'leaflet';
import { StoreService } from "../main/service/store.service";
import { PersonalisationMarker, PersonalisationPolyline, TypeMarkers} from "src/app/directives/informacion/data/enumMapa";
import { AddressSuggestionBean, Viaje } from "../order-course/data";
import { RequestGeoAutocomplete } from "src/app/directives/informacion/data/serviceGeo";
import { RequestMotorizedOrigin, RequestOrderPayment, RequestTrip} from "./data/request";
import * as UtilModalViaje from "./util-modal-viaje-corporate";
import { RequestTripService } from "./services/request-trip.service";
import { CustomerExpressResponse, ResponseLoadingOrder, ResponseMotorizedOrigin, ZoneResponse } from "./data/response";
import { LoadingMotorizedComponent } from "./dialog/loading-motorized/loading-motorized.component";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { environment } from "src/environments/environment";
import { AlertServices } from "../service/alert.service";
import { StoreTripResponse, TagOrderResponse } from "../main/service/data/response";
import { DataSharedService } from "../service/data-shared.service";
import { MenuService } from "src/app/app.menu.service";
import { AppMainComponent } from "src/app/app.main.component";
import { HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { COUNTRYCODE, NUMBERPHONELENGTH } from 'src/app/utils/constant';
import { CountryCode, CountryCodes } from 'src/app/utils/country-codes';
import { AddressSuggestionResponse } from "../order-course/data/response";
import { CustomerExpressService } from "./services/customer-express.service";
import { FilterRequest } from "../order-history/service/data/request";
import { ShareLocationService } from "../service/share-location.service";

// Interfaces para compatibilidad
interface LatLngLiteral {
  lat: number;
  lng: number;
}
type InputType = 'coordinates' | 'place' | 'autocomplete' | 'linkconvert';
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
  onDragEnd?:(e:any)=>void
}

@Component({
  selector: "app-request-trip",
  templateUrl: "./request-trip.component.html",
  styleUrls: ["./request-trip.component.scss"],
  providers: [DialogService],
})
export class RequestTripComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("search") searchElementRef: ElementRef;
  
  // Leaflet
  private leafletMap: L.Map;
  private leafletMarkers: L.Marker[] = [];
  private leafletPolyline: L.Polyline;
  private originIcon: L.DivIcon;
  private destinationIcon: L.DivIcon;
  
  // Estado del mapa: 'total' | 'partial' | 'form'
  mapViewState: 'total' | 'partial' | 'form' = 'partial';
  
  origenIcon: any =
    "assets/empresas/" +
    environment.NAME_COMPANY +
    environment.MARKERS.ORIGEN.URL;
  destinoIcon: any =
    "assets/empresas/" +
    environment.NAME_COMPANY +
    environment.MARKERS.DESTINO.URL;
  referenciaIcon: any = "assets/images/REFERENCIA_VERDE.png";
  imgLogo: any = "assets/images/icono-piwi.png";

  userPhone: string;
  userAttributes: any;

  input_visible_pickup: any;
  inputVisibleDestino: any;
  input_reference_pickup?: string;
  input_reference_destination?: string;
  input_receptorNameOrigin_pickup?:string
  is_disabled_pickup: boolean = true;
  center: LatLngLiteral = {
    lat: environment.centermap.lat,
    lng: environment.centermap.lng,
  };
  markers: Marker[] = [
    {
      maintext: "Barranquilla",
      secondText: "Hotel atrium",
      lat: environment.centermap.lat,
      lng: environment.centermap.lng
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
  coberturePosition: RequestGeoAutocomplete = {
      key_word: "",
      longitude: environment.centermap.lng,
      latitude: environment.centermap.lat,
    };
  polyline_order?: PersonalisationPolyline[] = [];
  //agm-map
  polyLines :PolyLine[] = [
    {
      routePoints:[]
    }
  ]
  mapStyles: any[] = [
    {
      featureType: 'poi',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      stylers: [{ visibility: 'off' }]
    }
  ];
  gestureHandling="greedy"
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
      height: 70,
      width: 60
    }
  }
  globalIconDestination: any = {
    url: this.destinoIcon,
    scaledSize: {
      height: 70,
      width: 60 
    }
  }
  activeIndexCalendar: number = 0
  stateOptions: any[]=[];
  method_payment = "efectivo";
  amount?: number = 0;
  cashAmount?: number = null;
  request_trip: RequestTrip = new RequestTrip();
  ref?: DynamicDialogRef;
  editTripData: any
  validationPhoneStore: string
  nroViaje: number = 0;
  locationData: PolyLine[]
  locationDestination: any
  lat: number 
  lng: number
  zoom = 17;
  isDraggabled: boolean
  data_driver: ResponseMotorizedOrigin[] = [];
  isHiddenInput: boolean = false

  countryCodes: CountryCode[] = CountryCodes;
  selectCountryCode: CountryCode = CountryCodes.find(country => country.dial_code == environment.countryDial);
  tagsOrderSelect:TagOrderResponse[]
  storeSelected:any
  constructor(
    private storeService: StoreService,
    private requestTripService: RequestTripService,
    private dialogService: DialogService,
    private alert:AlertServices,
    private dataShared:DataSharedService,
    private appSer:MenuService,
    private main: AppMainComponent,
    private readonly customerExpressService: CustomerExpressService,
    private cdr: ChangeDetectorRef,
    private shareLocation: ShareLocationService 
  ) {
    this.storeSelected=JSON.parse(localStorage.getItem('storeBean'))
  }
  ngAfterViewInit(): void {
    // Esperar a que el documento esté completamente cargado
    if (document.readyState === 'complete') {
      this.initMapWhenReady();
    } else {
      window.addEventListener('load', () => {
        this.initMapWhenReady();
      });
    }
  }
  
  private initMapWhenReady(): void {
    // Usar requestAnimationFrame para esperar al siguiente ciclo de renderizado
    requestAnimationFrame(() => {
      setTimeout(() => {
        if(!this.stateOptions||this.stateOptions.length==0){
          this.stateOptions=this.main.DataStore.tripSetting.paymentMethod
        }
        
        // Forzar el estado parcial para asegurar que el contenedor tenga altura
        this.mapViewState = 'partial';
        
        // Forzar detección de cambios para que Angular actualice el DOM
        this.cdr.detectChanges();
        
        // Esperar un frame más para que el CSS se aplique
        requestAnimationFrame(() => {
          // Intentar inicializar mapa
          this.tryInitLeafletMap();
          
          // Configurar reintentos cada 300ms si no se inicializó
          if (!this.leafletMap && !this.mapInitRetryInterval) {
            this.mapInitRetryInterval = setInterval(() => {
              this.tryInitLeafletMap();
            }, 300);
          }
        });
      }, 100);
    });
    
    // Invalidar tamaño después de que Angular complete el render
    setTimeout(() => {
      if (this.leafletMap) {
        this.leafletMap.invalidateSize();
      }
    }, 1500);
  }

  ngOnDestroy(): void {
    if (this.leafletMap) {
      this.leafletMap.remove();
    }
    if (this.mapInitRetryInterval) {
      clearInterval(this.mapInitRetryInterval);
    }
    if (this.tileCheckInterval) {
      clearInterval(this.tileCheckInterval);
    }
  }

  // Intervalo para reintentar inicialización del mapa
  private mapInitRetryInterval: any;
  private mapInitRetries = 0;
  private readonly MAX_RETRIES = 25; // 5 segundos máximo (25 * 200ms)
  
  // Validación automática de tiles cargados
  private tileCheckInterval: any;
  private tileCheckRetries = 0;
  private readonly MAX_TILE_CHECK_RETRIES = 5;
  private tilesLoaded = false;

  // Verificar si el contenedor tiene dimensiones válidas
  private isMapContainerReady(): boolean {
    const container = document.getElementById('leaflet-map');
    if (!container) {
      console.log('Contenedor leaflet-map no encontrado');
      return false;
    }
    
    // Forzar reflow del DOM para obtener dimensiones correctas
    container.offsetHeight;
    
    const rect = container.getBoundingClientRect();
    const ready = rect.width > 50 && rect.height > 50;
    
    if (!ready) {
      console.log(`Contenedor no listo: ${rect.width}x${rect.height}`);
      
      // Intentar forzar altura si el contenedor existe pero no tiene dimensiones
      if (rect.height < 50) {
        const parent = container.parentElement;
        if (parent) {
          parent.style.minHeight = '200px';
          container.style.minHeight = '200px';
          container.style.height = '100%';
        }
      }
    }
    return ready;
  }

  // Inicializar mapa con reintentos
  private tryInitLeafletMap(): void {
    if (this.leafletMap) {
      if (this.mapInitRetryInterval) {
        clearInterval(this.mapInitRetryInterval);
      }
      return;
    }
    
    if (this.isMapContainerReady()) {
      this.initLeafletMap();
      if (this.mapInitRetryInterval) {
        clearInterval(this.mapInitRetryInterval);
      }
    } else {
      this.mapInitRetries++;
      console.log(`Intento ${this.mapInitRetries}/${this.MAX_RETRIES} de inicializar mapa`);
      if (this.mapInitRetries >= this.MAX_RETRIES) {
        // Forzar inicialización después de muchos intentos
        console.warn('Forzando inicialización del mapa después de máximos reintentos');
        this.initLeafletMap();
        if (this.mapInitRetryInterval) {
          clearInterval(this.mapInitRetryInterval);
        }
      }
    }
  }

  // Alternar vista del mapa (tristate: total -> partial -> form -> total)
  toggleMapExpand(): void {
    const previousState = this.mapViewState;
    
    switch (this.mapViewState) {
      case 'partial':
        this.mapViewState = 'total';
        break;
      case 'total':
        this.mapViewState = 'form';
        break;
      case 'form':
        this.mapViewState = 'partial';
        break;
    }
    
    // Si venimos del estado 'form', el mapa se vuelve visible
    // Necesita múltiples invalidateSize para asegurar renderizado
    if (previousState === 'form') {
      this.refreshMap();
    } else {
      // Recalcular tamaño del mapa después de la animación
      setTimeout(() => {
        if (this.leafletMap) {
          this.leafletMap.invalidateSize();
        }
      }, 350);
    }
  }

  // Método para refrescar el mapa (útil cuando no carga correctamente)
  refreshMap(): void {
    if (!this.leafletMap) {
      // Si el mapa no existe, intentar inicializarlo
      this.tryInitLeafletMap();
      return;
    }
    
    // Forzar invalidateSize
    this.leafletMap.invalidateSize();
    
    // Forzar recarga de tiles
    this.leafletMap.eachLayer((layer: any) => {
      if (layer.redraw) {
        layer.redraw();
      }
    });
    
    // Múltiples invalidateSize con diferentes delays
    [50, 150, 300, 500, 800].forEach(delay => {
      setTimeout(() => {
        if (this.leafletMap) {
          this.leafletMap.invalidateSize();
        }
      }, delay);
    });
  }
  
  // Verificar si el mapa está cargado (para mostrar/ocultar botón refresh)
  isMapLoaded(): boolean {
    return this.tilesLoaded || this.checkTilesVisible();
  }

  // Obtener texto del botón según estado
  getMapButtonText(): string {
    switch (this.mapViewState) {
      case 'partial': return 'Ver mapa completo';
      case 'total': return 'Solo formulario';
      case 'form': return 'Ver mapa';
    }
  }

  // Obtener icono del botón según estado
  getMapButtonIcon(): string {
    switch (this.mapViewState) {
      case 'partial': return 'pi-expand';
      case 'total': return 'pi-list';
      case 'form': return 'pi-map';
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

    // Verificar que el contenedor exista
    const container = document.getElementById('leaflet-map');
    if (!container) {
      console.warn('Contenedor del mapa no encontrado, reintentando...');
      return;
    }

    // Crear iconos personalizados con forma de PIN
    this.originIcon = this.createPinIcon(this.origenIcon, '#47AC34');
    this.destinationIcon = this.createPinIcon(this.destinoIcon, '#eb0045');

    try {
      // Inicializar mapa
      this.leafletMap = L.map('leaflet-map', {
        center: [this.center.lat, this.center.lng],
        zoom: this.zoom,
        zoomControl: true
      });

      // Agregar capa de OpenStreetMap con listener de carga
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.leafletMap);

      // Listener cuando los tiles se cargan
      tileLayer.on('load', () => {
        console.log('Tiles cargados correctamente');
        this.tilesLoaded = true;
        if (this.tileCheckInterval) {
          clearInterval(this.tileCheckInterval);
        }
        if (this.leafletMap) {
          this.leafletMap.invalidateSize();
        }
      });

      // Listener de error en tiles
      tileLayer.on('tileerror', (error) => {
        console.warn('Error cargando tile:', error);
      });

      // Múltiples invalidateSize para asegurar renderizado correcto
      [100, 300, 600, 1000, 2000].forEach(delay => {
        setTimeout(() => {
          if (this.leafletMap) {
            this.leafletMap.invalidateSize();
          }
        }, delay);
      });

      // Listener para resize de ventana con debounce
      let resizeTimeout: any;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (this.leafletMap) {
            this.leafletMap.invalidateSize();
          }
        }, 100);
      });

      // Crear markers iniciales
      this.updateLeafletMarkers();
      
      // Iniciar validación automática de carga de tiles
      this.startTileLoadCheck();
      
      console.log('Mapa Leaflet inicializado correctamente');
    } catch (error) {
      console.error('Error al inicializar mapa Leaflet:', error);
      // Resetear para permitir reintento
      this.leafletMap = null;
    }
  }
  
  // Validación automática cada 2s para verificar si el mapa cargó
  private startTileLoadCheck(): void {
    this.tileCheckRetries = 0;
    this.tilesLoaded = false;
    
    // Limpiar interval anterior si existe
    if (this.tileCheckInterval) {
      clearInterval(this.tileCheckInterval);
    }
    
    this.tileCheckInterval = setInterval(() => {
      this.tileCheckRetries++;
      
      // Verificar si hay tiles visibles en el contenedor
      const tilesVisible = this.checkTilesVisible();
      
      if (tilesVisible || this.tilesLoaded) {
        console.log('✓ Mapa cargado correctamente');
        clearInterval(this.tileCheckInterval);
        return;
      }
      
      console.log(`Verificación ${this.tileCheckRetries}/${this.MAX_TILE_CHECK_RETRIES}: Mapa no cargado, refrescando...`);
      this.refreshMap();
      
      if (this.tileCheckRetries >= this.MAX_TILE_CHECK_RETRIES) {
        console.warn('Máximo de reintentos de carga de mapa alcanzado');
        clearInterval(this.tileCheckInterval);
      }
    }, 2000); // Cada 2 segundos
  }
  
  // Verificar si hay tiles cargados visualmente
  private checkTilesVisible(): boolean {
    const container = document.getElementById('leaflet-map');
    if (!container) return false;
    
    // Verificar si hay imágenes de tiles cargadas
    const tiles = container.querySelectorAll('.leaflet-tile-loaded');
    return tiles.length > 0;
  }

  private updateLeafletMarkers(): void {
    if (!this.leafletMap) return;

    // Limpiar markers existentes
    this.leafletMarkers.forEach(marker => marker.remove());
    this.leafletMarkers = [];

    // Filtrar markers válidos
    const validMarkers = this.markers.filter(m => m.lat && m.lng && !(m.lat === 0 && m.lng === 0));

    // Crear markers
    this.markers.forEach((marker, index) => {
      if (!marker.lat || !marker.lng || (marker.lat === 0 && marker.lng === 0)) return;

      const icon = index === 0 ? this.originIcon : this.destinationIcon;
      const leafletMarker = L.marker([marker.lat, marker.lng], {
        icon: icon,
        draggable: marker.isDraggable ?? false
      }).addTo(this.leafletMap);

      // Agregar popup con label
      if (marker.label) {
        leafletMarker.bindPopup(marker.label);
      }

      // Manejar drag
      if (marker.isDraggable) {
        leafletMarker.on('dragend', (e: L.DragEndEvent) => {
          const newLatLng = (e.target as L.Marker).getLatLng();
          this.onChangeMapMarkers({ coords: { lat: newLatLng.lat, lng: newLatLng.lng } }, marker);
        });
      }

      this.leafletMarkers.push(leafletMarker);
    });

    // Centrar mapa según cantidad de markers
    if (validMarkers.length === 1) {
      // Solo un marker (tienda) - centrar en él
      this.leafletMap.setView([validMarkers[0].lat, validMarkers[0].lng], 16);
    } else if (validMarkers.length >= 2) {
      // Dos o más markers - ajustar bounds para mostrar todos
      const bounds = L.latLngBounds(validMarkers.map(m => [m.lat, m.lng] as L.LatLngTuple));
      this.leafletMap.fitBounds(bounds, { padding: [50, 50] });
    }

    // Actualizar polyline si hay puntos
    this.updateLeafletPolyline();
  }

  private updateLeafletPolyline(): void {
    if (!this.leafletMap) return;

    // Remover polyline existente
    if (this.leafletPolyline) {
      this.leafletPolyline.remove();
    }

    // Crear polyline si hay puntos
    if (this.polyLines.length > 0 && this.polyLines[0].routePoints && this.polyLines[0].routePoints.length > 0) {
      const points: L.LatLngExpression[] = this.polyLines[0].routePoints.map(p => [p.lat, p.lng]);
      this.leafletPolyline = L.polyline(points, {
        color: '#eb0045',
        weight: 5,
        opacity: 0.8
      }).addTo(this.leafletMap);
      
      // Ajustar vista para mostrar toda la ruta
      this.leafletMap.fitBounds(this.leafletPolyline.getBounds(), { padding: [50, 50] });
    }
  }

  private centerLeafletMap(): void {
    if (!this.leafletMap || this.markers.length < 2) return;

    const validMarkers = this.markers.filter(m => m.lat && m.lng && !(m.lat === 0 && m.lng === 0));
    if (validMarkers.length < 2) return;

    const bounds = L.latLngBounds(validMarkers.map(m => [m.lat, m.lng] as L.LatLngTuple));
    this.leafletMap.fitBounds(bounds, { padding: [50, 50] });
  }

  ngOnInit(): void {
    this.editTripData = JSON.parse(localStorage.getItem('edit-trip'))
    if(this.editTripData) {
      console.log()
      this.loadDataForm()
      this.onGetLocationStore();
    } else {
      this.isDraggabled = false
      this.request_trip.readyToDmAt = 0 
      this.destinationFromSavedAddress = false
      this.destinationAddressId = null
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
          id: null,
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
      this.processSharedLocation();

    }
  }
  loadDataForm(){
    setTimeout( () => {
      console.log('edit')
      this.onUpdateEditOrder(this.editTripData)
      this.address = {
        mainText: this.editTripData.addresses[0].addressStreet
      }
      if(!this.editTripData.isCheckedStore){
        this.is_disabled_pickup = true
        this.isHiddenInput = false
        this.request_trip.isCheckedStore = true
      } else {
        this.request_trip.isCheckedStore = false
        this.is_disabled_pickup = false
        this.isHiddenInput = true
      }
      this.request_trip.isOrderCalendar=this.editTripData.isOrderCalendar
      this.input_reference_pickup = this.editTripData.addresses[0].reference
      
      const matchedCountryOrigin = this.countryCodes.find(country => this.editTripData.addresses[0].phone.startsWith(country.dial_code))

      if(matchedCountryOrigin) {
        this.originMobilePhone = this.editTripData.addresses[0].phone.replace(matchedCountryOrigin.dial_code, '')
      }

      this.input_receptorNameOrigin_pickup = this.editTripData.addresses[0].receptorName

      this.inputVisibleDestino = this.editTripData.addresses[1].addressStreet
      this.input_reference_destination = this.editTripData.addresses[1].reference
      this.addressDestination = {
        mainText: this.editTripData.addresses[1].addressStreet
      }
      
      const matchedCountry = this.countryCodes.find(country => this.editTripData.addresses[1].phone.startsWith(country.dial_code));
      if (matchedCountry) {
        this.destinationMobilePhone = this.editTripData.addresses[1].phone.replace(matchedCountry.dial_code, '')
      }
      
      this.destinationReceptorName = this.editTripData.addresses[1].receptorName
      this.request_trip.description = this.editTripData.detail

      this.method_payment = this.editTripData.payment.method.type
      this.cashAmount = this.editTripData.productPrice
      this.editTripData.addresses.forEach((element,i) => {
        if(i==0){
          this.request_trip.addresses[i] = element          
          this.request_trip.addresses[i].point = element.location          
        }else{
          this.request_trip.addresses[i]=element      
          this.request_trip.addresses[i].point = element.location       
        }
      });
      this.request_trip.store.id= this.editTripData.store.id
      this.request_trip.isCheckedStore=this.editTripData.isCheckedStore
      if(this.editTripData.isOrderCalendar == true){        
        this.activeIndexCalendar = 1        
        this.creadDate = new Date(this.editTripData.readyToDmAt * 1000)
      } else {
        let differenceInSeconds = this.editTripData.readyToDmAt - this.editTripData.createdAt
        let differenceInMinutes = differenceInSeconds / 60
        this.request_trip.readyToDmMinutesAt = differenceInMinutes > 0 ? Math.round(differenceInMinutes) : 0
      }
      
      this.onGetAmountOrder()
    }, 1500)
  }
  
  // Función simplificada sin dependencia de Google Maps
  fnDetalleViajeLabelListServiceWeb(
    latLng: {lat: number, lng: number},
    tittle: string,
    isEstado: number,
    labelSelector: string,
    id: any,
    view_screen_map?: boolean
  ): PersonalisationMarker {
    let detalle: PersonalisationMarker = new PersonalisationMarker();

    detalle.posicion = L.latLng(latLng.lat, latLng.lng);
    detalle.showTittle = true;
    detalle.tittle = tittle;
    detalle.tipoMarker = TypeMarkers.CONDUCTOR;
    detalle.isDragable = false;
    detalle.idEstado = isEstado;
    detalle.showInfowindow = true;
    detalle.typeServicesId = id;
    // InfoWindow ahora será manejado por Leaflet popup
    detalle.infoWindow = null;
    detalle.view_screen_map = view_screen_map ? view_screen_map : false;
    return detalle;
  }
  async onUpdateEditOrder(item: ResponseLoadingOrder) {
    let lstPosiciones: PersonalisationMarker[] = [];
    await this.requestTripService.onViewTrackingMotorizedService(item.uuid).subscribe((viaje) => {
      if (viaje.data.position) {
        let tittle = viaje.data.deliveryMan.name;
        lstPosiciones.push(
          this.fnDetalleViajeLabelListServiceWeb({lat: viaje.data.position.lat, lng: viaje.data.position.lng}, tittle, -1, "", "", true)
        );
        this.lstPosicionConductor = lstPosiciones;
      } else {
        this.onClearMap();
        this.updatePositionOrderEdit(item);
      }
    }, (error) => {
      this.alert.showError('Error', error.error.messages[0].message)
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
  isLoadingStoreAvailable=false
  private onGetLocationStore() {
    this.appSer.getStoreByIdAgent().subscribe((store:any)=>{
      const storeId=store.data.map((sA)=>sA.store_id).join(",")
      this.isLoadingStoreAvailable=true
      this.storeService.onGetLocationStoreService(storeId).subscribe((resp)=>{
        this.storesAvailable=resp.data
        this.isLoadingStoreAvailable=false
        if(this.storesAvailable.length>0){
          if(!this.editTripData){
            this.request_trip.store=this.storesAvailable[0]
            this.selectStore(this.storesAvailable[0],'',true)
          }
        }
      })
    },(error) => {
      this.alert.showError('Error', error.error.messages[0].message)
      this.isLoadingStoreAvailable=false
    })
  }
  selectStore(event:any, flagInit : any,Defauliten:boolean=false){
    
    if(!this.request_trip.isCheckedStore){

      if(!Defauliten)
      this.selectedStore= event.item?event.item:this.storesAvailable.find((store)=>store.store.id==event.value)
      else{
        this.selectedStore= event
      }
      const store=this.selectedStore.store
      const tripSetting=this.selectedStore.tripSetting
      
      console.log("resp.data.store",store.phone)
      
      this.validationPhoneStore = store.phone
      this.address = {
        mainText: store.addressStreet+' ('+store.fullName+')'
      }
      this.dataStorePhone = store.phone;
      this.request_trip.addresses[0].point.type = "Point";
      this.request_trip.addresses[0].floor = "";
      this.request_trip.addresses[0].alias = "";
      this.request_trip.addresses[0].marker = "store";
      this.request_trip.addresses[0].addressStreet = this.address.mainText;
      this.request_trip.addresses[0].point.coordinates = [
        store.location.coordinates[0],
        store.location.coordinates[1]
      ];
  
      this.markers[0].isDraggable=false
      this.markers[0].onDragEnd=(e)=>{
        console.log(e.coords)
      }
      this.request_trip.store.id=store.id
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
      if(this.request_trip.addresses[0].point.coordinates.length>0){
        this.onGetAmountOrder()
      }
    }
  }
  
  // mapClicked removido - no se usa con Leaflet
  
  onChangeMapMarkers($event: any, marker: any) {
    this.flagInitMap = false;
    let latlng = {
      lat: $event.coords?.lat,
      lng: $event.coords?.lng,
      storeId: this.request_trip.store.id
    };

    this.setGeoInverse(latlng,marker.label);

  }

  setGeoInverse(coords:{lat:number,lng:number,storeId?:number},label:string){
    this.requestTripService.onGeoCodeInverseUser(coords).subscribe(
      (resp) => {
        const address=resp.data.address
        if(label == "Destino"){
          this.addressDestination = {mainText: address}

          this.request_trip.addresses[1].point.type = "Point";
          this.request_trip.addresses[1].floor = "";
          this.request_trip.addresses[1].alias = "";
          this.request_trip.addresses[1].marker = "store";
          this.request_trip.addresses[1].addressStreet = address;
          this.request_trip.addresses[1].point.coordinates = [
          coords?.lng,
          coords?.lat,
          ]
          this.onGetAmountOrder();
        }

        if(label == "Origen"){
          this.address = { mainText: address }
          this.request_trip.addresses[0].point.type = "Point";
          this.request_trip.addresses[0].floor = "";
          this.request_trip.addresses[0].alias = "";
          this.request_trip.addresses[0].marker = "store";
          this.request_trip.addresses[0].addressStreet = address;
          this.request_trip.addresses[0].point.coordinates = [ coords?.lng, coords?.lat ]
          this.onGetAmountOrder();

        }
      },
      (error) => {
        this.alert.showInfo('','Geocoder failed');
      }
    )
  }

  convertPolygonToLatLngLiteral(coordinates: number[][]): LatLngLiteral[] {
    return coordinates.map(coord => {
      return { lat: coord[1], lng: coord[0] };
    });
  }

  address: AddressSuggestionBean
  addresses: AddressSuggestionBean[]

  addressDestination: AddressSuggestionBean
  addressesDestination: AddressSuggestionBean[]
  addressesDestinationCopy: AddressSuggestionBean[]=[]
  
  // Control para no reemplazar dirección manual cuando se busca cliente
  destinationFromSavedAddress: boolean = false
  destinationAddressId: number = null

  searchAddress(e){
    this.requestTripService.onGetSuggestionAddress(e.query, this.request_trip.store.id).subscribe(
      (resp) => {
        this.addresses = resp.data.map((as) => AddressSuggestionResponse.toBean(as))
        if (resp.data.length == 0) {
          this.addresses = [{mainText: "No se encontro coincidencias"}]
        }
      }, (error) => {
        this.addresses = [{mainText: "Ocurrio un error en la busqueda"}]
      }
    )
  }

  selectPrediction(prediction: any) {
    this.addresses = [];

    this.requestTripService.onGeoCodeUser({placeId: prediction.placeId, storeId: this.request_trip.store.id}).subscribe(
      (resp) => {
        console.log(resp.data)

        this.request_trip.addresses[0].addressStreet = this.address.mainText;
          this.request_trip.addresses[0].point.type = "Point";
          this.request_trip.addresses[0].floor = "";
          this.request_trip.addresses[0].alias = "";
          this.request_trip.addresses[0].marker = "store";
          this.request_trip.addresses[0].point.coordinates = [
            resp.data.lng,
            resp.data.lat,
          ];

          const newMarkers: Marker = {
            lat: resp.data.lat,
            lng: resp.data.lng,
            iconUrl: this.globalIconOrigin,
            label: 'Origen',
            isDraggable: true,
            onDragEnd: (e)=>{
              console.log(e.coords)
            }
          }

          this.center = {
            lat: resp.data.lat,
            lng: resp.data.lng,
          }

          this.markers[0] = newMarkers

          this.onGetMotorizedPosiitonOrigin();
          this.updatePosition();

          if(this.request_trip.addresses[1].point.coordinates[1] && this.request_trip.addresses[1].point.coordinates[0]){
            this.onGetAmountOrder()
          }

      }
    )
  }

  searchAddressDestination(e){
    console.log("searchAddressDestination",e)
    let word=e.query as string;
    console.log("addressesDestination",this.addressesDestination)
    console.log("addressesDestinationCustomerExpress",this.addressesDestinationCopy)
    console.log("addressDestination",this.addressDestination)
    if(!word || word==''){
      if(this.addressesDestinationCopy ==null || this.addressesDestinationCopy?.length==0){
        this.addressesDestination = [{mainText: "No se encontro coincidencias"}]
      }
      this.addressesDestination=JSON.parse(JSON.stringify(this.addressesDestinationCopy ))
      return
    }
    const regex = /[?&]q=(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/;
    const match=word.match(regex)
    if(match){
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[3]);
      word=lat+","+lng
    }
    const inputType=this.identifyInputType(word)
    if(inputType=="autocomplete"){
      this.autocompleteDestionation(word)
    }
    if(inputType=="place"){
      this.selectPredictionDestination(null,word)
    }
    if(inputType=="coordinates"){
      this.setCoordinates(word)
    }
    if(inputType=="linkconvert"){
      this.setLinkConvert(word)
    }
  }
  setLinkConvert(word: string) {
    this.requestTripService.setLinkConvert(word).subscribe(
      (resp) => {
        const latLng = resp.data.lat + "," + resp.data.lng;
        this.setCoordinates(latLng);
      },
      (error) => { }
    )
  }
  setCoordinates(word:string){
    const lat=+(word.split(",")[0].trim());
    const lng=+(word.split(",")[1].trim());
    this.setDestination(lat,lng);
    this.setGeoInverse({lat:lat,lng:lng,storeId: this.request_trip.store.id},"Destino");
  }
  autocompleteDestionation(word:string){
    this.requestTripService.onGetSuggestionAddress(word, this.request_trip.store.id).subscribe(
      (resp) => {
        this.addressesDestination = resp.data.map((as) => AddressSuggestionResponse.toBean(as))
        this.addressesDestinationCopy= JSON.parse(JSON.stringify(this.addressesDestination))
        if (resp.data.length == 0) {
          this.addressesDestination = [{mainText: "No se encontro coincidencias"}]
        }
      }, (error) => {
        this.addressesDestination = [{mainText: "Ocurrio un error en la busqueda"}]
      }
    )
  }

  selectPredictionDestination(prediction?: AddressSuggestionBean,address?:string) {
    console.log("selectPredictionDestination",prediction)
    this.addressesDestinationCopy.find(a=>a.id!=null)
    
    // Si es dirección guardada (tiene id pero no placeId)
    if(prediction && !(prediction?.placeId) && prediction.lat && prediction.lng){
      this.addressesDestination = JSON.parse(JSON.stringify(this.addressesDestinationCopy));
      this.destinationAddressId = prediction.id || null;
      this.destinationFromSavedAddress = !!prediction.id;
      this.setDestination(prediction.lat, prediction.lng, prediction.id);
      this.onGetAmountOrder();
      return;
    }

    // Si es búsqueda manual (tiene placeId o es texto libre)
    this.destinationAddressId = null;
    this.destinationFromSavedAddress = false;

    if(prediction){
      this.addressesDestination = [];
    }
    
    this.requestTripService.onGeoCodeUser({address: address, placeId: prediction?.placeId, storeId: this.request_trip.store.id}).subscribe(
      (resp) => {
        this.setDestination(resp.data.lat,resp.data.lng);
        this.onGetAmountOrder();
      },
      ()=>{
        this.addressesDestination = []
      }
    )
  }

  setDestination(lat:number, lng:number, addressId?: number){
    this.addressesDestination = []
    this.request_trip.addresses[1].id = addressId || null;
    this.request_trip.addresses[1].point.type = "Point";
    this.request_trip.addresses[1].floor = "";
    this.request_trip.addresses[1].alias = "";
    this.request_trip.addresses[1].marker = "store";
    this.request_trip.addresses[1].addressStreet = this.addressDestination.mainText;
    this.request_trip.addresses[1].point.coordinates = [
      lng,
      lat
    ];
    const newMarkers: Marker = {
      lat: lat,
      lng: lng,
      iconUrl: this.globalIconDestination,
      label: 'Destino',
      isDraggable: true,
      onDragEnd: (e)=>{
        console.log(e.coords)
      }
    }

    this.markers[1] = newMarkers

    this.updatePosition();
    this.centrarMapa()
  }

  // Google Places removido - usando API propio
  findAdressOrigin() {
    // No hace nada - el autocomplete usa API propio
  }
  
  findAdress() {
    // No hace nada - el autocomplete usa API propio
  }
  
  drawPolyline(overviewPolyline: any){
    this.locationData = overviewPolyline
    this.polyLines[0].routePoints = overviewPolyline
    
    // Dibujar polyline en Leaflet
    this.updateLeafletPolyline();
  }

  centrarMapa() { 
    if (this.markers.length >= 2) { 
      const marker1 = this.markers[0];
      const marker2 = this.markers[1];
      
      if (!marker1.lat || !marker1.lng || !marker2.lat || !marker2.lng) return;
      if (marker1.lat === 0 && marker1.lng === 0) return;
      if (marker2.lat === 0 && marker2.lng === 0) return;

      const centerLat = (marker1.lat + marker2.lat) / 2;
      const centerLng = (marker1.lng + marker2.lng) / 2;

      // Calcular distancia usando Leaflet
      const latlng1 = L.latLng(marker1.lat, marker1.lng);
      const latlng2 = L.latLng(marker2.lat, marker2.lng);
      const distance = latlng1.distanceTo(latlng2);
      
      const zoom = this.calcularNivelDeZoom(distance);

      console.log('distancia_ ', distance)

      this.center = { lat: centerLat, lng: centerLng };
      this.zoom = zoom;
      console.log('zoom_ ', zoom)

      // Actualizar mapa de Leaflet
      if (this.leafletMap) {
        this.centerLeafletMap();
      }
    } 
  }
  calcularNivelDeZoom(distance: number): number{
    if (distance < 1000) {
      return 15;
    } else if (distance < 5000) {
      return 14;
    } else {
      return 13;
    }
  }
  
  updatePosition() {
    var lstPosiciones: PersonalisationMarker[] = [];
    // Actualizar markers de Leaflet
    this.updateLeafletMarkers();
    this.lstPosiciones = lstPosiciones;
  }
  onUpdatePositionDriver() {
    var lstPosicionConductor: PersonalisationMarker[] = [];
    if (this.data_driver) {
      lstPosicionConductor = [];
      for (let item of this.data_driver) {
        let detalle: PersonalisationMarker = new PersonalisationMarker();
        detalle.posicion = L.latLng(item.position.point.coordinates[1]!, item.position.point.coordinates[0]!);
        detalle.showTittle = true;
        detalle.tittle = "Conductor";
        detalle.tipoMarker = TypeMarkers.CONDUCTOR_LABEL;
        detalle.isDragable = false;
        lstPosicionConductor.push(detalle);
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
          this.drawPolyline(data.data.polyLine)
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

  onSaveLoading: boolean = false

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
    if(this.request_trip.isCheckedStore == true && (isEmptyOriginMobilePhone && isEmpty)){
      this.alert.showError('Error', "es obligatorio escribir por lo menos un numero")
      return;
    }

    if ("CASH" === this.method_payment) {
      order.productPrice = this.cashAmount
    }

    this.onSaveLoading = true

    order.payment = {
      method: {
        type: this.method_payment,
      },
    };
    
    order.uuid_price=this.uuid_price
    order.type = "SendAndReciveStore"    
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
        order.addresses[0].phone = !this.request_trip?.isCheckedStore ? this.dataStorePhone : (this.selectCountryCode.dial_code + this.originMobilePhone?.toString());
        order.addresses[0].marker = item.marker;
        order.addresses[0].alias = item.alias;
        order.addresses[0].reference = this.input_reference_pickup ? this.input_reference_pickup : '';
        order.addresses[0].floor = item.floor;
        order.addresses[0].point = item.point;
        order.addresses[0].receptorName=this.input_receptorNameOrigin_pickup ? this.input_receptorNameOrigin_pickup : '';
      } else {
        order.addresses[1].phone = this.selectCountryCode.dial_code + this.destinationMobilePhone?.toString();
        order.addresses[1].marker = item.marker;
        order.addresses[1].alias = item.alias;
        order.addresses[1].reference = this.input_reference_destination ? this.input_reference_destination : '';
        order.addresses[1].floor = item.floor;
        order.addresses[1].addressStreet = item.addressStreet;
        order.addresses[1].point = item.point;
        order.addresses[1].receptorName = this.destinationReceptorName ? this.destinationReceptorName : '';
      }
    });
    order.isOrderCalendar=this.request_trip.isOrderCalendar
    order.isCheckedStore=this.request_trip.isCheckedStore??false
    order.store.id= this.request_trip.store.id
    order.tags = this.tagsOrderSelect

    if(this.request_trip.isOrderCalendar==true){
      order.readyToDmAt=Number(this.creadDate.getTime().toString().substring(0,10));
      order.readyToDmMinutesAt=null;
    }else{
      order.readyToDmMinutesAt=this.request_trip.readyToDmMinutesAt;
      order.readyToDmAt=null;
    }
    let store = JSON.parse(localStorage.getItem('storeBean'))
    this.requestTripService.onSaveOrderService(order,store.zoneId).subscribe((data) => {
        this.ref = this.dialogService.open(LoadingMotorizedComponent, {
          header: "Repartidor",
          data: {
            isUpdated: false
          }
        });
        this.onSaveLoading = false
      },
      (error:HttpErrorResponse) => {
        if(error.status==400){
          this.alert.showError('',error.error.messages[0].message);
        }else{

          this.alert.showError('',"Ocurrió un error");
        }
        this.onSaveLoading = false
      }
    );
    
  }

  convertToTimestamp(minutos: number): number {
    const segundos = minutos * 60;
    const timestamp = segundos * 1000; 
    return timestamp;
  }

  onUpdateOrder() {
    
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
    if(this.request_trip.isCheckedStore == true && (isEmptyOriginMobilePhone && isEmpty)){
      this.alert.showError('',"es obligatorio escribir por lo menos un numero");
      return;
    }

    if ("CASH" === this.method_payment) {
      order.productPrice = this.cashAmount
    }


    this.onSaveLoading = true

    order.payment = {
      method: {
        type: this.method_payment,
      },
    };

    order.uuid = this.editTripData.uuid

    order.uuid_price=this.uuid_price



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
        order.addresses[0].phone = !this.request_trip?.isCheckedStore ? this.dataStorePhone : (this.selectCountryCode.dial_code + this.originMobilePhone?.toString());
        order.addresses[0].marker = item.marker;
        order.addresses[0].alias = item.alias;
        order.addresses[0].reference = this.input_reference_pickup ? this.input_reference_pickup : '';
        order.addresses[0].floor = item.floor;
        order.addresses[0].point = item.point;        
        order.addresses[0].receptorName=this.input_receptorNameOrigin_pickup ? this.input_receptorNameOrigin_pickup : '';
    
      } else {
        order.addresses[1].id = this.editTripData.addresses[1].id
        order.addresses[1].phone = this.selectCountryCode.dial_code + this.destinationMobilePhone?.toString();
        order.addresses[1].marker = item.marker;
        order.addresses[1].alias = item.alias;
        order.addresses[1].reference = this.input_reference_destination ? this.input_reference_destination : '';
        order.addresses[1].floor = item.floor;
        order.addresses[1].addressStreet = item.addressStreet;
        order.addresses[1].point = item.point;
        order.addresses[1].receptorName = this.destinationReceptorName ? this.destinationReceptorName : '';
      }
    });
    order.isOrderCalendar=this.request_trip.isOrderCalendar
    order.isCheckedStore=this.request_trip.isCheckedStore
    order.store.id=this.request_trip.store.id
    if(this.request_trip.isOrderCalendar==true){
      order.readyToDmAt=Number(this.creadDate.getTime().toString().substring(0,10));
      order.readyToDmMinutesAt=null;
    }else{
      order.readyToDmMinutesAt=this.request_trip.readyToDmMinutesAt;
      order.readyToDmAt=null;
    }
    this.requestTripService.onUpdateOrderService(order).subscribe(
      (data) => {
        this.ref = this.dialogService.open(LoadingMotorizedComponent, {
          header: "Repartidor",
          data: {
            isUpdated: true
          }
        });
        this.onSaveLoading = false
      },
      (error:HttpErrorResponse) => {
        if(error.status==400){
          this.alert.showError('',error.error.messages[0].message);
        }else{

          this.alert.showError('',"Ocurrió un error");
        }
        this.onSaveLoading = false
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
    if(this.request_trip.isCheckedStore == true){
      this.isDraggabled = true
      this.updatePosition()
      this.is_disabled_pickup = !this.is_disabled_pickup
      this.isHiddenInput = !this.isHiddenInput
    } 
    else {
      this.is_disabled_pickup = !this.is_disabled_pickup
      this.isHiddenInput = !this.isHiddenInput
      this.input_reference_pickup = ''
      this.request_trip.mobile = null
      
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
  identifyInputType(input: string): InputType {
    const trimmed = input.trim();

    const gmapsUrlRegex =
    /^(?:https?:\/\/)?(?:www\.)?(?:maps\.app\.goo\.gl\/[A-Za-z0-9]+(?:[/?#][^\s]*)?|goo\.gl\/maps\/[^\s]+|(?:maps\.google\.[A-Za-z.]{2,}|google\.[A-Za-z.]{2,})\/maps(?:[/?#][^\s]*)?)$/i;
    if (gmapsUrlRegex.test(trimmed)) return 'linkconvert';
    const coordinateRegex = /^-?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*-?((1[0-7]\d|[1-9]?\d)(\.\d+)?|180(\.0+)?)$/;
    if (coordinateRegex.test(trimmed)) return 'coordinates';

    const plusCodeRegex = /^[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3}(?:\s+\w+.*)?$/i;
    if (plusCodeRegex.test(trimmed)) return 'place';

    const words = trimmed.split(/\s+/);

    const commonAddressKeywords = [
      'calle', 'av', 'avenida', 'jr', 'jirón', 'psj', 'pasaje',
      'mz', 'manzana', 'lt', 'lote', 'edificio', 'urb', 'urbanización',
      'interior', 'dpto', 'departamento', 'bloque', 'km', 'carretera'
    ];

    const hasCommonKeyword = commonAddressKeywords.some(keyword =>
      trimmed.toLowerCase().includes(keyword)
    );

    const hasStreetNumber = /\b\d{1,5}\b/.test(trimmed);

    const looksLikeCompleteAddress =
      hasStreetNumber && words.length >= 3;

    if (looksLikeCompleteAddress) return 'place';

    return 'autocomplete';
  }
  
  onPhoneBlur(event: Event) {
    const input = event.target as HTMLInputElement;
    const formatted = this.formatPeruPhone(input.value);

    if (!formatted) {
      this.destinationMobilePhone = "";
      input.value = "";
      alert("Número inválido, debe ser un celular peruano (9 dígitos, empieza en 9).");
      return;
    }
    this.destinationMobilePhone = formatted;
    input.value = formatted;
    this.requestCustomer(this.selectCountryCode.dial_code,formatted)
  }

  formatPeruPhone(input: string): string | null {
    if (!input) return null;
    let digits = input.replace(/\D+/g, "");
    digits = digits.replace(/^0+/, "");
    while (digits.startsWith("51") && digits.length > 11) {
      digits = digits.slice(2);
    }
    if (digits.length === 11 && digits.startsWith("51")) {
      digits = digits.slice(2);
    }
    if (/^9\d{8}$/.test(digits)) {
      return digits;
    }
    return input;
  }
  isLoadingRequestCustomer:boolean
  customerExpress:CustomerExpressResponse
  requestCustomer(dial_code: string, phone: string) {
    
    const request:FilterRequest={
      filters:[
        {field:"country_code",value:dial_code},
        {field:"phone",value:phone},
        {field:"brand_id",value:this.storeSelected.brand.id}
      ]
    }
    this.isLoadingRequestCustomer=true
    this.customerExpressService.filteCustomer(request).subscribe(
      (resp)=>{
        this.isLoadingRequestCustomer=false
        this.customerExpress=resp.data[0]        
        if(!this.customerExpress){
          this.destinationReceptorName=""
          return
        }
        this.destinationReceptorName=this.customerExpress.fullName
        this.requestAddressCustomer()
      },
      (error)=>{
        this.isLoadingRequestCustomer=false
      },
      ()=>{}
    )
  }
  isDropDownEnable:boolean=true
  requestAddressCustomer(){
    const request:FilterRequest={
      filters:[
        {field:"customer_express_id",value:this.customerExpress.id}
      ]
    }
    this.customerExpressService.filterAddress(request).subscribe(
      (resp)=>{
        const addresses=resp.data
        const defaultAddress=addresses.find(a=>a.default)??addresses[0]
        this.isDropDownEnable=false
        
        if(addresses?.length>0){          
          this.addressesDestination=addresses.map(a=>{
            return {
              id: a.id,
              mainText:a.addressStreet,
              secondText: a?.reference??'',
              lat: a.lat,
              lng: a.lng
            } as AddressSuggestionBean
          })
          this.addressesDestinationCopy=JSON.parse(JSON.stringify(this.addressesDestination))
          this.isDropDownEnable=true
        }

        const hasCoordinates = this.request_trip.addresses[1]?.point?.coordinates?.[0] 
                            && this.request_trip.addresses[1]?.point?.coordinates?.[1];
        const hasManualDestination = hasCoordinates && !this.destinationFromSavedAddress;

        if(hasManualDestination){
          console.log('📍 Dirección manual detectada, no se reemplazará con dirección guardada');
          return;
        }

        if(!defaultAddress){
          return
        }

        this.addressDestination={
          id: defaultAddress.id,
          mainText: defaultAddress.addressStreet
        }
        this.destinationAddressId = defaultAddress.id;
        this.destinationFromSavedAddress = true;
        this.setDestination(defaultAddress.lat, defaultAddress.lng, defaultAddress.id);
        this.onGetAmountOrder();
        this.input_reference_destination=defaultAddress.reference
      },
      (error)=>{

      },
      ()=>{}
    )
  }

  private processSharedLocation(): void {
    const sharedData = this.shareLocation.consume();
    if (!sharedData) return;

    console.log('[ShareTarget] Ubicación recibida de WhatsApp:', sharedData);

    // Esperar a que el mapa y los datos de la tienda estén listos
    setTimeout(() => {
      if (sharedData.inputType === 'coordinates' && sharedData.coords) {
        // Coordenadas directas extraídas del link de Google Maps
        const coordStr = `${sharedData.coords.lat},${sharedData.coords.lng}`;
        this.setCoordinates(coordStr);
        this.alert.showInfo('📍 Ubicación recibida', 'Destino configurado desde WhatsApp');
      } else if (sharedData.inputType === 'linkconvert' && sharedData.url) {
        // Link acortado de Google Maps → resolver vía backend
        this.setLinkConvert(sharedData.url);
        this.alert.showInfo('📍 Ubicación recibida', 'Procesando ubicación desde WhatsApp...');
      }
    }, 1500);
  }
}