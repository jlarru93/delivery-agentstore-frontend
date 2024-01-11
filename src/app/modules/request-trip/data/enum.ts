export enum enumStatusOrder {
    preparingOrder = 'preparingOrder',
    orderReady = 'orderReady',
    toStore = 'toStore',
    inStore = 'inStore',
    reciveDelivery = 'reciveDelivery',
    toHome = 'toHome',
    nearHome = 'nearHome',
    inHome = 'inHome',
    reciveOrderDeliveryMan = 'reciveOrderDeliveryMan',
    done = 'done',
    open = 'open',
    rejectPayment = 'rejectPayment',
    pendingPayment = 'pendingPayment'
} 
export enum enumTypePayment{
    CASH = 'CASH',
    CREDIT = 'CREDIT'
}