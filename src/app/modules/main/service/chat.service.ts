import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment as env } from '../../../../environments/environment'
import { ChatResponse } from "./data/chat.response";
import { ChatReadRequest, ChatRequest } from "./data/chat.request";
import { Observable } from "rxjs";

@Injectable({
providedIn: 'root'
})
export class ChatService {
    constructor(private http: HttpClient) { }

    getMessage(orderUuidId:string):Observable<ChatResponse[]>{
        let path="/chat/order/:orderUuid/agentstore"
        path=path.replace(":orderUuid",orderUuidId)
        return this.http.get<ChatResponse[]>(env.url.backEnd+path)
    }
    sendMessage(request:ChatRequest):Observable<ChatResponse[]>{
        return this.http.post<ChatResponse[]>(env.url.backEnd+"/chat/message/agentStore",request)
    }
    readMessages(request:ChatReadRequest):Observable<ChatResponse[]>{
        return this.http.post<ChatResponse[]>(env.url.backEnd+"/chat/message/read/agentStore",request)
    }
}