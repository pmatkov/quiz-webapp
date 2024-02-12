import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import {AuthService} from "./shared/auth.service";
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {

    constructor(private authService: AuthService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {

        if (this.authService.isAuthenticated()) {
            return true;
        }
        else if (this.authService.isExpired()) {
            this.router.navigate(['/auth/login']);
            return false;
        }
        return this.authService.whoAmI().pipe(map((res) => {

            if (res.status === 'OK') {
                return true;
            }
            this.router.navigate(['/auth/login']);
            return false;
        }))
    }
}