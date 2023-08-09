import { environment } from "src/environments/environment";
import {
  FormatoDistancia,
  ClassNameControl,
  PersonalisationMarker,
  TypeMarkers,
  ValorComparativo,
  PersonalisationPolyline,
} from "../data/enumMapa";
import { GenericObject } from "../data/genericObject";
import { RequestGeoAutocomplete } from "../data/serviceGeo";

// inicializar mapa
export function fnInitMap(
  id: string,
  lat: number,
  lng: number,
  defaultUI: boolean
): google.maps.Map {
  return new google.maps.Map(document.getElementById(id)!, {
    center: new google.maps.LatLng(lat, lng),
    zoom: 15,
    disableDefaultUI: true,
    // disableDefaultUI: (defaultUI)? defaultUI : false,
    // zoomControl: (!defaultUI) ? true : false,
    // mapTypeControl: false,
    // scaleControl: false,
    // streetViewControl: false,
    // rotateControl: false,
    // fullscreenControl: false,
  });
}

export function fnCrearPolilyne(
  map: google.maps.Map,
  personalizationPolyline?: PersonalisationPolyline
): google.maps.Polyline {
  const lineSymbol = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    strokeColor: "#393",
  };

  return new google.maps.Polyline({
    // icons: [ 
    //    {
    //   icon: lineSymbol,
    //   offset: "100%",
    // },],
    geodesic: true,
    strokeColor: "#EF494D",
    map: map,
  });
  //  OptionsPolyline((personalizationPolyline) ? personalizationPolyline : new PersonalisationPolyline()));
}
export function bezierMap(
  lat1: any,
  long1: any,
  lat2: any,
  long2: any,
  lat3: any,
  long3: any,
  lat4: any,
  long4: any,
  resolution: any,
  map: any
) {
  var points = [];

  // for(var it = 0; it <= 1; it += resolution) {
  //     points.push(getBezier({x:lat1, y:long1},{x:lat2, y:long2},{x:lat3, y:long3},{x:lat4, y:long4}, it));
  // }

  // for(var i = 0; i < points.length - 1; i++) {
  //         var Line = new google.maps.Polyline({
  //             path: [new google.maps.LatLng(points[i].x, points[i].y), new google.maps.LatLng(points[i+1].x, points[i+1].y)],
  //             geodesic: true,
  //             strokeOpacity: 0,
  //             strokeColor: 'yellow',
  //             icons: [{
  //                     icon: {
  //                     path: 'M 0,-2 0,2',
  //                     strokeColor: 'violet',
  //                     strokeOpacity: 1,
  //                     strokeWeight: 4
  //                 },
  //                 repeat: '36px'
  //             },{
  //                     icon: {
  //                     path: 'M -1,-2 -1,2',
  //                     strokeColor: 'black',
  //                     strokeOpacity: 1,
  //                     strokeWeight: 2
  //                 },
  //                 repeat: '36px'
  //             }]
  //         });

  //         Line.setMap(map);

  // getBezier(1,1,1,1,1,1)
}

export function getBezier(C1: any, C2: any, C3: any, C4: any, percent: any) {
  // bezierMap.prototype = {
  //     B1 : function (t) { return t*t*t; },
  //     B2 : function (t) { return 3*t*t*(1-t); },
  //     B3 : function (t) { return 3*t*(1-t)*(1-t); },
  //     B4 : function (t) { return (1-t)*(1-t)*(1-t); },
  // }
  //     var pos = {};
  //     pos.x = C1.x*this.B1(percent) + C2.x*this.B2(percent) + C3.x*this.B3(percent) + C4.x*this.B4(percent);
  //     pos.y = C1.y*this.B1(percent) + C2.y*this.B2(percent) + C3.y*this.B3(percent) + C4.y*this.B4(percent);
  //     return pos;
}
export function fnInitHeadMap(
  map: google.maps.Map
): google.maps.visualization.HeatmapLayer {
  return new google.maps.visualization.HeatmapLayer({
    data: [],
    opacity: 0.8,
    map: map,
  });
}

export function setMapAll(
  map: google.maps.Map,
  lstMarkers: google.maps.Marker[]
) {
  if (map && lstMarkers && lstMarkers.length >= 1) {
    lstMarkers.forEach((marker) => {
      marker.setMap(map);
    });
  }
}

