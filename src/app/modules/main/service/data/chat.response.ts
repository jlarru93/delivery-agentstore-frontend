import { ChatBean, ReadUserBean, StoreBean, UserBean } from "../../data.chat"

export class ReadUserResponse {
    id: number
    name: string
    type: string
    readedAt: number
    static toBean(response: ReadUserResponse): ReadUserBean {
        let bean=new ReadUserBean()
        bean.id=response.id
        bean.name=response.name
        bean.type=response.type
        bean.readedAt=response.readedAt
        return bean
    }
}

export class StoreResponse {
    id: number
    name: string
    static toBean(response: StoreResponse): StoreBean {
        let bean=new StoreBean()
        bean.id=response.id
        bean.name=response.name
        return bean
    }
}

export class UserResponse {
    id: number
    name: string
    picture?: string
    type: string
    static toBean(response:UserResponse):UserBean{
        let bean=new UserBean()
        bean.id=response.id
        bean.name=response.name
        bean.picture=response.picture
        bean.type=response.type
        return bean
    }
}


export class ChatResponse {
    uuid: string
    uuidOrder: string
    user: UserResponse
    store: StoreResponse
    body: string
    readUser?: ReadUserResponse[]
    createdAt: number
    static toBean(response:ChatResponse):ChatBean{
        let bean=new ChatBean()
        bean.uuid=response.uuid
        bean.uuidOrder=response.uuidOrder
        bean.user=UserResponse.toBean(response.user)
        bean.store=StoreResponse.toBean(response.store)
        bean.body=response.body
        bean.readUser=response.readUser?.map((ru)=>ReadUserResponse.toBean(ru))
        bean.createdAt= response.createdAt
        bean.hour= convertirTimestampAHora(response.createdAt)
        return bean
    }
}


function convertirTimestampAHora(timestamp: number): string {
    const date = new Date(timestamp);
    let horas = date.getHours();
    const minutos = date.getMinutes();
    const sufijo = horas >= 12 ? 'PM' : 'AM';
  
    // Convertir las horas al formato de 12 horas
    horas = horas % 12;
    horas = horas || 12; // Si es 0, lo convertimos a 12
  
    const horaAmPm = `${horas}:${minutos.toString().padStart(2, '0')} ${sufijo}`;
    return horaAmPm;
}