import { ComplaintBean, OrderHistorBean } from "../../data"

export class ComplaintResponse{
    reason ?: string
    detail ?: string
    evidence ?: string[]
    static toBean(self: ComplaintResponse): ComplaintBean{
        const bean = new ComplaintBean()
        bean.reason = self.reason
        bean.detail = self.detail
        bean.evidence = self.evidence
        return bean
    }
}

export class OrderHistoryResponse {
    orderId ?: number
    status ?: string
    createdAt ?: number
    total ?: number
    deliveryManName ?: string
    complaint ?: ComplaintResponse
    static toBean(self: OrderHistoryResponse): OrderHistorBean {
        const bean = new OrderHistorBean()
        bean.orderId = self.orderId
        bean.status = self.status
        bean.createdAt = self.createdAt
        bean.total = self.total
        bean.deliveryManName = self.deliveryManName
        bean.complaint = ComplaintResponse.toBean(self.complaint)
        return bean
    }
}