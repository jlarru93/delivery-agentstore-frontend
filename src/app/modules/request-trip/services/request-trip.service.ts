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

  onSaveOrderService(request: RequestTrip) {
    let path = "/order-trip";
    return this.http.post<ObjetResponse<ResponseTrip>>(
      env.url.backEnd + path,
      request
    );
  }

  onUpdateOrderService(request: RequestTrip){
    let path = "/order-trip/:uuid"
    path = path.replace(':uuid', request.uuid)
    return this.http.put<ObjetResponse<ResponseTrip>>(
      env.url.backEnd + path, request
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
    let path = "/order-trip";
    return this.http.get<ObjetResponse<ResponseLoadingOrder[]>>(
      env.url.backEnd + path
    );
  }
  onGetPaymentOrderService(request: RequestOrderPayment) {
    let path = "/order-trip/delivery/price";
    return this.http.post<ObjetResponse<ResponseOrderPayment>>(
      env.url.backEnd + path,
      request
    );
  }
  onCancelOrderService(id: string) {
    let path = "/order-trip/:id/cancel";
    return this.http.delete<ObjetResponse<ResponseOrderPayment>>(
      env.url.backEnd + path.replace(":id", id.toString())
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
