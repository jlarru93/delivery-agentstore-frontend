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
}

export class OrderHistorBean{
  orderId ?: number
  status ?: string
  createdAt ?: number
  total ?: number
  deliveryManName ?: string
  complaint ?: ComplaintBean
}