import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { AsyncData } from "../data/response";

@Injectable({
    providedIn: 'root'
})
export class OpenStoreHandler{

    public _data: BehaviorSubject<AsyncData<any>> = new BehaviorSubject<AsyncData<any>>(null);
    data$ = this._data.asObservable();
    


    constructor() {
    }

    handle(payload: string) {
        console.log("OpenStoreHandler",payload)
        let response=JSON.parse(payload) as AsyncData<any>
        this._data.next(response)
    }

}