export function fnDiferentPositionAndLenght(
  lstMarkers: google.maps.Marker[],
  lstPosiciones: PersonalisationMarker[],
  lstPosicionesMarkers: PersonalisationMarker[]
): boolean {
  if (lstMarkers.length != lstPosiciones.length) {
    return true;
  } else {
    for (let i = 0; i < lstMarkers.length; i++) {
      if (lstMarkers[i].getPosition! && lstPosiciones[i].posicion) {
        if (
          lstMarkers[i].getPosition()?.lat() !=
          lstPosiciones[i].posicion?.lat() ||
          lstMarkers[i].getPosition()?.lng() != lstPosiciones[i].posicion?.lng()
        ) {
          return true;
        }
      }

      if (lstMarkers[i].getDraggable() != lstPosiciones[i].isDragable) {
        return true;
      }

      if (
        lstPosiciones[i].showTittle &&
        lstMarkers[i].getTitle() != lstPosiciones[i].tittle
      ) {
        return true;
      }

      if (!lstPosicionesMarkers[i].idDestino) {
        lstPosicionesMarkers[i].idDestino = undefined!;
      }
      if (lstPosicionesMarkers[i].idDestino != lstPosiciones[i].idDestino) {
        return true;
      }

      if (lstPosicionesMarkers[i].tipoMarker != lstPosiciones[i].tipoMarker) {
        return true;
      }

      if (
        lstPosiciones[i].showInfowindow &&
        lstPosiciones[i].infoWindow != lstPosicionesMarkers[i].infoWindow &&
        // lstPosiciones[i].infoWindow &&
        // lstPosicionesMarkers[i].infoWindow &&
        lstPosicionesMarkers[i].infoWindow?.getContent() !=
        lstPosiciones[i].infoWindow?.getContent()
      ) {
        return true;
      }

      if (lstPosicionesMarkers[i].selector != lstPosiciones[i].selector) {
        return true;
      }

      // if (lstPosicionesMarkers[i].idEstado != lstPosiciones[i].idEstado) {
      //     return true
      // };

      if (lstPosicionesMarkers[i].estado != lstPosiciones[i].estado) {
        return true;
      }

      // if (lstPosicionesMarkers[i].labelSelector != lstPosiciones[i].labelSelector &&
      //     lstMarkers[i].get("labelContent") != lstPosiciones[i].labelSelector) {
      //     return true
      // };
    }
    return false;
  }
}

export function fnCrearMarker(
  index: number,
  detalleMarker: PersonalisationMarker,
  map: google.maps.Map,
  estadosComparativo: any[]
): google.maps.Marker {
  // if (detalleMarker.tipoMarker == TypeMarkers.CONDUCTOR_LABEL) {
  //     let selector: string = detalleMarker.selector!;
  //     let MarkerWithLabel = require('markerwithlabel')(google.maps);
  //     return new MarkerWithLabel({
  //         position: detalleMarker.posicion,
  //         draggable: detalleMarker.isDragable,
  //         raiseOnDrag: true,
  //         map: map,
  //         labelContent: detalleMarker.labelSelector,
  //         labelAnchor: new google.maps.Point(30, 75),
  //         labelClass: "labels-mapa" + " " + selector,
  //         labelStyle: { opacity: 1 },
  //         icon: getUrlIcon(detalleMarker),
  //         title: detalleMarker.tittle,
  //     }) as google.maps.Marker;
  // }
  // else
  {
    return new google.maps.Marker({
      position: detalleMarker.posicion,
      title: detalleMarker.tittle,
      map: map,
      draggable: detalleMarker.isDragable,
      animation: google.maps.Animation.DROP,
      icon: getUrlIcon(detalleMarker),
    });
  }
}

export function createClassStyle(
  selector: string,
  idEstado: number,
  estadosComparativo: GenericObject[]
) {
  let color = "#ffffff";

  estadosComparativo.forEach((estado) => {
    if (estado.id == idEstado) {
      color = estado.color!;
    }
  });

  color = color ? color : "#ffffff";
  // if (document.getElementsByClassName(selector)) {
  //   createCSSSelector(
  //     selector,
  //     "{border: 1px solid" +
  //     color +
  //     "; background: " +
  //     color +
  //     "; color: " +
  //     fnColorBasedBrightnessBlackOrWhite(color) +
  //     "}"
  //   );
  // } else {
  //   editCSSSelector(selector, color);
  // }
}

