import { Component, OnInit } from "@angular/core";
import { ConfirmationService, MessageService } from 'primeng/api';
import { Product } from "src/app/demo/domain/product";
import { ProductService } from "src/app/demo/service/productservice";
import { OrderHandler } from "../service/handlers/order.handler";
//import { MqttService } from "../service/mqtt.service";
import { OrderService } from "./service/order.service";
import { OrderResponse } from "./service/data/response";
import { OrderBean } from "./data";
import { DialogService } from "primeng/dynamicdialog";
import { OrderDialogComponent } from "./dialog/orderDialog.component";
import { PREPARING_ORDER_STATUS, OPEN_ORDER_STATUS, READY_ORDER_STATUS } from "src/app/utils/constant";
import { MqttService } from "../service/mqtt.service";
import { StoreHandler } from "../service/handlers/store.handler";
@Component({
    selector: 'app-stores',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    providers: [ConfirmationService, MessageService,DialogService]
  })
  export class MainComponent implements OnInit {
    minutes: number = 2;
    displayOrder:boolean=false
    products: Product[];
    orders:OrderBean[]
    ordersOpen:OrderBean[]
    ordersPreparing:OrderBean[]
    ordersReady:OrderBean[]
    orderSelected:OrderBean


    title:string="Aceptar"

    loadingButtonAcept:boolean=false
    //valid that mqtt and ordes is ready to subscribe
    isMqttConnect:boolean=false
    isDoneGetOrders:boolean=false

    constructor(public dialogService: DialogService,private productService: ProductService,private orderService:OrderService,private mqtt:MqttService,private orderHandler:OrderHandler,private storeHandler:StoreHandler){}
    ngOnInit(): void {
      console.log("MAIN")
      this.productService.getProductsWithOrdersSmall().then(data => this.products = data);
      this.getOrders()
      this.mqtt._onConnect.subscribe((isConnect)=>{
        if(isConnect){
          this.isMqttConnect=isConnect
          this.mqttListener()
          this.validOrdersSubscribe()
        }
      })
    }

    validOrdersSubscribe(){
      if(this.isMqttConnect && this.isDoneGetOrders){
        this.orders.forEach((order)=>this.subscribeOrder(order.uuid))
      }
    }

    getOrders(){
      this.orderService.getOrders().subscribe((resp)=>{
        this.orders=resp.data.map((it)=>OrderResponse.toBean(it))
        this.sortOrders()
        this.isDoneGetOrders=true
        this.validOrdersSubscribe()
      })
    }
    mqttListener(){
      this.orderHandler._data.subscribe((asyncData)=>{
        if(asyncData){
          let orderMqtt=OrderResponse.toBean(asyncData.data)
          let orderIndex=this.orders.findIndex((order)=>order.id === orderMqtt.id)
          this.orders[orderIndex]=orderMqtt
          console.log(orderMqtt)
          this.sortOrders()
        }
      })
      this.storeHandler._data.subscribe((asyncData)=>{
        if(asyncData){
          let orderMqtt=OrderResponse.toBean(asyncData.data)
          this.orders.push(orderMqtt)
          this.sortOrders()
          this.subscribeOrder(orderMqtt.uuid)
        }
      })
    }
    openOrderDialog(order:OrderBean){
      this.displayOrder=true
      this.orderSelected=order
      /*this.dialogService.open(
        OrderDialogComponent
        ,{
        header: 'Choose a Product',
        width: '70%',
        contentStyle: { 'max-height': '500px', overflow: 'auto' },
        baseZIndex: 10000,
      })*/
    }

    sortOrders(){
      this.ordersOpen=this.orders.filter((order)=>order.status==OPEN_ORDER_STATUS)
      this.ordersPreparing=this.orders.filter((order)=>order.status==PREPARING_ORDER_STATUS)
      this.ordersReady=this.orders.filter((order)=>order.status==READY_ORDER_STATUS)

      
    }

    aceptOrder(){
      const order=this.orderSelected
      this.loadingButtonAcept=true
      this.orderService.aceptOder(order.id.toString()).subscribe((resp)=>{
        this.displayOrder=false
        this.loadingButtonAcept=false
      },()=>{

        this.loadingButtonAcept=false
      },()=>{
      })
    }
    readyOrder(){
      const order=this.orderSelected
      this.loadingButtonAcept=true
      this.orderService.readyOder(order.id.toString()).subscribe((resp)=>{
        this.displayOrder=false
        this.loadingButtonAcept=false
      },()=>{

        this.loadingButtonAcept=false
      },()=>{
      })
    }
    giveOrderToDriver(){

    }

  
    subscribeOrder(orderUuid:string){
      this.mqtt.subscribe("order/"+orderUuid)
    }
}