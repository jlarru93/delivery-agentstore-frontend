import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment as env } from "../../../../environments/environment";
import { FilterRequest } from "../../order-history/service/data/request";
import { ObjetResponse } from "src/app/models";
import { AddressCustomerExpressResponse, CustomerExpressResponse } from "../data/response";
@Injectable({
  providedIn: "root",
})
export class CustomerExpressService {


  constructor(private http: HttpClient) { }

  filteCustomer(filterRequest: FilterRequest) {
    return this.http.post<ObjetResponse<CustomerExpressResponse[]>>(env.url.backEndUser + "/customer-expres/filter/agent-store", filterRequest)
  }
  filterAddress(filterRequest: FilterRequest) {
    return this.http.post<ObjetResponse<AddressCustomerExpressResponse[]>>(env.url.backEndUser + "/address/filter/agent-store", filterRequest)
  }
}