import { Injectable } from "@angular/core";
import {
  RequestMotorizedOrigin,
  RequestOrderPayment,
  RequestTrip,
} from "../data/request";
import { HttpClient } from "@angular/common/http";
import {
  PolygonResponse,
  ResponseLoadingOrder,
  ResponseOrderPayment,
  ResponseTrip,
  ZoneResponse
} from "../data/response";
import { ObjetResponse } from "src/app/models";
import { environment as env } from "../../../../environments/environment";
import { ResponseMotorizedOrigin } from "../data/response";
import { AddressSuggestionResponse, ResponseTrackingMotorized } from "../../order-course/data/response";
@Injectable({
  providedIn: "root",
})
export class RequestTripService {
  constructor(private http: HttpClient) {}

  onSaveOrderService(request: RequestTrip,zoneId:string) {
    return this.http.post<ObjetResponse<ResponseTrip>>(
      env.url.backendOrder + "/order/zone/"+Number(zoneId)+"/agent-store",
      request
    );
  }

  onUpdateOrderService(request: RequestTrip){
    let path = "/order/:uuid/agent-store"
    path = path.replace(':uuid', request.uuid)
    return this.http.put<ObjetResponse<ResponseTrip>>(
      env.url.backendOrder + path, request
    )
  }

  onGetMotorizedPositionService(request: RequestMotorizedOrigin) {
    let path = "/delivery-man/near/location";
    return this.http.post<ObjetResponse<ResponseMotorizedOrigin[]>>(
      env.url.url_back_tracking + path,
      request
    );
  }
  onLoadingMotorizedService() {
    const request = {
      "filters":[
          {"field":"type","value":[env.TYPE_ORDER_TRADITIONAL,env.TYPE_ORDER_SEND_AND_RECIVE_ORDER], "condition": "in"},
          {"field":"status","value":[env.STATUS_COMPLAINT_DONE, env.STATUSORDER_CANCEL, env.STATUSORDER_PENDING_PAYMENT, env.STATUSORDER_REJECT_PAYMENT], "condition":"nin"},
          {"field":"isSelfManaged","value":true,"condition":"nin"},
          {"field":"isPickUpStore","value":true,"condition":"nin"}
      ]
  }
  return this.http.post<ObjetResponse<ResponseLoadingOrder[]>>(
      env.url.backendOrder + "/order/filterV2/agent-store",request
    );
  }
  onGetPaymentOrderService(request: RequestOrderPayment) {
    let path = "/order/delivery/price/agent-store";
    return this.http.post<ObjetResponse<ResponseOrderPayment>>(
      env.url.backendOrder + path,
      request
    );
  }
  onCancelOrderService(id: string,request:any) {
    let path = "/order/:id/cancel/agent-store";

    return this.http.put<ObjetResponse<ResponseOrderPayment>>(
      env.url.backendOrder + path.replace(":id", id.toString()),request
    );
  }
  onViewTrackingMotorizedService(uuid: string) {
    let path = "/orderTrackings/order/:uuid/lastRouter/agentStore";
    return this.http.get<ObjetResponse<ResponseTrackingMotorized>>(
      env.url.url_back_tracking + path.replace(":uuid", uuid.toString())
    );
  }
  //http://dev-api.tres22.net/delivery-zone/zone/:zoneid/agent/store
  onGetPolygonZone(){
    let store = JSON.parse(localStorage.getItem('storeBean'))
    let path = "/zone/:zoneid/agent/store"
    path = path.replace(':zoneid',store.zoneId)
    return this.http.get<ObjetResponse<ZoneResponse>>(env.url.backEnd_Zone + path)
  }

  onGetSuggestionAddress(word,storeId){
    let zone = JSON.parse(localStorage.getItem('zoneResponse'))
    let request = {
      word: word,
      zoneId: zone.id,
      storeId: storeId
    }
    return this.http.post<ObjetResponse<AddressSuggestionResponse[]>>(env.url.util_banckEnd + '/gmap/autoComplete/agent-store',request)
  }

  onGeoCodeUser(request){
    return this.http.post<ObjetResponse<any>>(env.url.util_banckEnd + '/gmap/geoCode/agent-store', request)
  }

  ///gmap/geoCodeInverse/user
  onGeoCodeInverseUser(request){
    return this.http.post<ObjetResponse<any>>(env.url.util_banckEnd + '/gmap/geoCodeInverse/agent-store', request)
  }
}
