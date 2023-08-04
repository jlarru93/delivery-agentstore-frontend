import { Injectable } from '@angular/core';
import { RequestTrip } from '../data/request';
import { HttpClient } from '@angular/common/http';
import { ResponseTrip } from '../data/response';
import { ObjetResponse } from 'src/app/models';
import {environment as env} from '../../../../environments/environment'
@Injectable({
  providedIn: 'root'
})
export class RequestTripService {

  constructor( private http:HttpClient
    ) { }

  onSaveOrderService(request : RequestTrip){
    let path = "/order-trip"
    return this.http.post<ObjetResponse<ResponseTrip>>(env.url.backEnd + path, request)
  }
  onGetMotorizedPositionService(){

  }
  onLoadingMotorizedService(){

  }
}
