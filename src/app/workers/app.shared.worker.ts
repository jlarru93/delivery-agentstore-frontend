/// <reference lib="webworker" />
import { Client, ConnectionOptions } from "paho-mqtt";
import { BehaviorSubject } from "rxjs";
import { v4 as uuidv4 } from 'uuid';
import { WorkerAction } from './data'
import { environment } from '../../environments/environment'
const connections: MessagePort[] = [];
console.log("SharedWorker")
//vairable a nivel de serviceWork

var clientMqtt: Client
var _onConnect: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
var onConnect$ = _onConnect.asObservable();
let val = 1;

let channelsSubscripted: string[] = []

//@ts-ignore
self.onconnect = (connectEvent: MessageEvent<WorkerAction>) => {
  console.log("inicio WORKER")
  const port = connectEvent.ports[0];
  connections.push(port);

  port.onmessage = (requestMessageEvent: MessageEvent<WorkerAction<any>>) => {
    val++
    console.log('worker got message: ', requestMessageEvent);
    // throw new Error('Test error from worker');
    if (requestMessageEvent.data.action === 'subscribe') {
      subscribe(requestMessageEvent.data.param)
      const resp = { action: "subscribe", param: "se envio suscripcion a " + requestMessageEvent.data.param } as WorkerAction<string>
      connections.forEach(connection => connection.postMessage(resp));
    }
    if (requestMessageEvent.data.action === 'unsubscribe') {
      unSuscribe(requestMessageEvent.data.param)
      const resp = { action: "unsubscribe", param: "se envio suscripcion a " + requestMessageEvent.data.param } as WorkerAction<string>
      connections.forEach(connection => connection.postMessage(resp));
    } else if (requestMessageEvent.data.action === 'terminate') {
      self.close();
    }
  };
};

function getMqttClient() {


  if (!clientMqtt) {
    const idTransaccion = uuidv4();
    const clientId = "AgentStore-" + idTransaccion;
    const server=environment.mqttServer.url
    const port=environment.mqttServer.port_mqtt
    clientMqtt = new Client(server, port, clientId);
    configMqttClient()
  }
  if (!clientMqtt.isConnected()) {
    let connectionOptions = {
      useSSL: true,
      timeout: 3,
      reconnect:true,
      keepAliveInterval: 30,
      userName: environment.mqttServer.user,
      password: environment.mqttServer.pwd,
      onSuccess: () => {
        console.log("CONECCION SATISFACTORIA")
        connections.forEach(connection => connection.postMessage({ action: "mqttConnect", param: true }));
        connections.forEach(connection => connection.postMessage("conectado"));
        channelsSubscripted.forEach((channel => subscribe(channel)))
        _onConnect.next(true)
      },
      onFailure: (message) => {
        console.log("CONNECTION FAILURE - ", message);
        connections.forEach(connection => connection.postMessage("fallo la conexxion"));
        _onConnect.next(false)
      }
    } as ConnectionOptions
    clientMqtt.connect(connectionOptions);
  }
  return clientMqtt
}

function configMqttClient() {
  clientMqtt.onConnectionLost = (responseObject: Paho.MQTT.MQTTError) => {
    if (responseObject.errorCode !== 0) {
      connections.forEach(connection => connection.postMessage({ action: "mqttConnect", param: false }));
    }
  };
  // called when a message arrives
  clientMqtt.onMessageArrived = (message: Paho.MQTT.Message) => {
    console.log("onMessageArrived:", message);
    if(!message.duplicate){
      connections.forEach(connection => connection.postMessage({ action: "mqttMessage", param: message }));
    }
  };
}

function subscribe(topic: string) {
  channelsSubscripted.push(topic)
  if (!clientMqtt || !clientMqtt.isConnected()) {
    getMqttClient()
    _onConnect.subscribe((isconect) => {
      if (isconect) {
        clientMqtt.subscribe(topic, { qos: 2, onSuccess: () => connections.forEach(connection => connection.postMessage("susbrito a " + topic)) })
      }
    })
  } else {
    clientMqtt.subscribe(topic, { qos: 2, onSuccess: () => connections.forEach(connection => connection.postMessage("susbrito a " + topic)) })
  }
}

function unSuscribe(unsubcribeTopic: string) {
  channelsSubscripted = channelsSubscripted.filter((topic) => topic != unsubcribeTopic)
  if (clientMqtt && clientMqtt.isConnected()) {
    clientMqtt.unsubscribe(unsubcribeTopic)
  }
}