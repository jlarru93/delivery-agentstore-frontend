import { Component, OnInit } from '@angular/core';
import { Viaje } from './data';
import { MouseEvent } from 'src/agm/core';

@Component({
  selector: 'app-order-course',
  templateUrl: './order-course.component.html',
  styleUrls: ['./order-course.component.scss']
})
export class OrderCourseComponent implements OnInit {

  constructor() { }
  list_viaje : Viaje[] = [
        {
            "company": {
                "id": "3266464f-b77a-4ae1-a254-d18dc5172f66",
                "businessName": "Taxi Satelital",
                "tradeName": " AUTOTAXI SATELITAL SOCIEDAD ANONIMA CERRADA"
            },
            "costCenter": null,
            "dynamicFields": [],
            "driver": null,
            "vehicle": null,
            "location": null,
            "statusType": {
                "id": 1,
                "name": "PENDIENTE",
                "description": ""
            },
            "id": "39fc759d-e129-45d1-b564-36ff7564cfae",
            "shortId": "45020",
            "serviceType": {
                "id": 4,
                "name": "Estandar",
                "description": "",
                "isCourier": false,
                "isCargo": false,
                "cargoPhotoMin": 0,
                "cargoPhotoMax": 1,
                "destinationsMin": null,
                "destinationsMax": null,
                "isRestrictedAddNewDestination": false
            },
            "paymentType": {
                "id": 100,
                "name": "Efectivo",
                "description": "Efectivo",
                "isEnableRequestOtherUser": false,
                "card_error": null
            },
            "serviceDateTime": "2023-07-27T17:03:45-05:00",
            "price": 24,
            "pickup": {
                "id": "dcf9f14f-afe1-4f74-a19a-6029b2b1dc2f",
                "latitude": -12.1026495,
                "longitude": -76.9557621,
                "mainText": "Calle Los Petroleros 323",
                "secondaryText": "Lima, Perú",
                "price": 24,
                "placeZone": null,
                "contacts": [
                    {
                        "id": "",
                        "fullNameFormat": "{firstName}, {firstLastName},{secondLastName}",
                        "firstName": "Carlodaniel",
                        "firstLastName": "",
                        "secondLastName": "",
                        "cellphone": "944927896",
                        "countryCode": "51"
                    }
                ]
            },
            "destinations": [
                {
                    "id": "dcf9f14f-afe1-4f74-a19a-6029b2b1dc2f",
                    "latitude": -12.0672896,
                    "longitude": -77.0337292,
                    "mainText": "Estadio Nacional",
                    "secondaryText": "Calle José Díaz, Lima, Perú",
                    "price": 24,
                    "contacts": [
                        {
                            "id": "",
                            "fullNameFormat": "{firstName}, {firstLastName},{secondLastName}",
                            "firstName": "Carlodaniel",
                            "firstLastName": "",
                            "secondLastName": "",
                            "cellphone": "944927896",
                            "countryCode": "51"
                        }
                    ]
                }
            ],
            "currencyType": {
                "id": 0,
                "symbol": "S/",
                "code": "PEN",
                "name": "NUEVO SOL"
            },
            "route": null,

            "passenger": [
                {
                    "id": 1,
                    "clientId": 26408,
                    "firstName": "Carlodaniel",
                    "secondLastName": "",
                    "firstLastName": "",
                    "cellPhone": "944927896",
                    "countryCode": "51"
                }
            ],
            "requestBy": {
                "id": "",
                "firstName": "",
                "secondLastName": null,
                "firstLastName": null
            },
            "client": {
                "id": "5b0b1944-94ef-426d-ac77-b71c6fa1e0c3",
                "firstName": "Carlodaniel",
                "secondLastName": "Pimentel",
                "firstLastName": "Huamani"
            },
            "isRequiredServiceCloseCode": false,
            "isAlreadyCalificated": false,
            "courierPackageInfo": null,
            
            

        },
        {
            "company": {
                "id": "3266464f-b77a-4ae1-a254-d18dc5172f66",
                "businessName": "Taxi Satelital",
                "tradeName": " AUTOTAXI SATELITAL SOCIEDAD ANONIMA CERRADA"
            },
            "costCenter": null,
            "dynamicFields": [],
            "driver": null,
            "vehicle": null,
            "location": null,
            "statusType": {
                "id": 1,
                "name": "PENDIENTE",
                "description": ""
            },
            "id": "4235aafb-8b0b-4f3d-8d38-482fa90afd95",
            "shortId": "45016",
            "serviceType": {
                "id": 4,
                "name": "Estandar",
                "description": "",
                "isCourier": false,
                "isCargo": false,
                "cargoPhotoMin": 0,
                "cargoPhotoMax": 1,
                "destinationsMin": null,
                "destinationsMax": null,
                "isRestrictedAddNewDestination": false
            },
            "paymentType": {
                "id": 100,
                "name": "Efectivo",
                "description": "Efectivo",
                "isEnableRequestOtherUser": false,
                "card_error": null
            },
            "serviceDateTime": "2023-07-27T16:57:23-05:00",
            "price": 24,
            "pickup": {
                "id": "c000ba3f-1138-4479-be9e-bf4e0ce78c69",
                "latitude": -12.1026495,
                "longitude": -76.9557621,
                "mainText": "Calle Los Petroleros 323",
                "secondaryText": "Lima, Perú",
                "price": 24,
                "placeZone": null,
                "contacts": [
                    {
                        "id": "",
                        "fullNameFormat": "{firstName}, {firstLastName},{secondLastName}",
                        "firstName": "Carlodaniel",
                        "firstLastName": "",
                        "secondLastName": "",
                        "cellphone": "944927896",
                        "countryCode": "51"
                    }
                ]
            },
            "destinations": [
                {
                    "id": "c000ba3f-1138-4479-be9e-bf4e0ce78c69",
                    "latitude": -12.0672896,
                    "longitude": -77.0337292,
                    "onRoute": false,
                    "mainText": "Estadio Nacional",
                    "secondaryText": "Calle José Díaz, Lima, Perú",
                    "price": 24,
                    "contacts": [
                        {
                            "id": "",
                            "fullNameFormat": "{firstName}, {firstLastName},{secondLastName}",
                            "firstName": "Carlodaniel",
                            "firstLastName": "",
                            "secondLastName": "",
                            "cellphone": "944927896",
                            "countryCode": "51"
                        }
                    ]
                }
            ],
            "currencyType": {
                "id": 0,
                "symbol": "S/",
                "code": "PEN",
                "name": "NUEVO SOL"
            },
            "route": null,

            "passenger": [
                {
                    "id": 1,
                    "clientId": 26408,
                    "firstName": "Carlodaniel",
                    "secondLastName": "",
                    "firstLastName": "",
                    "cellPhone": "944927896",
                    "countryCode": "51"
                }
            ],
            "requestBy": {
                "id": "",
                "firstName": "",
                "secondLastName": null,
                "firstLastName": null
            },
            "client": {
                "id": "5b0b1944-94ef-426d-ac77-b71c6fa1e0c3",
                "firstName": "Carlodaniel",
                "secondLastName": "Pimentel",
                "firstLastName": "Huamani"
            },
            "isRequiredServiceCloseCode": false,
            "isAlreadyCalificated": false,
            "courierPackageInfo": null,
            
            

        },
        {
            "company": {
                "id": "3266464f-b77a-4ae1-a254-d18dc5172f66",
                "businessName": "Taxi Satelital",
                "tradeName": " AUTOTAXI SATELITAL SOCIEDAD ANONIMA CERRADA"
            },
            "costCenter": null,
            "dynamicFields": [],
            "driver": null,
            "vehicle": null,
            "location": null,
            "statusType": {
                "id": 1,
                "name": "PENDIENTE",
                "description": ""
            },
            "id": "6b2683ed-f0ed-4c3d-8383-3892e2033b91",
            "shortId": "43838",
            "serviceType": {
                "id": 4,
                "name": "Estandar",
                "description": "",
                "isCourier": false,
                "isCargo": false,
                "cargoPhotoMin": 0,
                "cargoPhotoMax": 1,
                "destinationsMin": null,
                "destinationsMax": null,
                "isRestrictedAddNewDestination": false
            },
            "paymentType": {
                "id": 100,
                "name": "Efectivo",
                "description": "Efectivo",
                "isEnableRequestOtherUser": false,
                "card_error": null
            },
            "serviceDateTime": "2023-07-20T13:33:14-05:00",
            "price": 67,
            "pickup": {
                "id": "a8b6bedd-3f28-43e4-973f-3016b4ed90da",
                "latitude": -12.0230437,
                "longitude": -77.10799759999999,
                "onRoute": true,
                "mainText": "Aeropuerto Internacional Jorge Chávez (LIM)",
                "secondaryText": "Avenida Elmer Faucett, Callao, Perú",
                "price": 67,
                "placeZone": null,
                "contacts": [
                    {
                        "id": "",
                        "fullNameFormat": "{firstName}, {firstLastName},{secondLastName}",
                        "firstName": "Carlodaniel",
                        "firstLastName": "",
                        "secondLastName": "",
                        "cellphone": "944927896",
                        "countryCode": "51"
                    }
                ]
            },
            "destinations": [
                {
                    "id": "a8b6bedd-3f28-43e4-973f-3016b4ed90da",
                    "latitude": -12.1550946,
                    "longitude": -76.98220669999999,
                    "onRoute": false,
                    "mainText": "Mall del Sur",
                    "secondaryText": "Avenida Pedro Miotta, San Juan de Miraflores, Perú",
                    "price": 67,
                    "contacts": [
                        {
                            "id": "",
                            "fullNameFormat": "{firstName}, {firstLastName},{secondLastName}",
                            "firstName": "Carlodaniel",
                            "firstLastName": "",
                            "secondLastName": "",
                            "cellphone": "944927896",
                            "countryCode": "51"
                        }
                    ]
                }
            ],
            "currencyType": {
                "id": 0,
                "symbol": "S/",
                "code": "PEN",
                "name": "NUEVO SOL"
            },
            "route": null,

            "passenger": [
                {
                    "id": 1,
                    "clientId": 26408,
                    "firstName": "Carlodaniel",
                    "secondLastName": "",
                    "firstLastName": "",
                    "cellPhone": "944927896",
                    "countryCode": "51"
                }
            ],
            "requestBy": {
                "id": "",
                "firstName": "",
                "secondLastName": null,
                "firstLastName": null
            },
            "client": {
                "id": "5b0b1944-94ef-426d-ac77-b71c6fa1e0c3",
                "firstName": "Carlodaniel",
                "secondLastName": "Pimentel",
                "firstLastName": "Huamani"
            },
            "isRequiredServiceCloseCode": false,
            "isAlreadyCalificated": false,
            "courierPackageInfo": null,
        },
        {
            "company": {
                "id": "3266464f-b77a-4ae1-a254-d18dc5172f66",
                "businessName": "Taxi Satelital",
                "tradeName": " AUTOTAXI SATELITAL SOCIEDAD ANONIMA CERRADA"
            },
            "costCenter": null,
            "dynamicFields": [],
            "driver": null,
            "vehicle": null,
            "location": null,
            "statusType": {
                "id": 1,
                "name": "PENDIENTE",
                "description": ""
            },
            "id": "9226c641-57ef-4ebb-a597-231da949e93c",
            "shortId": "43836",
            "serviceType": {
                "id": 4,
                "name": "Estandar",
                "description": "",
                "isCourier": false,
                "isCargo": false,
                "cargoPhotoMin": 0,
                "cargoPhotoMax": 1,
                "destinationsMin": null,
                "destinationsMax": null,
                "isRestrictedAddNewDestination": false
            },
            "paymentType": {
                "id": 100,
                "name": "Efectivo",
                "description": "Efectivo",
                "isEnableRequestOtherUser": false,
                "card_error": null
            },
            "serviceDateTime": "2023-07-20T11:13:32-05:00",
            "price": 67,
            "pickup": {
                "id": "2a0ea4be-e949-43ac-8f59-2283501de558",
                "latitude": -12.1357189,
                "longitude": -76.9681004,
                "onRoute": true,
                "mainText": "Parque 12 De Noviembre",
                "secondaryText": "San Juan de Miraflores, Perú",
                "price": 67,
                "placeZone": null,
                "contacts": [
                    {
                        "id": "",
                        "fullNameFormat": "{firstName}, {firstLastName},{secondLastName}",
                        "firstName": "Carlodaniel",
                        "firstLastName": "",
                        "secondLastName": "",
                        "cellphone": "944927896",
                        "countryCode": "51"
                    }
                ]
            },
            "destinations": [
                {
                    "id": "2a0ea4be-e949-43ac-8f59-2283501de558",
                    "latitude": -12.0230437,
                    "longitude": -77.10799759999999,
                    "onRoute": false,
                    "mainText": "Aeropuerto Internacional Jorge Chávez (LIM)",
                    "secondaryText": "Avenida Elmer Faucett, Callao, Perú",
                    "price": 67,
                    "contacts": [
                        {
                            "id": "",
                            "fullNameFormat": "{firstName}, {firstLastName},{secondLastName}",
                            "firstName": "Carlodaniel",
                            "firstLastName": "",
                            "secondLastName": "",
                            "cellphone": "944927896",
                            "countryCode": "51"
                        }
                    ]
                }
            ],
            "currencyType": {
                "id": 0,
                "symbol": "S/",
                "code": "PEN",
                "name": "NUEVO SOL"
            },
            "route": null,

            "passenger": [
                {
                    "id": 1,
                    "clientId": 26408,
                    "firstName": "Carlodaniel",
                    "secondLastName": "",
                    "firstLastName": "",
                    "cellPhone": "944927896",
                    "countryCode": "51"
                }
            ],
            "requestBy": {
                "id": "",
                "firstName": "",
                "secondLastName": null,
                "firstLastName": null
            },
            "client": {
                "id": "5b0b1944-94ef-426d-ac77-b71c6fa1e0c3",
                "firstName": "Carlodaniel",
                "secondLastName": "Pimentel",
                "firstLastName": "Huamani"
            },
            "isRequiredServiceCloseCode": false,
            "isAlreadyCalificated": false,
            "courierPackageInfo": null,
        },
        {
            "company": {
                "id": "3266464f-b77a-4ae1-a254-d18dc5172f66",
                "businessName": "Taxi Satelital",
                "tradeName": " AUTOTAXI SATELITAL SOCIEDAD ANONIMA CERRADA"
            },
            "costCenter": null,
            "dynamicFields": [],
            "driver": null,
            "vehicle": null,
            "location": null,
            "statusType": {
                "id": 1,
                "name": "PENDIENTE",
                "description": ""
            },
            "id": "d628a286-957a-4036-80c0-69743c12dfee",
            "shortId": "43812",
            "serviceType": {
                "id": 4,
                "name": "Estandar",
                "description": "",
                "isCourier": false,
                "isCargo": false,
                "cargoPhotoMin": 0,
                "cargoPhotoMax": 1,
                "destinationsMin": null,
                "destinationsMax": null,
                "isRestrictedAddNewDestination": false
            },
            "paymentType": {
                "id": 100,
                "name": "Efectivo",
                "description": "Efectivo",
                "isEnableRequestOtherUser": false,
                "card_error": null
            },
            "serviceDateTime": "2023-07-19T12:03:06-05:00",
            "price": 32,
            "pickup": {
                "id": "4ee62652-3bae-4070-9288-e9c3d0f2ef22",
                "latitude": -12.0672896,
                "longitude": -77.0337292,
                "onRoute": true,
                "mainText": "Estadio Nacional",
                "secondaryText": "Calle José Díaz, Lima, Perú",
                "price": 32,
                "placeZone": null,
                "contacts": [
                    {
                        "id": "",
                        "fullNameFormat": "{firstName}, {firstLastName},{secondLastName}",
                        "firstName": "Carlodaniel",
                        "firstLastName": "",
                        "secondLastName": "",
                        "cellphone": "944927896",
                        "countryCode": "51"
                    }
                ]
            },
            "destinations": [
                {
                    "id": "4ee62652-3bae-4070-9288-e9c3d0f2ef22",
                    "latitude": -12.1550946,
                    "longitude": -76.98220669999999,
                    "mainText": "Mall del Sur",
                    "secondaryText": "Avenida Pedro Miotta, San Juan de Miraflores, Perú",
                    "price": 32,
                    "contacts": [
                        {
                            "id": "",
                            "fullNameFormat": "{firstName}, {firstLastName},{secondLastName}",
                            "firstName": "Carlodaniel",
                            "firstLastName": "",
                            "secondLastName": "",
                            "cellphone": "944927896",
                            "countryCode": "51"
                        }
                    ]
                }
            ],
            "currencyType": {
                "id": 0,
                "symbol": "S/",
                "code": "PEN",
                "name": "NUEVO SOL"
            },
            "route": null,
            "passenger": [
                {
                    "id": 1,
                    "clientId": 26408,
                    "firstName": "Carlodaniel",
                    "secondLastName": "",
                    "firstLastName": "",
                    "cellPhone": "944927896",
                    "countryCode": "51"
                }
            ],
            "requestBy": {
                "id": "",
                "firstName": "",
                "secondLastName": null,
                "firstLastName": null
            },
            "client": {
                "id": "5b0b1944-94ef-426d-ac77-b71c6fa1e0c3",
                "firstName": "Carlodaniel",
                "secondLastName": "Pimentel",
                "firstLastName": "Huamani"
            },
            "isRequiredServiceCloseCode": false,
            "isAlreadyCalificated": false,
            "courierPackageInfo": null,
            
            

        },
        {
            "company": {
                "id": "3266464f-b77a-4ae1-a254-d18dc5172f66",
                "businessName": "Taxi Satelital",
                "tradeName": " AUTOTAXI SATELITAL SOCIEDAD ANONIMA CERRADA"
            },
            "dynamicFields": [],
            "driver": null,
            "vehicle": null,
            "location": null,
            "statusType": {
                "id": 1,
                "name": "PENDIENTE",
                "description": ""
            },
            "id": "dc1db44a-51a4-4a92-8ed4-358019434fd0",
            "shortId": "43750",
            "serviceType": {
                "id": 4,
                "name": "Estandar",
                "description": "",
                "isCourier": false,
                "isCargo": false,
                "cargoPhotoMin": 0,
                "cargoPhotoMax": 1,
                "destinationsMin": null,
                "destinationsMax": null,
                "isRestrictedAddNewDestination": false
            },
            "paymentType": {
                "id": 100,
                "name": "Efectivo",
                "description": "Efectivo",
                "isEnableRequestOtherUser": false,
                "card_error": null
            },
            "serviceDateTime": "2023-07-14T00:12:16-05:00",
            "price": 24,
            "pickup": {
                "id": "d48c210e-7905-4190-aaa1-6ac099f614ab",
                "latitude": -12.1029305,
                "longitude": -76.9559118,
                "mainText": "C. Los Petroleros 320, Lima 15023, Perú",
                "secondaryText": "C. Los Petroleros 320, Lima 15023, Perú",
                "price": 24,
                "placeZone": null,
                "contacts": [
                    {
                        "id": "",
                        "fullNameFormat": "{firstName}, {firstLastName},{secondLastName}",
                        "firstName": "Carlodaniel",
                        "firstLastName": "",
                        "secondLastName": "",
                        "cellphone": "944927896",
                        "countryCode": "51"
                    }
                ]
            },
            "destinations": [
                {
                    "id": "d48c210e-7905-4190-aaa1-6ac099f614ab",
                    "latitude": -12.1319502,
                    "longitude": -77.0305149,
                    "mainText": "Larcomar",
                    "secondaryText": "Malecón de la Reserva, Miraflores, Perú",
                }
            ],
            "currencyType": {
                "id": 0,
                "symbol": "S/",
                "code": "PEN",
                "name": "NUEVO SOL"
            },
            "route": null,
            "passenger": [
                {
                    "id": 1,
                    "clientId": 26408,
                    "firstName": "Carlodaniel",
                    "secondLastName": "",
                    "firstLastName": "",
                    "cellPhone": "944927896",
                    "countryCode": "51"
                }
            ],
            "requestBy": {
                "id": "",
                "firstName": "",
                "secondLastName": null,
                "firstLastName": null
            },
            "client": {
                "id": "5b0b1944-94ef-426d-ac77-b71c6fa1e0c3",
                "firstName": "Carlodaniel",
                "secondLastName": "Pimentel",
                "firstLastName": "Huamani"
            },
            "isRequiredServiceCloseCode": false,
            "isAlreadyCalificated": false,
            "courierPackageInfo": null,
        }
    ]
  idClient ?: string
  center: any = {
    lat: 10.96854,
    lng: -74.78132
  };
  activeState: boolean[] = [true, false, false];

