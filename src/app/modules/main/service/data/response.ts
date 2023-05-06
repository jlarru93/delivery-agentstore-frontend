import { AddressBean, CardBean, DeliveryManBean, EstimationTimeBean, OptionBean, OrderBean, PaymentBean, ProductBean, StoreBean, SubOptionBean, UserBean } from "../../data"

export class StatusOpenStoreResponse {
    status: boolean
}

export class SubOptionResponse {
    id?: number
    name?: string
    unitPrice?: number
    quantity?: number
    static toBean(self: SubOptionResponse): SubOptionBean {
        const bean = {
            id: self.id,
            name: self.name,
            unitPrice: self.unitPrice,
            quantity: self?.quantity
        } as SubOptionBean
        return bean
    }
}

export class OptionResponse {
    id?: number
    name?: string
    control?: string
    subOption?: SubOptionResponse[]
    static toBean(self?: OptionResponse): OptionBean {
        const bean = {
            id: self.id,
            name: self.name,
            control: self.control,
            subOption: self.subOption.map((it) => SubOptionResponse.toBean(it))
        } as OptionBean
        return bean
    }
}

export class ProductResponse {
    id?: number
    name?: string
    unitPrice?: number
    quantity?: number
    options?: OptionResponse[]
    static toBean(self: ProductResponse): ProductBean {
        const bean = {
            id: self.id,
            name: self.name,
            unitPrice: self.unitPrice,
            quantity: self.quantity,
            options: self?.options.map((it) => OptionResponse.toBean(it))
        } as ProductBean
        return bean
    }
}

export class EstimationTimeResponse {
    min?: number
    max?: number
    static toBean(self: EstimationTimeResponse): EstimationTimeBean {
        const bean = {
            min: self.min,
            max: self.max
        } as EstimationTimeBean
        return bean
    }
}

export class StoreResponse {
    id: number
    name: string
    //address: AddressResponse
    addressStreet: string
    location?: Point
    static toBean(self: StoreResponse): StoreBean {
        console.log("StoreResponse", self)
        const bean = {
            id: self.id,
            name: self?.name,
            addressStreet: self.addressStreet,
            location: self.location
        } as StoreBean
        return bean
    }
}


export class DeliveryManResponse {
    id: number
    name: string
    phone: string
    status: string
    static toBean(self?: DeliveryManResponse): DeliveryManBean|null {
        if(!self){
            return null
        }
        const bean = {
            id: self!.id,
            name: self!.name,
            phone: self!.phone,
            status: self!.status,
        } as DeliveryManBean
        return bean
    }
}

export class Point {
    type: string;
    coordinates: number[];
}

export class AddressResponse {
    id: number
    location: Point
    reference?: string
    addressStreet: string
    floor?: string
    alias?: string
    static toBean(self?: AddressResponse): AddressBean | null {
        if( !self) return null
        const bean = {
            id: self.id,
            location: self.location,
            reference: self?.reference,
            addressStreet: self.addressStreet,
            floor: self?.floor,
            alias: self?.alias,
        } as AddressBean
        return bean
    }
}

export class UserResponse {
    id?: number
    fullName?: string
    address?: AddressResponse
    static toBean(self: UserResponse): UserBean {
        console.log("UserResponse", self)
        const bean = {
            id: self.id,
            fullName: self.fullName,
            address: AddressResponse.toBean(self.address)
        } as UserBean
        return bean
    }
}

export class CardResponse {
    id?: string
    static toBean(self?: CardResponse): CardBean | null{
        if(!self) return null
        const bean = {
            id: self?.id
        } as CardBean
        return bean
    }
}
export class PaymentResponse {
    id?: number
    amount?: number
    method?: string
    card?: CardResponse
    static toBean(self?: PaymentResponse): PaymentBean {
        const bean = {
            id: self?.id,
            amount: self?.amount,
            method: self?.method,
            card: CardResponse.toBean(self?.card)
        } as PaymentBean
        return bean
    }
}

export class OrderResponse {
    id?: number
    uuid?: string
    zoneId?: number
    productPrice: number
    servicePrice: number
    deliveryPrice: number
    tip: number;
    total: number
    user: UserResponse
    store: StoreResponse
    estimationTime: EstimationTimeResponse
    payment?: PaymentResponse
    products: ProductResponse[]
    deliveryMan?: DeliveryManResponse
    status?: string
    createdAt: number
    static toBean(self: OrderResponse): OrderBean {
        console.log("OrderResponse", self)
        const bean = {
            id: self?.id,
            uuid: self?.uuid,
            zoneId: self?.zoneId,
            productPrice: self.productPrice,
            servicePrice: self.servicePrice,
            deliveryPrice: self.deliveryPrice,
            tip: self.tip,
            total: self.total,
            user: UserResponse.toBean(self.user),
            store: StoreResponse.toBean(self.store),
            estimationTime: EstimationTimeResponse.toBean(self.estimationTime),
            payment: PaymentResponse.toBean(self.payment),
            products: self.products.map((it) => ProductResponse.toBean(it)),
            deliveryMan: DeliveryManResponse.toBean(self?.deliveryMan),
            status: self.status,
            createdAt: self.createdAt,
        } as OrderBean
        return bean
    }
}