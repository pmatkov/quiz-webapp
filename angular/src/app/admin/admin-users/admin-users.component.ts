import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription} from 'rxjs';
import { AuthService } from 'src/app/shared/auth.service';
import { UserService } from 'src/app/shared/user.service';
import { ValidatorService } from 'src/app/shared/validator.service';
import { UserRole } from 'src/app/users/user-role.model';
import { User } from 'src/app/users/user.model';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['../admin.css']
})
export class AdminUsersComponent implements OnInit, OnDestroy {

  users : User[] = [];
  usersSubscription : Subscription | null = null;

  currentUser: User = new User();
  userSubscription : Subscription | null = null;

  userForm! : FormGroup;
  add : boolean = false;

  constructor(private fb : FormBuilder, private userService: UserService, private authService: AuthService, private validatorService: ValidatorService) {}

  ngOnInit() {

    this.usersSubscription = this.userService.getUsers()
    .subscribe(users => {
      this.users = users;
    });

    this.userSubscription = this.authService.getUser()
    .subscribe(user => {
      this.currentUser = user;
    });
  }

  initForm() {

  
    this.userForm = this.fb.group({
      'id' : new FormControl('', null),
      'username' : new FormControl('', Validators.required),
      'password': new FormControl("", Validators.required),
      'repeatedPassword': new FormControl("", Validators.required),
      'role': new FormControl("", Validators.required)},
      {
        validators: [this.validatorService.matchValidator('password', 'repeatedPassword')]
      }
    );
  }

  addUser() {
    this.initForm();
    this.switchMode();
  }

  changeRole(user: User) {


    user.role = user.role == UserRole.User ? UserRole.Admin : UserRole.User;
    console.log(user);
    
    this.userService.editUser({...user});
  }

  deleteUser(id: string) {

    this.userService.deleteUser(id);
  }

  onSubmit(){

    const { id, repeatedPassword, ...user} = this.userForm.value;
    this.userService.addUser(user);
    this.switchMode();
  }

  switchMode() {
    this.add = !this.add;
  }

  getErrorMessages(control: AbstractControl, patterns?: string[]): string[] {

    return this.validatorService.generateErrorMsgs(control, patterns);
  }

  getUserTooltip(id: string) {

    if (this.currentUser.id === id) {
      return 'Unable to make changes to logged in user.' ;
    }
    return '';

  }
  
    
  ngOnDestroy() {

    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

  }
}
