import { IdClient, IdEmpresa, IdFavorite } from './typesKeyword'
import { GenericObject } from './genericObject';

export class RequestGetFavorite{
    client_id?: number;
    company_id?: number;
}

export class Favorite{
    alias?: string; //post
    clientId?: IdClient; //post
    companyClientId?: IdEmpresa; //post
    createdDate?: Date;
    createdUser?: string;
    enable?: true;
    id?: IdFavorite;
    latitude?: number; //post
    longitude?: number; //post
    mainText?: string; //post
    modificatedDate?: Date;
    modificatedUser?: string;
    secondaryText?: string; //post
    zone?:GenericObject;
}