  marker ?:any
  =
  {
    maintext :'Barranquilla',
    secondText : 'Hotel atrium',
    lat: 10.96854,
    lng: -74.78132
  }
  async ngOnInit() {

    // this.idClient = this.dataMaestra.user?.uuid
    this.onIntervalServiceCourseTab()
    this.suscriptionWebSocket();
  }
  ngOnDestroy(): void {
    clearInterval(this.IntervalOnGoing);
    // if (this.suscripcionTopic) {
    //   this.webSocketMqtt.ususcribeSuscription(this.suscripcionTopic.id!);
    // }
  }
  onTabClose() {
    // clearInterval(this.IntervalOnGoing)
    // this.onClearMap.emit([])
    // this.flagAccordion = false
  }
  async onTapOpen(envios: any, flagAccordion: boolean) {
    // let select_service = this.viaje[envios.index]
    // this.enviosServicio = select_service
    // this.flagAccordion = true
    // // await this.onGetRouteServiceShared(select_service)
    // this.onUpdateDriver();
    // // this.onUpdatePosicion(select_service)
    // // this.getServiceRouteAssigned(select_service.id)
    // this.onIntervalServiceCourseTab()
  }

private onIntervalServiceCourseTab() {
  this.onListServiceCourse();
  // this.IntervalOnGoing = setInterval(() => {
  //   this.onListServiceCourse();
  // }, 15000);
}
  link_href_shared_service ?: string
  IntervalOnGoing? : any
  list_marker ?: any = []
  async onListServiceCourse() {
    debugger
    for (let index = 0; index < this.list_viaje[0].destinations.length; index++) {
      const element = this.list_viaje[0].destinations[index];
      if(index== 0 ){
        this.marker.lat =  this.list_viaje[0].pickup.latitude
        this.marker.lng =  this.list_viaje[0].pickup.longitude
      }else {
        this.marker.lat =  element.latitude
        this.marker.lng =  element.longitude
      }
      this.list_marker.push(this.marker)
      
    }


    // await this.serviceComponent.requestService(StructService.CODE, RouteService.distpatchMonitorGetCurso, this.dataMaestra.user?.uuid).then(
    //   (response: any[]) => {
    //     if (response) {
    //       this.viaje = []
    //       response.forEach(element => {
    //         if (element.statusType.id == EstadosViaje.APROBADO || element.statusType.id == EstadosViaje.ASIGNADO ||
    //           element.statusType.id == EstadosViaje.LEIDO || element.statusType.id == EstadosViaje.UBICADO ||
    //           element.statusType.id == EstadosViaje.CONTACTO || element.statusType.id == EstadosViaje.BUSCANDO_CONDUCTOR
    //           || element.statusType.id == EstadosViaje.PREGUNTANDO_CONDUCTOR
    //         )
    //           element.flagActiveButtonCancel = true
    //         else
    //           element.flagActiveButtonCancel = false

    //         if (element.statusType.id == EstadosViaje.BUSCANDO_CONDUCTOR
    //           || element.statusType.id == EstadosViaje.PREGUNTANDO_CONDUCTOR) {
    //           element.flagBuscandoConductor = true
    //         } else {
    //           element.flagBuscandoConductor = false
    //         }
    //         this.viaje.push(element)
    //       });
    //       if (this.viaje.length > 0) {
    //         this.onGetRouteServiceShared(this.viaje[0])
    //         setTimeout(()=>{ this.update_position.emit(this.viaje[0])},1000)
    //         this.onGetServiceRouteAssigned.emit(this.viaje[0].id)
    //       }else {
    //         this.onClearMap.emit([])
    //       }
    //     }else{
    //       this.onClearMap.emit([])
    //     }
    //   })
  }

