import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ObjetResponse, Pagination } from 'src/app/models';
import { ComplaintResponse, OrderHistoryResponse } from './data/response';
import {environment as env} from '../../../../environments/environment'
import { Observable } from 'rxjs';
import { OrderResponse } from '../../main/service/data/response';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {

  constructor(
    private http:HttpClient
  ) { }

  //{{BaseUrl}}/order/complaints/filter
  getOrderHistories(bodyRequest: any) {
    
    return this.http.post<ObjetResponse<OrderResponse[]>>(
      env.url.backendOrder + "/order/filterV2/agent-store",bodyRequest);
  }

  // {{BaseUrl}}/complaints/:complaintUuid/status
  updateComplaintStatus(complaintUuid: string, bodyStatus: any){

    let path = "/complaints/:complaintUuid/status"
    path = path.replace(":complaintUuid", complaintUuid)
    return this.http.put<ObjetResponse<ComplaintResponse>>(env.url.backEnd + path, bodyStatus)
  }
}
