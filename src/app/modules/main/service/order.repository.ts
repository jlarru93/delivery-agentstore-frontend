import { Injectable } from "@angular/core";
import { OrderService } from "./order.service";
import { OrderHandler } from "../../service/handlers/order.handler";
import { StoreHandler } from "../../service/handlers/store.handler";
import { AudioService } from "../../service/audio.service";
import { MqttService } from "../../service/mqtt.service";
import { OrderBean } from "../data";
import { OrderResponse } from "./data/response";
import { BehaviorSubject, Subject, map } from "rxjs";
import * as CONSTANTES from "src/app/utils/constant";
import { DataSharedService } from "../../service/data-shared.service";
import { AceptOrderRequest } from "./data/request";
import { ChatHandler } from "../../service/handlers/chat.handler";
import { ChatService } from "./chat.service";
import { ChatResponse } from "./data/chat.response";

@Injectable({
    providedIn: 'root'
  })
export class OrderRepository{

    orders:BehaviorSubject<OrderBean[]>= new BehaviorSubject<OrderBean[]>([]);
    orderChat:Subject<OrderBean>=new Subject<OrderBean>()
    newOrder:BehaviorSubject<OrderBean> = new BehaviorSubject<OrderBean>(null);
    updatedOrder:BehaviorSubject<OrderBean> = new BehaviorSubject<OrderBean>(null);

    counter:number=0
    intervalMs:number=10000
    interval: NodeJS.Timeout
    timePullRequest:number=30
    isStop=false
    public asyncronousIsConnect:boolean=false

    
    constructor(
        private orderService:OrderService,
        private orderHandler:OrderHandler,
        private storeHandler:StoreHandler,
        private audioService:AudioService,
        private dataSharedService:DataSharedService,
        private chatHandler:ChatHandler,
        private chatService:ChatService ,
        private mqtt:MqttService){
            this.setOrderFromOrderHanlder()
            this.setOrderFromStoreHanlder()
            this.setOrderChatFromChatHanlder()
            this.pullRequest()
            this.uploadStoreSelected()
    }
    setOrderChatFromChatHanlder(){
        this.chatHandler._data.subscribe((asyncData)=>{
            if(asyncData && asyncData.data.uuid){
              let messageBean=ChatResponse.toBean(asyncData.data)
              const orders=this.orders.value
              let orderIndex=orders.findIndex((order)=>order.uuid==messageBean.uuidOrder)
              const order=orders[orderIndex]
              order.messagesNoReadTotal++
    
              let indexMessage=order.messagesChat.findIndex((message)=>message.uuid==messageBean.uuid)
              if(indexMessage>0){
                order.messagesChat[indexMessage]=messageBean
              }else{
                order.messagesChat.push(messageBean)
              }
              this.orderChat.next(order)
            }
          })
    }
    
    cancelOrder(id:number,comment:string){
        return this.orderService.cancelOrder(id,comment).pipe(map((resp)=>{
            const orderCancel=OrderResponse.toBean(resp.data)
            const orders=this.orders.value.filter(o=>o.id!=resp.data.id)
            this.orders.next(orders)
            return orderCancel
        }))
    }
    aceptOder(id: number, readyToDmAt: number) {
        return this.orderService.aceptOder(id+"",readyToDmAt).pipe(map((resp)=>{
            const order=OrderResponse.toBean(resp.data)
            this.addProcess(order)
            this.orders.next(this.orders.value)
        }))
    }
    readyOder(id: number, body: AceptOrderRequest) {
        return this.orderService.readyOder(id+"",body).pipe(map((resp)=>{
            const order=OrderResponse.toBean(resp.data)
            this.addProcess(order)
            this.orders.next(this.orders.value)
        }))
    }
    uploadStoreSelected(){
        this.dataSharedService.listStore$.subscribe((storeIds)=>{
            this.getOrder(storeIds)
        })
    }

    updateReadyToDm(json: { uuid: string; readyToDmAt: number; readyToDmMinutesAt: number; }) {
        return this.orderService.updateReadyToDm(json).pipe(map((resp)=>{
            const order=OrderResponse.toBean(resp.data)
            this.addProcess(order)
            this.orders.next(this.orders.value)
        }))
    }

