import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { OrderBean, PaymentBean, ProductBean } from "../data";
import { HttpClient } from "@angular/common/http";
import { OrderRepository } from "../service/order.repository";
import { AceptOrderRequest } from "../service/data/request";
import * as CONSTANTES from "src/app/utils/constant";
import { PrintService } from 'src/app/utils/print.service';


@Component({
    selector: 'order-modal',
    templateUrl: './order.modal.component.html',
    styleUrls: ['./order.modal.component.scss','./order.modal.rechazo.component.scss'],
    providers: [ConfirmationService, MessageService, DialogService],
})
export class OrderModalComponent implements OnInit {

    @Input()
    orderSelected: OrderBean

    @Input() visible: boolean = false;
    @Output() visibleChange = new EventEmitter<boolean>();

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

    constructor(
        private messageService: MessageService,
        private http: HttpClient,
        private confirmationService: ConfirmationService,
        private orderRepository: OrderRepository,
        private printService: PrintService
    ) { }
    ngOnInit(): void {
        this.storeDataStorage = JSON.parse(localStorage.getItem('storeBean'))
    }

    init() {
        this.storeDataStorage = JSON.parse(localStorage.getItem('storeBean'))
        this.flagOpenReceiptDialog=false
        this.readyToDmMinutesAt=null
        if(this.orderSelected.status=="open"){
            this.readyToDmAt=15
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
    }
    onShow(_event:any){
        this.init()
        //this.openSetBusinessId(this.option)
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

    aceptOrder(){
      let orderRequest=JSON.parse(JSON.stringify(this.orderSelected)) as OrderBean
      orderRequest.readyToDmAt=this.readyToDmAt
      this.loadingButtonAcept=true

      if(['CARD','CASH','PAY_IN_STORE','PAYMENT-BUTTON'].includes(orderRequest.payment.method.type)){
        this.orderRepository.aceptOder(orderRequest.uuid,orderRequest.readyToDmAt).subscribe((resp)=>{
        this.visible=false
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
          this.orderRepository.aceptOder(orderRequest.uuid,orderRequest.readyToDmAt).subscribe((resp)=>{
            this.visible=false
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
}