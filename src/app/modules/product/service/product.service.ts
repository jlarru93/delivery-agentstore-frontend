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

    getProducts() {
      return this.http.get<ObjetResponse<StoreResponse>>(env.url.backEnd + "/store/items")
    }

    deleteProduct(bodyRequest){
      let path = "/store/:storeId/product/:productId/outStock"
      path = path.replace(":storeId", bodyRequest.storeId)
      path = path.replace(":productId", bodyRequest.productId)
      const body={isOutStock: bodyRequest.status} as ProductStockRequest
      return this.http.put<ObjetResponse<any>>(env.url.backEnd + path, body)
    }

    
    //{{BaseUrl}}/store/:storeId/product/:productId/outStock
  }