import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { OrderBean, PaymentBean, ProductBean } from "../data";
import { HttpClient } from "@angular/common/http";
import { OrderRepository } from "../service/order.repository";
import { AceptOrderRequest } from "../service/data/request";
import * as CONSTANTES from "src/app/utils/constant";
import { PrintService } from 'src/app/utils/print.service';
import { RequestTripService } from "../../request-trip/services/request-trip.service";
import { ResponseTrackingMotorized } from "../../order-course/data/response";


@Component({
    selector: 'order-modal',
    templateUrl: './order.modal.component.html',
    styleUrls: ['./order.modal.component.scss','./order.modal.rechazo.component.scss'],
    providers: [ConfirmationService, MessageService, DialogService],
})
export class OrderModalComponent implements OnInit, OnDestroy {

    @Input()
    orderSelected: OrderBean

    @Input() visible: boolean = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() editOrder = new EventEmitter<OrderBean>();

    readyToDmAt: number
    readyToDmMinutesAt: number

    payment: PaymentBean
    paymentName: string
    styleString:string


    displayOrderReject: boolean = false;
    showConfirmReject: boolean = false;
    loadingButtonCancel: boolean = false;
    otherReasonOrder: string = '';
    reasonToReject: string = ''; 
    selectedTab: boolean = true;

    // Propiedades del mapa
    mapCenter = { lat: -8.3791, lng: -74.5539 }; // Pucallpa por defecto
    mapZoom = 14;
    mapMarkers: any[] = [];
    showMapView: boolean = false;
    
    // Tracking del motorizado
    motorizedTracking: ResponseTrackingMotorized | null = null;
    trackingInterval: any = null;

    // Propiedades de aceptación programada
    scheduledAcceptMode: 'confirm' | 'modify' = 'confirm';
    scheduledDates: {label: string, value: string}[] = [];
    scheduledHours: string[] = [];
    scheduledMinutes: string[] = ['00', '15', '30', '45'];
    scheduledSelectedDate: string = '';
    scheduledSelectedHour: string = '12';
    scheduledSelectedMinute: string = '00';
    scheduledPreviewText: string = '';

    constructor(
        private messageService: MessageService,
        private http: HttpClient,
        private confirmationService: ConfirmationService,
        private orderRepository: OrderRepository,
        private printService: PrintService,
        private requestTripService: RequestTripService
    ) { }
    ngOnInit(): void {
        this.storeDataStorage = JSON.parse(localStorage.getItem('storeBean'))
    }
    
    ngOnDestroy(): void {
        this.stopTrackingPolling();
        if (this.leafletMap) {
            this.leafletMap.remove();
            this.leafletMap = null;
        }
    }

    init() {
        this.readyToDmAt = null
        this.readyToDmMinutesAt = null

        this.payment = null
        this.paymentName = null
        this.styleString = null


        this.displayOrderReject = false;
        this.showConfirmReject = false;
        this.loadingButtonCancel = false;
        this.otherReasonOrder = '';
        this.reasonToReject = ''; 
        this.selectedTab = true;
        this.flagOpenReceiptDialog=false

        this.dialogScreenshoot = false;
        this.loadingButtonUpdateTime = false;
        this.storeDataStorage = null
        this.imagenURL = null

        this.loadingButtonAcept = false;
        this.loadingButtonOrderReady = false;
        this.loadingButtonFinish = false;
        this.loadingButtonSelfManage = false;
        this.showConfirmOrderReady = false;
        
        // Limpiar datos del mapa y tracking
        this.motorizedTracking = null;
        this.showMapView = false;
        this.stopTrackingPolling();
        if (this.leafletMap) {
            this.leafletMap.remove();
            this.leafletMap = null;
            this.motorizedMarker = null;
        }
        
        this.storeDataStorage = JSON.parse(localStorage.getItem('storeBean'))
        
        if(this.orderSelected.status=="open"){
            this.readyToDmAt=15
        }

        // Inicializar datos de aceptación programada (solo si tiene reservationAt)
        if (this.orderSelected.isOrderCalendar && this.orderSelected.reservationAt) {
            this.initScheduledAcceptance();
        }
        if (this.orderSelected.readyToDmAt) {
            this.readyToDmAt = this.orderSelected.readyToDmAt;
        }

        if (this.orderSelected.readyToDmMinutesAt) {
            this.readyToDmMinutesAt = this.orderSelected.readyToDmMinutesAt;
        } else {
            this.readyToDmMinutesAt = 10;
        }

        //this.displayOrder = true;
        this.payment = this.orderSelected.payment;
        this.imagenURL = this.payment?.method?.url;
        this.paymentName = this.onGetMethodType(this.payment?.method?.type);

        // Llamar DESPUÉS de abrir el modal
        setTimeout(() => {
            this.accordionFunction();
        }, 500);

        this.http.get('../../../../assets/styles/print-template.component.scss', {responseType: 'text'}).subscribe(
        styleSheet => {
          this.styleString = styleSheet
        }
      )

    }