export function createClassStyleGroup(selector: string, color: string) {
  // color = color ? color : "#ffffff";
  // if (document.getElementsByClassName(selector)) {
  //   createCSSSelector(
  //     selector,
  //     "{border: 1px solid" +
  //     color +
  //     "; background: " +
  //     color +
  //     "; color: " +
  //     fnColorBasedBrightnessBlackOrWhite(color) +
  //     "}"
  //   );
  // } else {
  //   editCSSSelector(selector, color);
  // }
}

export function createCSSSelector(selector: any, cssStyle: any) {
  var style = document.createElement("style");
  style.type = "text/css";
  style.innerHTML = "." + selector + cssStyle;
  document.getElementsByTagName("head")[0].appendChild(style);
}

export function editCSSSelector(selector: string, background: string) {
  let classEdit = document.getElementsByClassName(
    selector
  ) as HTMLCollectionOf<Element>;

  for (let i = 0; i < classEdit.length; i++) {
    classEdit[i].setAttribute("style", "background:" + background + ";");
  }
}

export function fitBounds(
  map: google.maps.Map,
  coberturePosition: RequestGeoAutocomplete,
  lstMarkers?: google.maps.Marker[],
  lstPolylinsMapa?: google.maps.Polyline[],
  lstPosiciones?: PersonalisationMarker[]
) {
  if (map) {
    let bounsConteiner: boolean = false;
    var bounds = new google.maps.LatLngBounds();
    if (lstPosiciones != undefined  && lstPosiciones.length != 0) {
      if (lstPosiciones.length == 1) {
        bounds.extend(
          new google.maps.LatLng(
            lstPosiciones[0].posicion!.lat(),
            lstPosiciones[0].posicion!.lng()
          )
        );
        map.fitBounds(bounds);
        google.maps.event.addListenerOnce(map, "idle", function () {
          map.setZoom(15);
        });
      } else {
        if (lstPolylinsMapa.length > 0) {
          lstPolylinsMapa.forEach((polyline) => {
            if (polyline && polyline.getPath()) {
              let pathPolyline = polyline.getPath();
              pathPolyline.forEach((pathPoly) => {
                bounds.extend(pathPoly);
              });
            }
          });
          map.fitBounds(bounds);
        }
        else {
          lstMarkers.forEach(marker => {
            if ((marker.getPosition() && marker.getPosition()?.lat() && marker.getPosition()?.lng()) && (marker.getPosition()?.lat() != 0 && marker.getPosition()?.lng() != 0)) {
              bounds.extend(marker.getPosition()!);
              bounsConteiner = true;
            }
          });
          map.fitBounds(bounds);
        }
      }
    } else {
      bounds.extend(
        new google.maps.LatLng(
          coberturePosition.latitude!,
          coberturePosition.longitude!
        )
      );
      map.fitBounds(bounds);
      google.maps.event.addListenerOnce(map, "idle", function () {
        map.setZoom(15);
      });
    }
  }
}

export function editarControlMap(newValue: string, className: string) {
  let control = document.getElementsByClassName(className)[0];
  if (control) {
    control.lastChild!.textContent = newValue; //(newValue / 1000).toFixed(2);
  }
}

