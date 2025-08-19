import { Injectable } from "@angular/core";
//import { BehaviorSubject, Observable } from "rxjs";
import { MqttRoutingService } from "./mqtt.routing.service";
import { WorkerAction } from "src/app/workers/data";
import { MqttService } from "./mqtt.service";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class WokerHandler{
    public _onConnect: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
    onConnect$ = this._onConnect.asObservable();

    sharedWorker!: SharedWorker;
    isSupportedWorker:boolean=false

    constructor(private routing: MqttRoutingService,private mqttService:MqttService){
        if(this.validateWorkerSupport()){
            this.initSharedWorker()
        }else{
            this.initMqttService()
            
        }
    }
    validateWorkerSupport(){
        return typeof SharedWorker !== 'undefined'
    }

    initSharedWorker() {
        this.isSupportedWorker=true
        //@ts-ignore
        this.sharedWorker = new SharedWorker(new URL('../../workers/app.shared.worker', import.meta.url));
        //this.sharedWorker = new SharedWorker('assets/workers/app.shared.worker.ts');
        this.sharedWorker.port.onmessage = ({ data })=>{
    
            if(data.action==="mqttMessage"){  
                const message=data as WorkerAction<any> /*Paho.MQTT.Message*/
                console.log("onMessageArrived:", message);
                let topic = message.param.destinationName
                let payload = message.param.payloadString
                this.routing.route(topic,payload)
            }else if(data.action==="mqttConnect"){
                console.log('Data received from shared worker ', data.param as boolean);
                this.routing.notifyConnection(data.param as boolean);
                this._onConnect.next(true);
            }else{
                console.log('Data received from shared worker ', data);
            }
        }
        this.sharedWorker.port.onmessageerror = this.onmessageerror
        return true
    }
    initMqttService(){
        this.isSupportedWorker=false
        this.mqttService.init()

    }


    onmessageerror(error){
        console.error('Error message received from shared worker:', error);
    }

    onmessage({ data }){
        
        if(data.action==="mqttMessage"){  
            const message=data as WorkerAction<any> /*Paho.MQTT.Message */
            console.log("onMessageArrived:", message);
            let topic = message.param.destinationName
            let payload = message.param.payloadString
            this.routing.route(topic,payload)
        }else if(data.action==="mqttConnect"){
            console.log('Data received from shared worker ', data.param as boolean);
            //this.routing.notifyConnection(data.param as boolean)
        }else{
            console.log('Data received from shared worker ', data);
        }
    };
    subscribe(channel:string){
        if(this.isSupportedWorker){
            this.sharedWorker.port.postMessage({ action: "subscribe", param: channel });
        }else{
            this.mqttService.subscribe(channel)
        }
        
    }
    unsubscribe(channel:string){
        if(this.isSupportedWorker){
            this.sharedWorker.port.postMessage({ action: "unsubscribe", param: channel });
        }else{
            this.mqttService.unSubscribe(channel)
        }
        
    }
}