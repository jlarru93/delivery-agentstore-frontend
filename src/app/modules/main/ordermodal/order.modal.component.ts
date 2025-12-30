import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { OrderBean, PaymentBean, ProductBean } from "../data";
import { HttpClient } from "@angular/common/http";

@Component({
    selector: 'order-modal',
    templateUrl: './order.modal.component.html',
    styleUrls: ['./order.modal.component.scss'],
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

    constructor(
        private messageService: MessageService,
        private http: HttpClient,
    ) { }
    ngOnInit(): void {
        this.storeDataStorage = JSON.parse(localStorage.getItem('storeBean'))
    }

    init() {
        this.storeDataStorage = JSON.parse(localStorage.getItem('storeBean'))
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
    updateTimes(order: OrderBean) {
        this.loadingButtonUpdateTime = true;

        // TODO: Reemplazar con tu servicio real
        // Ejemplo:
        /*
        const request = {
          orderId: order.id,
          readyTime: this.readyToDmMinutesAt
        };
        
        this.dynamicReportService.updateOrderTime(request).subscribe(
          (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Tiempo actualizado correctamente'
            });
            this.loadingButtonUpdateTime = false;
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo actualizar el tiempo'
            });
            this.loadingButtonUpdateTime = false;
          }
        );
        */

        // Simulación por ahora (ELIMINAR cuando tengas el servicio real)
        setTimeout(() => {
            this.loadingButtonUpdateTime = false;
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Tiempo de preparación actualizado a ' + this.readyToDmMinutesAt + ' minutos'
            });
        }, 1000);
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

    printToPDF(){
      const printArea: HTMLElement = document.getElementById('pdf');
      const printWindow = window.open('','PRINT')!;
      printWindow.document.write(`<html><head><style>${this.styleString}</style></head><body>${printArea.innerHTML}</body></html>`)
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      },1000) 
    }
    sendMessageWhatsApp(phoneNumber:string){
        if(!phoneNumber){
        return
        }
        const url = `https://wa.me/${phoneNumber}`;
        window.open(url, '_blank');
    }
}