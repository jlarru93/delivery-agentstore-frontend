import { Store } from "src/app/models"
import { AddressBean, CardBean, DeliveryManBean, EstimationTimeBean, MethodBean, OptionBean, OrderBean, PaymentBean, PriceBean, ProductBean, StoreBean, SubOptionAggregable, SubOptionBean, SubOptionMultiple, SubOptionUnique, UserBean } from "../../data"
import { AddressResponseLoadingOrder } from "src/app/modules/request-trip/data/response"

export class StatusOpenStoreResponse {
    id:number
    name:string
    isOpen: boolean
}

export class SubOptionResponse {
    id?: number
    name?: string
    price?: PriceResponse
    quantity?: number
    control?: string
    static toBean(self: SubOptionResponse, control: string): SubOptionBean {
        switch (control) {
            case "SS": {
                let bean = new SubOptionAggregable()
                bean.id = self.id
                bean.name = self.name
                bean.price = PriceResponse.toBean(self.price)
                bean.quantity = self?.quantity
                return bean
            }
            case "SM": {
                let bean = new SubOptionMultiple()
                bean.id = self.id,
                    bean.name = self.name,
                    bean.quantity = self.quantity,
                    bean.price = PriceResponse.toBean(self.price)
                return bean
            }
            case "SU": {
                let bean = new SubOptionUnique()
                bean.id = self.id,
                    bean.name = self.name,
                    bean.price = PriceResponse.toBean(self.price)
                return bean
            }
            default: {
                let bean = new SubOptionUnique()
                bean.id = self.id,
                    bean.name = self.name,
                    bean.price = PriceResponse.toBean(self.price)
                return bean
            }
        }
    }
}

export class OptionResponse {
    id?: number
    name?: string
    control?: string
    subOption?: SubOptionResponse[]
    static toBean(self?: OptionResponse): OptionBean {
        let bean = new OptionBean()
        bean.id = self.id,
            bean.name = self.name,
            bean.control = self.control,
            bean.subOptions = self.subOption.map((it) => SubOptionResponse.toBean(it, self.control))

        return bean
    }
}
export class PriceResponse {
    currency: String
    value: number
    id?: number
    currencyId?: number
    static toBean(selft: PriceResponse): PriceBean {
        const bean = new PriceBean()
        bean.id = selft.id
        bean.currencyId = selft.currencyId
        bean.value = selft.value
        bean.currency = selft.currency
        return bean
    }
}
export class ProductResponse {
    id?: number
    name?: string
    price?: PriceResponse
    quantity?: number
    options?: OptionResponse[]
    review?: string
    comment?: string
    static toBean(self: ProductResponse): ProductBean {
        const bean = new ProductBean()
        bean.id = self.id,
            bean.name = self.name,
            bean.price = PriceResponse.toBean(self.price),
            bean.quantity = self.quantity,
            bean.options = self?.options.map((it) => OptionResponse.toBean(it)),
            bean.review = self?.review,
            bean.comment = self?.comment
        return bean
    }
}

export class EstimationTimeResponse {
    min?: number
    max?: number
    static toBean(self: EstimationTimeResponse): EstimationTimeBean {
        const bean = new EstimationTimeBean()
        bean.min = self.min
        bean.max = self.max
        return bean
    }
}

// export class StoreResponse {
//     id: number
//     name: string
//     fullName : string
//     phone : string
//     //address: AddressResponse
//     addressStreet: string
//     location?: Point
//     static toBean(self: StoreResponse): StoreBean {
//         const bean = new StoreBean()
//         bean.id = self.id,
//             bean.name = self?.name,
//             bean.addressStreet = self.addressStreet,
//             bean.location = self.location
//         return bean
//     }
// }

export class Location {
    type: string;
    coordinates: number[];

    constructor(type: string, coordinates: number[]) {
        this.type = type;
        this.coordinates = coordinates;
    }
}

export class PaymentMethod {
    name: string;
    value: string;

    constructor(name: string, value: string) {
        this.name = name;
        this.value = value;
    }
}

export class RequestStore {
    id?: number;
    adminStore_id?: number;
    name?: string;
    addressStreet?: string;
    location?: Location;
    brand_id?: number;
    zone_id?: number;
    phone: string;
    fullName: string;
}
export class StoreResponse {
    id: number
    name: string
    fullName : string
    phone : string
    //address: AddressResponse
    addressStreet: string
    location?: Point
    logo?: string
    tripSetting:any
    static toBean(self: StoreResponse): StoreBean {
        const bean = new StoreBean()
        bean.id = self.id,
        bean.name = self?.name,
        bean.addressStreet = self.addressStreet,
        bean.location = self.location
        bean.logo = self.logo
        bean.tripSetting=self.tripSetting
        return bean
    } 
}
export class StoreTripResponse {
    id: number; 
    store : RequestStore;
    location: Location;
    addressStreet: string
    tripSetting: {
        paymentMethod: PaymentMethod[];
    };

