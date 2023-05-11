import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ObjetResponse } from "../../../models";
import { OrderResponse } from "./data/response";
import { environment as env } from '../../../../environments/environment'
import { AceptOrderRequest } from "./data/request";
import { PREPARING_ORDER_STATUS, READY_ORDER_STATUS } from "src/app/utils/constant";
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http: HttpClient) { }

  getOrders() {
    return this.http.get<ObjetResponse<OrderResponse[]>>(env.url.backEnd + "/order")
  }

  aceptOder(orderId:string){
    let path="/order/:orderId/status"
    path=path.replace(":orderId",orderId)
    const body={status:PREPARING_ORDER_STATUS} as AceptOrderRequest
    return this.http.put<ObjetResponse<any>>(env.url.backEnd + path,body)
  }

  readyOder(orderId:string){
    let path="/order/:orderId/status"
    path=path.replace(":orderId",orderId)
    const body={status:READY_ORDER_STATUS} as AceptOrderRequest
    return this.http.put<ObjetResponse<any>>(env.url.backEnd + path,body)
  }
}