
export class StoreRequest {
    id?: number
    name?: string
}

export interface ChatRequest {
    uuid:string
    uuidOrder: string
    body: string
    store: StoreRequest
}


export interface ChatReadRequest {
    uuidMessage: string
    uuidOrder: string
}