    static toBean(json: any): StoreTripResponse {
        const trip = new StoreTripResponse();
        trip.id = json.store.id;
        // trip.fullName = json.store.fullName;
        trip.location = new Location(json.store.location.type, json.store.location.coordinates);
        // trip.phone = json.store.phone;
        trip.tripSetting = {
            paymentMethod: json.tripSetting.paymentMethod.map((method: any) => new PaymentMethod(method.name, method.value))
        };
        return trip;
    }

    static toBeanTrip(json: any): StoreTripResponse {
        const trip = new StoreTripResponse();
        trip.id = json.store.id;
        // trip.fullName = json.store.fullName;
        trip.location = new Location(json.store.location.type, json.store.location.coordinates);
        // trip.phone = json.store.phone;
        trip.tripSetting = {
            paymentMethod: json.tripSetting.paymentMethod.map((method: any) => new PaymentMethod(method.name, method.value))
        };
        return trip;
    }
}

// Usage example:
// const jsonData = /* ... JSON data ... */;
// const trip = StoreResponse.fromJSON(jsonData);
// console.log(trip);

export class DeliveryManResponse {
    id: number
    name: string
    phone: string
    status: string
    static toBean(self?: DeliveryManResponse): DeliveryManBean | null {
        if (!self) {
            return null
        }
        const bean = new DeliveryManBean()
        bean.id = self!.id
        bean.name = self!.name
        bean.phone = self!.phone
        bean.status = self!.status
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
        if (!self) return null
        const bean = new AddressBean()
        bean.id = self.id
        bean.location = self.location
        bean.reference = self?.reference
        bean.addressStreet = self.addressStreet
        bean.floor = self?.floor
        bean.alias = self?.alias
        return bean
    }
}

export class UserResponse {
    id?: number
    fullName?: string
    address?: AddressResponse
    phone? : string
    static toBean(self: UserResponse): UserBean {
        const bean = new UserBean()
        bean.id = self.id,
            bean.fullName = self.fullName,
            bean.address = AddressResponse.toBean(self.address)
            bean.phone = self.phone
        return bean
    }
}

export class CardResponse {
    id?: string
    static toBean(self?: CardResponse): CardBean | null {
        if (!self) return null
        const bean = new CardBean()
        bean.id = self?.id
        return bean
    }
}

export class MethodResponse{
    name?: string 
    type?: string 
    url?: string
    static toBean(self?: MethodResponse): MethodBean | null {
        if (!self) return null
        const bean = new MethodBean
        bean.name = self?.name
        bean.type = self?.type
        bean.url = self?.url
        return bean
    }
}

export class PaymentResponse {
    id?: number
    amount?: PriceResponse
    method?: MethodResponse
    card?: CardResponse
    static toBean(self?: PaymentResponse): PaymentBean {
        const bean = new PaymentBean()
        bean.id = self?.id
        bean.amount = PriceResponse.toBean(self?.amount)
        bean.method = MethodResponse.toBean(self?.method)
        bean.card = CardResponse.toBean(self?.card)
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
    deliveryPriceDiscount: number
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
    readyToDmAt: number
    acceptAgentStoreAt: number
    addresses ?: AddressResponseLoadingOrder[]
    statusForAgentStore:string
    isApprovedSelfManaged:boolean
    isSelfManaged:boolean
    isPickUpStore:boolean
    static toBean(self: OrderResponse): OrderBean {
        const bean = new OrderBean()
        bean.id = self?.id
        bean.uuid = self?.uuid
        bean.zoneId = self?.zoneId
        bean.productPrice = self.productPrice
        bean.servicePrice = self.servicePrice
        bean.deliveryPrice = self.deliveryPrice
        bean.deliveryPriceDiscount = self.deliveryPriceDiscount
        bean.tip = self.tip
        bean.total = self.total
        bean.user = UserResponse.toBean(self.user)
        bean.store = StoreResponse.toBean(self.store)
        bean.estimationTime = EstimationTimeResponse.toBean(self.estimationTime)
        bean.payment = PaymentResponse.toBean(self.payment)
        bean.products = self.products.map((it) => ProductResponse.toBean(it))
        bean.deliveryMan = DeliveryManResponse.toBean(self?.deliveryMan)
        bean.status = self.status
        bean.createdAt = self.createdAt
        bean.readyToDmAt = self.readyToDmAt
        bean.acceptAgentStoreAt = self.acceptAgentStoreAt
        bean.statusForAgentStore=self.statusForAgentStore
        bean.isApprovedSelfManaged=self.isApprovedSelfManaged??false
        bean.isSelfManaged = self.isSelfManaged??false
        bean.isPickUpStore = self.isPickUpStore??false
        return bean
    }
}