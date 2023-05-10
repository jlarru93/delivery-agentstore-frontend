import { Gender } from "../models";

export const COUNTRYCODE = "+51";
export const NUMBERPHONELENGTH = 9;
export const USERNAMELENGTH = 4;
export const PASSWORDLENGTH = 6;
export const NUMBERDNILENGTH = 8;
export const KEYLENGTH = 4;
export const GENDERS:Gender[]=[{name:"Masculino",code:"MALE"},{name:"Femenino",code:"FEMALE"}]
export const GENDERDEFAULT:Gender={name:"Masculino",code:"MALE"}
export const ACEPT_ORDER_STATUS = "preparingOrder";