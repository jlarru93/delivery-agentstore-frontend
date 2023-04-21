import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { AuthService } from "./auth.service";
import { catchError } from 'rxjs/operators';
//import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    //@BlockUI() blockUI: NgBlockUI;
    constructor(private authenticationService : AuthService){

    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
       
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                this.authenticationService.resetSecurityObject();
                //location.reload();
               
            }
      //      this.blockUI.stop();
            const error = err.error.message || err.statusText;
            return throwError(error);
        }))
    }


}