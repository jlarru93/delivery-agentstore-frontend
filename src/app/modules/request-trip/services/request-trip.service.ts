import { Injectable } from '@angular/core';
import {  RequestMotorizedOrigin, RequestTrip } from '../data/request';
import { HttpClient } from '@angular/common/http';
import { ResponseTrip } from '../data/response';
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
    let path = '/near/location';
    return this.http.post<ObjetResponse<ResponseMotorizedOrigin[]>>(env.url.url_back_delivery_man + path, request);

  }
  onLoadingMotorizedService(){

  }
  onGetPaymentOrderService(request : any){
    let path = "/order-trip";
    return this.http.post<ObjetResponse<ResponseTrip>>(env.url.backEnd + path, request);
  }
}
