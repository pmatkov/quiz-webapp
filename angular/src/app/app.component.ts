import { Component, OnInit } from '@angular/core';
import { AuthService } from './shared/auth.service';
import { Router } from '@angular/router';
import { User } from './users/user.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'projekt';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
  
    this.authService.whoAmI().subscribe({
      next: (res: {status: string, user?: User }) => {
      
      if (res.status === 'OK') {
        console.log(res);
      } 
      else {
        this.router.navigate(['/'])
      }
    },
    error: (error) => {

      if (error.error.message === 'Expired token') {

        console.error("Expired token");
        this.authService.expiredTk.next(true);
        this.router.navigate(['/auth/login'])
      }
      else {
        console.error(error);
      }
    }
    });
  } 
}
