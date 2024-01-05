import { PriceBean, StoreBean, ProductBean, TiketKitchenBean } from "../../data";

export class PriceResponse{
    currency ?: string;
    value ?: number;
    static toBean(self: PriceResponse) : PriceBean {
        try{
            const bean = new PriceBean
            bean.currency = self.currency;
            bean.value = self.value;
            return bean
        }catch(e){
            console.log("self",self)
            console.log(e)
            throw e
        }
    }
}

export class ProductsResponse{
    id ?: number;
    review ?: string;
    name ?: string;
    price ?: PriceResponse;
    menu ?: []
    picture ?: string;
    isOutStock : boolean;
    isEnabled:boolean
    static toBean(self: ProductsResponse): ProductBean{
        try{
            const bean = new ProductBean()
            bean.id = self.id;
            bean.review = self.review;
            bean.name = self.name;
            bean.price = PriceResponse.toBean(self.price);
            bean.menu = self.menu;
            bean.picture = self.picture;
            bean.isOutStock = self.isOutStock;
            return bean
        }catch(e){
            console.log("self:product",self)
            throw e
        }        
    }
}

export class MenuResponse {

}

export class StoreResponse {
    id?: number;
    zoneId?: number;
    fullName?: string;
    banner?: string;
    log?: string;
    starRating: string;
    isEnable: boolean;
    menu ?: string[];
    products ?: ProductsResponse[];
    isOpen: boolean;
    ticketKitchen: TiketKitchenResponse[];
    tripSetting:any[];
    static toBean(self: StoreResponse) : StoreBean{
        const bean = new StoreBean()
            bean.id = self.id;
            bean.zoneId = self.zoneId;
            bean.fullName = self.fullName;
            bean.banner = self.banner;
            bean.log = self.log;
            bean.starRating = self.starRating;
            bean.isEnable = self.isEnable;
            bean.menu = self.menu;
            bean.products = self.products.filter((it)=>it.isEnabled).map((it) => ProductsResponse.toBean(it));
            bean.isOpen = self.isOpen
            bean.tripSetting=self.tripSetting
            bean.ticketKitchen = self.ticketKitchen.map((it) => TiketKitchenResponse.toBean(it)) 
        return bean
    }
}

export class TiketKitchenResponse {
    key?: string
    value?: boolean
    tag?: string
    static toBean(response: TiketKitchenResponse) : TiketKitchenBean {
        let bean = new TiketKitchenBean()
            bean.key = response.key
            bean.value = response.value
            bean.tag = response.tag
        return bean
    }
}