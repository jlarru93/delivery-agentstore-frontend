import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ObjetResponse } from "src/app/models";
import {environment as env} from '../../../../environments/environment'
import { StatusOpenStoreResponse, StoreTripResponse } from "./data/response";
import { OpenStoreRequest } from "./data/request";
@Injectable({
    providedIn: 'root'
  })
  export class StoreService {
    constructor(private http:HttpClient) { }

    getStatusOpen(){
        return this.http.get<ObjetResponse<StatusOpenStoreResponse[]>>(env.url.backEnd+"/store/status/open")
    }

    changeStatusOpen(request:OpenStoreRequest){
        return this.http.put<ObjetResponse<StatusOpenStoreResponse>>(env.url.backEnd+"/store/open",request)
    }
  //   onGetLocationStoreService(){
  //     return this.http.get<ObjetResponse<StoreResponse>>(env.url.backEnd+"/store/just-deliveryMan")
  // }
  onGetLocationStoreService(store_ids:string){
    return this.http.get<ObjetResponse<StoreTripResponse[]>>(env.url.backEnd+"/store/setting",{headers:{store_ids:store_ids}})
  }
  }