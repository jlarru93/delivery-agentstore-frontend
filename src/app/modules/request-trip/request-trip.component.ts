import { AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { MouseEvent } from 'src/agm/core';
import { AuthService } from 'src/app/utils/auth.service';
import { StoreService } from '../main/service/store.service';
import { MapsAPILoader } from 'src/agm/core';
import { PersonalisationMarker, PersonalisationPolyline } from 'src/app/directives/informacion/data/enumMapa';
import { Viaje } from '../order-course/data';
import { RequestGeoAutocomplete } from 'src/app/directives/informacion/data/serviceGeo';

@Component({
  selector: 'app-request-trip',
  templateUrl: './request-trip.component.html',
  styleUrls: ['./request-trip.component.scss']
})
export class RequestTripComponent implements OnInit, AfterViewInit {
  @ViewChild('search') searchElementRef: ElementRef;
  origenIcon: any = 'assets/images/busqueda/origen.png';
  destinoIcon: any = 'assets/images/busqueda/destino.png';
  referenciaIcon: any = 'assets/images/busqueda/referencia.svg'
  imgLogo: any = 'assets/images/656.png'

  userPhone: string
  userAttributes: any

  input_visible_pickup: any
  inputVisibleDestino: any
  input_reference_pickup ?: string
  input_reference_destination ?: string
  is_disabled_pickup : boolean = true
  center: any = {
    lat: 10.96854,
    lng: -74.78132
  };

  marker =
  {
    maintext :'Barranquilla',
    secondText : 'Hotel atrium',
    lat:10.96854,
    lng: -74.78132
  }
  lstPosiciones : PersonalisationMarker[] = []; 
  lstPosicionConductor: PersonalisationMarker[] = [];
  //Mapa
  idDragable: boolean = true;
  polilyneRuta: PersonalisationPolyline[] = [];
  minutosEstimados?: Date = undefined;
  metrosEstimados?: number = undefined;
  initMapViewAfter: boolean = false;
  flagInitMap ?: boolean 
  viaje : Viaje = new Viaje()
  coberturePosition: RequestGeoAutocomplete = {
    key_word: "",
    longitude: -74.78132,
    latitude: 10.96854,
  };
  constructor(
    private storeService : StoreService,
  ) { }

  stateOptions: any[];
  value1: string = "efectivo";
  ngAfterViewInit(): void {
  }
  ngOnInit(): void {
    this.findAdress()
    this.onGetLocationStore();
    // this.auth.getUserDetails().then(
    //   (data) => {
    //       this.userAttributes = data
    //       let userPhoneObj = this.userAttributes.find(attributes => attributes.Name == 'phone_number')
    //       this.userPhone = userPhoneObj.Value
    //   }
    // )
    this.stateOptions = [{label: 'Efectivo', value: 'efectivo'}, {label: 'Pago Digital', value: 'e-wallet'}];
  }

  private onGetLocationStore() {
    this.storeService.onGetLocationStoreService().subscribe((data) => {
      this.input_visible_pickup = data.data.fullName;
      this.marker.lng = data.data.location.coordinates[0];
      this.marker.lat = data.data.location.coordinates[1];
    });
  }

  mapClicked($event: MouseEvent) {
    this.marker.lat = $event.coords.lat,
    this.marker.lng = $event.coords.lng
  }
  onChangeMapMarkers(event :any){

  }
  nroViaje: number = 0;
  findAdress(){
  //  google.maps.
      const element = <HTMLInputElement>document.getElementById('txtUbicacion');
      const autocomplete = new google.maps.places.Autocomplete(
        element,
        {
          types: [],
          fields: ['place_id'],
          componentRestrictions: {
            country: 'CO'
          }
        });
  
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace().place_id;
        // this.geocodePlaceId(place);
  
      });
  
    }
    onSaveOrder(){
      
    }
   }
