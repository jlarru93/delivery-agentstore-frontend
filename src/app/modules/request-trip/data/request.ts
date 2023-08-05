
// Define the class for the "point" object within "addresses"
export class Point {
    type: string;
    coordinates: number[];
    constructor() {
    }
  }
  
  // Define the class for the "addresses" object
  export class Address {
    sort: number;
    maker: string;
    addressStreet: string;
    point: Point;
    alias: string;
    floor: string;
    reference: string;
    phone: string;

  }
  
  // Define the class for the "payment" object
  export class Payment {
    amount: { value: number };
    method: { type: string };
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
    readyToDmAt ?: number
  
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
    };
  }