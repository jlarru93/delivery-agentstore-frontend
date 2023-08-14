import { Component, OnInit, Input, AfterViewInit, OnChanges, Output, EventEmitter, SimpleChanges, OnDestroy, DoCheck, AbstractType } from '@angular/core';
import * as UtilInformacionMapa from './utilInformacionMapa';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { cloneDeep } from 'lodash';
import { ClassNameControl, PersonalisationMarker, PersonalisationPolyline } from '../data/enumMapa';
import { RequestGeoAutocomplete } from '../data/serviceGeo';
import { changePositionMarker } from '../data/data';
import { isEmpty } from '../data/utilCopyWithoutReference';
import { GenericObject } from '../data/genericObject';


@Component({
  selector: 'nexus-informacion-mapa',
  templateUrl: './informacion-mapa.component.html',
  styleUrls: ['./informacion-mapa.component.scss']
})
export class InformacionMapaComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy, DoCheck {

  @Input() coberturePosition: RequestGeoAutocomplete = {
    longitude:  -74.78132 ,
    latitude: 10.96854,
  };

  @Input() idMap: string = 'map'
  @Input() fitBoundsMap: boolean = true;
  @Input() defaultUI: boolean = false;

  @Input() lstPosiciones: PersonalisationMarker[] = [];
  @Input() lstPosicionesDriver: PersonalisationMarker[] = [];
  @Input() LimpiarCoordenadas: boolean = false;
  @Input() viewTime: boolean = false;
  @Input() viewMetros: boolean = false;
  @Input() time?: Date;
  @Input() metros?: number;
  @Input() service_number?: string;
  @Input() viewService: boolean = false;
  @Input() viewPriceEstimate: boolean = false;
  @Input() priceEstimate?: number;

  @Input() polyline?: google.maps.LatLng[];
  @Input() lstCoordinateEncoded: PersonalisationPolyline[] = [];

  @Output() onChange: EventEmitter<changePositionMarker> = new EventEmitter();//MUEVE MARKERS

  // fullscreem
  @Input() viewFullScreem: boolean = false;
  @Output() fullScreem: EventEmitter<any> = new EventEmitter();

  // heatmap
  @Input() viewHeatmap: boolean = false;
  @Input() heatmapData: google.maps.LatLng[] = [];

  //polygon
  @Input() flagPolygon: boolean = false
  @Input() polygon: any
  @Input() initMap: boolean = false
  @Input() initMapViewAfter: boolean = false
  @Output() setDataPolygon: EventEmitter<any> = new EventEmitter();
  map?: google.maps.Map;

  lstMarkers: google.maps.Marker[] = [];
  lstMarkersDriver: google.maps.Marker[] = [];

  lstPosicionesMarkers: PersonalisationMarker[] = [];
  lstPosicioneDriver: PersonalisationMarker[] = [];
  polylineDirection?: google.maps.Polyline;

  lstPolylinsMapa: google.maps.Polyline[] = [];
  lstPersonalizationPolyline: PersonalisationPolyline[] = [];

  heatmap?: google.maps.visualization.HeatmapLayer;

  //suscription
  coreObservableSuscription: Subscription;

  //settime
  timerService?: NodeJS.Timer;
  timerMetros?: NodeJS.Timer;
  timerPrice?: NodeJS.Timer;
  timerTime?: NodeJS.Timer;
  timerPolyline?: NodeJS.Timer;

  theRanchPolygon: any;
  // bouns
  fitBoungReserve: boolean = false;
  drawingManager: any;
  bermudaTriangle?: google.maps.Polygon;
  pointGeocerca = { lat: 0, long: 0 }
  constructor(
  ) {
  }

  async ngOnInit() {
  }
  if(LimpiarCoordenadas = true) {
    console.log('El valor del boton es: ', LimpiarCoordenadas, 'color:red');
  }

  // Direcciones
  directionsDisplay: google.maps.DirectionsRenderer;
  directionsService: google.maps.DirectionsService;
  geocoder: google.maps.Geocoder;

