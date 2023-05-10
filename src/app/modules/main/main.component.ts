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
    constructor(public dialogService: DialogService,private productService: ProductService,private orderService:OrderService,private orderHandler:OrderHandler,private store:OrderHandler){}
    ngOnInit(): void {
      this.productService.getProductsWithOrdersSmall().then(data => this.products = data);
      this.connectMqtt()
      this.getOrders()

    }
    getOrders(){
      this.orderService.getOrders().subscribe((resp)=>{
        this.orders=resp.data.map((it)=>OrderResponse.toBean(it))
        this.shortOrders()
      })
    }
    connectMqtt(){
      this.orderHandler._data.subscribe((data)=>{
        if(data){
          this.title=data
        }
      })
      this.store._data.subscribe((data)=>{
        if(data){
          console.log("ORDER recibida",data)
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

    shortOrders(){
      this.ordersOpen=this.orders.filter((order)=>order.status==OPEN_ORDER_STATUS)
      this.ordersPreparing=this.orders.filter((order)=>order.status==PREPARING_ORDER_STATUS)
      this.ordersReady=this.orders.filter((order)=>order.status==READY_ORDER_STATUS)

      
    }

    aceptOrder(){
      const order=this.orderSelected
      this.loadingButtonAcept=true
      this.orderService.aceptOder(order.id.toString()).subscribe((resp)=>{
        
        order.status=PREPARING_ORDER_STATUS
        this.shortOrders()
        this.displayOrder=false
        this.loadingButtonAcept=false
      },()=>{

        this.loadingButtonAcept=false
      },()=>{
      })
    }
    readyOrder(){
      
    }
    giveOrderToDriver(){

    }

  
}