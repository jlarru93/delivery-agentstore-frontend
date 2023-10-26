import { environment } from "src/environments/environment";

export function formatCurrency(input:number):string{
    const numberFormat=environment.numberFormat

    const decimalPart=input.toString().split(".")[1]??""
    const entryPart=input.toString().split(".")[0]
    const decimalConfig=decimalPart.substring(0,numberFormat.decimalPlaces)
    
    const regex = /(\d)(?=(\d{3})+(?!\d))/g;
    const entryConfig=entryPart.replace(regex, '$1'+numberFormat.thousandsSeparator);
    
    let resulNumber=''
    if(decimalConfig!=''){
        resulNumber=entryConfig+numberFormat.decimalSeparator+decimalConfig
    }else{
        resulNumber=entryConfig
    }
    return resulNumber
}