    selfManagedOrder(uuid: string) {
        return this.orderService.selfManagedOrder(uuid).pipe(map((resp)=>{
            const order=OrderResponse.toBean(resp.data)
            this.addProcess(order)
            this.orders.next(this.orders.value)
        }))
    }

    updateStatus(id: number, json: { status: string; }) {
        return this.orderService.updateStatus(id,json).pipe(map((resp)=>{
            const order=OrderResponse.toBean(resp.data)
            this.addProcess(order)
            this.orders.next(this.orders.value)
        }))
    }

    destroy(){
        clearInterval(this.interval)
    }

    start(){
        this.isStop=false
    }
    stop(){
        this.isStop=true
    }
    playAudio(){
        this.audioService.onPlayAudio()
    }
    stopAudio(){
        this.audioService.stopAudio()
    }
    private pullRequest(){
        this.interval=setInterval(()=>{
            if(this.isStop){
                return
            }
            this.counter++
            if(this.counter!=this.timePullRequest){
                return
            }
            if(!this.asyncronousIsConnect){
                console.log("pullRequest")
                const storeIds=this.dataSharedService.listStore.value
                console.log("storeIds",storeIds)
                this.getOrder(storeIds)
            }else{
                console.log("pullRequest no ejecutado")
            }
            if(this.counter>this.timePullRequest){
                this.counter=0
            }
        },this.intervalMs)
    }
    private getOrder(storeIds){
        this.orderService.getOrders(storeIds).subscribe((resp)=>{
            const orders=resp.data.map((o)=>OrderResponse.toBean(o))
            orders.forEach((o)=>{
                this.addProcess(o)
            })
            //this.orders.complete()
            console.log("this.orders.value",this.orders.value)
            this.orders.next(this.orders.value)
        })
    }

    private setOrderFromStoreHanlder(){
        this.storeHandler._data.subscribe((orderResponse)=>{
            console.log("setOrderFromStoreHanlder",orderResponse)
            const newOrder=OrderResponse.toBean(orderResponse.data)
            this.addProcess(newOrder)
            this.orders.next(this.orders.value)
            //this.orders.complete()
        })
    }

    private setOrderFromOrderHanlder(){
        this.orderHandler._data.subscribe((orderResponse)=>{
            const newOrder=OrderResponse.toBean(orderResponse.data)
            this.addProcess(newOrder)
            //this.orders.complete()
            this.orders.next(this.orders.value)
        })
    }
    private addProcess(newOrder: OrderBean){
        const orders=this.orders.value
        const indexOrder=orders.findIndex(o=>o.id===newOrder.id)
        const isNewOrder=indexOrder==-1
        if(isNewOrder){
            console.log("ADD")
            orders.push(newOrder)
            this.addNewOrder(newOrder)
            if(newOrder.statusForAgentStore===CONSTANTES.OPEN_ORDER_STATUS){
                this.playAudio()
            }
        }else{
            console.log("UPDATE")
            newOrder.messagesChat=orders[indexOrder].messagesChat
            newOrder.showButton=orders[indexOrder].showButton
            newOrder.messagesNoReadTotal=orders[indexOrder].messagesNoReadTotal
            orders[indexOrder]=newOrder
            this.updateOrder(newOrder)
        }       
        console.log("addProcess.orders",orders) 
    }
    private updateOrder(newOrder:OrderBean){
        //this.updatedOrder.next(newOrder)
        console.log("se acutlaizo ",newOrder.id)
    }
    private addNewOrder(newOrder:OrderBean){
        this.subscribeOrder(newOrder.uuid)
        this.subscribeChat(newOrder.uuid)
        if(newOrder.status===CONSTANTES.OPEN_ORDER_STATUS){
            this.playAudio()
        }
        //this.newOrder.next(newOrder)
    }    

    subscribeOrder(orderUuid:string){
        this.mqtt.subscribe("order/"+orderUuid)
    }
    subscribeChat(orderUuid:string){
        this.mqtt.subscribe("chat/"+orderUuid)
    }
}