  async ngAfterViewInit() {
    if (this.initMapViewAfter) {
      this.map = UtilInformacionMapa.fnInitMap(this.idMap, this.coberturePosition.latitude!, this.coberturePosition.longitude!, this.defaultUI);
      this.lstMarkers = this.fnActualizarPosicionMapa(this.lstMarkers, this.lstPosiciones);
      UtilInformacionMapa.setMapAll(this.map, this.lstMarkers);

      // if (environment.CONFIGURATION.MAPA.DIRECTION) {
      //   this.polylineDirection = UtilInformacionMapa.fnCrearPolilyne(this.map);
      // }

      await UtilInformacionMapa.crearControlMap(this.map, this.time!, this.viewTime, this.metros!, this.viewMetros, this.viewFullScreem, this.fullScreem, this.viewPriceEstimate, this.priceEstimate!,this.service_number!, this.viewService);

      if (this.viewHeatmap && this.heatmapData) {
        this.heatmap = UtilInformacionMapa.fnInitHeadMap(this.map);
      }
    }
    // if (this.flagPolygon) this.drawPolygon()
    // this.getPolygon()
  }

  ngOnDestroy() {

    if (this.coreObservableSuscription) {
      this.coreObservableSuscription.unsubscribe();
    }

    if (this.timerMetros) {
      clearTimeout(this.timerMetros);
    }
    if (this.timerPrice) {
      clearTimeout(this.timerPrice);
    }

    if (this.timerTime) {
      clearTimeout(this.timerTime);
    }
  }
  ngDoCheck() {
    // if (UtilInformacionMapa.fnDiferentPositionAndLenght(this.lstMarkers, this.lstPosiciones, this.lstPosicionesMarkers)) {
    //   if (this.map) {
    //     this.lstMarkers = this.fnActualizarPosicionMapa(this.lstMarkers, this.lstPosiciones);
    //   }
    // }

  }
  overlaySetPolygone: any
  eliminarPoligon() {
    if (this.overlaySetPolygone != undefined) {
      this.overlaySetPolygone.setMap(null)
    }

  }
  async ngOnChanges(changes: SimpleChanges) {
    debugger
    if (this.initMap) {
      this.map = UtilInformacionMapa.fnInitMap(this.idMap, this.coberturePosition.latitude!, this.coberturePosition.longitude!, this.defaultUI);
      this.lstMarkers = this.fnActualizarPosicionMapa(this.lstMarkers, this.lstPosiciones);
      if (changes.lstPosicionesDriver) {
        this.lstMarkersDriver = this.fnActualizarPosicionMapaDriver(this.lstMarkersDriver, this.lstPosicionesDriver);
      }
      UtilInformacionMapa.setMapAll(this.map, this.lstMarkers);
      UtilInformacionMapa.setMapAll(this.map, this.lstMarkersDriver);

      // if (environment.CONFIGURATION.MAPA.DIRECTION) {
      //   this.polylineDirection = UtilInformacionMapa.fnCrearPolilyne(this.map);
      //   // UtilInformacionMapa.animatePolyline(this.polylineDirection); 

      // }
      await UtilInformacionMapa.crearControlMap(this.map, this.time!, this.viewTime, this.metros!, this.viewMetros, this.viewFullScreem, this.fullScreem, this.viewPriceEstimate, this.priceEstimate!,this.service_number!, this.viewService);
      if (this.viewHeatmap && this.heatmapData) {
        this.heatmap = UtilInformacionMapa.fnInitHeadMap(this.map);
      }
    } else {
      if (changes.lstPosiciones) {
        this.lstMarkers = this.fnActualizarPosicionMapa(this.lstMarkers, this.lstPosiciones);
      }
      if (changes.lstPosicionesDriver) {
        this.lstMarkersDriver = this.fnActualizarPosicionMapaDriver(this.lstMarkersDriver, this.lstPosicionesDriver);
      }
    }
    // if (environment.CONFIGURATION.MAPA.DIRECTION) {
    //   var LatLngBounds = google.maps.LatLngBounds
    //   this.polylineDirection = UtilInformacionMapa.fnCrearPolilyne(this.map!);
    //   UtilInformacionMapa.animatePolyline(this.lstMarkers, this.map); 

    // }
    this.bermudaTriangle?.setMap(null)
    if (changes.metros) {
      UtilInformacionMapa.editarControlMap(UtilInformacionMapa.converMetrotoFormat(this.metros!), ClassNameControl.DISTANCIA);
      if (this.metros && !document.getElementsByClassName(ClassNameControl.DISTANCIA)[0]) {
        // this.timerMetros = setTimeout(() => {
        //   UtilInformacionMapa.editarControlMap(UtilInformacionMapa.converMetrotoFormat(this.metros!), ClassNameControl.DISTANCIA);
        // }, 2000);
      }
    }
    if (this.service_number) {
      UtilInformacionMapa.editarControlMap((this.service_number!), ClassNameControl.SERVICE);
      if (this.service_number && !document.getElementsByClassName(ClassNameControl.SERVICE)[0]) {
        this.timerService = setTimeout(() => {
          UtilInformacionMapa.editarControlMap( 'Servicio: ' + this.service_number, ClassNameControl.SERVICE);
        }, 2000);
      }
    }
    if (changes.priceEstimate) {
      UtilInformacionMapa.editarControlMap(UtilInformacionMapa.convertFormatPrice(this.priceEstimate!), ClassNameControl.PRICE_ESTIMATE);
      if (this.priceEstimate && !document.getElementsByClassName(ClassNameControl.PRICE_ESTIMATE)[0]) {
        // this.timerPrice = setTimeout(() => {
        //   UtilInformacionMapa.editarControlMap(UtilInformacionMapa.convertFormatPrice(this.priceEstimate!), ClassNameControl.PRICE_ESTIMATE);
        // }, 2000);
      }

    }
    if (changes.time ) {
      UtilInformacionMapa.editarControlMap(UtilInformacionMapa.convertFormatTime(this.time!), ClassNameControl.TIEMPO);
      if (this.time && !document.getElementsByClassName(ClassNameControl.TIEMPO)[0]) {
        // this.timerTime = setTimeout(() => {
        //   UtilInformacionMapa.editarControlMap(UtilInformacionMapa.convertFormatTime(this.time!), ClassNameControl.TIEMPO);
        // }, 2000);
      }
    }
    if (changes.polyline) {
      if (!this.polylineDirection) {
        this.polylineDirection = UtilInformacionMapa.fnCrearPolilyne(this.map!);
        // UtilInformacionMapa.animatePolyline(this.polylineDirection); 
      }

      if (this.polyline && this.polyline.length > 0 && this.map) {
        this.polylineDirection.setMap(this.map);
        this.polylineDirection.setPath(this.polyline);
      } else {
        this.polylineDirection.setPath([]);
        this.polylineDirection.setMap(null);
      }
    }
    if (changes.viewHeatmap && this.map) {
      this.heatmapData = (this.viewHeatmap) ? this.heatmapData : [];

      if (!this.heatmap) {
        this.heatmap = UtilInformacionMapa.fnInitHeadMap(this.map);
      }

      if (this.viewHeatmap) {
        this.heatmap.setData(this.heatmapData);
        this.heatmap.setMap(this.map);
      } else {
        this.heatmap.setData(this.heatmapData);
        this.heatmap.setMap(null);
      }
    }
    if (changes.heatmapData && this.viewHeatmap && this.map) {
      if (!this.heatmap) {
        this.heatmap = UtilInformacionMapa.fnInitHeadMap(this.map);
      }
      this.heatmapData = (this.heatmapData) ? this.heatmapData : [];
      this.heatmap.setData(this.heatmapData);
    }
    if (changes.lstCoordinateEncoded) {
      if (UtilInformacionMapa.fnDiferentCoordinateEncoded(this.lstCoordinateEncoded, this.lstPersonalizationPolyline)) {
        if (this.map) {
          this.fnActualizarPolylineMapa();
        }
      }
    }
    // if (this.fitBoundsMap) {
    //   UtilInformacionMapa.fitBounds(this.map!, this.coberturePosition, lstMarkers, this.lstPolylinsMapa, lstPosiciones)
    // }
  }
  lstPosicionesMemory: PersonalisationMarker[] = []
  fnActualizarPosicionMapa(lstMarkers: google.maps.Marker[], lstPosiciones: PersonalisationMarker[]): google.maps.Marker[] {
    if (lstPosiciones) {
      if (lstPosiciones.length == lstMarkers.length) {
        for (let i = 0; i < lstMarkers.length; i++) {
          if (!isEmpty(lstMarkers[i])) {
            this.actualizarMarker(lstMarkers, lstPosiciones, i)
          }
          // this.markerListener(lstMarkers[i], i, lstPosiciones[i]);
        }

      } else if (lstPosiciones.length < lstMarkers.length) {
        for (let i = 0; i < lstMarkers.length; i++) {
          if (!isEmpty(lstMarkers[i]) && i < lstPosiciones.length) {
            this.actualizarMarker(lstMarkers, lstPosiciones, i)
          } else if (!isEmpty(lstMarkers[i])) {
            if (this.lstPosicionesMarkers[i].showInfowindow && this.lstPosicionesMarkers[i].infoWindow) {
              this.lstPosicionesMarkers[i].infoWindow!.close()
              this.lstPosicionesMarkers[i].infoWindow!.setContent('')
            }
            lstMarkers[i].setMap(null);
          }
          // let posicion =  lstPosiciones[i]
          // this.markerListener(lstMarkers[i], i,posicion);

        }

        this.lstPosicionesMarkers.splice(lstPosiciones.length, (lstMarkers.length - lstPosiciones.length));
        lstMarkers.splice(lstPosiciones.length, (lstMarkers.length - lstPosiciones.length));
      } else if (lstPosiciones.length > lstMarkers.length) {
        for (let i = 0; i < lstMarkers.length; i++) {
          if (!isEmpty(lstMarkers[i])) {
            this.actualizarMarker(lstMarkers, lstPosiciones, i)
            let posicion = lstPosiciones[i]
            // this.markerListener(lstMarkers[i], i, );
          }
        }
        for (let i = lstMarkers.length; i < lstPosiciones.length; i++) {
          let estados: any[] = UtilInformacionMapa.lstEstados(lstPosiciones[i].estado!, '')
          let marker = UtilInformacionMapa.fnCrearMarker(i, lstPosiciones[i], this.map!, estados);
          // marker.setTitle(fnCrearMarker)
          // this.lstPosicionesMarkers.push((lstPosiciones[i]));
          this.lstPosicionesMarkers.push(UtilInformacionMapa.CloneDetalleMarker(lstPosiciones[i]));
          let infoWindow = new google.maps.InfoWindow()
          infoWindow.setContent(infoWindow.getContent())
          // this.lstPosicionesMarkers.push(cloneDeep(lstPosiciones[i]));
          this.lstPosicionesMarkers[i].infoWindow = infoWindow;
          // lstPosiciones[i].isDragableMemory = true 
          this.lstPosicionesMemory.push(lstPosiciones[i])
          lstMarkers.push(marker);
          this.markerListener(lstMarkers[i], lstPosiciones[i].idDestino, i, lstPosiciones[i]);
        }

      }
      // for (let i = 0; i < lstMarkers.length; i++) {
      //   if (!isEmpty(lstMarkers[i])) {
      //     this.markerListener(lstMarkers[i], i,lstPosiciones[i]);
      //   }
      // }
    }
    // if (lstPosiciones > this.lstPosicionesMemory ) {
    //     let array : PersonalisationMarker[]= this.lstPosiciones.filter(element=> !element.isDragableMemory)
    //     for (let i = 0; i< array.length; i++) {
    //       const element = array[i];
    //       this.markerListener(lstMarkers[i], i, lstPosiciones[i]);
    //     }
    //   this.lstPosicionesMemory = lstPosiciones
    // }
    if (lstPosiciones.length > 0) {
      if (this.fitBoundsMap && !lstPosiciones[0].view_screen_map) {
        UtilInformacionMapa.fitBounds(this.map!, this.coberturePosition, lstMarkers, this.lstPolylinsMapa, lstPosiciones)
      }
   
    }

    return lstMarkers;
  }
  fnActualizarPosicionMapaDriver(lstMarkers: google.maps.Marker[], lstPosiciones: PersonalisationMarker[]): google.maps.Marker[] {
    if (lstPosiciones) {
      if (lstPosiciones.length == lstMarkers.length) {
        for (let i = 0; i < lstMarkers.length; i++) {
          if (!isEmpty(lstMarkers[i])) {
            this.actualizarMarkerDriver(lstMarkers, lstPosiciones, i)
          }
          // this.markerListener(lstMarkers[i], i, lstPosiciones[i]);
        }

      } else if (lstPosiciones.length < lstMarkers.length) {
        for (let i = 0; i < lstMarkers.length; i++) {
          if (!isEmpty(lstMarkers[i]) && i < lstPosiciones.length) {
            this.actualizarMarkerDriver(lstMarkers, lstPosiciones, i)
          } else if (!isEmpty(lstMarkers[i])) {
            if (this.lstPosicioneDriver[i].showInfowindow && this.lstPosicioneDriver[i].infoWindow) {
              this.lstPosicioneDriver[i].infoWindow!.close()
              this.lstPosicioneDriver[i].infoWindow!.setContent('')
            }
            lstMarkers[i].setMap(null);
          }
          // let posicion =  lstPosiciones[i]
          // this.markerListener(lstMarkers[i], i,posicion);

        }

        this.lstPosicioneDriver.splice(lstPosiciones.length, (lstMarkers.length - lstPosiciones.length));
        lstMarkers.splice(lstPosiciones.length, (lstMarkers.length - lstPosiciones.length));
      } else if (lstPosiciones.length > lstMarkers.length) {
        for (let i = 0; i < lstMarkers.length; i++) {
          if (!isEmpty(lstMarkers[i])) {
            this.actualizarMarkerDriver(lstMarkers, lstPosiciones, i)
            let posicion = lstPosiciones[i]
            // this.markerListener(lstMarkers[i], i, );
          }
        }
        for (let i = lstMarkers.length; i < lstPosiciones.length; i++) {
          let estados: GenericObject[] = UtilInformacionMapa.lstEstados(lstPosiciones[i].estado!, '')
          let marker = UtilInformacionMapa.fnCrearMarker(i, lstPosiciones[i], this.map!, estados);
          // marker.setTitle(fnCrearMarker)
          // this.lstPosicionesMarkers.push((lstPosiciones[i]));
          this.lstPosicioneDriver.push(UtilInformacionMapa.CloneDetalleMarker(lstPosiciones[i]));
          let infoWindow = new google.maps.InfoWindow()
          infoWindow.setContent(infoWindow.getContent())
          // this.lstPosicionesMarkers.push(cloneDeep(lstPosiciones[i]));
          this.lstPosicioneDriver[i].infoWindow = infoWindow;
          // lstPosiciones[i].isDragableMemory = true 
          this.lstPosicionesMemory.push(lstPosiciones[i])
          lstMarkers.push(marker);
          // this.markerListener(lstMarkers[i], lstPosiciones[i].idDestino, i, lstPosiciones[i]);
        }
      }
    }
    if (lstPosiciones.length > 0 ) {
      if (this.fitBoundsMap && lstPosiciones[0].view_screen_map) {
        UtilInformacionMapa.fitBounds(this.map!, this.coberturePosition, lstMarkers, this.lstPolylinsMapa, lstPosiciones)
      }
    }
    return lstMarkers;
  }
  fnActualizarPolylineMapa() {
    let polyline: google.maps.Polyline
    if (this.lstCoordinateEncoded) {
      if (this.lstCoordinateEncoded.length == this.lstPersonalizationPolyline.length) {
        for (let i = 0; i < this.lstPersonalizationPolyline.length; i++) {
          if (!isEmpty(this.lstPersonalizationPolyline[i])) {
            this.actualizarLstPolyline(i)
          }
        }
      } else if (this.lstCoordinateEncoded.length < this.lstPersonalizationPolyline.length) {
        for (let i = 0; i < this.lstPersonalizationPolyline.length; i++) {
          if (!isEmpty(this.lstPersonalizationPolyline[i]) && i < this.lstCoordinateEncoded.length) {
            this.actualizarLstPolyline(i)
          } else if (!isEmpty(this.lstPolylinsMapa[i])) {
            this.lstPolylinsMapa[i].setMap(null);
          }
        }

        this.lstPolylinsMapa.splice(this.lstCoordinateEncoded.length, (this.lstPersonalizationPolyline.length - this.lstCoordinateEncoded.length));
        this.lstPersonalizationPolyline.splice(this.lstCoordinateEncoded.length, (this.lstPersonalizationPolyline.length - this.lstCoordinateEncoded.length));
      } else if (this.lstCoordinateEncoded.length > this.lstPersonalizationPolyline.length) {
        for (let i = 0; i < this.lstPersonalizationPolyline.length; i++) {
          if (!isEmpty(this.lstPolylinsMapa[i])) {
            this.actualizarLstPolyline(i)
          }
        }
        for (let i = this.lstPersonalizationPolyline.length; i < this.lstCoordinateEncoded.length; i++) {
          polyline = UtilInformacionMapa.fnCrearPolilyne(this.map!, this.lstCoordinateEncoded[i])
          this.lstPersonalizationPolyline.push(cloneDeep(this.lstCoordinateEncoded[i]));

          this.lstPolylinsMapa.push(polyline);
          if (!this.map) {
            this.lstPolylinsMapa[i].setMap(this.map!);
          } else {
            this.lstPolylinsMapa[i].setMap(this.map);
          }
          this.lstPolylinsMapa[i].setPath(UtilInformacionMapa.decodingPolyline(this.lstCoordinateEncoded[i].coordinateEncoded!))
        }
      }
    }
    // debugger
    // UtilInformacionMapa.animatePolyline(polyline); 
    if (this.fitBoundsMap) {
      UtilInformacionMapa.fitBounds(this.map!, this.coberturePosition, this.lstMarkers, this.lstPolylinsMapa,this.lstPosiciones)
    }
  }

