
export class ReadUserBean {
    id: number
    name: string
    type: string
    readedAt: number
}

export class StoreBean {
    id: number
    name: string
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
    hour:string

}