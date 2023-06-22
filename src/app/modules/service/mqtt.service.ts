import { Injectable } from "@angular/core";
import { Client } from "paho-mqtt";
import { v4 as uuidv4 } from 'uuid';
import { MqttRoutingService } from "./mqtt.routing.service";
import { threadId } from "worker_threads";
import { BehaviorSubject } from "rxjs";
import { environment } from "src/environments/environment";
@Injectable({
    providedIn: 'root'
})
export class MqttService {
    public _onConnect: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
    onConnect$ = this._onConnect.asObservable();

    client: Client
    message: string = ""
    constructor(private routing: MqttRoutingService) {
        let host = environment.mqttServer.url
        let wsport = environment.mqttServer.port
        let idTransaccion = uuidv4();
        const clientId = "AgentStore-" + idTransaccion;

        this.client = new Client(host, wsport, "/ws", clientId);
        // set callback handlers
        // called when the client loses its connection
        this.client.onConnectionLost = (responseObject: Paho.MQTT.MQTTError) => {
            if (responseObject.errorCode !== 0) {
                console.log("onConnectionLost:" + responseObject.errorMessage);
            }
        };
        // called when a message arrives
        this.client.onMessageArrived = (message: Paho.MQTT.Message) => {
            console.log("onMessageArrived:", message);
            let topic = message.destinationName
            let payload = message.payloadString
            this.routing.route(topic,payload)
        };
        // connect the client
        this.client.connect({
            timeout: 3,
            keepAliveInterval: 30,
            onSuccess: () => {
                // Once a connection has been made, make a subscription and send a message.
                console.log("onConnect");
                this._onConnect.next(true)
            },
            onFailure: (message) => {
                console.log("CONNECTION FAILURE - ", message);
                this._onConnect.next(false)
            }
        });
    }


    subscribe(channel: string) {
        console.log("Suscrito a:",channel)
        this.client.subscribe(channel)
    }

    unSubscribe(channel: string) {
        this.client.unsubscribe(channel)
    }
}