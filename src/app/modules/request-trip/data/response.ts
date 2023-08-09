import { ChatBean, UserBean } from "src/app/chat/data.chat";
import { Address, Payment, Point } from "./request";
import { DeliveryMan } from "../../order-course/data/response";
import { DeliveryManBean } from "../../main/data";

export class ResponseMotorizedOrigin {
    id: number;
    name: string;
    method: {
      method: string;
    }[];
    statusWork: string;
    position: {
      lastUpdate: number;
      point: {
        type: string;
        coordinates: [number, number];
      };
    };
  }
  
  export class ResponseTrip {
    id: number;
    uuid: string;
    status: string;
    createdAt: number;
    deliveryPrice: number;
    tip: number;
    description: string;
    payment: {
      amount: {
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
  }
  export class ResponseOrderPayment {
    distance: number;
    amount: number;
    overviewPolyline: string;
    travelTime: number;
    uuid : string;
// const jsonData = {
//     "distance": 6350,
//     "amount": 17000,
//     "overviewPolyline": "y~ibA`ovgMANBXJVPP\\Lb@DTC\\KPO`@GV@fAd@b@P\\Nl@ThC`Ab@R|GlCl@V`Bh@jDfA`AVr@PrDv@p\\zJzAd@pAb@hBj@fCt@hA`@hBh@`Cv@r@RbDbAnCx@`@LNF^LxC~@r@Rd@NtA^n@P`Cr@dDdAp@RZJ^NPF`@LrA\\RPPLHL@BBTAVKRILKJMFOBQBQ?Q?QCOIKIIKGMEQCS?Q?WBe@Pa@Ti@n@{AfEmJd@kAx@oBd@gAdAaC|C{GdAgCz@oB~BiFhCkGpAeDz@iCvAsDj@}ATo@Ri@n@gBnAsDlAaDbAwC|@sCLYRk@Vo@Vo@t@aCXmBZgCjAeFx@gDNq@Ja@XoATcA\\oA^{@NYb@_An@cBrAmCvCcGjCrAj@oA",
//  };
}
export class ResponseLoadingOrder{
    user : UserBean;
    payment :Payment;
    addresses :AddressResponseLoadingOrder[];
    status: string;
    createdAt: number;
    readyToDmAt: number;
    tip: number;
    id: number;
    uuid: string;
    type: string;
    zoneId: number;
    deliveryPrice: number;
    total: number;
    date_string : string
    messagesNoReadTotal:number
    messagesChat:ChatBean[]
    isLoadingChat:boolean
    showButton:boolean
    deliveryMan : DeliveryManBean
    status_order ?: string
    order_name ?: string
    constructor(){
        this.messagesNoReadTotal=0
        this.messagesChat=[]
        this.isLoadingChat=false
        this.showButton=false
    }

}
export class AddressResponseLoadingOrder {
  sort: number;
  marker: string;
  addressStreet: string;
  location: Point;
  alias: string;
  floor: string;
  reference: string;
  phone: string;
  label ?: string;
  uuidRoutePrice ?: string;
}

  