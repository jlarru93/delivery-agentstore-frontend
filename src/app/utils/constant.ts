import { Gender } from "../models";

export const COUNTRYCODE = "+51";
export const NUMBERPHONELENGTH = 9;
export const USERNAMELENGTH = 4;
export const PASSWORDLENGTH = 6;
export const NUMBERDNILENGTH = 8;
export const KEYLENGTH = 4;
export const GENDERS:Gender[]=[{name:"Masculino",code:"MALE"},{name:"Femenino",code:"FEMALE"}]
export const GENDERDEFAULT:Gender={name:"Masculino",code:"MALE"}
export const PREPARING_ORDER_STATUS = "preparingOrder";
export const OPEN_ORDER_STATUS = "open";
export const CANCEL_ORDER_STATUS = "cancel";
export const READY_ORDER_STATUS = "orderReady";
export const DEFAULT_TIME_WAIT_DM_IN_MINUTES = 10;
export const DELIVERYMAN_RED_BACKGROUND:string='red'
export const USER_RED_BACKGROUND:string='blue'
export const COLOR_READ_USER={'delivery-man':DELIVERYMAN_RED_BACKGROUND,'user':USER_RED_BACKGROUND}
export const USER_TYPE_AGENT_STORE:string='agent-store'