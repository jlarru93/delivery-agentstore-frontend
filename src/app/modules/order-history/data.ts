export class ComplaintBean{
  reason ?: string
  detail ?: string
  evidence ?: string[]
}

export class OrderHistorBean{
  orderId ?: number
  status ?: string
  createdAt ?: number
  total ?: number
  deliveryManName ?: string
  complaint ?: ComplaintBean
}