    onVisibleChange(v: boolean) { 
        this.visible = v; this.visibleChange.emit(v);
        // Detener polling cuando se cierra
        if (!v) {
            this.onHide();
        }
    }
    onShow(_event:any){
        this.init()
        this.initializeMap()
        this.startTrackingPolling()
    }
    
    // Limpiar al cerrar modal
    onHide(): void {
        this.stopTrackingPolling();
        if (this.leafletMap) {
            this.leafletMap.remove();
            this.leafletMap = null;
            this.motorizedMarker = null;
        }
    }
    
    // Iniciar polling de tracking (cada 10 segundos)
    private startTrackingPolling(): void {
        // Limpiar intervalo previo si existe
        this.stopTrackingPolling();
        
        // Solo iniciar si hay motorizado asignado
        if (this.orderSelected?.deliveryMan?.id && this.orderSelected?.uuid) {
            this.trackingInterval = setInterval(() => {
                this.loadMotorizedTracking();
            }, 10000); // 10 segundos
        }
    }
    
    // Detener polling
    private stopTrackingPolling(): void {
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
            this.trackingInterval = null;
        }
    }
    
    // ========== INICIALIZAR MAPA CON LEAFLET ==========
    private leafletMap: any = null;
    private leafletLoaded = false;
    private motorizedMarker: any = null;
    private currentMapContainerId: string = '';

    async initializeMap() {
        // Mostrar mapa por defecto si es orden de comercio (SendAndReciveStore)
        this.showMapView = this.orderSelected?.isCommerce() || false;
        
        // Cargar Leaflet dinámicamente
        await this.loadLeaflet();
        
        // Cargar tracking si hay motorizado asignado
        if (this.orderSelected?.deliveryMan?.id) {
            this.loadMotorizedTracking();
        }
        
        if (!this.showMapView) return;
        
        // Pequeño delay para que el DOM se renderice
        setTimeout(() => {
            this.renderLeafletMap('order-map-desktop');
        }, 100);
    }

    private async loadLeaflet(): Promise<void> {
        if (this.leafletLoaded || (window as any).L) {
            this.leafletLoaded = true;
            return;
        }

        return new Promise((resolve) => {
            // Cargar CSS de Leaflet
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);

            // Cargar JS de Leaflet
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => {
                this.leafletLoaded = true;
                resolve();
            };
            document.body.appendChild(script);
        });
    }

    // Cargar tracking del motorizado
    private loadMotorizedTracking(): void {
        if (!this.orderSelected?.uuid) return;
        
        this.requestTripService.onViewTrackingMotorizedService(this.orderSelected.uuid)
            .subscribe({
                next: (response) => {
                    if (response?.data) {
                        this.motorizedTracking = response.data;
                        // Actualizar marcador en el mapa si ya está renderizado
                        if (this.leafletMap) {
                            this.updateMotorizedMarker();
                        }
                    }
                },
                error: (err) => {
                    console.log('No se pudo cargar tracking del motorizado:', err);
                }
            });
    }

    // Actualizar marcador del motorizado
    private updateMotorizedMarker(): void {
        const L = (window as any).L;
        if (!L || !this.leafletMap || !this.motorizedTracking?.position) return;

        const pos = this.motorizedTracking.position;
        
        // Crear icono de motorizado con forma de pin (punta abajo)
        const motorizedIcon = L.divIcon({
            className: 'custom-leaflet-marker',
            html: `<div style="
                position: relative;
                width: 40px;
                height: 48px;
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    background: #3B82F6;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                    border: 3px solid white;
                ">
                    <span style="
                        transform: rotate(45deg);
                        font-size: 18px;
                    ">🛵</span>
                </div>
            </div>`,
            iconSize: [40, 48],
            iconAnchor: [20, 48],
            popupAnchor: [0, -48]
        });

        // Si ya existe el marcador, actualizar posición
        if (this.motorizedMarker) {
            this.motorizedMarker.setLatLng([pos.lat, pos.lng]);
        } else {
            // Crear nuevo marcador
            this.motorizedMarker = L.marker([pos.lat, pos.lng], { icon: motorizedIcon })
                .addTo(this.leafletMap)
                .bindPopup(`<b>🛵 ${this.motorizedTracking.deliveryMan?.name || 'Motorizado'}</b><br>
                           📱 ${this.motorizedTracking.deliveryMan?.phone || ''}`);
        }
    }

    // Decodificar polyline de Google (encoded polyline)
    private decodePolyline(encoded: string): {lat: number, lng: number}[] {
        if (!encoded) return [];
        
        const points: {lat: number, lng: number}[] = [];
        let index = 0, lat = 0, lng = 0;

        while (index < encoded.length) {
            let b, shift = 0, result = 0;
            
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            
            const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lat += dlat;

            shift = 0;
            result = 0;
            
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            
            const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lng += dlng;

            points.push({
                lat: lat / 1e5,
                lng: lng / 1e5
            });
        }
        
        return points;
    }

    private renderLeafletMap(containerId: string): void {
        const L = (window as any).L;
        if (!L) return;

        const container = document.getElementById(containerId);
        if (!container) return;

        // Limpiar mapa previo si existe
        if (this.leafletMap) {
            this.leafletMap.remove();
            this.leafletMap = null;
            this.motorizedMarker = null;
        }

        // Limpiar contenedor
        container.innerHTML = '';
        this.currentMapContainerId = containerId;

        // Obtener coordenadas
        let centerLat = -8.3791; // Pucallpa por defecto
        let centerLng = -74.5539;
        
        const markers: any[] = [];
        
        if (this.orderSelected?.addresses && this.orderSelected.addresses.length >= 2) {
            const origen = this.orderSelected.addresses[0];
            const destino = this.orderSelected.addresses[1];
            
            if (origen?.location?.coordinates) {
                markers.push({
                    lat: origen.location.coordinates[1],
                    lng: origen.location.coordinates[0],
                    label: origen.label || 'Recojo',
                    address: origen.addressStreet,
                    type: 'origin'
                });
            }
            
            if (destino?.location?.coordinates) {
                markers.push({
                    lat: destino.location.coordinates[1],
                    lng: destino.location.coordinates[0],
                    label: destino.label || 'Entrega Final',
                    address: destino.addressStreet,
                    type: 'destination'
                });
            }

            // Centrar entre origen y destino
            if (markers.length >= 2) {
                centerLat = (markers[0].lat + markers[1].lat) / 2;
                centerLng = (markers[0].lng + markers[1].lng) / 2;
            } else if (markers.length === 1) {
                centerLat = markers[0].lat;
                centerLng = markers[0].lng;
            }
        }

        // Crear mapa
        this.leafletMap = L.map(container, {
            center: [centerLat, centerLng],
            zoom: 14,
            zoomControl: true,
            scrollWheelZoom: true
        });

        // Agregar tiles de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19
        }).addTo(this.leafletMap);

        // Agregar marcadores con iconos personalizados
        const bounds: any[] = [];
        
        markers.forEach((marker, index) => {
            const isOrigin = marker.type === 'origin';
            const color = isOrigin ? '#47AC34' : '#E53935';
            const letter = isOrigin ? 'A' : 'B';
            
            const customIcon = L.divIcon({
                className: 'custom-leaflet-marker',
                html: `<div style="
                    width: 32px;
                    height: 32px;
                    background: ${color};
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 14px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    border: 2px solid white;
                ">${letter}</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            const leafletMarker = L.marker([marker.lat, marker.lng], { icon: customIcon })
                .addTo(this.leafletMap)
                .bindPopup(`<b>${marker.label}</b><br>${marker.address || ''}`);
            
            bounds.push([marker.lat, marker.lng]);
        });

        // Dibujar polyline (ruta) si existe - COLOR ROJO
        const overviewPolyline = this.orderSelected?.deliveryPriceMongo?.overviewPolyline;
        if (overviewPolyline) {
            const routePoints = this.decodePolyline(overviewPolyline);
            if (routePoints.length > 0) {
                const latLngs = routePoints.map(p => [p.lat, p.lng]);
                L.polyline(latLngs, {
                    color: '#E53935',
                    weight: 4,
                    opacity: 0.8
                }).addTo(this.leafletMap);
                
                // Agregar puntos de ruta a bounds
                routePoints.forEach(p => bounds.push([p.lat, p.lng]));
            }
        }

        // Agregar marcador del motorizado si existe
        if (this.motorizedTracking?.position) {
            this.updateMotorizedMarker();
            bounds.push([this.motorizedTracking.position.lat, this.motorizedTracking.position.lng]);
        }

        // Ajustar vista para mostrar todos los marcadores
        if (bounds.length >= 2) {
            this.leafletMap.fitBounds(bounds, { padding: [50, 50] });
        }

        // Invalidar tamaño después de renderizar
        setTimeout(() => {
            this.leafletMap?.invalidateSize();
        }, 200);
    }

    // Renderizar mapa en mobile (llamado desde tab change)
    renderMobileMap(): void {
        setTimeout(async () => {
            await this.loadLeaflet();
            this.renderLeafletMap('order-map-mobile');
        }, 150);
    }

    // Detectar cambio de tab en mobile
    onMobileTabChange(event: any): void {
        // Tab 2 es "Mapa" (índice 0=Productos, 1=Info, 2=Mapa, 3=Resumen)
        if (event.index === 2) {
            this.renderMobileMap();
        }
    }

    // Alternar vista mapa/productos
    toggleMapView() {
        this.showMapView = !this.showMapView;
        if (this.showMapView) {
            setTimeout(() => {
                this.renderLeafletMap('order-map-desktop');
            }, 100);
        }
    }

    // Refrescar ubicación del motorizado
    refreshMotorizedLocation(): void {
        this.loadMotorizedTracking();
    }
    
    // Formatear teléfono peruano (+51 XXX XXX XXX)
    formatPhonePeru(phone: string): string {
        if (!phone) return '';
        
        // Limpiar el número (solo dígitos y +)
        let cleaned = phone.replace(/[^\d+]/g, '');
        
        // Si empieza con +51
        if (cleaned.startsWith('+51')) {
            const number = cleaned.substring(3); // Quitar +51
            if (number.length === 9) {
                return `+51 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6, 9)}`;
            }
        }
        
        // Si empieza con 51 (sin +)
        if (cleaned.startsWith('51') && cleaned.length === 11) {
            const number = cleaned.substring(2);
            return `+51 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6, 9)}`;
        }
        
        // Si es solo 9 dígitos (número peruano sin código)
        if (cleaned.length === 9 && !cleaned.startsWith('+')) {
            return `+51 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)}`;
        }
        
        // Retornar original si no coincide con formato peruano
        return phone;
    }
    
    // Abrir WhatsApp del motorizado
    openMotorizedWhatsApp(): void {
        if (!this.motorizedTracking?.deliveryMan?.phone) return;
        
        let phone = this.motorizedTracking.deliveryMan.phone.replace(/[^\d]/g, '');
        
        // Asegurar que tenga código de país
        if (phone.length === 9) {
            phone = '51' + phone;
        }
        
        const message = `Hola ${this.motorizedTracking.deliveryMan.name || ''}, sobre la orden #${this.orderSelected?.id || ''}`;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    closeOptionBusinessIdDialog() { }

    dialogScreenshoot: boolean = false;
    loadingButtonUpdateTime: boolean = false;
    storeDataStorage: any; // Si usas app-print-template
    imagenURL: string

    // ========== MÉTODO 1: Abrir dialog de screenshot ==========
    openDialogScreenShoot() {
        if (this.imagenURL) {
            this.dialogScreenshoot = true;
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No hay comprobante de pago disponible'
            });
        }
        this.flagOpenReceiptDialog=true
    }

    // ========== MÉTODO 2: Incrementar tiempo ==========
    onIncrement() {
        if (this.orderSelected.status === 'open') {
            this.readyToDmAt += 5;
        } else {
            this.readyToDmMinutesAt += 5;
        }
    }

    // ========== MÉTODO 3: Decrementar tiempo ==========
    onDecrement() {
        if (this.orderSelected.status === 'open') {
            this.readyToDmAt = Math.max(0, this.readyToDmAt - 5);
        } else {
            this.readyToDmMinutesAt = Math.max(0, this.readyToDmMinutesAt - 5);
        }
    }

    // ========== MÉTODO 4: Actualizar tiempo de orden ==========
    updateTimes(item: OrderBean) {
        this.loadingButtonUpdateTime = true
        var json = {
            uuid: item.uuid,
            readyToDmAt: this.orderSelected.createdAt + (this.readyToDmMinutesAt * 60),
            readyToDmMinutesAt: this.readyToDmMinutesAt
        }

        if(this.readyToDmMinutesAt >= item.readyToDmMinutesAt){
            this.orderRepository.updateReadyToDm(json).subscribe((response) => {
                setTimeout(() => {
                this.onVisibleChange(false)
                }, 1500);

                item.readyToDmMinutesAt = this.readyToDmMinutesAt;
                this.loadingButtonUpdateTime = false
                console.log(response)
                this.messageService.add({
                    severity: 'success',
                    summary: '¡Orden Lista!',
                    detail: 'El tiempo estimada modificado',
                    life: 3000
                });
            }, (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error.messages[0].message
                });
                this.loadingButtonUpdateTime = false
            })
        }
        else{
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'El tiempo de preparacion debe ser mayor que el tiempo actual'
            });
            this.loadingButtonUpdateTime = false
        }
    }

    // ========== MÉTODO 5: Transformar datos de orden (OPCIONAL) ==========
    // Usar este método si tus datos de orden tienen diferente estructura
    transformOrderData(order: OrderBean): OrderBean {
        if (!order || !order.products) {
            return order;
        }

        // Clonar orden para no mutar el original
        const transformedOrder = JSON.parse(JSON.stringify(order));

        // Transformar productos
        transformedOrder.products = transformedOrder.products.map(product => {
            // Si el producto ya tiene options en el formato correcto, no hacer nada
            if (product.options && product.options[0]?.type) {
                return product;
            }

            // Transformar options al formato esperado
            if (product.options) {
                product.options = product.options.map(option => ({
                    name: option.name || option.title || 'Opción',
                    type: this.determineOptionType(option),
                    subOptions: this.transformSubOptions(option)
                }));
            }

            return product;
        });

        return transformedOrder;
    }

    // ========== MÉTODO 6: Determinar tipo de opción ==========
    determineOptionType(option: any): 'unique' | 'multiple' | 'sumable' {
        // Si ya tiene tipo definido
        if (option.type) {
            return option.type;
        }

        // Determinar por propiedades
        if (option.sumable || option.isSumable || option.addable) {
            return 'sumable';
        }

        if (option.max === 1 || option.maxSelection === 1 || option.single) {
            return 'unique';
        }

        return 'multiple';
    }

    // ========== MÉTODO 7: Transformar sub-opciones ==========
    transformSubOptions(option: any): any[] {
        // Si ya tiene subOptions
        if (option.subOptions) {
            return option.subOptions;
        }

        // Si tiene items
        if (option.items) {
            return option.items.map(item => ({
                name: item.name || item.title || item.label,
                selected: item.selected || item.checked || false,
                quantity: item.quantity || item.count || 0
            }));
        }

        // Si tiene choices
        if (option.choices) {
            return option.choices.map(choice => ({
                name: choice.name || choice.title,
                selected: choice.selected || false,
                quantity: choice.quantity || 0
            }));
        }

        return [];
    }


    accordionFunction() {
        setTimeout(() => {
            const productos = document.querySelectorAll(".orden-producto-header");

            if (!productos || productos.length === 0) {
                console.log('No hay productos para expandir');
                return;
            }

            productos.forEach((productoHeader) => {
                // Verificar si el producto es expandible
                const esNoExpandible = productoHeader.classList.contains('no-expandible');

                if (esNoExpandible) {
                    // Si no es expandible, no agregar evento click
                    return;
                }

                const toggle = productoHeader.querySelector(".orden-producto-toggle") as HTMLElement;
                const detalles = productoHeader.parentElement?.querySelector(".orden-producto-detalles") as HTMLElement;

                if (!toggle || !detalles) {
                    return;
                }

                // Expandir por defecto
                detalles.classList.add("visible");
                toggle.classList.add("expandido");

                // Agregar evento click solo a productos expandibles
                productoHeader.addEventListener("click", () => {
                    detalles.classList.toggle("visible");
                    toggle.classList.toggle("expandido");
                });
            });
        }, 100);
    }
    onGetMethodType(method: string) {
        let methodConverted: string
        switch (method) {
            case 'CARD': methodConverted = 'Tarjeta de crédito'; break;
            case 'CASH': methodConverted = 'Efectivo'; break;
            case 'BANK': methodConverted = 'Cuenta bancaria'; break;
            case 'E-WALLET': methodConverted = 'Billetera electrónica'; break;
            case 'PAYMENT-BUTTON': methodConverted = 'PSE'; break
        }
        return methodConverted
    }
    tieneDetalles(product: ProductBean): boolean {
        const tieneOpciones = product?.options && product?.options?.length > 0;
        const tieneComentarios = product.comment && product.comment.trim() !== '';
        return tieneOpciones || tieneComentarios;
    }

    async printToPDF(): Promise<void> {
        const printArea: HTMLElement = document.getElementById('pdf');
        
        if (!printArea) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se encontró el área de impresión'
            });
            return;
        }

        const fileName = `comanda-${this.orderSelected.id}`;
        
        try {
            await this.printService.print(
                printArea.innerHTML,
                this.styleString,
                fileName
            );
        } catch (error) {
            console.error('Error al imprimir:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo generar la impresión'
            });
        }
    }
    sendMessageWhatsApp(phoneNumber:string){
        if(!phoneNumber){
        return
        }
        const url = `https://wa.me/${phoneNumber}`;
        window.open(url, '_blank');
    }



    /**ACCIONES */
    loadingButtonAcept: boolean = false;
    loadingButtonOrderReady: boolean = false;
    loadingButtonFinish: boolean = false;
    loadingButtonSelfManage: boolean = false;
    showConfirmOrderReady: boolean = false;  //
    shouldShowActionButtons(): boolean {
        const status = this.orderSelected?.status;
        const statusAgent = this.orderSelected?.statusForAgentStore;
        
        // Si tiene algún botón principal
        if (status === 'open') return true;
        if (status === 'preparingOrder') return true;
        if (status === 'orderReady' && this.orderSelected.isSelfManaged) return true;
        if (status === 'orderReady' && this.orderSelected.isApprovedSelfManaged && !this.orderSelected.isSelfManaged) return true;
        
        // O si puede rechazar
        if (!['done', 'inRoute', 'cancel', 'preparingOrder', 'orderReady'].includes(statusAgent)) return true;
        
        return false;
    }
    flagOpenReceiptDialog: boolean = false

    // ========== MÉTODOS ACEPTACIÓN PROGRAMADA ==========
    initScheduledAcceptance() {
        this.scheduledAcceptMode = 'confirm';
        this.scheduledDates = this.buildScheduledDates();
        this.scheduledHours = [];
        for (let i = 6; i <= 22; i++) {
            this.scheduledHours.push(String(i).padStart(2, '0'));
        }
        // Pre-seleccionar fecha/hora: readyToDmAt (hora operativa) tiene prioridad, sino reservationAt (hora del cliente)
        const preselectedTs = this.orderSelected.readyToDmAt || this.orderSelected.reservationAt;
        if (preselectedTs) {
            const preDate = new Date(preselectedTs * 1000);
            const preDateStr = `${preDate.getFullYear()}-${String(preDate.getMonth()+1).padStart(2,'0')}-${String(preDate.getDate()).padStart(2,'0')}`;
            this.scheduledSelectedDate = preDateStr;
            this.scheduledSelectedHour = String(preDate.getHours()).padStart(2, '0');
            this.scheduledSelectedMinute = String(Math.floor(preDate.getMinutes()/15)*15).padStart(2, '0');
        } else {
            this.scheduledSelectedDate = this.scheduledDates[0]?.value || '';
            this.scheduledSelectedHour = '12';
            this.scheduledSelectedMinute = '00';
        }
        this.updateScheduledPreview();
    }

    buildScheduledDates(): {label: string, value: string}[] {
        const dates: {label: string, value: string}[] = [];
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const now = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() + i);
            const value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            let label: string;
            if (i === 0) label = 'Hoy';
            else if (i === 1) label = 'Mañana';
            else label = `${dayNames[d.getDay()]} ${d.getDate()}`;
            dates.push({ label, value });
        }
        return dates;
    }

    onSelectScheduledMode(mode: 'confirm' | 'modify') {
        this.scheduledAcceptMode = mode;
    }

    onSelectScheduledDate(value: string) {
        this.scheduledSelectedDate = value;
        this.updateScheduledPreview();
    }

    updateScheduledPreview() {
        const dateObj = this.scheduledDates.find(d => d.value === this.scheduledSelectedDate);
        if (dateObj) {
            this.scheduledPreviewText = `${dateObj.label} a las ${this.scheduledSelectedHour}:${this.scheduledSelectedMinute}`;
        }
    }

    getScheduledReadyToDmAt(): number {
        if (this.scheduledAcceptMode === 'confirm') {
            return this.orderSelected.reservationAt;
        }
        return this.buildTimestampFromPicker();
    }

    buildTimestampFromPicker(): number {
        const parts = this.scheduledSelectedDate.split('-');
        const d = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]),
                           parseInt(this.scheduledSelectedHour), parseInt(this.scheduledSelectedMinute), 0);
        return Math.floor(d.getTime() / 1000);
    }

    getReadyToDmDisplay(): string {
        const ts = this.orderSelected.readyToDmAt;
        if (!ts) return '';
        const d = new Date(ts * 1000);
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dateObj = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const diffDays = Math.round((dateObj.getTime() - today.getTime()) / 86400000);
        const hora = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        if (diffDays === 0) return `Hoy ${hora}`;
        if (diffDays === 1) return `Mañana ${hora}`;
        return `${dayNames[d.getDay()]} ${d.getDate()} ${hora}`;
    }

    updateScheduledTime() {
        this.loadingButtonUpdateTime = true;
        const newReadyToDmAt = this.buildTimestampFromPicker();
        const json = {
            uuid: this.orderSelected.uuid,
            readyToDmAt: newReadyToDmAt,
            readyToDmMinutesAt: this.orderSelected.readyToDmMinutesAt || 15
        };
        this.orderRepository.updateReadyToDm(json).subscribe((response) => {
            this.orderSelected.readyToDmAt = newReadyToDmAt;
            this.loadingButtonUpdateTime = false;
            this.messageService.add({
                severity: 'success',
                summary: '¡Actualizado!',
                detail: 'Fecha y hora de entrega actualizada',
                life: 3000
            });
        }, (error) => {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error.error.messages[0].message
            });
            this.loadingButtonUpdateTime = false;
        });
    }

    aceptOrder(){
      this.loadingButtonAcept=true
      const uuid = this.orderSelected.uuid
      const readyToDmMinutesAt = this.readyToDmAt // minutos (15 por defecto)

      // Para órdenes programadas: enviar readyToDmAt como timestamp
      const readyToDmAt = (this.orderSelected.isOrderCalendar && this.orderSelected.reservationAt)
        ? this.getScheduledReadyToDmAt()
        : undefined;

      const doAccept = () => {
        this.orderRepository.aceptOder(uuid, readyToDmMinutesAt, readyToDmAt).subscribe((resp)=>{
          this.onVisibleChange(false)
          this.loadingButtonAcept=false
          this.dialogScreenshoot=false
          this.messageService.add({
            severity: 'success',
            summary: '',
            detail: 'Operación realizado con exito'
          });
        },(error)=>{
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error.messages[0].message
          });
          this.loadingButtonAcept=false
          this.dialogScreenshoot=false
        })
      }

      if(['CARD','CASH','PAY_IN_STORE','PAYMENT-BUTTON'].includes(this.orderSelected.payment.method.type)){
        doAccept()
      } else {
        if(!this.flagOpenReceiptDialog){
          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'Por favor revise el comprobante de pago primero, Dar click en el boton del ojo'
          });
          this.loadingButtonAcept = false
          this.dialogScreenshoot=false
          this.openDialogScreenShoot()
        } else {
          doAccept()
        }
      }
    }
    markOrderReady() {
        // Validar que hay orden seleccionada
        if (!this.orderSelected) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No hay orden seleccionada'
            });
            return;
        }
        
        // Validar que la orden esté en estado correcto
        if (this.orderSelected.status !== 'preparingOrder') {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Esta orden no está en preparación'
            });
            return;
        }
        
        // Mostrar modal de confirmación
        this.showConfirmOrderReady = true;
    }
    confirmarOrdenLista() {
        this.loadingButtonOrderReady = true;
        var body:AceptOrderRequest
        const uuid=this.orderSelected.uuid
        if(this.orderSelected.isPickUpStore){
        body={uuid:uuid,status:CONSTANTES.DONE_ORDER_STATUS} as AceptOrderRequest
        }else{
        body={uuid:uuid,status:CONSTANTES.READY_ORDER_STATUS} as AceptOrderRequest
        }
        
        // Llamar al servicio para marcar orden como lista
        this.orderRepository.readyOder(uuid,body).subscribe({
            next: (response) => {
                this.loadingButtonOrderReady = false;
                this.showConfirmOrderReady = false;
                                
                // Cerrar modal de orden si está abierto
                this.onVisibleChange(false)
                
                // Mensaje de éxito
                this.messageService.add({
                    severity: 'success',
                    summary: '¡Orden Lista!',
                    detail: `La orden #${this.orderSelected.id} está lista para entregar`,
                    life: 5000
                });
                
                // Log opcional
                console.log(`Orden ${this.orderSelected.id} marcada como lista`);
            },
            error: (error) => {
                this.loadingButtonOrderReady = false;
                
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo marcar la orden como lista. Intenta nuevamente.'
                });
                
                console.error('Error al marcar orden como lista:', error);
            }
        });
    }
    cancelarConfirmacionOrdenLista() {
        this.showConfirmOrderReady = false;
    }
    finishOrder(){}
    selfManagedOrder(){}
    openRejectDialog() {
        // Resetear valores
        this.selectedTab = true;
        this.otherReasonOrder = '';
        
        // Verificar que hay orden seleccionada
        if (!this.orderSelected) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No hay orden seleccionada'
            });
            return;
        }
        
        // Verificar que tiene teléfono
        if (!this.orderSelected.user?.phone) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Esta orden no tiene teléfono del cliente registrado'
            });
        }
        
        // Abrir modal
        this.displayOrderReject = true;
    }
    llamarCliente(phoneNumber: string) {
        if (!phoneNumber) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No hay número de teléfono disponible'
            });
            return;
        }
        
        // Limpiar el número (quitar espacios, guiones, etc.)
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        
        // Abrir marcador telefónico
        // En desktop abrirá la aplicación predeterminada
        // En móvil abrirá el marcador nativo
        window.location.href = `tel:${cleanPhone}`;
        
        // Opcional: Tracking o log
        console.log(`Iniciando llamada a: ${cleanPhone}`);
        
        // Opcional: Cerrar modal después de iniciar llamada
        // setTimeout(() => {
        //     this.displayOrderReject = false;
        // }, 500);
    }
    // ========== MÉTODO 4: Cerrar Modal ==========
    closeModalOrderCancel() {
        this.displayOrderReject = false;
        this.otherReasonOrder = '';
    }

    cancelOrder(reason: string) {
        // Validar razón
        if (!reason || reason.trim().length < 5) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debes especificar un motivo válido (mínimo 5 caracteres)'
            });
            return;
        }
        
        // Guardar razón y mostrar modal de confirmación
        this.reasonToReject = reason.trim();
        this.showConfirmReject = true;
    }

    confirmarRechazo() {
        this.loadingButtonCancel = true;
        
        const orderRequest = {
            uuid: this.orderSelected.uuid,
            reason: this.reasonToReject
        };
        
        this.orderRepository.cancelOrder(orderRequest.uuid, orderRequest.reason).subscribe({
            next: (response) => {
                this.loadingButtonCancel = false;
                this.showConfirmReject = false;
                this.displayOrderReject = false;
                
                // Actualizar lista de órdenes
                //this.getOrders();
                
                // Mensaje de éxito
                this.messageService.add({
                    severity: 'success',
                    summary: 'Orden Rechazada',
                    detail: 'El cliente ha sido notificado del rechazo'
                });
                
                // Log opcional
                console.log(`Orden ${this.orderSelected.id} rechazada por: ${this.reasonToReject}`);
            },
            error: (error) => {
                this.loadingButtonCancel = false;
                
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo rechazar la orden. Intenta nuevamente.'
                });
                
                console.error('Error al rechazar orden:', error);
            }
        });
    }
    cancelarConfirmacion() {
        this.showConfirmReject = false;
        this.reasonToReject = '';
        this.closeModalOrderCancel()
    }
    // ========== FORMATEAR TELÉFONO (INTERNACIONAL) ==========
    formatPhone(phone: string): string {
        if (!phone) return '';
        
        // Limpiar el número (quitar espacios, guiones, paréntesis)
        const cleaned = phone.replace(/\D/g, '');
        
        // Si está vacío después de limpiar
        if (!cleaned) return phone;
        
        // ========== NÚMEROS PERUANOS ==========
        // +51 + 9 dígitos = 11 dígitos total
        if (cleaned.startsWith('51') && cleaned.length === 11) {
            return `+51 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
        }
        
        // Solo 9 dígitos (peruano sin código)
        if (cleaned.length === 9 && cleaned.startsWith('9')) {
            return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
        }
        
        // ========== NÚMEROS INTERNACIONALES ==========
        // Si tiene código de país (10+ dígitos)
        if (cleaned.length >= 10) {
            // Detectar código de país (1-3 dígitos)
            let countryCode = '';
            let nationalNumber = '';
            
            // Códigos de 1 dígito: USA (+1)
            if (cleaned.startsWith('1') && cleaned.length === 11) {
                countryCode = '1';
                nationalNumber = cleaned.slice(1);
                return `+${countryCode} ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6)}`;
            }
            
            // Códigos de 2 dígitos comunes (México +52, Colombia +57, Argentina +54, etc.)
            const twoDigitCodes = ['52', '57', '54', '56', '55', '58', '53', '34', '44', '49', '33', '39'];
            for (const code of twoDigitCodes) {
                if (cleaned.startsWith(code)) {
                    countryCode = code;
                    nationalNumber = cleaned.slice(2);
                    break;
                }
            }
            
            // Si encontró código de 2 dígitos
            if (countryCode) {
                // Formatear según longitud
                if (nationalNumber.length === 10) {
                    return `+${countryCode} ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6)}`;
                }
                if (nationalNumber.length === 9) {
                    return `+${countryCode} ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6)}`;
                }
                // Formato genérico
                return `+${countryCode} ${nationalNumber.replace(/(\d{3})(?=\d)/g, '$1 ')}`;
            }
            
            // Si no se detectó código conocido, formato genérico
            // Asumir primeros 2-3 dígitos como código de país
            if (cleaned.length > 10) {
                const possibleCode = cleaned.slice(0, 2);
                const rest = cleaned.slice(2);
                return `+${possibleCode} ${rest.replace(/(\d{3})(?=\d)/g, '$1 ')}`;
            }
        }
        
        // ========== FALLBACK ==========
        // Para cualquier otro caso, separar cada 3 dígitos
        if (cleaned.length > 6) {
            return cleaned.replace(/(\d{3})(?=\d)/g, '$1 ');
        }
        
        // Si es muy corto, devolver como está
        return phone;
    }

    // ========== EDITAR ORDEN ==========
    onEditOrder(): void {
        if (!this.orderSelected) return;
        
        // Cerrar el modal
        this.visible = false;
        this.visibleChange.emit(false);
        
        // Emitir evento para que el padre maneje la edición
        this.editOrder.emit(this.orderSelected);
    }

    // Verificar si la orden puede ser editada
    canEditOrder(): boolean {
        // Usar la misma lógica que las tarjetas del kanban
        return this.orderSelected?.canEdit() ?? false;
    }
}