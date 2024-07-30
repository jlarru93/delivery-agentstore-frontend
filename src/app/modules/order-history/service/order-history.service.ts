import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ObjetResponse, Pagination } from 'src/app/models';
import { ComplaintResponse, OrderHistoryResponse } from './data/response';
import {environment as env} from '../../../../environments/environment'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {

  constructor(
    private http:HttpClient
  ) { }

  //{{BaseUrl}}/order/complaints/filter
  getOrderHistories(bodyRequest: any, pagination: Pagination) {
    
    let headers:HttpHeaders=new HttpHeaders({
      size:pagination.size.toString(),
      page:pagination.page.toString()
    });

    return this.http.post<OrderHistoryResponse>(
      env.url.backEnd + "/order/complaints/filter/agent-store",bodyRequest,{headers:headers}
    );
  }

  // {{BaseUrl}}/complaints/:complaintUuid/status
  updateComplaintStatus(complaintUuid: string, bodyStatus: any){

    let path = "/complaints/:complaintUuid/status"
    path = path.replace(":complaintUuid", complaintUuid)
    return this.http.put<ObjetResponse<ComplaintResponse>>(env.url.backEnd + path, bodyStatus)
  }
}
