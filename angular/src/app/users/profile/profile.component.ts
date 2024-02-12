import { Component, ViewChild } from '@angular/core';
import { Subscription} from 'rxjs';
import { User } from '../user.model';
import { AuthService } from 'src/app/shared/auth.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidatorService } from 'src/app/shared/validator.service';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  authenticated : boolean = false;
  authSubscription : Subscription | null = null;

  user: User = new User();
  userSubscription : Subscription | null = null;

  profileForm! : FormGroup;
  edit: boolean = false;

  imgDir : string = environment.API_URL + '/assets/uploads/';
  defaultImg : string = environment.API_URL + '/assets/img/' + 'avatar.png';
  maxSize: boolean = false;

  @ViewChild('fileInput') fileInput: any;
  
  constructor(private authService: AuthService, private fb : FormBuilder, private validatorService: ValidatorService) {}

  ngOnInit(): void {

    this.authSubscription = this.authService.authStatus.subscribe(authenticated => {
      this.authenticated = authenticated;
    });
    this.userSubscription = this.authService.getUser().subscribe(user => {
      this.user = user;
    });

    this.initForm();
 }

 initForm(): void {
  this.profileForm = this.fb.group({
    'username' : new FormControl({value: this.user.username, disabled: true}, null),
    'name' : new FormControl(this.user.name, null),
    'surname' : new FormControl(this.user.surname, null),
    'age' : new FormControl(this.user.age, null),
    'email': new FormControl(this.user.email, [Validators.required, Validators.email])
  });
}

 getErrorMessages(control: AbstractControl, patterns?: string[]): string[] {

  return this.validatorService.generateErrorMsgs(control, patterns);
}

 onEdit() {
 
  if (this.edit) {
  
    let user = {...this.profileForm.value, id: this.user.id, username: this.user.username, 
      password: this.user.password, role: this.user.role, imageUrl: this.user.imageUrl};   

    this.authService.editUser(user)
    .subscribe({
      next: (status: string) => {
      
        if (status === 'OK') {
            this.authService.restoreUser(user);
        }
    },
      error: (error) => {
        console.error(error);
    }});
  }
  
  this.edit = !this.edit;

}

 onCancel() {

  this.edit = !this.edit;
  this.initForm();
  
 }

 openFileInput() {
  
    this.fileInput.nativeElement.click();
  }

 onFileSelected(event: any) {

    const file = event.target.files[0];
    console.log(file);

    if (file && file.size < 200 * 1024) {

      this.maxSize = false;

      this.authService.editProfileImg(this.user.id, file)
      .subscribe({
          next: (status: string) => {
          
            if (status === 'OK') {
              this.authService.restoreUser(this.user);
            }
          },
            error: (error) => {
              console.error(error);
          }});

    }
    else {
      this.maxSize = true;
    }
  }

  removeImage() {

    this.authService.deleteProfileImg(this.user.id)
      .subscribe({
        next: (status: string) => {
          console.log(status);
        
          if (status === 'OK') {
            this.authService.restoreUser(this.user);
          }
        },
          error: (error) => {
            console.error(error);
        }});
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
