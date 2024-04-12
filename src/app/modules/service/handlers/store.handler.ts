import { Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";
import { AsyncData } from "../data/response";
import { OrderResponse } from "../../main/service/data/response";
import { DataSharedService } from "../data-shared.service";

@Injectable({
    providedIn: 'root'
})
export class StoreHandler{

    public _data: Subject<AsyncData<OrderResponse>> = new Subject<AsyncData<OrderResponse>>();
    data$ = this._data.asObservable();
    


    constructor() {
    }

    handle(payload: string) {
        console.log("StoreHandler",payload)
        let response=JSON.parse(payload) as AsyncData<OrderResponse>
        this._data.next(response)
    }

}