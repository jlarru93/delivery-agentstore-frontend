import { Injectable } from "@angular/core";
import { OrderService } from "./order.service";
import { OrderHandler } from "../../service/handlers/order.handler";
import { StoreHandler } from "../../service/handlers/store.handler";
import { AudioService } from "../../service/audio.service";
import { OrderBean } from "../data";
import { OrderResponse } from "./data/response";
import { BehaviorSubject, Observable, Subject, map } from "rxjs";
import * as CONSTANTES from "src/app/utils/constant";
import { DataSharedService } from "../../service/data-shared.service";
import { AceptOrderRequest } from "./data/request";
import { ChatHandler } from "../../service/handlers/chat.handler";
import { ChatService } from "./chat.service";
import { ChatResponse } from "./data/chat.response";
import { WokerHandler } from "../../service/worker.service";

@Injectable({
    providedIn: 'root'
  })
export class OrderRepository{

    orders:BehaviorSubject<OrderBean[]>= new BehaviorSubject<OrderBean[]>([]);
    orderChat:Subject<OrderBean>=new Subject<OrderBean>()
    newOrder:BehaviorSubject<OrderBean> = new BehaviorSubject<OrderBean>(null);
    updatedOrder:BehaviorSubject<OrderBean> = new BehaviorSubject<OrderBean>(null);
    orderCancel:BehaviorSubject<OrderBean> = new BehaviorSubject<OrderBean>(null);

    counter:number=0
    intervalMs:number=10000
    interval: NodeJS.Timeout
    timePullRequest:number=3
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
        private mqtt:WokerHandler){
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
    
    cancelOrder(id:string,comment:string){
        return this.orderService.cancelOrder(id,comment).pipe(map((resp)=>{
            const orderCancel=OrderResponse.toBean(resp.data)
            const orders=this.orders.value.filter(o=>o.id!=resp.data.id)
            this.orders.next(orders)
            return orderCancel
        }))
    }
    aceptOder(id: string, readyToDmMinutesAt: number, readyToDmAt?: number) {
        return this.orderService.aceptOder(id+"", readyToDmMinutesAt, readyToDmAt).pipe(map((resp)=>{
            const order=OrderResponse.toBean(resp.data)
            this.addProcess(order)
            this.orders.next(this.orders.value)
        }))
    }
    readyOder(id: string, body: AceptOrderRequest) {
        return this.orderService.readyOder(id+"",body).pipe(map((resp)=>{
            const order=OrderResponse.toBean(resp.data)
            this.addProcess(order)
            this.orders.next(this.orders.value)
        }))
    }
    uploadStoreSelected(){
        this.dataSharedService.listStore$.subscribe((storeIds)=>{
            this.getOrder(storeIds+"")
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

    updateStatus(id: string, json: { uuid:string,status: string; }) {
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
        const storeIds=this.dataSharedService.listStore.value
        this.getOrder(storeIds+"")
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
        const storeIds=this.dataSharedService.listStore.value
        this.getOrder(storeIds+"")
        this.interval=setInterval(()=>{
            if(this.isStop){
                return
            }
            let executeOrder=false
            this.counter++
            /*if(!this.asyncronousIsConnect){
                console.log("asyncronousIsConnect",this.asyncronousIsConnect)
                executeOrder=true
            }*/
            if(this.counter>=this.timePullRequest){
                this.counter=0
                executeOrder=true
            }
            if(executeOrder){
                const storeIds=this.dataSharedService.listStore.value
                this.getOrder(storeIds+"")
            }

        },this.intervalMs)
    }
    private getOrder(storeIds: string){
        console.log('data type?', storeIds)
        this.orderService.getOrders(storeIds).subscribe((resp)=>{
            const storeID = storeIds.split(",")
            const orders=resp.data.map((o)=>OrderResponse.toBean(o))
            const inputOrderId=orders.map(o=>o.id)
            orders.forEach((o)=>{
                try {
                    this.addProcess(o)
                } catch (error) {
                    console.log("error",error)
                }
            })
            
            //this.orders.complete()

            //console.log("Puente",this.orders.value)
            const ordesStoreSelected=this.orders.value.filter((o)=> storeID.includes(o.store.id+""))
            const orderInProcess=ordesStoreSelected.filter((o=>inputOrderId.includes(o.id)))
            this.orders.next(orderInProcess)

            //console.log("Puente y Mega",this.orders.value)
        })
    }

    getOrderById(orderId: number) {
        // return this.orderService.getOrderById(orderId).pipe(
        //     map((resp) => OrderResponse.toBean(resp))
        // );
    }

    private setOrderFromStoreHanlder(){
        this.storeHandler._data.subscribe((orderResponse)=>{
            //console.log("setOrderFromStoreHanlder",orderResponse)
            if(orderResponse?.data){
                const newOrder=OrderResponse.toBean(orderResponse.data)
                this.addProcess(newOrder)
                if(!this.isStop){
                    this.orders.next(this.orders.value)
                }                
            }

            //this.orders.complete()
        })
    }

    private setOrderFromOrderHanlder(){
        this.orderHandler._data.subscribe((orderResponse)=>{
            if(orderResponse.data.status === CONSTANTES.CANCEL_ORDER_STATUS){
                const orderCancel=OrderResponse.toBean(orderResponse.data)
                const orders = this.orders.value.filter(order => order.uuid !== orderResponse.data.uuid)
                this.orderCancel.next(orderCancel)
                if(!this.isStop){
                    this.orders.next(orders)
                }
            } else {
                const newOrder=OrderResponse.toBean(orderResponse.data)
                this.orderCancel.next(newOrder)
                this.addProcess(newOrder)
                //this.orders.complete()
                if(!this.isStop){
                    this.orders.next(this.orders.value)
                }              

            }
        })
    }
    private addProcess(newOrder: OrderBean){
        const orders=this.orders.value
        const indexOrder=orders.findIndex(o=>o.id===newOrder.id)
        const isNewOrder=indexOrder==-1
        if(isNewOrder){
            //console.log("ADD")
            orders.push(newOrder)
            this.addNewOrder(newOrder)
            if(newOrder.statusForAgentStore===CONSTANTES.OPEN_ORDER_STATUS){
                console.log("play Audio by:::: ",JSON.stringify(newOrder))
                this.playAudio()
            }
        }else{
            //console.log("UPDATE")
            newOrder.messagesChat=orders[indexOrder].messagesChat
            newOrder.showButton=orders[indexOrder].showButton
            newOrder.messagesNoReadTotal=orders[indexOrder].messagesNoReadTotal
            orders[indexOrder]=newOrder
            this.updateOrder(newOrder)
        }       
        //console.log("addProcess.orders",orders) 
    }
    private updateOrder(newOrder:OrderBean){
        //this.updatedOrder.next(newOrder)
        //console.log("se acutlaizo ",newOrder.id)
    }
    private addNewOrder(newOrder:OrderBean){
        this.subscribeOrder(newOrder.uuid)
        this.subscribeChat(newOrder.uuid)
        if(newOrder.status===CONSTANTES.OPEN_ORDER_STATUS){
            console.log("play Audio by:::: ",JSON.stringify(newOrder))
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