import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { AuthService } from "./auth.service";
import { catchError, map } from 'rxjs/operators';
//import { BlockUI, NgBlockUI } from 'ng-block-ui';


@Injectable()
export class JWTInterceptor implements HttpInterceptor {

  //@BlockUI() blockUI: NgBlockUI;
  constructor(private authenticationService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isLoggedIn = this.authenticationService.isAllAuthenticated();
    let isApiUrl = false
    environment.url.backEndInit.forEach((urlInit)=>{
      if(request.url.startsWith(urlInit)){
        isApiUrl=true;
      }
    })
    if (isLoggedIn && isApiUrl) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.authenticationService.getAutorizationToken()}`
          //, 'X-Frame-Options': 'sameorigin'
        }
      }); 
    }
    return next.handle(request);
  }




}