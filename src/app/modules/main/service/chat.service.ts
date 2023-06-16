import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment as env } from '../../../../environments/environment'
import { ChatResponse } from "./data/chat.response";
import { ChatReadRequest, ChatRequest } from "./data/chat.request";
import { Observable } from "rxjs";
import { ObjetResponse } from "src/app/models";

@Injectable({
providedIn: 'root'
})
export class ChatService {
    constructor(private http: HttpClient) { }

    getMessage(orderUuidId:string):Observable<ObjetResponse<ChatResponse[]>>{
        let path="/chat/order/:orderUuid/agentStore"
        path=path.replace(":orderUuid",orderUuidId)
        return this.http.get<ObjetResponse<ChatResponse[]>>(env.url.util_banckEnd+path)
    }
    sendMessage(request:ChatRequest):Observable<ObjetResponse<ChatResponse[]>>{
        return this.http.post<ObjetResponse<ChatResponse[]>>(env.url.util_banckEnd+"/chat/message/agentStore",request)
    }
    readMessages(request:ChatReadRequest):Observable<ObjetResponse<ChatResponse[]>>{
        return this.http.post<ObjetResponse<ChatResponse[]>>(env.url.util_banckEnd+"/chat/message/read/agentStore",request)
    }
}