  actualizarMarker(lstMarkers: google.maps.Marker[], lstPosiciones: PersonalisationMarker[], i: number) {
    if (lstMarkers[i].getPosition() && lstPosiciones[i].posicion &&
      lstMarkers[i].getPosition()!.lat() != lstPosiciones[i].posicion!.lat() ||
      lstMarkers[i].getPosition()!.lng() != lstPosiciones[i].posicion!.lng()) {
      lstMarkers[i].setPosition(lstPosiciones[i].posicion ? lstPosiciones[i].posicion! : new google.maps.LatLng(0, 0));
    }
    if (lstMarkers[i].getDraggable() != lstPosiciones[i].isDragable) {
      var isDragable = lstPosiciones[i].isDragable ? lstPosiciones[i].isDragable! : false
      lstMarkers[i].setDraggable(isDragable)
    };

    if (lstPosiciones[i].showTittle &&
      lstMarkers[i].getTitle() != lstPosiciones[i].tittle) {
      lstMarkers[i].setTitle((lstPosiciones[i].tittle) ? lstPosiciones[i].tittle! : null);
    }
    // debugger
    // if (this.lstPosicionesMarkers[i].tipoMarker != lstPosiciones[i].tipoMarker) {
    lstMarkers[i].setIcon(UtilInformacionMapa.getUrlIcon(lstPosiciones[i]));
    // };

    if (lstPosiciones[i].showInfowindow &&
      lstPosiciones[i].infoWindow &&
      this.lstPosicionesMarkers[i].infoWindow &&
      this.lstPosicionesMarkers[i].infoWindow!.getContent() != lstPosiciones[i].infoWindow!.getContent()) {
      let infoWindow = new google.maps.InfoWindow()
      infoWindow.setContent(infoWindow.getContent())
      this.lstPosicionesMarkers[i].infoWindow = infoWindow;
    };

    if (this.lstPosicionesMarkers[i].idDestino != lstPosiciones[i].idDestino) {
      this.lstPosicionesMarkers[i].idDestino = (lstPosiciones[i].idDestino) ? lstPosiciones[i].idDestino! : undefined!;
    };
    if (this.lstPosicionesMarkers[i].selector != lstPosiciones[i].selector ||
      this.lstPosicionesMarkers[i].estado != lstPosiciones[i].estado ||
      this.lstPosicionesMarkers[i].idEstado != lstPosiciones[i].idEstado) {
      if (lstPosiciones[i].selector && lstPosiciones[i].idEstado) {
        this.lstPosicionesMarkers[i].selector = (lstPosiciones[i].selector) ? lstPosiciones[i].selector : undefined;
        this.lstPosicionesMarkers[i].estado = (lstPosiciones[i].estado) ? lstPosiciones[i].estado : undefined;
        this.lstPosicionesMarkers[i].idEstado = (lstPosiciones[i].idEstado) ? lstPosiciones[i].idEstado : undefined;
        lstMarkers[i].set("labelClass", lstPosiciones[i].selector)
      }
    };

    if (this.lstPosicionesMarkers[i].labelSelector != lstPosiciones[i].labelSelector &&
      lstMarkers[i].get("labelContent") != lstPosiciones[i].labelSelector) {
      lstMarkers[i].set("labelContent", (lstPosiciones[i].labelSelector) ? lstPosiciones[i].labelSelector : null);
    };

    this.lstPosicionesMarkers[i] = UtilInformacionMapa.CloneDetalleMarker(lstPosiciones[i]);
    // this.lstPosicionesMarkers[i] = cloneDeep(lstPosiciones[i]);
  }
  actualizarMarkerDriver(lstMarkers: google.maps.Marker[], lstPosiciones: PersonalisationMarker[], i: number) {
    if (lstMarkers[i].getPosition() && lstPosiciones[i].posicion &&
      lstMarkers[i].getPosition()!.lat() != lstPosiciones[i].posicion!.lat() ||
      lstMarkers[i].getPosition()!.lng() != lstPosiciones[i].posicion!.lng()) {
      lstMarkers[i].setPosition(lstPosiciones[i].posicion ? lstPosiciones[i].posicion! : new google.maps.LatLng(0, 0));
    }
    if (lstMarkers[i].getDraggable() != lstPosiciones[i].isDragable) {
      var isDragable = lstPosiciones[i].isDragable ? lstPosiciones[i].isDragable! : false
      lstMarkers[i].setDraggable(isDragable)
    };

    if (lstPosiciones[i].showTittle &&
      lstMarkers[i].getTitle() != lstPosiciones[i].tittle) {
      lstMarkers[i].setTitle((lstPosiciones[i].tittle) ? lstPosiciones[i].tittle! : null);
    }
    // debugger
    // if (this.lstPosicionesMarkers[i].tipoMarker != lstPosiciones[i].tipoMarker) {
    lstMarkers[i].setIcon(UtilInformacionMapa.getUrlIcon(lstPosiciones[i]));
    // };

    if (lstPosiciones[i].showInfowindow &&
      lstPosiciones[i].infoWindow &&
      this.lstPosicioneDriver[i].infoWindow &&
      this.lstPosicioneDriver[i].infoWindow!.getContent() != lstPosiciones[i].infoWindow!.getContent()) {
      let infoWindow = new google.maps.InfoWindow()
      infoWindow.setContent(infoWindow.getContent())
      this.lstPosicioneDriver[i].infoWindow = infoWindow;
    };

    if (this.lstPosicioneDriver[i].idDestino != lstPosiciones[i].idDestino) {
      this.lstPosicioneDriver[i].idDestino = (lstPosiciones[i].idDestino) ? lstPosiciones[i].idDestino! : undefined!;
    };
    if (this.lstPosicioneDriver[i].selector != lstPosiciones[i].selector ||
      this.lstPosicioneDriver[i].estado != lstPosiciones[i].estado ||
      this.lstPosicioneDriver[i].idEstado != lstPosiciones[i].idEstado) {
      if (lstPosiciones[i].selector && lstPosiciones[i].idEstado) {
        this.lstPosicioneDriver[i].selector = (lstPosiciones[i].selector) ? lstPosiciones[i].selector : undefined;
        this.lstPosicioneDriver[i].estado = (lstPosiciones[i].estado) ? lstPosiciones[i].estado : undefined;
        this.lstPosicioneDriver[i].idEstado = (lstPosiciones[i].idEstado) ? lstPosiciones[i].idEstado : undefined;
        lstMarkers[i].set("labelClass", lstPosiciones[i].selector)
      }
    };

    if (this.lstPosicioneDriver[i].labelSelector != lstPosiciones[i].labelSelector &&
      lstMarkers[i].get("labelContent") != lstPosiciones[i].labelSelector) {
      lstMarkers[i].set("labelContent", (lstPosiciones[i].labelSelector) ? lstPosiciones[i].labelSelector : null);
    };

    this.lstPosicioneDriver[i] = UtilInformacionMapa.CloneDetalleMarker(lstPosiciones[i]);
    // this.lstPosicionesMarkers[i] = cloneDeep(lstPosiciones[i]);
  }
  actualizarLstPolyline(i: number) {
    if (this.lstPolylinsMapa[i].getMap()) {
      this.lstPolylinsMapa[i].setMap(this.map!);
    }

    if (this.lstPersonalizationPolyline[i].coordinateEncoded != this.lstCoordinateEncoded[i].coordinateEncoded) {
      this.lstPolylinsMapa[i].setPath(UtilInformacionMapa.decodingPolyline(this.lstCoordinateEncoded[i].coordinateEncoded!))
    };

    if (this.lstPersonalizationPolyline[i].color != this.lstCoordinateEncoded[i].color) {
      this.lstPolylinsMapa[i].setOptions(UtilInformacionMapa.OptionsPolyline(this.lstCoordinateEncoded[i]))
    };

    this.lstPersonalizationPolyline[i] = cloneDeep(this.lstCoordinateEncoded[i]);
  }

