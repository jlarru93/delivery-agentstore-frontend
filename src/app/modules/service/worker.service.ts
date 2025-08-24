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
    public _onConnectWorker: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    onConnectWoker$ = this._onConnectWorker.asObservable();
    public _onConnectWS: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    onConnectWs$ = this._onConnectWS.asObservable();
    public _onConnectAsync: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    onConnectAsync$ = this._onConnectAsync.asObservable();

    sharedWorker!: SharedWorker;
    isSupportedWorker:boolean=false

    constructor(private routing: MqttRoutingService,private mqttService:MqttService){
        const isSupportedWorker=this.validateWorkerSupport()
        console.log("this.validateWorkerSupport()",isSupportedWorker)
        if(isSupportedWorker){
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
                this._onConnectWorker.next(true);
                this._onConnectAsync.next(true);
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
        this.mqttService._onConnect.subscribe((resp)=>{
            this._onConnectWS.next(resp);
            this._onConnectAsync.next(resp)
        })
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