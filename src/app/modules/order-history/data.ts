import { ChatBean } from "src/app/chat/data.chat"

export class UserBean{
  id ?: number
}

export class ComplaintBean{
  _id ?: string
  uuid ?: string
  user ?: UserBean
  deliveryMan ?: string
  reason ?: string
  detail ?: string
  evidence ?: string[]
  status ?: string
  messagesNoReadTotal:number
  messagesChat: ChatBean[]
  isLoadingChat : boolean
  constructor(){
    this.messagesNoReadTotal=0
    this.messagesChat=[]
    this.isLoadingChat=false
}
}

export class OrderHistorBean{
  orderId ?: number
  orderUuid ?: string
  status ?: string
  createdAt ?: number
  total ?: number
  deliveryManName ?: string
  complaint ?: ComplaintBean
}