export async function crearControlMap(
  map: google.maps.Map,
  time: Date,
  viewTime: boolean,
  metros: number,
  viewMetros: boolean,
  viewFullScreem: boolean,
  emitEventFullScreeem: any,
  viewPriceEstimate: boolean,
  priceEstimate: number,
  service_number : string,
  viewService : boolean
) {
  const controlKilometro = document.createElement("div");
  controlKilometro.style.cursor = "pointer";
  controlKilometro.style.height = "28px";
  controlKilometro.style.width = "80px";
  controlKilometro.style.top = "10px";
  // controlKilometro.title = 'Servicio';
  controlKilometro.style.background = 'red'
  controlKilometro.style.borderRadius = "2px";
  controlKilometro.style.color = 'red'
  controlKilometro.style.textAlign = "center";
  controlKilometro.style.marginTop = "70px";
  controlKilometro.style.marginLeft = "15px";
  controlKilometro.style.backgroundColor = "#e52421";

  const containerKilometraje = document.createElement("div");
  containerKilometraje.style.fontFamily = "Roboto,Arial,sans-serif";
  containerKilometraje.style.fontSize = "14px";
  containerKilometraje.style.lineHeight = "30px";
  containerKilometraje.style.paddingLeft = "5px";
  containerKilometraje.style.paddingRight = "5px";
  containerKilometraje.innerHTML = converMetrotoFormat(metros);
  containerKilometraje.className = ClassNameControl.DISTANCIA;

  const controlTiempo = document.createElement("div");
  controlTiempo.style.cursor = "pointer";
  controlTiempo.style.height = "28px";
  controlTiempo.style.width = "80px";
  // controlTiempo.title = 'Tiempo';
  controlTiempo.style.background = 'red'
  controlTiempo.style.borderRadius = "2px";
  controlTiempo.style.color = 'red'
  controlTiempo.style.marginTop = "5px";
  controlTiempo.style.marginLeft = "15px";
  controlTiempo.style.textAlign = "center";

  const containerTiempo = document.createElement("div");
  containerTiempo.style.fontFamily = "Roboto,Arial,sans-serif";
  containerTiempo.style.fontSize = "14px";
  controlTiempo.style.marginLeft = "15px";
  controlKilometro.style.top = "10px";
  containerTiempo.style.lineHeight = "30px";
  containerTiempo.style.paddingRight = "5px";
  containerTiempo.innerHTML = convertFormatTime(time);
  containerTiempo.className = ClassNameControl.TIEMPO;

  const controlPriceEstimate = document.createElement("div");
  controlPriceEstimate.style.cursor = "pointer";
  controlPriceEstimate.style.height = "28px";
  controlPriceEstimate.style.width = "80px";
  controlPriceEstimate.style.top = "10px";
  // controlKilometro.title = 'Servicio';
  controlPriceEstimate.style.background = 'red'
  controlPriceEstimate.style.borderRadius = "2px";
  controlPriceEstimate.style.color = 'red'
  controlPriceEstimate.style.textAlign = "center";
  controlPriceEstimate.style.marginTop = "5px";
  controlPriceEstimate.style.marginLeft = "15px";

  const containerPrice = document.createElement("div");
  containerPrice.style.fontFamily = "Roboto,Arial,sans-serif";
  containerPrice.style.fontSize = "16px";
  containerPrice.style.lineHeight = "30px";
  containerPrice.style.paddingLeft = "5px";
  containerPrice.style.paddingRight = "5px";
  containerPrice.innerHTML = convertFormatPrice(priceEstimate);
  containerPrice.className = ClassNameControl.PRICE_ESTIMATE;
  containerPrice.style.backgroundColor = "#e52421";

  const controlService = document.createElement("div");
  controlService.style.cursor = "pointer";
  controlService.style.height = "28px";
  controlService.style.width = "100px";
  controlService.style.top = "10px";
  // controlKilometro.title = 'Servicio';
  controlService.style.background = 'red'
    controlService.style.borderRadius = "2px";
    controlService.style.color = 'red'
    controlService.style.textAlign = "center";
    controlService.style.marginTop = "5px";
    controlService.style.marginLeft = "15px";

  const containerService = document.createElement("div");
  containerService.style.fontFamily = "Roboto,Arial,sans-serif";
  containerService.style.fontSize = "16px";
  containerService.style.lineHeight = "30px";
  containerService.style.paddingLeft = "5px";
  containerService.style.paddingRight = "5px";
  containerService.innerHTML = 'Servicio: ' + (service_number?service_number : '');
  containerService.className = ClassNameControl.SERVICE;
  containerService.style.backgroundColor = "#e52421";

  const pantallaCompleta = document.createElement("div");
  pantallaCompleta.style.cursor = "pointer";
  pantallaCompleta.style.marginTop = "20px";
  pantallaCompleta.style.marginRight = "10px";
  pantallaCompleta.style.marginLeft = "10px";
  pantallaCompleta.style.marginBottom = "20px";
  pantallaCompleta.style.boxShadow = "2px 2px 3px #999;";

  var containerPantallaCompleta = document.createElement("I");
  containerPantallaCompleta.style.padding = "10px";
  containerPantallaCompleta.style.paddingTop = "15px";
  containerPantallaCompleta.style.background = 'red'
  containerPantallaCompleta.style.color = 'red'
  containerPantallaCompleta.className = ClassNameControl.PANTALLA_COMPLETA;
  containerPantallaCompleta.style.borderRadius = "2px";
  containerPantallaCompleta.style.boxShadow = "2px 2px 3px #999";

  if (viewMetros) {
    controlKilometro.appendChild(containerKilometraje);
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(controlKilometro);
  }
  if (
    viewPriceEstimate
  ) {
    controlPriceEstimate.appendChild(containerPrice);
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(
      controlPriceEstimate
    );
  }

  if (
    viewService
  ) {
    controlService.appendChild(containerService);
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(
      controlService
    );
  }


  if ( viewTime) {
    controlTiempo.appendChild(containerTiempo);
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(controlTiempo);
  }

  if (viewFullScreem) {
    pantallaCompleta.appendChild(containerPantallaCompleta);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(pantallaCompleta);
    pantallaCompleta.addEventListener("click", function () {
      emitEventFullScreeem.emit({});
    });
  }
}

