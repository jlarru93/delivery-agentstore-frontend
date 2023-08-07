import { PersonalisationMarker, TypeMarkers } from "src/app/directives/informacion/data/enumMapa";

export function fnDetalleViaje(latLng: google.maps.LatLng, showTittle: boolean, tittle: string,
    tipoMarker: TypeMarkers, isDragable: boolean, index?: number,
    typeServicesId?: any): PersonalisationMarker {
    let detalle: PersonalisationMarker = new PersonalisationMarker();

    detalle.posicion = latLng;
    detalle.showTittle = showTittle;
    // detalle.tittle = tittle;
    detalle.idDestino = (index) ? index : undefined!;
    detalle.tipoMarker = tipoMarker;
    detalle.isDragable = isDragable;
    detalle.showInfowindow = true;
    detalle.tittle = tittle;
    detalle.infoWindow = new google.maps.InfoWindow({
        content: '<b> ' + tittle + ' </b> '
    });
    // detalle.typeServicesId = typeServicesId

    return detalle
}