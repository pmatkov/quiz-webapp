import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/users/user.model';
import { UserRole} from 'src/app/users/user-role.model';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  userRole = UserRole;

  authenticated : boolean = false;
  authSubscription : Subscription | null = null;

  user: User = new User();
  userSubscription : Subscription | null = null;

  imgDir : string = environment.API_URL + '/assets/uploads/';
  defaultImg : string = environment.API_URL + '/assets/img/' + 'avatar.png';
  
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {

    this.authSubscription = this.authService.authStatus.subscribe(authenticated => {
      this.authenticated = authenticated;
    });

    this.userSubscription = this.authService.getUser().subscribe(user => {
      this.user = user;
    });
 }

  isActive() {

    const regex = /\/user\b/;
    return  regex.test(this.router.url);
    
  }

 logout(){
   this.authService.logoutUser();
 }

 ngOnDestroy(){

  if (this.authSubscription) {
    this.authSubscription.unsubscribe();
  }

  if (this.userSubscription) {
    this.userSubscription.unsubscribe();
  }
 }

}