export function converMetrotoFormat(metros: number): string {
  // if (metros) {
  //   if (
  //     environment.CONFIGURATION.MAPA.FORMATO_DISTANCIA ==
  //     FormatoDistancia.KILOMETROS
  //   ) {
  //     return "KM. " + (metros / 1000).toFixed(2);
  //   } else if (
  //     environment.CONFIGURATION.MAPA.FORMATO_DISTANCIA ==
  //     FormatoDistancia.METROS
  //   ) {
  //     return "MT. " + metros;
  //   }
  // } else {
  //   if (
  //     environment.CONFIGURATION.MAPA.FORMATO_DISTANCIA ==
  //     FormatoDistancia.KILOMETROS
  //   ) {
  //     return "KM. ---";
  //   } else if (
  //     environment.CONFIGURATION.MAPA.FORMATO_DISTANCIA ==
  //     FormatoDistancia.METROS
  //   ) {
  //     return "MT. ---" + metros;
  //   }
  // }
  return "";
}
export function convertFormatPrice(price: number): string {
  if (price) {
    return "S/. " + price;
    //     if (environment.CONFIGURATION.MAPA.FORMATO_DISTANCIA == FormatoDistancia.TYPE_PAYMENT) {
    //         return 'S/. ' + price;
    //     } else if (environment.CONFIGURATION.MAPA.FORMATO_DISTANCIA == FormatoDistancia.TYPE_PAYMENT) {
    //         return 'S/. ' + price;
    //     }
    // } else {
    //     if (environment.CONFIGURATION.MAPA.TYPE_PAYMENT == FormatoDistancia.TYPE_PAYMENT) {
    //         return 'S/. ---';
    //     } else if (environment.CONFIGURATION.MAPA.FORMATO_DISTANCIA == FormatoDistancia.TYPE_PAYMENT) {
    //         return 'S/. ---' + price;
    //     }
    // }
    // return '';
  } else {
    return "S/. ";
  }
}
export function convertFormatTime(tiempo: Date): string {
  return tiempo ? tiempo.getHours() + ":" + tiempo.getMinutes() : "--:--";
}

