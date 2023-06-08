
export class StoreRequest {
    id?: number
    name?: string
}

export class ChatRequest {
    uuid:string
    uuidOrder: string
    body: string
    store: StoreRequest
}


export class ChatReadRequest {
    uuidMessage: string
    uuidOrder: string
}