import { AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { MouseEvent } from 'src/agm/core';
import { AuthService } from 'src/app/utils/auth.service';
import { StoreService } from '../main/service/store.service';
import { MapsAPILoader } from 'src/agm/core';
import { PersonalisationMarker, PersonalisationPolyline, TypeMarkers } from 'src/app/directives/informacion/data/enumMapa';
import { Viaje } from '../order-course/data';
import { RequestGeoAutocomplete } from 'src/app/directives/informacion/data/serviceGeo';
import { RequestTrip } from './data/request';
import * as UtilModalViaje from './util-modal-viaje-corporate'
import { RequestTripService } from './services/request-trip.service';
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
    private requestTripService : RequestTripService
  ) { }

  stateOptions: any[];
  method_payment = "efectivo";
  request_trip : RequestTrip = new RequestTrip()
  ngAfterViewInit(): void {
  }
  ngOnInit(): void {
    this.request_trip.addresses = [
      {
        addressStreet : '',
        alias : '',
        floor : '',
        phone : '',
        maker : '',
        point : {
          coordinates : [
            0,
            0
          ],
          type : ''
        },
        sort : 0,
        reference : ''
      },
      {
        addressStreet : '',
        alias : '',
        floor : '',
        phone : '',
        maker : '',
        point : {
          coordinates : [
            0,
            0
          ],
          type : ''
        },
        sort : 1,
        reference : ''
      }
    ]
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
      // this.input_visible_pickup = data.data.fullName;
      // this.marker.lng = data.data.location.coordinates[0];
      // this.marker.lat = data.data.location.coordinates[1];
      this.updatePositionOrigin()
    });
  }

  mapClicked($event: MouseEvent) {
    this.marker.lat = $event.coords.lat,
    this.marker.lng = $event.coords.lng
  }
  onChangeMapMarkers(event :any){

  }
  nroViaje: number = 0;
  findAdressOrigin(){
    //  google.maps.
        const element = <HTMLInputElement>document.getElementById('txtUbicacion_origin');
        const autocomplete = new google.maps.places.Autocomplete(
          element,
          {
            types: [],
            fields: ['place_id'],
            componentRestrictions: {
              country: 'PE'//'CO'
            }
          });
    
        autocomplete.addListener('place_changed', () => {
          let place: any = autocomplete.getPlace().place_id;
          this.geocodePlaceIdMultidestino(place)
        });
    
      }
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
        let place: any = autocomplete.getPlace().place_id;
        this.geocodePlaceIdMultidestino(place)
      });
  
    }
    geocoder: google.maps.Geocoder = new google.maps.Geocoder();
    geocodePlaceIdMultidestino(placeId) {
          this.geocoder.geocode({ 'placeId': placeId }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            this.request_trip.addresses[1].addressStreet = results[0].formatted_address;
            this.request_trip.addresses[1].point.coordinates = [results[0].geometry.location.lat(),results[0].geometry.location.lng()]
            // this.geocodePlaceId(place);
            this.updatePositionOrigin()
          }
        }
      });
  
    }
    updatePositionOrigin(){
      var lstPosiciones: PersonalisationMarker[] = [];
      lstPosiciones.push(
        UtilModalViaje.fnDetalleViaje(
          new google.maps.LatLng(
            this.marker.lat ,
            this.marker.lng ,
          ),
          true,
          'Origen',
          TypeMarkers.ORIGEN,
          true,
          1
        )
      );
      if(this.request_trip.addresses.length > 1){
        lstPosiciones.push(
          UtilModalViaje.fnDetalleViaje(
            new google.maps.LatLng(
              this.request_trip.addresses[1].point.coordinates[0],
              this.request_trip.addresses[1].point.coordinates[1],
            ),
            true,
            'Destino',
            TypeMarkers.DESTINO,
            true,
            1
          )
        );
      }
     
      this.lstPosiciones = lstPosiciones;
    }

    onSaveOrder(){
      let order : RequestTrip = new RequestTrip()
      // order.payment = this.method_payment
      order.addresses.forEach((item,index)=> {
        item.sort = index++
        if (index==1) {
          // item.addressStreet = this.input_visible_pickup
        } else {
          
        }
      })
      
    }
   }
