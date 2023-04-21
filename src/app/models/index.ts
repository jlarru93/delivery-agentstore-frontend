import { HttpStatus } from "@nestjs/common/enums";

export interface AdminStore {
    id?: number,
    documentNumber?: string;
    documentType?: string;
    name?: string,
    phoneNumber?: string,
    phone_countryCode?:string,
    zone_id?: number
}

export interface Price {
    id?: number;
    product_id?: number;
    value?: string;

}

export interface Product {
    id?: number;
    name?: string;
    picture?: string;
    snap?: string;
    review?: string;
    status?: string;
}

export interface ProductRequest {
    dataProduct?: Product,
    option?: Option[],
    price?: string,
    stores?: Store[]
    categories?: Category[]
    tags?: Tag[]
}

export interface Option {
    id?: number;
    product_id?: number;
    name?: string;
    control?: any;
    subOption?: SubOption[];
    status?: string
}
export interface SubOption {
    id?: number;
    options_id?: number;
    name?: string;
    price?: PriceSubOption[];
    status?: string
}
export interface PriceSubOption {
    id?: number;
    subOption_id?: number;
    value?: string;
    status?: string;
}

export interface Category {
    id?: number;
    name?: string;
}

export interface Tag {
    id?: number;
    tag_id?: number;
    value?: string;
}


export interface ReniecConsultResponse {
    meta: MetaData,
    data: Reniec
}
export interface ResponseOperation {
    type?: string;
    message?: string;
    result?: any;
}
export interface Zone {
    id?: number,
    name?: string,
    polygon?: string;

}
export interface Store {
    id?: number,
    adminStore_id?: number,
    name?: string,
    addressStreet?: string,
    location?: string,
    brand_id?: number,
    zone_id?: number
    status?: string;
}
export interface AdminZone {
    id?: number;
    name?: string;
    documentNumber?: string;
    documentType?: string;
    phoneNumber?: string;
}
export interface dniRequest {
    primerNombre?: string,
    segundoNombre?: string
    apellidoPaterno?: string,
    apellidoMaterno?: string
}

export interface SendSMS {
    code?: string,
    phone_number?: string
}

export interface Position {
    lat: string,
    lng: string
}
export interface User {
    phoneNumber: string,
    name?: string,
    email?: string
}
export interface ReniecDto {
    primerNombre?: string,
    segundoNombre?: string,
    apellidoPaterno?: string,
    apellidoMaterno?: string
}

export interface OrderRequest {
    id?: number,
    date?: string,
    detail?: string,
    diler_id?: number,
    user_id?: number,
    total?: string,
    addressStreet_id?: number,
    store_id?: number
}

export interface dilerRequest {
    id?: number,
    name?: string,
    dni?: string,
    picture?: string,
    fullLastName?: string,
    phone?: string,
    address?: string,
    zone_id?: number
}

export interface DilerOrderRequest {
    order_id?: number,
    diler_id?: number
}

export interface ReportRequest {
    idUser?: string,
    fechaini?: string,
    fechafin?: string,
    type?: string,
    idReport?: string,
    info?: any
}
export interface ZoneAddRequest {
    zone: Zone,
    adminZone: AdminZone
}
export interface ZoneUpdateRequest {
    zone: Zone,
    adminZone: AdminZone
}
export interface ZoneAddResponse {
    meta: MetaData,
    data: ZoneAddResponseWrapper
}
export interface ZoneListResponse {
    meta: MetaData,
    data: Zone[]
}
export interface ZoneUpdateResponse {
    meta: MetaData,
    data: ZoneUpdateResponseWrapper
}

export interface ZoneAddResponseWrapper {
    zone: Zone,
    adminZone: AdminZone
}
export interface ZoneUpdateResponseWrapper {
    zone?: Zone,
    adminZone?: AdminZone
}
export interface ZoneWrapper extends ZoneUpdateResponseWrapper {
}
export interface Message {
    code: HttpStatus | string
    type: TypeError
    message: string | any
}
export enum TypeError {
    error = "error", warn = "warn", invalid = "invalid", fatal = "fatal", info = "info"
}
export interface MetaData {
    menssages?: Message[],
    totalRecords?: number
    idTransaction?: string
    nextPageNumber?: number
    totalNumberPages?: number
    additionalData?: string
    responseCode?: string
}
export interface ZoneVerifyResponse {
    data: Zone
    meta: MetaData
}
export interface Reniec {
    primerNombre?: string,
    segundoNombre?: string,
    apellidoPaterno?: string,
    apellidoMaterno?: string
}
export interface ReniecConsultResponse {
    meta: MetaData,
    data: Reniec
}


export interface ResponseOperation {
    type?: string;
    message?: string;
    result?: any;
}

export interface Store {
    id?: number,
    adminStore_id?: number,
    name?: string,
    addressStreet?: string,
    location?: string,
    brand_id?: number,
    zone_id?: number
}
export interface Brand {
    id?: number,
    name?: string,
    categories:Category[]
    zone_id?: number
}
export interface Pagination {
    page: number,
    size: number,
    totalRecords?: number,
    totalNumberPages?: number
}
export interface Meta {
    meta: MetaData
}

export interface AdminStoreListResponse extends Meta {
    data: AdminStore[]
}
export interface DeliveryManListResponse extends Meta {
    data: DeliveryMan[]
}
export interface DeliveryMan {
    id?: number,
    enable?:boolean,
    name?: string,
    documentType?: string,
    documentNumber?: string,
    documentImage?: string,
    picture?: string,
    fullLastName?: string,
    phone?: string,
    address?: string,
    zone_id?: number,
    email?: string,
    countryCode?: string,
    gender?: string
    vehicle?: Vehicle
}
export interface Vehicle {
    id?: number;
    photoOwnershipCard?: string;
    photoLicense?: string;
    photoInsurance?: string;
    picture1Vehicle?: string;
    picture2Vehicle?: string;

    licensePlate?: string;
    ownershipCard?: string;
    licenseNumber?: string;
    expireLicense?: number;
    insuranceNumber?: string;
    expireInsurance?: number;
    type?: string;
}
export interface Gender { name: string, code: string }
export interface FileRequest {
    blob: Blob
    options: { type: string }
    name: string
}
export interface S3Data {
    /**
     * URL of the uploaded object.
     */
    Location: string;
    /**
     * ETag of the uploaded object.
     */
    ETag?: string;
    /**
     * Bucket to which the object was uploaded.
     */
    Bucket?: string;
    /**
     * Key to which the object was uploaded.
     */
    Key?: string;
}
export interface ObjetResponse<T> {
    meta: MetaData
    data: T
}
export interface S3Data {
    /**
     * URL of the uploaded object.
     */
    Location: string;
    /**
     * ETag of the uploaded object.
     */
    ETag?: string;
    /**
     * Bucket to which the object was uploaded.
     */
    Bucket?: string;
    /**
     * Key to which the object was uploaded.
     */
    Key?: string;
}
