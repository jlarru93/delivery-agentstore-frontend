
export class PriceBean{
    currency: String
    value: number
    oldValue: number
    getCurrencyAndValue(): String {
        return this.currency + this.value.toString()
    }
    getCurrencyAndOldValue(): String {
        return this.currency + this.oldValue.toString()
    }
}

export class ProductBean{
    id ?: number;
    review ?: string;
    name ?: string;
    price ?: PriceBean;
    menu ?: string[]
    picture ?: string;
    isOutStock : boolean;
}

export class StoreBean {
    id?: number;
    zoneId?: number;
    fullName?: string;
    banner?: string;
    log?: string;
    starRating: string;
    isEnable: boolean;
    menu ?: string[];
    products ?: ProductBean[];
    isOpen: boolean;
    tripSetting:any[]
    ticketKitchen: TiketKitchenBean[]
}

export class TiketKitchenBean {
    key?: string
    value?: boolean
    tag?: string
}