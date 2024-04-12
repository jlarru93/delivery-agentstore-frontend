import { Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";
import { AsyncData } from "../data/response";
import { OrderResponse } from "../../main/service/data/response";

@Injectable({
    providedIn: 'root'
})
export class OrderHandler{
    public _data: Subject<AsyncData<OrderResponse>> = new Subject<AsyncData<OrderResponse>>();
    data$ = this._data.asObservable();

    handle(payload: string) {
        console.log("OrderHandler",payload)
        let response=JSON.parse(payload) as AsyncData<OrderResponse>
        this._data.next(response)
        
    }
}