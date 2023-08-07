import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MouseEvent } from "src/agm/core";
import { AuthService } from "src/app/utils/auth.service";
import { StoreService } from "../main/service/store.service";
import { MapsAPILoader } from "src/agm/core";
import {
  PersonalisationMarker,
  PersonalisationPolyline,
  TypeMarkers,
} from "src/app/directives/informacion/data/enumMapa";
import { Viaje } from "../order-course/data";
import { RequestGeoAutocomplete } from "src/app/directives/informacion/data/serviceGeo";
import {
  Point,
  RequestMotorizedOrigin,
  RequestOrderPayment,
  RequestTrip,
} from "./data/request";
import * as UtilModalViaje from "./util-modal-viaje-corporate";
import { RequestTripService } from "./services/request-trip.service";
import { ResponseMotorizedOrigin } from "./data/response";
import { LoadingMotorizedComponent } from "./dialog/loading-motorized/loading-motorized.component";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { environment } from "src/environments/environment";
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
  is_disabled_pickup: boolean = true;
  center: any = {
    lat: 10.96854,
    lng: -74.78132,
  };

  marker = {
    maintext: "Barranquilla",
    secondText: "Hotel atrium",
    lat: 10.96854,
    lng: -74.78132,
  };
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
  constructor(
    private storeService: StoreService,
    private requestTripService: RequestTripService,
    private dialogService: DialogService
  ) {}

  stateOptions: any[];
  method_payment = "efectivo";
  amount?: number = 123323;
  request_trip: RequestTrip = new RequestTrip();
  ref?: DynamicDialogRef;
  ngAfterViewInit(): void {}
  ngOnInit(): void {
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
    this.findAdress();
    this.onGetLocationStore(true);
    // this.auth.getUserDetails().then(
    //   (data) => {
    //       this.userAttributes = data
    //       let userPhoneObj = this.userAttributes.find(attributes => attributes.Name == 'phone_number')
    //       this.userPhone = userPhoneObj.Value
    //   }
    // )
    // this.stateOptions = [{label: 'Efectivo', value: 'efectivo'}, {label: 'Pago Digital', value: 'e-wallet'}];
  }

  private onGetLocationStore(flagInit : boolean) {
    this.storeService.onGetLocationStoreService().subscribe((data) => {
      this.input_visible_pickup = data.data.store.fullName;
      this.request_trip.addresses[0].phone = data.data.store.phone;
      this.request_trip.addresses[0].point.type = "Point";
      this.request_trip.addresses[0].floor = "";
      this.request_trip.addresses[0].alias = "";
      this.request_trip.addresses[0].marker = "store";
      this.request_trip.addresses[0].addressStreet = this.input_visible_pickup;
      this.request_trip.addresses[0].point.coordinates = [
        data.data.store.location.coordinates[1],
        data.data.store.location.coordinates[0]
      ];

      // this.input_visible_pickup = this.marker.maintext
      this.marker.lng = data.data.store.location.coordinates[0];
      this.marker.lat = data.data.store.location.coordinates[1];
      this.stateOptions = data.data.tripSetting.paymentMethod;
      this.method_payment = "CASH";
      this.onGetMotorizedPosiitonOrigin();
      this.flagInitMap = flagInit;
      this.updatePosition();
    });
  }

  mapClicked($event: MouseEvent) {
    (this.marker.lat = $event.coords.lat),
      (this.marker.lng = $event.coords.lng);
  }
  onChangeMapMarkers(event: any) {}
  nroViaje: number = 0;
  findAdressOrigin() {
    //  google.maps.
    const element = <HTMLInputElement>(
      document.getElementById("txtUbicacion_origin")
    );
    const autocomplete = new google.maps.places.Autocomplete(element, {
      types: [],
      fields: ["place_id"],
      componentRestrictions: {
        country: "PE", //'CO'
      },
    });

    autocomplete.addListener("place_changed", () => {
      let place: any = autocomplete.getPlace().place_id;
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
        country: "PE",
      },
    });

    autocomplete.addListener("place_changed", () => {
      let place: any = autocomplete.getPlace().place_id;
      this.geocodePlaceIdMultidestino(place);
    });
  }
  geocoder: google.maps.Geocoder = new google.maps.Geocoder();
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
            results[0].geometry.location.lat(),
            results[0].geometry.location.lng(),
          ];
          // this.geocodePlaceId(place);
          this.onGetMotorizedPosiitonOrigin();
          this.updatePosition();
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
            results[0].geometry.location.lat(),
            results[0].geometry.location.lng(),
          ];
          // this.geocodePlaceId(place);
          this.onGetAmountOrder();
          this.updatePosition();
        }
      }
    });
  }
  updatePosition() {
    var lstPosiciones: PersonalisationMarker[] = [];
    lstPosiciones.push(
      UtilModalViaje.fnDetalleViaje(
        new google.maps.LatLng(this.marker.lat, this.marker.lng),
        true,
        "Origen",
        TypeMarkers.ORIGEN,
        true,
        1
      )
    );
    if (this.request_trip.addresses.length > 1) {
      lstPosiciones.push(
        UtilModalViaje.fnDetalleViaje(
          new google.maps.LatLng(
            this.request_trip.addresses[1].point.coordinates[0],
            this.request_trip.addresses[1].point.coordinates[1]
          ),
          true,
          "Destino",
          TypeMarkers.DESTINO,
          true,
          1
        )
      );
    }

    this.lstPosiciones = lstPosiciones;
  }
  onUpdatePositionDriver() {
    var lstPosicionConductor: PersonalisationMarker[] = [];
    if (this.data_driver) {
      lstPosicionConductor = [];
      // this.lstPosicionConductor = this.lstPosiciones.filter(item => item.tipoMarker != TypeMarkers.CONDUCTOR_LABEL)
      for (let item of this.data_driver) {
        lstPosicionConductor.push(
          UtilModalViaje.fnDetalleViaje(
            new google.maps.LatLng(
              item.position.point.coordinates[1]!,
              item.position.point.coordinates[0]!
            ),
            true,
            "Conductor",
            TypeMarkers.CONDUCTOR_LABEL,
            false,
            undefined,
            1
          )
        );
      }
    } else {
      lstPosicionConductor.push(new PersonalisationMarker());
    }
    this.lstPosicionConductor = lstPosicionConductor;
  }
  data_driver: ResponseMotorizedOrigin[] = [];
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
    this.requestTripService.onGetMotorizedPositionService(request).subscribe(
      (data) => {
        this.data_driver = data.data;
        this.onUpdatePositionDriver();
      },
      (error) => {
        alert("Ocurrió un error");
      }
    );
  }
