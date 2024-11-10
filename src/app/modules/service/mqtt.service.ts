import { Injectable } from "@angular/core";
import { Client, ConnectionOptions, Message } from "paho-mqtt";
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
    isMqttConnect:boolean
    client: Client
    message: string = ""
    constructor(private routing: MqttRoutingService) {
        const host = environment.mqttServer.url;
        const wsport = environment.mqttServer.port;
        const path = environment.mqttServer.path;
        const useSSL = environment.mqttServer.useSSL;
        const mqttUser = environment.mqttServer.user;
        const mqttPwd = environment.mqttServer.pwd;
    
        const idTransaccion = uuidv4();
        const clientId = "AgentStore-" + idTransaccion;
        console.log("clientId", clientId);
    
        // Crear cliente MQTT
        this.client = new Client(host, wsport, path, clientId);
    
        // Manejadores de eventos
        this.client.onConnectionLost = (responseObject) => {
          if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:", responseObject.errorMessage);
          }
        };
    
        this.client.onMessageArrived = (message: Message) => {
          console.log("onMessageArrived:", message);
          const topic = message.destinationName;
          const payload = message.payloadString;
          this.routing.route(topic, payload);
        };
    
        // Configuración de conexión
        const connectionOptions = {
          useSSL: useSSL,
          timeout: 3,
          keepAliveInterval: 30,
          onSuccess: () => {
            console.log("Conectado a MQTT");
            this.isMqttConnect = true;
          },
          onFailure: (message) => {
            console.log("CONNECTION FAILURE -", message);
            this.isMqttConnect = false;
          }
        } as Paho.MQTT.ConnectionOptions;
    
        if (mqttUser) {
          connectionOptions.userName = mqttUser;
          connectionOptions.password = mqttPwd;
        }
    
        console.log("environment.mqttServer", environment.mqttServer);
        console.log("connectionOptions", connectionOptions);
        console.log("this.client", this.client);
    
        // Conectar al cliente
        this.client.connect(connectionOptions);
    
        // Reconectar cada 15 segundos si la conexión se pierde
        setInterval(() => {
          if (!this.client.isConnected()) {
            console.log("Intentando reconectar...");
            this.client.connect(connectionOptions);
          }
        }, 15000);
    
    }


    subscribe(channel: string) {
        //console.log("Suscrito a:",channel)
        this.client.subscribe(channel)
    }

    unSubscribe(channel: string) {
        this.client.unsubscribe(channel)
    }
}