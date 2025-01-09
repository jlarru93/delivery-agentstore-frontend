import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, from, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { AuthService } from "./auth.service";
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { ConnectionService } from "../modules/service/connection.service";


@Injectable()
export class JWTInterceptor implements HttpInterceptor {

  constructor(private authenticationService: AuthService,private readonly connectionService:ConnectionService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let isApiUrl = false
    environment.url.backEndInit.forEach((urlInit)=>{
      if(request.url.startsWith(urlInit)){
        isApiUrl=true;
      }
    })
    if(!isApiUrl){
      return next.handle(request).pipe(tap(()=>this.attachResponse(request.url)));;
    }
    const isLoggedIn = this.authenticationService.isAllAuthenticated();

    if (isLoggedIn) {
      const clonedRequest = this.attachTokenToRequest(request, this.authenticationService.getAutorizationToken());
      return next.handle(clonedRequest).pipe(tap(()=>this.attachResponse(request.url)));
    }else{
      return from(this.authenticationService.refreshToken()).pipe(
        mergeMap(() => {
          const newToken = this.authenticationService.getAutorizationToken();
          const clonedRequest = this.attachTokenToRequest(request, newToken);
          return next.handle(clonedRequest).pipe(tap(()=>this.attachResponse(request.url)));;
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

  private attachResponse(url:string){
    if(url.includes("api.piwi.pe")){
      this.connectionService.setValue(true)
    }
  }

}