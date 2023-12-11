
export class PriceBean{
    currency: String
    value: number

    getCurrencyAndValue(): String {
        return this.currency + this.value.toString()
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
}