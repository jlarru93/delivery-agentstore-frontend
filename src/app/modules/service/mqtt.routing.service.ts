import { Injectable } from "@angular/core";
import { OrderHandler } from "./handlers/order.handler";
import { StoreHandler } from "./handlers/store.handler";
import { ChatHandler } from "./handlers/chat.handler";
import { OpenStoreHandler } from "./handlers/store.open.handler";

@Injectable({
    providedIn: 'root'
})
export class MqttRoutingService{

    constructor(private orderHandler:OrderHandler,private storeHandler:StoreHandler,private chatHandler:ChatHandler,private readonly openStoreHandler:OpenStoreHandler){}

    route(topic:string,payload: string) {
        // debugger
        console.log("topic",topic)
        if(topic=='store-general'){       
        }else if(topic.startsWith("order")){
            this.orderHandler.handle(payload)
        }
        else if(topic.startsWith('store')){
            this.storeHandler.handle(payload)
        }
        else if(topic.startsWith('open/store/')){
            this.openStoreHandler.handle(payload)
        }
        else if(topic.startsWith('chat')){
            this.chatHandler.handle(payload)
        }
    }
    notifyConnection(isConnected:boolean){
        console.log("conectToMqtt",isConnected)
        //this.chatHandler.asyncronousIsConnect=isConnected
    }
}