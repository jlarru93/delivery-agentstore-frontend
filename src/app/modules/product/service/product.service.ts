import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ObjetResponse } from "src/app/models";
import { StoreResponse } from "./data/response";
import { environment as env } from '../../../../environments/environment'
import { ProductStockRequest } from "./data/request";

@Injectable({
    providedIn: 'root'
  })
  export class ProductService {

    constructor(
      private http: HttpClient
    ){}

    getProducts(storeId:number) {
      return this.http.get<ObjetResponse<StoreResponse>>(env.url.store_banckEnd + "/store/"+storeId+"/items/agent-store")
    }

    deleteProduct(bodyRequest){
      let path = "/store/:storeId/product/:productId/outStock/agent-store"
      path = path.replace(":storeId", bodyRequest.storeId)
      path = path.replace(":productId", bodyRequest.productId)
      const body={isOutStock: bodyRequest.status} as ProductStockRequest
      return this.http.put<ObjetResponse<any>>(env.url.store_banckEnd + path, body)
    }

    
    //{{BaseUrl}}/store/:storeId/product/:productId/outStock
  }