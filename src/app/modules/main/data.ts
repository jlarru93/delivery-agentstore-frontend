import { ChatBean } from "src/app/chat/data.chat"
import { formatCurrency } from "src/app/utils"
import { AddressResponseLoadingOrder } from "../request-trip/data/response"


export abstract class SubOptionBean {
    id?: number
    name?: string
    price?: PriceBean
    quantity? : number
    abstract getPrice(): number
    getPriceAndCurrency(){
        return "S/"+this.getPrice().toFixed(2)
    }
    getPriceMinimalCurrency(): string {
        return this.price.currency + formatCurrency(this.price.value)
    }
    //abstract select(recipe: SubOptionBean,parent:OptionBean)
}
export class SubOptionAggregable extends SubOptionBean {
    quantity: number
    getPrice(): number {
        return this.quantity * this.price?.value!!
    }

}
export class SubOptionMultiple extends SubOptionBean {
    getPrice(): number {
        return this.price.value
    }

}
export class SubOptionUnique extends SubOptionBean {
    getPrice(): number {
        return this.price.value
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
    id?: number
    currencyId?: number

    getCurrencyAndValue(): String {
        return this.currency + formatCurrency(this.value)
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
    getPriceMinimalCurrency(): string {
        return this.price.currency + formatCurrency(this.price.value)
    }
    getTotalPriceAndCurrency(): string {
        return this.price.currency + formatCurrency(this.getTotalPrice())
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
    readyToDmMinutesAt?: number
    statusHistory?:StatusHistoryBean[]
    totalPayUser?:number
    productPriceDiscount?:number
    productPriceWithDiscount?:number
    coupons?: CouponsBean[]
    urlTracking:string
    addresses?: AddressResponseLoadingOrder[]
    deliveryPriceMongo?: DeliveryPriceMongoBean

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

    //comanda
    getTotalPayUserAndCurrencyCommand(){
        return ""+this.getCurrency()+formatCurrency(this.totalPayUser ?? this.total ?? 0)
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
}
export interface StatusOpenStoreBean{
    id:number
    name:string
    isOpen:boolean
    isLoadingOpenStatusStore?:boolean
}