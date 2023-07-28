import { ComplaintBean, OrderHistorBean, UserBean } from "../../data"

export class UserResponse {
    id?: number
    static toBean(self: UserResponse): UserBean{
        const bean = new UserBean()
        bean.id = self.id
        return bean
    }
}

export class ComplaintResponse{
    _id ?: string
    uuid ?: string
    user ?: UserResponse
    deliveryMan ?: string
    reason ?: string
    detail ?: string
    evidence ?: string[]
    status ?: string
    static toBean(self: ComplaintResponse): ComplaintBean{
        const bean = new ComplaintBean()
        bean._id = self._id
        bean.uuid = self.uuid
        bean.user = UserResponse.toBean(self.user)
        bean.reason = self.reason
        bean.detail = self.detail
        bean.evidence = self.evidence
        bean.status = self.status
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