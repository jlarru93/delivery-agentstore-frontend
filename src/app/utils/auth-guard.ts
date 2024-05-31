import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { query } from '@angular/animations';

@Injectable({
  providedIn: 'root'
})
export class IsAuthenticated implements CanActivate {

  constructor(private auth: AuthService, private router: Router) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    if (await this.auth.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/login'],{queryParams:{destination:state?.url}});
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class IsNotAuthenticated implements CanActivate {

  constructor(private auth: AuthService, private router: Router) { }

  async canActivate(): Promise<boolean> {
    if (!await this.auth.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/']);
    return false;
  }
}
