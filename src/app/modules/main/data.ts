import { ChatBean } from "src/app/chat/data.chat"

export class StatusOpenStoreBean {
    status: boolean
}

export abstract class SubOptionBean {
    id?: number
    name?: string
    price?: PriceBean
    quantity? : number
    abstract getPrice(): number
    
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
        return this.currency + this.value.toString()
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
        return this.price.currency + this.price.value.toString()
    }
    getTotalPriceAndCurrency(): string {
        return this.price.currency + this.getTotalPrice().toString()
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
}


export class DeliveryManBean {
    id?: number
    name?: string
    phone?: string
    status?: string
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

export class OrderBean {
    id?: number
    uuid?: string
    zoneId?: number
    productPrice: number
    servicePrice: number
    deliveryPrice: number
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
    constructor(){
        this.messagesNoReadTotal=0
        this.messagesChat=[]
        this.isLoadingChat=false
        this.showButton=false
    }
    getCurrency(): string {
        return ""+this.products[0].price.currency
    }
    getProductPrice(): number {
        return this.products.reduce((accumulation, current) => { return accumulation + current.getTotalPrice() }, 0)//sumOf { it.getTotalPrice() }
    }
    getProductPriceAndCurrency(): string {
        return this.getCurrency() + this.getProductPrice().toString()
    }
    getServicePriceAndCurrency(): string {
        return this.getCurrency() + this.servicePrice.toString()
    }
    getDeliveryPriceAndCurrency(): string {
        return this.getCurrency() + this.deliveryPrice.toString()
    }
    getSubTotalPrice(): number {
        return (this.getProductPrice() + this.servicePrice + this.deliveryPrice)
    }
    getSubTotalPriceAndCurrency(): string {
        return this.getCurrency() + this.getSubTotalPrice().toString()
    }

    getdeliveryPriceAndCurrency():string{
        return ""+this.getCurrency() +this.deliveryPrice
    }
    getTipAndCurrency():string{
        return ""+this.getCurrency() +this.tip
    }
    getTotal():number{
        return this.getSubTotalPrice()+this.tip;
    }
    getTotalAndCurrency(){
        return ""+this.getCurrency()+this.getTotal()
    }
    getCountProducts(): string {
        return this.products.reduce((accumulation, current) => { return accumulation+current.quantity }, 0).toString() +" productos"//.sumOf { it.quantity }.toString() + " productos"
    }
}