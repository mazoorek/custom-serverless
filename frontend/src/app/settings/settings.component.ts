import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {select, Store} from '@ngrx/store';
import {AppState} from '../store/app.reducers';
import {selectUserEmail} from '../store/user/user.selectors';
import {UserService} from '../user/user.service';
import {ResponseResult} from '../store/user/user.model';
import {emailChange} from '../store/user/user.actions';

@Component({
  selector: 'settings',
  template: `
    <h2>Change email</h2>
    <form [formGroup]="emailForm" class="form form--login">
      <div class="form__group">
        <label class="form__label" for="email">New email address</label>
        <input formControlName="email" class="form__input" id="email" type="email" placeholder="you@example.com"
               required="required"/>
      </div>
      <div class="form__group">
        <label class="form__label" for="password">Password</label>
        <input formControlName="password" class="form__input" id="password" type="password" placeholder="••••••••"
               required="required"
               minlength="8"/>
      </div>
      <button class="btn btn--green" (click)="changeEmail()">Save Email</button>
      <ng-container *ngIf="emailFormValidationErrors.length > 0 || changeEmailResult">
        <div class="validation-container">
          <div *ngFor="let error of emailFormValidationErrors" class="validation-error">
            {{error}}
          </div>
          <div class="validation-valid" *ngIf="changeEmailResult?.success">
            {{changeEmailResult?.message}}
          </div>
          <div class="validation-error" *ngIf="!changeEmailResult?.success">
            {{changeEmailResult?.message}}
          </div>
        </div>
      </ng-container>
    </form>
    <div class="line"></div>
    <h2>Change password</h2>
    <form [formGroup]="passwordForm" class="form form--login">
      <div class="form__group">
        <label class="form__label" for="oldPassword">Old Password</label>
        <input formControlName="oldPassword" class="form__input" id="oldPassword" type="password" placeholder="••••••••"
               required="required"
               />
      </div>
      <div class="form__group">
        <label class="form__label" for="newPassword">New Password</label>
        <input formControlName="newPassword" class="form__input" id="newPassword" type="password" placeholder="••••••••"
               required="required"
               minlength="8"/>
      </div>
      <div class="form__group">
        <label class="form__label" for="newPasswordConfirm">New Password Confirm</label>
        <input formControlName="newPasswordConfirm" class="form__input" id="newPasswordConfirm" type="password"
               placeholder="••••••••"
               required="required"
               minlength="8"/>
      </div>
      <button class="btn btn--green" (click)="changePassword()">Save Password</button>
      <ng-container *ngIf="passwordFormValidationErrors.length > 0 || changePasswordResult">
        <div class="validation-container">
          <div *ngFor="let error of passwordFormValidationErrors" class="validation-error">
            {{error}}
          </div>
          <div class="validation-valid" *ngIf="changePasswordResult?.success">
            {{changePasswordResult?.message}}
          </div>
          <div class="validation-error" *ngIf="!changePasswordResult?.success">
            {{changePasswordResult?.message}}
          </div>
        </div>
      </ng-container>
    </form>
  `,
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  emailForm: FormGroup;
  passwordForm: FormGroup;
  changeEmailResult?: ResponseResult;
  changePasswordResult?: ResponseResult;
  passwordFormValidationErrors: string[] = [];
  emailFormValidationErrors: string[] = [];

  constructor(private fb: FormBuilder,
              private changeDetection: ChangeDetectorRef,
              private userService: UserService,
              private store: Store<AppState>) {
    this.emailForm = fb.group({
      email: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      password: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
    });
    this.passwordForm = fb.group({
      oldPassword: ['', Validators.compose([Validators.required, Validators.maxLength(255), this.validateOldPassword.bind(this)])],
      newPassword: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      newPasswordConfirm: ['', Validators.compose([Validators.maxLength(255), this.validatePasswordConfirm.bind(this)])]
    });
  }

  ngOnInit(): void {
    this.store.pipe(
      select(selectUserEmail)
    ).subscribe(userEmail => {
      this.emailForm.controls['email'].patchValue(userEmail);
      this.changeDetection.detectChanges();
    });
  }

  validateOldPassword(control: AbstractControl): ValidationErrors | null {
    if(this.passwordForm?.value?.newPassword === control.value) {
      return {invalidPasswordConfirm: true}
    }
    return null;
  }

  validatePasswordConfirm(control: AbstractControl): ValidationErrors | null {
    if(this.passwordForm?.value?.newPassword !== control.value) {
      return {invalidPasswordConfirm: true}
    }
    return null;
  }

  changeEmail(): void {
    this.changeEmailResult = undefined;
    this.emailFormValidationErrors = [];
    if(this.emailForm.valid) {
      this.userService.changeEmail(this.emailForm.value).subscribe(() => {
          this.changeEmailResult = {
            success: true,
            message: 'email change success'
          };
          this.store.dispatch(emailChange({newEmail: this.emailForm.value.email}))
          this.changeDetection.detectChanges();
        },
        (error) => {
          this.changeEmailResult = {
            success: false,
            message: error.error.message
          };
          this.changeDetection.detectChanges();
        });
    } else {
      this.prepareEmailFormValidationErrors();
    }
  }

  changePassword(): void {
    this.changePasswordResult = undefined;
    this.passwordFormValidationErrors = [];
    if(this.passwordForm.valid) {

      this.userService.changePassword(this.passwordForm.value).subscribe(() => {
          this.changePasswordResult = {
            success: true,
            message: 'password change success'
          };
          this.changeDetection.detectChanges();
        },
        (error) => {
          this.changePasswordResult = {
            success: false,
            message: error.error.message
          };
          this.changeDetection.detectChanges();
        });
    } else {
      this.preparePasswordFormValidationErrors();
    }
  }

  prepareEmailFormValidationErrors(): void {
    const controls = this.emailForm.controls;
    for (const name in this.emailForm.controls) {
      if (controls[name].invalid) {
        if (name === 'email') {
          this.emailFormValidationErrors.push('email field must be of email pattern');
        }
        if (name === 'password') {
          this.emailFormValidationErrors.push('password must be minimum 8 characters long');
        }
      }
    }
    this.changeDetection.detectChanges();
  }

  preparePasswordFormValidationErrors(): void {
    const controls = this.passwordForm.controls;
    for (const name in this.passwordForm.controls) {
      if (controls[name].invalid) {
        if (name === 'oldPassword') {
          this.passwordFormValidationErrors.push('new password must be different from the old one');
        }
        if (name === 'newPassword') {
          this.passwordFormValidationErrors.push('password must be minimum 8 characters long');
        }
        if (name === 'newPasswordConfirm') {
          this.passwordFormValidationErrors.push('password and passwordConfirm must be the same');
        }
      }
    }
    this.changeDetection.detectChanges();
  }
}
