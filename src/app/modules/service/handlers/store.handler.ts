import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { AsyncData } from "../data/response";
import { OrderResponse } from "../../main/service/data/response";

@Injectable({
    providedIn: 'root'
})
export class StoreHandler{
    public _data: BehaviorSubject<AsyncData<OrderResponse>> = new BehaviorSubject<AsyncData<OrderResponse>>(null);
    data$ = this._data.asObservable();
    audio=new Audio('assets/audio/audio.mp3');
    handle(payload: string) {
        setTimeout(async ()=>{
            await this.audio.play()
        },200)
        console.log("StoreHandler",payload)
        let response=JSON.parse(payload) as AsyncData<OrderResponse>
        this._data.next(response)
    }
}