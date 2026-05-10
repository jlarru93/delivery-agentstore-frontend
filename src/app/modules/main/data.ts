import { ChatBean } from "src/app/chat/data.chat"
import { formatCurrency } from "src/app/utils"
import { AddressResponseLoadingOrder } from "../request-trip/data/response"


export abstract class SubOptionBean {
    id?: number
    name?: string
    price?: PriceBean
    quantity? : number
    abstract getPrice(): number
    abstract getDisplayPrice(): number
    getPriceAndCurrency(){
        return "S/"+this.getDisplayPrice().toFixed(2)
    }
    getPriceMinimalCurrency(): string {
        return this.price.currency + formatCurrency(this.price.getDisplayValue())
    }
    //abstract select(recipe: SubOptionBean,parent:OptionBean)
}
export class SubOptionAggregable extends SubOptionBean {
    quantity: number
    getPrice(): number {
        return this.quantity * this.price?.value!!
    }
    getDisplayPrice(): number {
        return this.quantity * (this.price?.getDisplayValue() ?? 0)
    }

}
export class SubOptionMultiple extends SubOptionBean {
    getPrice(): number {
        return this.price.value
    }
    getDisplayPrice(): number {
        return this.price.getDisplayValue()
    }

}
export class SubOptionUnique extends SubOptionBean {
    getPrice(): number {
        return this.price.value
    }
    getDisplayPrice(): number {
        return this.price.getDisplayValue()
    }

}

export class OptionBean {
    id?: number
    name?: string
    control?: string
    subOptions?: SubOptionBean[]
    totalPrice(): number {
        return this.subOptions.reduce((accumulation, current) => { return accumulation + current.getPrice() }, 0) //sumOf { it.getPrice() }
    }
}
export class PriceBean {
    currency: String
    value: number
    priceToStore?: number
    id?: number
    currencyId?: number

    getCurrencyAndValue(): String {
        return this.currency + formatCurrency(this.value)
    }

    // Precio que se le muestra al agente del comercio: si el backend envía
    // price.priceToStore > 0 (lo que recibe ya descontada la comisión PIWI),
    // se usa ese. Si no, se cae al precio del cliente — sin etiquetas.
    // Nota: NO usar price.commerce, que es el precio de carta antes de comisión.
    getDisplayValue(): number {
        return this.priceToStore !== undefined && this.priceToStore !== null && this.priceToStore > 0
            ? this.priceToStore
            : this.value
    }
}
export class ProductBean {
    id?: number
    name?: string
    price?: PriceBean
    quantity?: number
    options?: OptionBean[]
    review?: string
    comment?: string
    picture?: string

    getTotalPrice(): number {
        return this.quantity * this.getUnitPrice()
    }
    getUnitPrice(): number {
        let priceSubOption = this.options?.reduce((accumulation, current) => { return accumulation + current.totalPrice() }, 0)  //sumOf { it.totalPrice() }?:0.0
        return this.price.currency, this.price.value + priceSubOption
    }
    // Precio unitario que ve el agente: usa price.commerce del producto y de
    // cada subOpción cuando exista; si no, cae al precio del cliente.
    getDisplayUnitPrice(): number {
        const subOptionsTotal = this.options?.reduce((acc, opt) => {
            return acc + (opt.subOptions?.reduce((s, sub) => s + sub.getDisplayPrice(), 0) ?? 0)
        }, 0) ?? 0
        return this.price.getDisplayValue() + subOptionsTotal
    }
    getDisplayTotalPrice(): number {
        return this.quantity * this.getDisplayUnitPrice()
    }
    getPriceMinimalCurrency(): string {
        return this.price.currency + formatCurrency(this.price.getDisplayValue())
    }
    getTotalPriceAndCurrency(): string {
        return this.price.currency + formatCurrency(this.getDisplayTotalPrice())
    }

}

export class EstimationTimeBean {
    min?: number
    max?: number
}

export class StoreBean {
    id?: number
    name?: string
    addressStreet: string
    location?: Point
    logo?:string
    tripSetting:any
}


export class DeliveryManBean {
    id?: number
    name?: string
    phone?: string
    status?: string
    picture?: PictureBean
}

export class PictureBean{
    profile?: string   
    document?: string
}

export class Point {
    type: string;
    coordinates: number[];
}

export class AddressBean {
    id?: number
    location?: Point
    reference?: string
    addressStreet: string
    floor: string
    alias: string
}

export class UserBean {
    id?: number
    fullName?: string
    address?: AddressBean
    phone?: string
    email?: string
    name?:string
    surname?:string
    documentType?: string
    documentValue?: string
}

