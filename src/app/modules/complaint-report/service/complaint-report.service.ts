import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment as env } from 'src/environments/environment';
import { ComplaintResponse, OrderResponse } from './data/response';
import { ObjetResponse } from 'src/app/models';

@Injectable({
  providedIn: 'root'
})
export class ComplaintReportService {

  constructor(
    private http:HttpClient
  ) { }

  getOrderComplaints(){
    return this.http.get<ObjetResponse<OrderResponse>>(env.url.backEnd+"/complaints/agent-store")
  }

  updateComplaintStatus(complaintUuid: string, bodyStatus: any){
    let path = "/complaints/:complaintUuid/status"
    path = path.replace(":complaintUuid", complaintUuid)
    return this.http.put<ObjetResponse<ComplaintResponse>>(env.url.backEnd + path, bodyStatus)
  }
}
