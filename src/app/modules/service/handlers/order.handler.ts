import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class OrderHandler{
    public _data: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    data$ = this._data.asObservable();

    handle(payload: string) {
        console.log("OrderHandler",payload)
        this._data.next(payload)
        
    }
}