export class CardBean {
    id?: string
}

export class MethodBean{
    name?: string 
    type?: string
    received_by_store_method?:string
    url?: string
}

export class PaymentBean {
    id?: number
    amount?: PriceBean
    method?: MethodBean
    card?: CardBean
    piwiCoin:number
}

export class CouponsBean{
    id?: number
    uuid?: string
    code?: string
    discount?: number
    typeDiscount?: string
}

export class UnreadMessagesBean{
    uuid?: string
    messagesNoReadTotal?: number
}

export class ExecuteForBean{
    id:string
    userType:string
}
export class StatusHistoryBean{
    status:string
    createAt:number
    executeFor:ExecuteForBean
}

export class DeliveryPriceMongoBean {
    overviewPolyline?: string
    distance?: number
    duration?: number
}

export class OrderBean {
    id?: number
    uuid?: string
    zoneId?: number
    type?: string  // 'traditional' | 'SendAndReciveStore'
    productPrice: number
    servicePrice: number
    deliveryPrice: number
    deliveryPriceDiscount : number
    deliveryPriceWithDiscount: number
    tip: number;
    total: number
    user?: UserBean
    store?: StoreBean
    estimationTime?: EstimationTimeBean
    payment?: PaymentBean
    products?: ProductBean[]
    deliveryMan?: DeliveryManBean
    status?: string
    createdAt: number
    readyToDmAt:number
    acceptAgentStoreAt: number
    messagesNoReadTotal:number
    messagesChat:ChatBean[]
    isLoadingChat:boolean
    showButton:boolean
    showChat:boolean
    statusForAgentStore:string
    isApprovedSelfManaged:boolean
    isSelfManaged:boolean
    isPickUpStore:boolean
    isOrderCalendar?:boolean
    reservationAt?:number
    readyToDmMinutesAt?: number
    statusHistory?:StatusHistoryBean[]
    totalPayUser?:number
    productPriceDiscount?:number
    productPriceWithDiscount?:number
    priceToStore?:number
    piwiPaysStore?:number
    commissionPaymentGatewayProduct?:number
    commissionPaymentGatewayTotal?:number
    storeAbsorbsPaymentGateway?:number
    coupons?: CouponsBean[]
    urlTracking:string
    addresses?: AddressResponseLoadingOrder[]
    deliveryPriceMongo?: DeliveryPriceMongoBean
    evidenceReceptionOrder?: string

    constructor(){
        this.messagesNoReadTotal=0
        this.messagesChat=[]
        this.isLoadingChat=false
        this.showButton=false
        this.showChat = true
    }
    getCurrency(): string {
        return ""+(this.products?.[0]?.price?.currency ?? "S/")
    }
    getProductPrice(): number {
        return this.products.reduce((accumulation, current) => { return accumulation + current.getTotalPrice() }, 0)//sumOf { it.getTotalPrice() }
    }
    getProductPriceAndCurrency(): string {
        return this.getCurrency() + formatCurrency(this.productPrice);
    }
    getServicePriceAndCurrency(): string {
        return this.getCurrency() + formatCurrency(this.servicePrice)
    }

    getSubTotalPrice(): number {
        return (this.getProductPrice() + this.servicePrice + this.deliveryPrice)
    }
    getSubTotalPriceAndCurrency(): string {
        return this.getCurrency() + formatCurrency(this.getSubTotalPrice())
    }

    getdeliveryPriceAndCurrency():string{
        return ""+this.getCurrency() +formatCurrency(this.deliveryPrice??0)
    }
    getTipAndCurrency():string{
        return ""+this.getCurrency() +formatCurrency(this.tip)
    }
    getTotal():number{
        return this.getSubTotalPrice()+this.tip;
    }
    getTotalProductsWithDiscount(){
        return ""+this.getCurrency() + formatCurrency(this.productPriceWithDiscount)
    }
    getTotalAndCurrency(){
        return ""+this.getCurrency()+formatCurrency(this.getTotal())
    }
    getTotalDiscountAndCurrency(){
        return ""+this.getCurrency() + formatCurrency((this.getTotal() - (this.deliveryPriceDiscount??0) ))
    }

    getTotalDiscountAndCurrencyWithCoupon(){
        return ""+this.getCurrency() + formatCurrency((this.totalPayUser - (this.deliveryPriceDiscount??0) ))
    }
    getCountProducts(): string {
        return this.products.reduce((accumulation, current) => { return accumulation+current.quantity }, 0).toString() +" productos"//.sumOf { it.quantity }.toString() + " productos"
    }
    
