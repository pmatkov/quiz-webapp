import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {AuthService} from "../shared/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private auth: AuthService){}

    intercept(request : HttpRequest<any>, next: HttpHandler) : Observable<HttpEvent<any>> {

        const token = this.auth.getToken();

        if (token){

            // console.log(token);

            const modRequest = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                  }
            });

            return next.handle(modRequest);

        } else {
            return next.handle(request);
        }

    }

}
