import { ChatRequest, StoreRequest } from "../modules/main/service/data/chat.request"

export class ReadUserBean {
    id: number
    name: string
    type: string
    readedAt: number
    background: string
}

export class StoreBean {
    id: number
    name: string
    static toRequest(bean:StoreBean):StoreRequest{
        let request=new StoreRequest()
        request.id=bean.id
        request.name=bean.name
        return request
    }
}

export class UserBean {
    id: number
    name: string
    picture?: string
    type: string
}


export class ChatBean {
    uuid: string
    uuidOrder: string
    user: UserBean
    store: StoreBean
    body: string
    readUser?: ReadUserBean[]
    createdAt: number

    static toRequest(bean:ChatBean):ChatRequest{
        let request=new ChatRequest()
        request.uuid=bean.uuid
        request.uuidOrder=bean.uuidOrder
        request.store=StoreBean.toRequest(bean.store)
        request.body=bean.body
        return request
    }
}