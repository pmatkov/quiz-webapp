import { Injectable } from '@angular/core';
import { User } from '../users/user.model';
import { BehaviorSubject, Observable, Subject, map, of, take } from 'rxjs';
import { Router } from '@angular/router';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token : string | null = null;
  private user : User | null = null;
  userSubject : BehaviorSubject<User> = new BehaviorSubject<User>(new User());

  msgEmitter : Subject<string> = new Subject<string>();
  authStatus : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  expiredTk :  BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private router: Router, private dataService: DataService) {}

  loginUser(credentials: { username: string, password: string }, editProfile?: boolean) {

    this.dataService.loginUser(credentials).subscribe({
      next: (res: { status: string, description?: string, user?: User, token?: string }) => {

        console.log(res);
  
        if (res.status === 'OK') {

          this.user = res.user!;
          this.userSubject.next({...this.user});

          this.token = res.token!;
          sessionStorage.setItem('token', this.token!);
          this.authStatus.next(true);

          this.router.navigate(['/']);
          
        } else {
          this.msgEmitter.next(res.description!);
        }
      },
        error: (error) => {
          console.error(error);
      }});
  }

  logoutUser() {
    this.user = null;
    this.token = null;
    sessionStorage.removeItem('token');
    this.authStatus.next(false);
    this.router.navigate(['/auth/login']);
  }

  registerUser(user: User) {

    this.dataService.registerUser(user).subscribe({
      next: (res : {status : string, description?: string, insertId? : string, token?: string }) => {

        console.log(res);
  
        if (res.status === 'OK') {
          this.user = {...user, id: res.insertId!};
          this.userSubject.next({...this.user});

          this.token = res.token!;
          sessionStorage.setItem('token', this.token!);
          this.authStatus.next(true);
          this.router.navigate(['/']);

        } else {
          this.msgEmitter.next(res.description!);
        }

      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  restoreUser(user: User) {

    this.dataService.restoreUser(user).subscribe({
      next: (res : {status : string, user?: User, token?: string }) => {

        console.log("Restored: ", res);
  
        if (res.status === 'OK') {
          this.user = res.user!;
          this.userSubject.next({...this.user});

          this.token = res.token!;
          sessionStorage.setItem('token', this.token!);
        } 
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  editUser(user: User): Observable<string> {
    return this.dataService.editUser(user).pipe(
      take(1),
      map((res: { status: string, changedRows?: string }) => {
        console.log("Edited: ", res);

        return res.status;
      })
    );
  }

  editProfileImg(id: string, image: File): Observable<string> {
    const formData = new FormData();
    formData.append('profileImg', image);

    return this.dataService.editProfileImg(id, formData).pipe(
      take(1),
      map((res: { status: string,  changedRows?: string, imageUrl?: string}) => {
        console.log("Edited: ", res);
        if (res.status === 'OK' && this.user) {
          this.user.imageUrl = res.imageUrl;
          this.userSubject.next({...this.user});

        }
        return res.status;
      })
    );
  }

  deleteProfileImg(id: string) : Observable<string>{
  
    return this.dataService.deleteProfileImg(id).pipe(
      take(1),
      map((res: { status: string,  changedRows?: string}) => {

    console.log("Deleted: ", res);
    if (res.status === 'OK' && this.user) {
        this.user.imageUrl = '';
        this.userSubject.next({...this.user});
      }
    return res.status;
    })
    );
  }

  getUser() {

    return this.userSubject;
  }

  isAuthenticated() {
   
    return this.user != null ;
  }

  
  isExpired() {
   
    return this.expiredTk.getValue();
  }

  getToken() {

    if (this.token) {
      return this.token; 
    }
    else if (sessionStorage.getItem('token')) {
      this.token = sessionStorage.getItem('token');
      return this.token;
    }
    return null;
  }

  whoAmI() {
    
    if (!this.isAuthenticated() && this.getToken()) {

      return this.dataService.getMe()
          .pipe(map((res : {status : string, user?: User }) => {

            if (res.status === 'OK' && res.user) {
              this.user = res.user;
              this.userSubject.next({...this.user});
              this.authStatus.next(true);
              this.expiredTk.next(false);
            }          
            return res;
          }))

    } else {    
        return of({status: 'NOT OK'});
      }
    }

}
