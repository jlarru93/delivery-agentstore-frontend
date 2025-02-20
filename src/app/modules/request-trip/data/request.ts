import { StoreRequest } from "../../main/service/data/chat.request";

// Define the class for the "point" object within "addresses"
export class Point {
    type: string;
    coordinates: number[];
    constructor() {
      this.type="Point"
    }
  }
  
  // Define the class for the "addresses" object
  export class Address {
    id?: number;
    sort: number;
    marker: string;
    addressStreet: string;
    point: Point;
    alias: string;
    floor: string;
    reference: string;
    receptorName?: string;
    phone: string;
    label ?: string;
    uuidRoutePrice ?: string;
  }
  
  // Define the class for the "payment" object
  export class Payment {
    amount?: { value: number };
    method: { type: string };
    id ?: number
  }
  export class TagsRequest{
    value:string
    color:string
  }
  
  // Define the main class with all the properties
  export class RequestTrip {
    id: number;
    uuid: string;
    status: string;
    createdAt: number;
    deliveryPrice: number;
    tip: number;
    description: string;
    payment: Payment;
    addresses: Address[];
    mobile ?: string
    readyToDmAt ?: number = 0
    readyToDmMinutesAt?:number = 0
    uuid_price:string
    productPrice?:number
    isOrderCalendar?:boolean = false
    isCheckedStore:boolean
    type?:string
    store:StoreRequest = new StoreRequest()
    tags:TagsRequest[]
    constructor(){
      this.addresses= [new Address,new Address]
    }
  }
  
  export class RequestMotorizedOrigin {
    origin: {
      lat: number;
      lng: number;
    };
    payment: {
      method: {
        type: string;
      };
    }
  }
  export class RequestOrderPayment {
    origin: {
      lat: number;
      lng: number;
  };
  destination: {
      lat: number;
      lng: number;
  };

}