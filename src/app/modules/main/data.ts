import { ChatBean } from "src/app/chat/data.chat"
import { formatCurrency } from "src/app/utils"


export abstract class SubOptionBean {
    id?: number
    name?: string
    price?: PriceBean
    quantity? : number
    abstract getPrice(): number
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
}

export class CardBean {
    id?: string
}

export class MethodBean{
    name?: string 
    type?: string 
    url?: string
}

export class PaymentBean {
    id?: number
    amount?: PriceBean
    method?: MethodBean
    card?: CardBean
}

export class CouponsBean{
    id?: number
    uuid?: string
    code?: string
    discount?: number
    typeDiscount?: string
}

export class OrderBean {
    id?: number
    uuid?: string
    zoneId?: number
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

    totalPayUser?:number
    productPriceDiscount?:number
    productPriceWithDiscount?:number
    coupons?: CouponsBean[]

    constructor(){
        this.messagesNoReadTotal=0
        this.messagesChat=[]
        this.isLoadingChat=false
        this.showButton=false
        this.showChat = true
    }
    getCurrency(): string {
        return ""+this.products[0]?.price.currency??'0'
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
        return ""+this.getCurrency()+formatCurrency(this.totalPayUser)
    }
    getTotalAndCurrencyCommand(){
        return ""+this.getCurrency()+formatCurrency(this.total)
    }
}
export interface StatusOpenStoreBean{
    id:number
    name:string
    isOpen:boolean
    isLoadingOpenStatusStore?:boolean
}
