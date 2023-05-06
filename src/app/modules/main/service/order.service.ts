import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ObjetResponse } from "../../../models";
import { OrderResponse } from "./data/response";
import { environment as env } from '../../../../environments/environment'
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http: HttpClient) { }

  getOrders() {
    return this.http.get<ObjetResponse<OrderResponse[]>>(env.url.backEnd + "/order")
  }
}