    getdeliveryPriceDiscountAndCurrency(): string{
        return ""+this.getCurrency() + formatCurrency(((this.deliveryPrice??0) - (this.deliveryPriceDiscount??0)))
    }

    // Verificar si hay descuento en el total (total != totalPayUser)
    hasTotalPayUserDiscount(): boolean {
        if (this.totalPayUser === undefined || this.totalPayUser === null) return false;
        return this.total !== this.totalPayUser;
    }
    
    // Obtener totalPayUser formateado
    getTotalPayUserAndCurrency(): string {
        return "" + this.getCurrency() + formatCurrency(this.totalPayUser ?? this.total ?? 0);
    }

    //comanda
    getTotalPayUserAndCurrencyCommand(){
        return ""+this.getCurrency()+formatCurrency(this.totalPayUser ?? this.total ?? 0)
    }

    // Total mostrado en las tarjetas de la cartilla:
    // - traditional: el monto que recibe el comercio (priceToStore), porque el comercio
    //   no debe ver lo que paga el cliente (incluye comisión PIWI / delivery).
    // - commerce (SendAndReciveStore): el total que paga el cliente, como antes.
    // Si priceToStore no viene o es 0, cae al comportamiento previo para no mostrar S/0.
    getCartillaTotalAndCurrency(): string {
        if (this.type === 'traditional' && this.priceToStore && this.priceToStore > 0) {
            return "" + this.getCurrency() + formatCurrency(this.priceToStore);
        }
        return this.getTotalPayUserAndCurrencyCommand();
    }
    getTotalAndCurrencyCommand(){
        return ""+this.getCurrency()+formatCurrency(this.total ?? 0)
    }
    getPiwiCoinAndCurrency(){
        return ""+this.getCurrency() + formatCurrency(this.payment?.piwiCoin??0)
    }
    
    // Obtener nombre del cliente desde addresses[1]
    getClientName(): string {
        if (this.addresses && this.addresses.length > 1 && this.addresses[1]?.receptorName) {
            return this.addresses[1].receptorName;
        }
        return this.user?.fullName || this.user?.name || '';
    }
    
    // Obtener teléfono del cliente desde addresses[1]
    getClientPhone(): string {
        if (this.addresses && this.addresses.length > 1 && this.addresses[1]?.phone) {
            return this.addresses[1].phone;
        }
        return this.user?.phone || '';
    }
    
    // Verificar si hay descuento en domicilio
    hasDeliveryDiscount(): boolean {
        return this.deliveryPrice !== this.deliveryPriceWithDiscount && 
               this.deliveryPriceWithDiscount !== undefined &&
               this.deliveryPriceWithDiscount !== null;
    }
    
    // Obtener precio de domicilio con descuento
    getDeliveryPriceWithDiscountAndCurrency(): string {
        const value = this.deliveryPriceWithDiscount ?? this.deliveryPrice ?? 0;
        return "" + this.getCurrency() + formatCurrency(value);
    }
    
    // Verificar si hay descuento en productos
    hasProductDiscount(): boolean {
        return this.productPrice !== this.productPriceWithDiscount && 
               this.productPriceWithDiscount !== undefined &&
               this.productPriceWithDiscount !== null;
    }
    
    // Obtener precio de productos con descuento
    getProductPriceWithDiscountAndCurrency(): string {
        const value = this.productPriceWithDiscount ?? this.productPrice ?? 0;
        return "" + this.getCurrency() + formatCurrency(value);
    }

    // Mostrar el monto que recibe el comercio solo si la comisión está activa
    shouldShowPriceToStore(): boolean {
        if (this.priceToStore === undefined || this.priceToStore === null) return false;
        if (this.priceToStore <= 0) return false;
        const productsTotal = this.productPriceWithDiscount ?? this.productPrice ?? 0;
        return this.priceToStore !== productsTotal;
    }

    // Monto que le corresponde al comercio por la orden
    getPriceToStoreAndCurrency(): string {
        return "" + this.getCurrency() + formatCurrency(this.priceToStore ?? 0);
    }

    // Cuando el comercio absorbe la comisión de la pasarela (tarjeta / PSE),
    // mostramos en el bloque "Le corresponde al comercio" el priceToStore tachado
    // junto al neto que efectivamente recibe (piwiPaysStore) + la línea de comisión.
    // Para otros métodos de pago o cuando PIWI absorbe la pasarela, se mantiene
    // el bloque original con solo priceToStore.
    isPaymentGatewayMethod(): boolean {
        const type = this.payment?.method?.type;
        return type === 'CARD' || type === 'PAYMENT-BUTTON';
    }

