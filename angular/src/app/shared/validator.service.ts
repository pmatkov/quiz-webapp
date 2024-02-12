import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

  constructor() { }

msgTemplates : Map<string, string> = new Map([
    ['required', '[replace] is required'],
    ['minlength', '[replace1] must be at least [replace2] characters'],
    ['email', 'e-mail is not valid'],
    ['pattern', '[replace] must have: '],
    ['nomatch', '[replace] do not match']
    ,]);

  globalValidator(): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {

      if (control instanceof FormGroup) {

        for (const controlName in control.controls) {
          const formControl = control.get(controlName);
  
          if (formControl && formControl.hasError('required')) {
            return { 'requiredGlobal': true };
          }
        }
      }
      return null;
    };
  }

  matchValidator(primary: string, secondary: string): ValidatorFn {
    
    return (abstractControl: AbstractControl): ValidationErrors | null => {
      const primaryControl = abstractControl.get(primary);
      const secondaryControl = abstractControl.get(secondary);

      const secondaryControlErrors = secondaryControl!.errors || {};
  
      if (primaryControl!.value !== secondaryControl!.value) {

        secondaryControl!.setErrors({ ...secondaryControlErrors, 'nomatch': true });
        return { 'nomatch': true };
      } else {
        secondaryControl!.setErrors(null);
        return null;
      }
    };
  }

  generateErrorMsgs(control: AbstractControl, patterns?: string[] | null, prefix: string = ''): string[] {

    const formGroup = control.parent;
    let controlName: string | undefined = '';

    if (formGroup) {
      const controls = formGroup.controls as {[key: string]: AbstractControl};
      const cn = Object.keys(controls).find(name => control === controls[name]);
      controlName = prefix + ' ' + (!isNaN(parseInt(cn!)) ? String(parseInt(cn!) + 1) : cn);

      if (controlName?.indexOf('repeated') != -1) {
        controlName = controlName?.replace('repeated', '').toLowerCase(); 
      }
    }

    const messages: string[] = [];
    let msg: string | undefined = '';
    const errors: ValidationErrors | null = control.errors;
  
    if (errors) {
  
      if (errors['required']) {
        msg = this.msgTemplates.get('required')?.replace('[replace]', controlName!);
        messages.push(msg!);
      }
  
      if (errors['minlength']) {
        msg = this.msgTemplates.get('minlength')?.replace('[replace1]', controlName!);
        msg = msg?.replace('[replace2]', errors['minlength'].requiredLength);
        messages.push(msg!);
      }

      if (errors['email']) {
        msg = this.msgTemplates.get('email');
        messages.push(msg!);
      }

      if (errors['pattern']) {
        msg = this.msgTemplates.get('pattern')?.replace('[replace]', controlName!);
        patterns?.forEach(pattern => {
          msg += pattern + ', ';
        })
        msg = msg?.replace(/[,\s]+$/, '');
        messages.push(msg!);
      }
 
      if (errors['nomatch']) {
        msg = this.msgTemplates.get('nomatch')?.replace('[replace]', controlName! + 's');
        messages.push(msg!);
      }

    }
    return messages;
  }
    
}


