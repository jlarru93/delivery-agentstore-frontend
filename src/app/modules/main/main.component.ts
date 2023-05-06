import { Component, OnInit } from "@angular/core";
import { ConfirmationService, MessageService } from 'primeng/api';
import { Product } from "src/app/demo/domain/product";
import { ProductService } from "src/app/demo/service/productservice";
import { OrderHandler } from "../service/handlers/order.handler";
//import { MqttService } from "../service/mqtt.service";
import { OrderService } from "./service/order.service";
import { OrderResponse } from "./service/data/response";
@Component({
    selector: 'app-stores',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    providers: [ConfirmationService, MessageService]
  })
  export class MainComponent implements OnInit {
    minutes: number = 2;
    displayOrder:boolean=true
    products: Product[];
    title:string="Aceptar"
    constructor(private productService: ProductService,private orderService:OrderService,private orderHandler:OrderHandler,private store:OrderHandler){}
    ngOnInit(): void {
      this.productService.getProductsWithOrdersSmall().then(data => this.products = data);
      this.orderService.getOrders().subscribe((resp)=>{
        const order=resp.data.map((it)=>OrderResponse.toBean(it))
        console.log("ORDER",order)
      })
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
  
}