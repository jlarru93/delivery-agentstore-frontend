import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { catchError } from 'rxjs/operators';
import { ConnectionService } from "../modules/service/connection.service";
//import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(private readonly connectionService:ConnectionService){

    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
       
        return next.handle(request).pipe(catchError((err:HttpErrorResponse) => {
            if(err.status===0){
                this.connectionService.setValue(false)
            }
            throw err
        }))
    }


}