export function getUrlIcon(detalleMarker: PersonalisationMarker): any {
  let urlIcon: any = {
    url: "",
    scaledSize: new google.maps.Size(30, 35),
    zIndex: 1,
  };
  switch (detalleMarker.tipoMarker) {
    case TypeMarkers.ORIGEN:
      urlIcon.url =
        "assets/empresas/" +
        environment.NAME_COMPANY +
        environment.MARKERS.ORIGEN.URL;
      urlIcon.scaledSize = environment.MARKERS.ORIGEN.ICON_SIZE;
      urlIcon.zIndex = environment.MARKERS.ORIGEN.POSICION;
      break;
    case TypeMarkers.DESTINO:
      urlIcon.url =
        "assets/empresas/" +
        environment.NAME_COMPANY +
        environment.MARKERS.DESTINO.URL;
      urlIcon.scaledSize = environment.MARKERS.DESTINO.ICON_SIZE;
      urlIcon.zIndex = environment.MARKERS.ORIGEN.POSICION;
      break;
    case TypeMarkers.CONDUCTOR:
      urlIcon.url =
        "assets/empresas/" +
        environment.NAME_COMPANY +
        environment.MARKERS.CONDUCTOR.URL;
      urlIcon.scaledSize = environment.MARKERS.CONDUCTOR.ICON_SIZE;
      break;
    case TypeMarkers.CONDUCTOR_LABEL:
      urlIcon.url =
      "assets/empresas/" +
      environment.NAME_COMPANY +
      environment.MARKERS.CONDUCTOR_LABEL.URL;
      urlIcon.scaledSize = environment.MARKERS.CONDUCTOR_LABEL.ICON_SIZE;
      break;
    case TypeMarkers.PASAJERO:
      urlIcon.url =
        "assets/empresas/" +
        environment.NAME_COMPANY +
        environment.MARKERS.PASAJERO.URL;
      urlIcon.scaledSize = environment.MARKERS.PASAJERO.ICON_SIZE;
      break;
    case TypeMarkers.CHECKPOINT:
      urlIcon.url =
        "assets/empresas/" +
        environment.NAME_COMPANY +
        environment.MARKERS.CHECKPOINT.URL;
      urlIcon.scaledSize = environment.MARKERS.CHECKPOINT.ICON_SIZE;
      break;
    case TypeMarkers.PRECLOSE:
      urlIcon.url =
        "assets/empresas/" +
        environment.NAME_COMPANY +
        environment.MARKERS.PRECLOSE.URL;
      urlIcon.scaledSize = environment.MARKERS.PRECLOSE.ICON_SIZE;
      break;
    case TypeMarkers.READING:
      urlIcon.url =
        "assets/empresas/" +
        environment.NAME_COMPANY +
        environment.MARKERS.READING.URL;
      urlIcon.scaledSize = environment.MARKERS.READING.ICON_SIZE;
      break;
    case TypeMarkers.CONTACT:
      urlIcon.url =
        "assets/empresas/" +
        environment.NAME_COMPANY +
        environment.MARKERS.CONTACT.URL;
      urlIcon.scaledSize = environment.MARKERS.CONTACT.ICON_SIZE;
      break;
    case TypeMarkers.START_DESTINATION:
      urlIcon.url =
        "assets/empresas/" +
        environment.NAME_COMPANY +
        environment.MARKERS.START_DESTINATION.URL;
      urlIcon.scaledSize = environment.MARKERS.START_DESTINATION.ICON_SIZE;
      break;
    case TypeMarkers.END_DESTINATION:
      urlIcon.url =
        "assets/empresas/" +
        environment.NAME_COMPANY +
        environment.MARKERS.END_DESTINATION.URL;
      urlIcon.scaledSize = environment.MARKERS.END_DESTINATION.ICON_SIZE;
      break;
    case TypeMarkers.RIDE_END:
      urlIcon.url =
        "assets/empresas/" +
        environment.NAME_COMPANY +
        environment.MARKERS.RIDE_END.URL;
      urlIcon.scaledSize = environment.MARKERS.RIDE_END.ICON_SIZE;
      break;
  }

  return urlIcon;
}

export function lstEstados(
  valorComparativo: ValorComparativo,
  dataMaestra: any
): GenericObject[] {
  let lstEstados: GenericObject[] = [];

  switch (valorComparativo) {
    case ValorComparativo.ESTADO_CONDUCTOR:
      dataMaestra.statusTypeDriver?.forEach((estado) => {
        let valor: GenericObject = new GenericObject();
        valor.id = estado.id;
        valor.color = estado.colorHex;
        valor.name = estado.name;

        lstEstados.push(valor);
      });
      break;
    case ValorComparativo.ESTADO_VIAJE:
      dataMaestra.statusTypeService?.forEach((estado) => {
        let valor: GenericObject = new GenericObject();
        valor.id = estado.id;
        valor.color = estado.colorHex;
        valor.name = estado.name;

        lstEstados.push(valor);
      });
      break;
  }

  return lstEstados;
}

