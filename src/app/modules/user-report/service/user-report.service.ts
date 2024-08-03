import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ObjetResponse, Pagination } from 'src/app/models';
import { environment as env } from 'src/environments/environment';
import { UserReportResponse } from './response';

@Injectable({
  providedIn: 'root'
})
export class UserReportService {

  constructor(
    private http:HttpClient
  ) { }

  // http://dev-api.tres22.net/agent-store/user
  getUserReportList(request,pagination: Pagination){
    let headers:HttpHeaders=new HttpHeaders({
      size:pagination.size.toString(),
      page:pagination.page.toString()
    });
    return this.http.post<ObjetResponse<UserReportResponse[]>>(env.url.backEndUser+"/user/profile/filter/agent-store",request, {headers: headers});
  }

  //https://dev-api.delivery-app.net/agent-store/user/{user_id}/address
  //https://dev-api.tres22.net/user/user/135/address/agent-store
  getUsersDirection(user_id: number,pagination: Pagination){
    let headers:HttpHeaders=new HttpHeaders({
      size:pagination.size.toString(),
      page:pagination.page.toString()
    });
    return this.http.post<ObjetResponse<any>>(env.url.backEndUser + '/user/' + user_id + '/address/agent-store',{},{headers: headers})
  }
}