uuid_price ?: string
  onGetAmountOrder() {
    let request: RequestOrderPayment = {
      origin: {
        lat: this.request_trip.addresses[0].point.coordinates[1],
        lng: this.request_trip.addresses[0].point.coordinates[0],
      },
      destination: {
        lat: this.request_trip.addresses[1].point.coordinates[0],
        lng: this.request_trip.addresses[1].point.coordinates[1],
      },
    };
    this.requestTripService.onGetPaymentOrderService(request).subscribe(
      (data) => {
        this.uuid_price = data.data.uuid
        this.amount = data.data.amount;
        this.polyline_order = [
          { coordinateEncoded: data.data.overviewPolyline },
        ];
      },
      (error) => {
        alert("Ocurrió un error al obtener la tarifa");
      }
    );
  }
  onSaveOrder() {
    let order: RequestTrip = new RequestTrip();
    if (!this.request_trip.description) {
      alert("La descripción es obligatoria");
    } else {
      order.payment = {
        amount: {
          value: this.amount,
        },
        method: {
          type: this.method_payment,
        },
      };
      order.readyToDmAt = this.request_trip.readyToDmAt;
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
          phone: this.request_trip.mobile,
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
          order.addresses[0].phone = item.phone;
          order.addresses[0].marker = item.marker;
          order.addresses[0].alias = item.alias;
          order.addresses[0].reference = item.reference;
          order.addresses[0].floor = item.floor;
          order.addresses[0].point = item.point;
        } else {
          order.addresses[1].phone = this.request_trip.mobile;
          order.addresses[1].marker = item.marker;
          order.addresses[1].alias = item.alias;
          order.addresses[1].reference = item.reference;
          order.addresses[1].floor = item.floor;
          order.addresses[1].addressStreet = item.addressStreet;
          order.addresses[1].point = item.point;
        }
      });
      console.log(JSON.stringify(order));
      this.requestTripService.onSaveOrderService(order).subscribe(
        (data) => {
          this.ref = this.dialogService.open(LoadingMotorizedComponent, {
            header: "Motorizado",
          });
          // alert("Se guardó correctamente");
        },
        (error) => {
          alert("Ocurrió un error");
        }
      );
    }
  }
}
