import * as L from 'leaflet';
import { PersonalisationMarker, TypeMarkers } from "src/app/directives/informacion/data/enumMapa";

export function fnDetalleViaje(
    latLng: L.LatLng, 
    showTittle: boolean, 
    tittle: string,
    tipoMarker: TypeMarkers, 
    isDragable: boolean, 
    index?: number,
    typeServicesId?: any, 
    view_screen_map?: boolean
): PersonalisationMarker {
    let detalle: PersonalisationMarker = new PersonalisationMarker();

    detalle.posicion = latLng;
    detalle.showTittle = showTittle;
    detalle.idDestino = (index) ? index : undefined!;
    detalle.tipoMarker = tipoMarker;
    detalle.isDragable = isDragable;
    detalle.showInfowindow = true;
    detalle.tittle = tittle;
    // InfoWindow ahora será manejado por Leaflet popup
    detalle.infoWindow = null;
    detalle.view_screen_map = view_screen_map ? view_screen_map : false;

    return detalle;
}