export class StatusOpenStoreBean{
    status:boolean
}

export class SubOptionBean {
    id?: number
    name?: string
    unitPrice?: number
    quantity?: number
}

export class OptionBean {
    id?: number
    name?: string
    control?: string
    subOption?: SubOptionBean[]
}

export class ProductBean {
    id?: number
    name?: string
    unitPrice?: number
    quantity?: number
    options?: OptionBean[]
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
export class PaymentBean {
    id?: number
    amount?: number
    method?: string
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
}