import { Injectable } from '@angular/core';
import {  RequestMotorizedOrigin, RequestOrderPayment, RequestTrip } from '../data/request';
import { HttpClient } from '@angular/common/http';
import { ResponseLoadingOrder, ResponseOrderPayment, ResponseTrip } from '../data/response';
import { ObjetResponse } from 'src/app/models';
import {environment as env} from '../../../../environments/environment'
import { ResponseMotorizedOrigin } from '../data/response';
@Injectable({
  providedIn: 'root'
})
export class RequestTripService {

  constructor( private http:HttpClient
    ) { }

  onSaveOrderService(request : RequestTrip){
    let path = "/order-trip";
    return this.http.post<ObjetResponse<ResponseTrip>>(env.url.backEnd + path, request);
  }
  onGetMotorizedPositionService(request : RequestMotorizedOrigin){
    let path = '/delivery-man/near/location';
    return this.http.post<ObjetResponse<ResponseMotorizedOrigin[]>>(env.url.url_back_tracking + path, request);

  }
  onLoadingMotorizedService(){
    let path = "/order-trip";
    return this.http.get<ObjetResponse<ResponseLoadingOrder[]>>(env.url.backEnd + path);
  }
  onGetPaymentOrderService(request : RequestOrderPayment){
    let path = "/order-trip/delivery/price";
    return this.http.post<ObjetResponse<ResponseOrderPayment>>(env.url.backEnd + path, request);
  }
  onCancelOrderService(id : number ){
    let path = "/order-trip/:id/cancel";
    return this.http.delete<ObjetResponse<ResponseOrderPayment>>(env.url.backEnd + path.replace(':id',id.toString()));
  }
}
