import { IfStmt } from '@angular/compiler';

export function CloneObject( obj:any ) {
    if ( obj === null || typeof obj  !== 'object' ) {
        return obj;
    }
 
    var temp = obj.constructor();
    for ( var key in obj ) {
        temp[ key ] = CloneObject( obj[ key ] );
    }
 
    return temp;
}

export function CloneArray( arrayOriginal: any ):any[] {

    return arrayOriginal.slice();
}

export function isEmpty(obj: any) {
    for (const prop in obj) {
        return false;
    }
    return true;
}