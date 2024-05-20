import { AnyObject } from "chart.js/types/basic";

export class Viaje {
    client?: any;
    company?: AnyObject;
    pickup ?: any;
    origin ?: any
    price ?: number
    location?: any;
    statusType ?:any
    route ?: any 
    flagBuscandoConductor ?: boolean
    destinations?: Destinations[];
    destination?: Destinations[];
    distance?: number;
    driver?: any;
    exigent?: boolean;
    fixedRate?: boolean;
    modeReserve?: number;
    observationClient?: string;
    observationInternal?: string;
    observationService?: string;
    paymentAbono?: number;
    paymentCard?: number;
    paymentCash?: number;
    paymentCredit?: number;
    requireAirConditioning?: boolean;
    requireAmpleTrunk?: boolean;
    receiptNumber?: string;
    routineId?: number;
    totalAirconditioning?: number;
    totalCarseat?: number;
    totalCharge?: number;
    totalCourier?: number;
    totalDestination?: number;
    totalDeviation?: number;
    totalDiscount?: number;
    totalDisplacement?: number;
    totalOther?: number;
    totalParking?: number;
    totalService?: number;
    totalStop?: number;
    totalToll?: number;
    totalWait?: number;
    uuid?: string;
    vehicle?: any;
    vip?: boolean;
    phoneNumberReceived?: string;

    serviceDateTime?: string | Date;
    serviceVehicleAttribute? : number[];
    paymentType ?: any
    //actualizar con dato del servidor
    rutina?: Date[];
    retorno?: Date[]
    id ?:any
    requestBy ?:any
    shortId? : any
    frontDateTime?: Date;
    passenger ?: any;
    courierPackageInfo ?:any
    isRequiredServiceCloseCode ?: boolean
    isAlreadyCalificated ?: boolean
    frontServiceDateTime?: string;
    frontFullName?: string;
    frontEmail?: string;
    frontIsClient?: boolean;
    serviceType ?: any;
    currencyType ?: any;
    isImmediate?:boolean;
    isRetained?: boolean;
    dynamicFields?: ResponseDynamicFields[];
    costCenter ?: any
    courierInfo? : CourierInfo
    dateTime?: string | Date;
    clientId?: string;
    companyId?: string;
    forOtherUser? : ForOtherUser
    immediate? : boolean
    placePickUpEntranceId? : number 
    referenceId? : string 
    flagActiveButtonCancel ?: boolean
    cost_center_id ?: any
    request_by?: any
}

export class ResponseCreateViaje {
    routineId?: number;
    services?: any[]
}
export class CargoInfo{
    description? : string;
    noHelpers? : number;
    noLevelDestination? : number;
    noLevelOrigin? : number;
}

export class CourierInfo{
    cellphone? : string;
    countryCode? : string;
    firstName? : string;
    isReceiver? : boolean;
    packageInfo?:    string
}
export class ForOtherUser{
    cellphone? : string;
    cellPhone?: string;
    contactId?: any
    countryCode? : string;
    firstLastName? : string;
    firstName? : string;
    secondLastName? : string;
    cost_center_id?: any;
}

export class DynamicFields {
    id?: number;
    name?: string;
    description?: string;
    type?: string;
    values?: Value[];
    isRequired?: boolean;
}

export class ResponseDynamicFields {
    id?: number;
    value?: string;
    isRequired?: boolean;
}

export class Value {
    code?: string;
    value?: string;
}
export class Destinations{
    // contact?: Contact;
    costDestination?: number;
    destination?: any;
    id?: any;
    latitude ?: number;
    longitude ?: number;
    uuid?: string;
    origin?: Destination;
    timeWait?: number;
    totalWait?: number;
    totalParking?: number;
    totalToll?: number;
    mainText?: string;
    secondaryText?: string
    frontTotalViaje?:number;
    frontShowInfoDestino?: boolean;
    kilometres?: number;
    onRoute ?: boolean;
    price?: number
    contacts ?: any
}


export class Destination {
    // address?: string;
    addressMainText?: string;
    addressSecondaryText?: string;
    latitude?: number;
    longitude?: number;
    number?: number;
    zoneDescription?: string;
    zoneId?: number;
    reference?: string;
};


export class AddressSuggestionBean {
    city?: string
    country?: string
    mainText?: string
    placeId?: string
    secondText?: string
}