  btnCancelViaje(item :Viaje){
    // this.cancelViaje.emit(item)
  }
  onUpdateDriver() {
    // let lstPosiciones = cloneDeep(
    //   this.fnLstPosicionesByDriver(
    //     this.enviosServicio, 
    //     )
    //   )
    // this.lstPosiciones.emit(lstPosiciones)
  }
  // fnLstPosicionesByDriver( viaje: Viaje): PersonalisationMarker[] {
  //   let lstPosiciones: PersonalisationMarker[] = []
  //   if (viaje) {
  //     let tittle = viaje.driver?.firstName + ' ' + viaje.driver?.firstLastName + ' ' + viaje.driver?.secondLastName
  //     if (viaje.location) {
  //       lstPosiciones.push(this.fnDetalleViajeLabelListServiceWeb(new google.maps.LatLng(viaje.location?.latitude!, viaje.location.longitude!), tittle, -1, viaje.driver?.id + "",viaje.serviceType.id))
  //     }

  //   }

  //   return lstPosiciones
  // }
  // fnDetalleViajeLabelListServiceWeb(latLng: google.maps.LatLng, tittle: string, isEstado: number, labelSelector: string,id:any): PersonalisationMarker {
  //   let detalle: PersonalisationMarker = new PersonalisationMarker();