  markerListener(marker: google.maps.Marker, iddestino: number, index: number, detalleMarker: PersonalisationMarker) {
    detalleMarker.isDragable = (detalleMarker.isDragable) ? (detalleMarker.isDragable) : false
    if (detalleMarker.showInfowindow && this.lstPosicionesMarkers[index].infoWindow) {
      google.maps.event.addListener(marker, 'click', () => {
        this.lstPosicionesMarkers[index].infoWindow!.open(this.map, this.lstMarkers[index])
      });
    }
    if (detalleMarker.isDragable) {
      this.fitBoungReserve = cloneDeep(this.fitBoundsMap)
      // google.maps.event.addListener(marker, 'dragstart', () => {
      //   this.fitBoungReserve = cloneDeep(this.fitBoundsMap)
      //   this.fitBoundsMap = false;
      // });
      // google.maps.event.addListener(marker, 'drag', () => {
      //   this.fitBoungReserve = cloneDeep(this.fitBoundsMap)
      //   this.fitBoundsMap = false;
      // });
      google.maps.event.addListener(marker, 'dragend', () => {
        let booleanFitBouns = cloneDeep(this.fitBoungReserve);
        this.fitBoundsMap = cloneDeep(booleanFitBouns);
        this.calcularCoordenadasMarkers(index, iddestino);
      });
    }
  }

  calcularCoordenadasMarkers(index: number, iddestino: number) {
    let jsonResponse: changePositionMarker = {
      index: iddestino == undefined ? 0 : iddestino,
      marker: this.lstMarkers[index],
      lstMarker: this.lstMarkers
    }
    this.onChange.emit(jsonResponse);
  }

  ////#region encode polyline

  //#fin encode polyline
}