import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { AsyncData } from "../data/response";
import { ChatResponse } from "../../main/service/data/chat.response";

@Injectable({
    providedIn: 'root'
})
export class ChatHandler{
    public _data: BehaviorSubject<AsyncData<ChatResponse>> = new BehaviorSubject<AsyncData<ChatResponse>>(null);
    data$ = this._data.asObservable();

    handle(payload: string) {
        console.log("ChatHandler",payload)
        let response=JSON.parse(payload) as AsyncData<ChatResponse>
        this._data.next(response)  
    }
}