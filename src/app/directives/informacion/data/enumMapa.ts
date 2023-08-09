export enum FormatoDistancia {
    KILOMETROS = 'KILOMETROS',
    TYPE_PAYMENT = 'SOLES',
    // MILLAS = 'MILLAS',
    METROS = 'METROS'
  }
  
export enum ClassNameControl {
    TIEMPO = 'tiempoEstimado',
    DISTANCIA = 'distanciaEstimada',
    PRICE_ESTIMATE = 'priceEstimate',
    SERVICE = 'service',
    PANTALLA_COMPLETA = 'fi flaticon-fullscreen'
}

export enum  TypeMarkers {
  ORIGEN = 'origen',
  DESTINO = 'destino',
  CONDUCTOR = 'conductor',
  CONDUCTOR_LABEL = 'conductor_label',
  PASAJERO = 'pasajero',
  CHECKPOINT = 'checkpoint',
  PRECLOSE = 'preclose',
  READING = 'reading',
  CONTACT = 'contact',
  START_DESTINATION = 'start_destination',
  END_DESTINATION = 'end_destination',
  RIDE_END = 'ride_end'

}

// export enum TypeInfoWindow {
//   PERSONALIZADO = 'personalizado',
// }

export enum ValorComparativo {
  ESTADO_CONDUCTOR = 'STATUS_DRIVER',
  ESTADO_VIAJE= 'STATUS_TRAVEL',
  // ESTADO_CONDUCTOR = 'estadoConductor',
  // ESTADO_VIAJE= 'estadoViaje',
}

export class PersonalisationMarker {
  isDragable?:boolean;
  isDragableMemory?:boolean;
  posicion?: google.maps.LatLng;
  idDestino?: number;
  
  tipoMarker?: TypeMarkers; //..

  showTittle?: boolean;
  tittle?: string;
  view_screen_map ?: boolean;
  showInfowindow?: boolean;
  infoWindow?: google.maps.InfoWindow;
  
  // typeWindow: TypeInfoWindow;

  // tipo de marker MarkerWithLabel
  selector?: string;
  labelSelector?:string
  idEstado?: number; // VALOR DEL Q OBTIENE EL COLOR
  estado?: ValorComparativo; //OBTIENE LA LISTA DE COLORES POR ESTADO
  typeServicesId?:number
}

export class PersonalisationPolyline {
  coordinateEncoded?:string; //coordenadas codificadas
  color?: string;
}