export function CloneDetalleMarker(
  detalleMarker: PersonalisationMarker
): PersonalisationMarker {
  let detalle: PersonalisationMarker = new PersonalisationMarker();
  detalle.isDragable = detalleMarker.isDragable ? true : false;
  detalle.posicion = new google.maps.LatLng(
    detalleMarker.posicion?.lat()!,
    detalleMarker.posicion?.lng()!
  );
  detalle.idDestino = detalleMarker.idDestino! + 0;
  switch (detalleMarker.tipoMarker) {
    case TypeMarkers.ORIGEN: {
      detalle.tipoMarker = TypeMarkers.ORIGEN;
      break;
    }
    case TypeMarkers.DESTINO: {
      detalle.tipoMarker = TypeMarkers.DESTINO;
      break;
    }
    case TypeMarkers.CONDUCTOR: {
      detalle.tipoMarker = TypeMarkers.CONDUCTOR;
      break;
    }
    case TypeMarkers.CONDUCTOR_LABEL: {
      detalle.tipoMarker = TypeMarkers.CONDUCTOR_LABEL;
      break;
    }
    case TypeMarkers.PASAJERO: {
      detalle.tipoMarker = TypeMarkers.PASAJERO;
      break;
    }
    default: {
      detalle.tipoMarker = detalleMarker.tipoMarker as TypeMarkers;
      break;
    }
  }

  detalle.showTittle = detalleMarker.showTittle ? true : false;
  if (detalle.showTittle && detalleMarker.tittle) {
    detalle.tittle = detalleMarker.tittle + "";
  }
  detalle.showInfowindow = detalleMarker.showInfowindow ? true : false;

  if (detalle.showInfowindow && detalleMarker.infoWindow) {
    detalle.infoWindow = new google.maps.InfoWindow();
    detalle.infoWindow.setContent(detalleMarker.infoWindow.getContent());
    // console.log(detalleMarker.infoWindow.getContent())
    // detalle.infoWindow.setContent('<b> Paca: </b> SDK-691 <br><b> F/h: </b> 09-02-2021 15:24 <br><b> Tiempo: </b> 0');
    // detalle.infoWindow.setPosition(detalleMarker.infoWindow.getPosition());
    // detalle.infoWindow.setZIndex(detalleMarker.infoWindow.getZIndex());

    detalle.selector = detalleMarker.selector;
    detalle.labelSelector = detalleMarker.labelSelector;
    detalle.idEstado = detalleMarker.idEstado! + 0;
    switch (detalleMarker.estado) {
      case ValorComparativo.ESTADO_CONDUCTOR: {
        detalle.estado = ValorComparativo.ESTADO_CONDUCTOR;
        break;
      }
      case ValorComparativo.ESTADO_VIAJE: {
        detalle.estado = ValorComparativo.ESTADO_VIAJE;
        break;
      }
      default: {
        detalle.estado = detalleMarker.estado! as ValorComparativo;
        break;
      }
    }
  }

  return detalle;
}

export function fnDiferentCoordinateEncoded(
  lstCoordinateEncoded: PersonalisationPolyline[],
  lstPersonalizationPolyline: PersonalisationPolyline[]
): boolean {
  if (lstPersonalizationPolyline.length != lstCoordinateEncoded.length) {
    return true;
  } else {
    for (let i = 0; i < lstCoordinateEncoded.length; i++) {
      if (
        lstPersonalizationPolyline[i].coordinateEncoded !=
        lstCoordinateEncoded[i].coordinateEncoded
      ) {
        return true;
      }

      if (
        lstPersonalizationPolyline[i].color != lstCoordinateEncoded[i].color
      ) {
        return true;
      }
    }
    return false;
  }
}

export function decodingPolyline(decodePath: string): google.maps.LatLng[] {
  if (decodePath) {
    return google.maps.geometry.encoding.decodePath(decodePath);
  }
  return [];
}

export function OptionsPolyline(
  personalizationPolyline: PersonalisationPolyline
): google.maps.PolygonOptions {
  return {
    geodesic: true,
    strokeColor: personalizationPolyline.color
      ? personalizationPolyline.color
      : 'red',
    strokeOpacity: 0.8,
    strokeWeight: 3,
  };
}
var linePartArr = [];
export function animatePolyline(line: google.maps.Polyline) {
  let count = 0;
  window.setInterval(() => {
    count = (count + 1) % 200;
    const icons = line.get("icons");
    icons[0].offset = count / 2 + "%";
    line.set("icons", icons);
  }, 20);
}