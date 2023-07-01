import { Component, OnInit } from '@angular/core';
import { MouseEvent } from 'src/agm/core';
import { AuthService } from 'src/app/utils/auth.service';

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

  inputVisible: any
  inputVisibleDestino: any

  center: any = {
    lat: 10.96854,
    lng: -74.78132
  };

  marker =
  {
    lat: 10.96854,
    lng: -74.78132
  }


  constructor(
    private auth: AuthService
  ) { }

  stateOptions: any[];
  value1: string = "efectivo";
  ngOnInit(): void {
    // this.auth.getUserDetails().then(
    //   (data) => {
    //       this.userAttributes = data
    //       let userPhoneObj = this.userAttributes.find(attributes => attributes.Name == 'phone_number')
    //       this.userPhone = userPhoneObj.Value
    //   }
    // )
    this.stateOptions = [{label: 'Efectivo', value: 'efectivo'}, {label: 'Pago Digital', value: 'e-wallet'}];
  }

  mapClicked($event: MouseEvent) {
    this.marker.lat = $event.coords.lat,
    this.marker.lng = $event.coords.lng
  }

}
