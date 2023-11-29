import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ObjetResponse } from "../../../models";
import { OrderResponse } from "./data/response";
import { environment as env } from '../../../../environments/environment'
import { AceptOrderRequest, CancelOrderRequest } from "./data/request";
import { CANCEL_ORDER_STATUS, PREPARING_ORDER_STATUS, READY_ORDER_STATUS } from "src/app/utils/constant";
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http: HttpClient) { }

  getOrders(id:string) {
    let headers: HttpHeaders = new HttpHeaders({
      store_ids:id
    });
    return this.http.get<ObjetResponse<OrderResponse[]>>(env.url.backEnd + "/order",{headers:headers})
  }

  aceptOder(orderId:string,readyToDmAt:number){
    let path="/order/:orderId/status"
    path=path.replace(":orderId",orderId)
    const body={status:PREPARING_ORDER_STATUS,readyToDmAt:readyToDmAt} as AceptOrderRequest
    return this.http.put<ObjetResponse<any>>(env.url.backEnd + path,body)
  }

  readyOder(orderId:string){
    let path="/order/:orderId/status"
    path=path.replace(":orderId",orderId)
    const body={status:READY_ORDER_STATUS} as AceptOrderRequest
    return this.http.put<ObjetResponse<any>>(env.url.backEnd + path,body)
  }

  cancelOrder(orderId: string, cancellation: string){
    let path="/order/:orderId/status"
    path=path.replace(":orderId",orderId)
    const body = {status: CANCEL_ORDER_STATUS, comment: cancellation} as CancelOrderRequest
    return this.http.put<ObjetResponse<any>>(env.url.backEnd + path,body)
  }
}