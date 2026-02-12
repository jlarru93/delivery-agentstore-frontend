export class OpenStoreRequest{
    id:number
    status: boolean;
}
export class AceptOrderRequest{
    uuid:string
    status:string
    readyToDmMinutesAt?:number
    readyToDmAt?:number
}
export class CancelOrderRequest{
    status:string
    uuid:string
    comment:string
}