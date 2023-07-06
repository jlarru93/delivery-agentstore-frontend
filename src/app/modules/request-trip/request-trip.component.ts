import { Component, OnInit } from '@angular/core';
import { MouseEvent } from 'src/agm/core';
import { AuthService } from 'src/app/utils/auth.service';
import { StoreService } from '../main/service/store.service';

@Component({
  selector: 'app-request-trip',
  templateUrl: './request-trip.component.html',
  styleUrls: ['./request-trip.component.scss']
})
export class RequestTripComponent implements OnInit {

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
    lat: 10.96854,
    lng: -74.78132
  }


  constructor(
    private auth: AuthService,
    private storeService : StoreService
  ) { }

  stateOptions: any[];
  value1: string = "efectivo";
  ngOnInit(): void {
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

}
