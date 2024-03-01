import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { AsyncData } from "../data/response";
import { StatusOpenStoreResponse } from "../../main/service/data/response";

@Injectable({
    providedIn: 'root'
})
export class OpenStoreHandler{

    public _data: BehaviorSubject<AsyncData<StatusOpenStoreResponse>> = new BehaviorSubject<AsyncData<StatusOpenStoreResponse>>(null);
    data$ = this._data.asObservable();
    


    constructor() {
    }

    handle(payload: string) {
        if(!payload){
            return
        }
        console.log("OpenStoreHandler",payload)
        let response=JSON.parse(payload) as AsyncData<StatusOpenStoreResponse>
        this._data.next(response)
    }

}