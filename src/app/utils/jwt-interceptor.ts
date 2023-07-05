import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, from, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { AuthService } from "./auth.service";
import { catchError, map, mergeMap } from 'rxjs/operators';
//import { BlockUI, NgBlockUI } from 'ng-block-ui';


@Injectable()
export class JWTInterceptor implements HttpInterceptor {

  //@BlockUI() blockUI: NgBlockUI;
  constructor(private authenticationService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let isApiUrl = false
    environment.url.backEndInit.forEach((urlInit)=>{
      if(request.url.startsWith(urlInit)){
        isApiUrl=true;
      }
    })
    if(!isApiUrl){
      return next.handle(request);
    }
    const isLoggedIn = this.authenticationService.isAllAuthenticated();

    if (isLoggedIn) {
      const clonedRequest = this.attachTokenToRequest(request, this.authenticationService.getAutorizationToken());
      return next.handle(clonedRequest);
    }else{
      return from(this.authenticationService.refreshToken()).pipe(
        mergeMap(() => {
          const newToken = this.authenticationService.getAutorizationToken();
          const clonedRequest = this.attachTokenToRequest(request, newToken);
          return next.handle(clonedRequest);
        }),
        catchError((error: any) => {
          // Error al refrescar el token, manejarlo según tus necesidades
          return throwError(error);
        })
      );
    }
    
  }
  private attachTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }



}