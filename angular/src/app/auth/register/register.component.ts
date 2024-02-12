import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/auth.service';
import { ValidatorService } from 'src/app/shared/validator.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../auth.css']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  message : string = '';

  constructor(private authService: AuthService, private fb : FormBuilder, private validatorService: ValidatorService) {}

  ngOnInit(): void {

  let pattern = /^(?=.*\d)(?=.*[@_!#$%^&*()\-+={}[\]:;<>,.?~\\/])/;

    this.registerForm = this.fb.group({
      'username': new FormControl("", [Validators.required, Validators.minLength(3)]),
      'password': new FormControl("", [Validators.required, Validators.minLength(8), Validators.pattern(pattern)]),
      'repeatedPassword': new FormControl("", [Validators.required, Validators.minLength(8), Validators.pattern(pattern)]),
      'email': new FormControl("", [Validators.required, Validators.email])},
      {
        validators: [this.validatorService.matchValidator('password', 'repeatedPassword')]
      }
    )

    this.authService.msgEmitter.subscribe((msg : string) => {
      this.message = msg;
    });

  }

  getErrorMessages(control: AbstractControl, patterns?: string[]): string[] {

    return this.validatorService.generateErrorMsgs(control, patterns);
  }

  onRegister(){

    const {repeatedPassword, ...user} = this.registerForm.value;
    user.role = 'user';
    this.authService.registerUser(user);
  }

}
