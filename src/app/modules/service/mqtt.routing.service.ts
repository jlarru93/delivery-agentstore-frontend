import { Injectable } from "@angular/core";
import { OrderHandler } from "./handlers/order.handler";
import { StoreHandler } from "./handlers/store.handler";

@Injectable({
    providedIn: 'root'
})
export class MqttRoutingService{

    constructor(private orderHandler:OrderHandler,private storeHandler:StoreHandler){}

    route(topic:string,payload: string) {
        console.log("topic",topic)
        if(topic=='store-general'){
            
            
        }else if(topic=='order'){
            this.orderHandler.handle(payload)
        }
        else if(topic.startsWith('store')){
            this.storeHandler.handle(payload)
        }
    }
}