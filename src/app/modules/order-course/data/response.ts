export class ResponseOrderCourse {
    id: number;
    uuid: string;
    status: string;
    user: {
      id: number;
      fullName: string;
      phone: string;
    };
    createdAt: number;
    deliveryPrice: number;
    tip: number;
    description: string;
    payment: {
      amount: {
        currency: string;
        currencyId: number;
        value: number;
      };
      method: {
        type: string;
      };
    };
    addresses: {
      sort: number;
      maker: string;
      addressStreet: string;
      point: {
        type: string;
        coordinates: [number, number];
      };
      alias: string;
      floor: string;
      reference: string;
      phone: string;
    }[];
    deliveryMan: DeliveryMan;
    recivedAt: number;
    readyToDmAt: number;
    acceptAgentStoreAt: number;
    evidenceReceptionOrder: string;
  }
  export class ResponseTrackingMotorized {
    id: number;
    uuid: string;
    status: string;
    deliveryMan: DeliveryMan;
    position: {
        lat: number;
        lng: number;
    };
    vehicle: string;
}

  export  class   DeliveryMan {
    id: number;
    name: string;
    phone: string;
    status: string;
  };