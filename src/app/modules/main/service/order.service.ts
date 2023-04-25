import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })
  export class MainService {
    constructor(private http:HttpClient) { }

    getOrders(){
      //return this.http.get<ObjetResponse<StatusOpenStoreResponse>>(env.url.backEnd+"/store/status/open")
    }
  }