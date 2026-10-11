export class OpenStoreRequest{
    id:number
    status: boolean;
    // Solo al cerrar. SLOT = solo el tramo actual (se reabre en el siguiente), DAY = todo el día.
    scope?: 'SLOT' | 'DAY';
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