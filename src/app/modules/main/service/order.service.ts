import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ObjetResponse } from "../../../models";
import { OrderResponse, UnreadMessagesResponse } from "./data/response";
import { environment as env } from '../../../../environments/environment'
import { AceptOrderRequest, CancelOrderRequest } from "./data/request";
import { CANCEL_ORDER_STATUS, PREPARING_ORDER_STATUS, READY_ORDER_STATUS } from "src/app/utils/constant";
import { OrderBean } from "../data";
import { url } from "inspector";
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http: HttpClient) { }
  
  getOrders(id:any) {
    let headers: HttpHeaders = new HttpHeaders({
      store_ids:id
    });
    return this.http.get<ObjetResponse<OrderResponse[]>>(env.url.backendOrder + "/order/operation/store/agent-store",{headers:headers})
  }

  getOrderById(orderId:number){
    //return this.http.get<OrderResponse>(env.url.backEnd + "/order/"+orderId)
  }

  aceptOder(orderId:string,readyToDmAt:number){
    let path="/order/:orderId/statusOrder/agent-store"
    path=path.replace(":orderId",orderId)
    const body={uuid:orderId,status:PREPARING_ORDER_STATUS,readyToDmMinutesAt:readyToDmAt} as AceptOrderRequest
    return this.http.put<ObjetResponse<OrderResponse>>(env.url.backendOrder + path,body)
  }

  readyOder(orderId:string,body:any){
    let path="/order/:orderId/statusOrder/agent-store"
    path=path.replace(":orderId",orderId)    
    return this.http.put<ObjetResponse<OrderResponse>>(env.url.backendOrder + path,body)
  }

  cancelOrder(orderId: string, cancellation: string){
    let path="/order/:orderId/statusOrder/agent-store"
    path=path.replace(":orderId",""+orderId)
    const body = {uuid:orderId,status: CANCEL_ORDER_STATUS, comment: cancellation} as CancelOrderRequest
    return this.http.put<ObjetResponse<OrderResponse>>(env.url.backendOrder + path,body)
  }
  updateReadyToDm(data:any){
    var url = env.url.backendOrder+'/order/readyToDm/agent-store'
    return this.http.put<ObjetResponse<OrderResponse>>(url,data)
  }

  selfManagedOrder(uuid:any){
    var url = env.url.backendOrder+`/order/${uuid}/selfManaged/agent-store`
    return this.http.put<ObjetResponse<OrderResponse>>(url,{})
  }

  updateStatus(id:any,json:any){
    var url = env.url.backendOrder+`/order/${id}/statusOrder/agent-store`
    return this.http.put<ObjetResponse<OrderResponse>>(url,json)
  }

  // /chat/message/NoReadTotal/agentstore
  onGetUnreadMessages(request){
    let path = '/chat/message/NoReadTotal/agentstore'
    return this.http.post<ObjetResponse<UnreadMessagesResponse[]>>(env.url.util_banckEnd + path, request)
  }
  updateReceivedByStoreMethodAvailable(uuid: string, received_by_store_method: string) {
    let path = '/order/' + uuid + '/receivedByStoreMethod/agent-store'
    return this.http.put<ObjetResponse<OrderResponse>>(env.url.backendOrder + path, { received_by_store_method: received_by_store_method })
  }
}