  //   detalle.posicion = latLng;
  //   detalle.showTittle = true;
  //   detalle.tittle = tittle;
  //   detalle.tipoMarker = TypeMarkers.CONDUCTOR_LABEL;
  //   detalle.isDragable = false;

  //   detalle.selector = ColorStatusLablelMarker.STATUS_DRIVER + isEstado;
  //   // detalle.labelSelector = labelSelector + '';
  //   detalle.idEstado = isEstado;
  //   detalle.estado = ValorComparativo.ESTADO_CONDUCTOR;
  //   detalle.showInfowindow = true;
  //   detalle.typeServicesId=id
  //   detalle.infoWindow = new google.maps.InfoWindow({
  //     content: '<b> ' + '   ' + tittle + '</b> '
  //   });
  //   return detalle
  // }
  onUpdatePosicion(item:Viaje){
    // this.update_position.emit(item)
  }
  viajeOpen: any
  async onGetService(index_obj: number, valueObj: Viaje) {
    // let viaje = this.viaje.find(viaje => viaje.id === valueObj.id)
    // let json = { service_id: valueObj.id, client_id: this.dataMaestra.user?.uuid } 
    // await this._ongoingService.getCorporativoServiceXId(json)
    // .subscribe
    //   (response => {
    //     console.log('ingresando')
    //     if(viaje!.statusType!.id == EstadosViaje.TERMINO || viaje!.statusType!.id == EstadosViaje.CANCELADO_BASE ){
    //       this.onClearMap.emit([])
    //       this.viaje.splice(index_obj,1)
    //     }else {
    //       if(this.flagAccordion){
    //         this.onGetRouteServiceShared(valueObj)
    //         setTimeout(()=>{ this.update_position.emit(valueObj)},1000)
    //       }
    //       this.updateLstViajesV2(index_obj,response)
    //     }
    //   },
    //   error=>{
    //     console.log('Ocurrio un error')
    // }
    // )
  

  }
  searchAutomatic: boolean = true;
  updateLstViajesV2(position_element : number , element: any) {
    // let viaje : Viaje = fnInitObjViajeOpe(element);
    // console.log("antes de entrar a updateElementViaje")
    // console.log(viaje)
    // this.updateElementViaje(position_element, viaje);
    // // this.orderArray()
  }
  validateFiltrosElement(element: Viaje) {
  }
  flagBuscandoConductor : boolean = true
  updateElementViaje(indexObjViaje: number, element: Viaje) {
    // if (element.statusType.id == EstadosViaje.APROBADO || element.statusType.id == EstadosViaje.ASIGNADO ||
    //   element.statusType.id == EstadosViaje.LEIDO || element.statusType.id == EstadosViaje.UBICADO ||
    //   element.statusType.id == EstadosViaje.CONTACTO || element.statusType.id == EstadosViaje.BUSCANDO_CONDUCTOR
    //   || element.statusType.id == EstadosViaje.PREGUNTANDO_CONDUCTOR) 
    //   this.viaje[indexObjViaje].flagActiveButtonCancel = true;
    // else
    //   this.viaje[indexObjViaje].flagActiveButtonCancel = false;
    //   if (element.statusType.id == EstadosViaje.BUSCANDO_CONDUCTOR
    //     || element.statusType.id == EstadosViaje.PREGUNTANDO_CONDUCTOR) {
    //     this.flagBuscandoConductor = true
    //   }else {
    //     this.flagBuscandoConductor = false
    //   }
    // this.viaje[indexObjViaje].client = element.client;
    // this.viaje[indexObjViaje].driver = element.driver;
    // this.viaje[indexObjViaje].exigent = element.exigent;
    // this.viaje[indexObjViaje].fixedRate = element.fixedRate;
    // this.viaje[indexObjViaje].passenger = element.passenger;
    // this.viaje[indexObjViaje].statusType = element.statusType;
    // this.viaje[indexObjViaje].serviceType = element.serviceType;
    // this.viaje[indexObjViaje].paymentType = element.paymentType;
    // this.viaje[indexObjViaje].currencyType = element.currencyType;
    // this.viaje[indexObjViaje].vehicle = element.vehicle;
    // this.viaje[indexObjViaje].vip = element.vip;
    // this.viaje[indexObjViaje].totalService = element.price;
    // this.viaje[indexObjViaje].destination = element.destination;
    // this.viaje[indexObjViaje].isRetained = element.isRetained;
    // console.log("indexObjViaje")
    // console.log(this.viaje[indexObjViaje])
  }
  //#region  push
  suscriptionWebSocket() {
    // this.webSocketMqtt.suscribeSuscription(this).then((data) => {
    //   this.suscripcionTopic = data;
    // }).catch((error) => {
    //   console.log(error);
    // })
  }
  mapClicked($event: MouseEvent) {
    this.marker.lat = $event.coords.lat,
    this.marker.lng = $event.coords.lng
  }

}