    shouldShowGatewayDiscount(): boolean {
        return this.isPaymentGatewayMethod()
            && this.storeAbsorbsPaymentGateway === 1
            && (this.piwiPaysStore ?? 0) > 0
            && (this.commissionPaymentGatewayProduct ?? 0) > 0;
    }

    getPiwiPaysStoreAndCurrency(): string {
        return "" + this.getCurrency() + formatCurrency(this.piwiPaysStore ?? 0);
    }

    getCommissionPaymentGatewayProductAndCurrency(): string {
        return "" + this.getCurrency() + formatCurrency(this.commissionPaymentGatewayProduct ?? 0);
    }

    calculateTime(){
        const tiempoActual = new Date();
        const tiempoCreacion = new Date(this.createdAt * 1000);
        const diferencia = tiempoActual.getTime() - tiempoCreacion.getTime();

        const hoursDifference = Math.floor(diferencia / (1000 * 60 * 60));
        const minutesDifference = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60)); 

        const res = `${hoursDifference}h ${minutesDifference}`.toString(); 
        return res;
    }
    
    getDriverBadge(){
        if (!this?.deliveryMan?.name) {
            return '🏍️ Sin asignar';
        }
        
        const nombreParts = this.deliveryMan.name.trim().split(' ');
        const primerNombre = nombreParts[0];
        const primerApellido = nombreParts.length > 1 ? nombreParts[1].charAt(0) + '.' : '';
        
        return `🏍️ ${primerNombre} ${primerApellido}`;
    }
    getPrepTimeBadge(){
        if (!this?.readyToDmMinutesAt || this.readyToDmMinutesAt === 0) {
            return '⏲️ --';
        }
        return `⏲️ ${this.readyToDmMinutesAt}min`;
    }
    onGetMethodType(): string {
        let methodConverted: string;
        switch(this.payment?.method?.type) {
            case 'CARD': 
            methodConverted = 'Tarjeta de crédito'; 
            break;
            case 'CASH': 
            methodConverted = 'Efectivo'; 
            break;
            case 'BANK': 
            methodConverted = this.payment.method.name; 
            break;
            case 'E-WALLET': 
            methodConverted = this.payment.method.name; 
            break;
            case 'PAYMENT-BUTTON': 
            methodConverted = 'PSE'; 
            break;
            case 'PAY_IN_STORE': 
            methodConverted = 'Pago en tienda'; 
            break;
            case 'CREDIT': 
            methodConverted = 'Crédito del comercio'; 
            break;
            default:
            methodConverted = 'Otro método';
            break;
        }
        return methodConverted;
    }
    getPaymentIcon(): string {
        switch(this.payment?.method?.type) {
            case 'CARD': 
            return 'pi-credit-card';
            case 'CASH': 
            return 'pi-money-bill';
            case 'BANK': 
            return 'pi-building';
            case 'E-WALLET': 
            return 'pi-wallet';
            case 'PAY_IN_STORE': 
            return 'pi-shopping-cart';
            case 'CREDIT': 
            return 'pi-file';
            default:
            return 'pi-wallet';
        }
    }
    hasPaymentEvidence(): boolean {
        const method: string=this.payment?.method?.type
        return method === 'E-WALLET' || method === 'BANK';
    }
    isCommerce(): boolean {
        return this.type === 'SendAndReciveStore';
    }
    canEdit(): boolean {
        return this.isCommerce() && !this.deliveryMan;
    }
    getReservationDisplay(): string {
        if (!this.reservationAt) return '';
        return this.formatTimestamp(this.reservationAt);
    }

    getScheduledBadgeDisplay(): string {
        const ts = this.readyToDmAt || this.reservationAt;
        if (!ts) return '';
        return this.formatTimestamp(ts);
    }

    private formatTimestamp(ts: number): string {
        const date = new Date(ts * 1000);
        const now = new Date();
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const isToday = date.toDateString() === now.toDateString();
        const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
        const isTomorrow = date.toDateString() === tomorrow.toDateString();
        let dayLabel: string;
        if (isToday) dayLabel = 'Hoy';
        else if (isTomorrow) dayLabel = 'Mañana';
        else dayLabel = `${dayNames[date.getDay()]} ${date.getDate()}`;
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        return `${dayLabel} ${h}:${m}`;
    }
}
export interface StatusOpenStoreBean{
    id:number
    name:string
    isOpen:boolean
    isLoadingOpenStatusStore?:boolean
}
