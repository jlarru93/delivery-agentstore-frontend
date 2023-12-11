export class OpenStoreRequest{
    id:number
    status: boolean;
}
export class AceptOrderRequest{
    status:string
}
export class CancelOrderRequest{
    status:string
    comment:string
}