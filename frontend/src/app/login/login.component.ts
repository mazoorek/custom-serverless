import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {AppState} from '../store/app.reducers';
import {loginStart, signupStart} from '../store/user/user.actions';
import {MatDialog} from '@angular/material/dialog';
import {ForgotPasswordPopupComponent} from '../popup/forgot-password-popup.component';
import {authError} from '../store/user/user.selectors';

export enum AuthenticateOption {
  SIGN_UP = 'SIGN_UP',
  LOG_IN = 'LOG_IN'
}

@Component({
  selector: 'login',
  template: `
    <div class="login-form">
      <h2 *ngIf="authenticateOption === AuthenticateOption.LOG_IN">
        Log into your account
      </h2>
      <h2 *ngIf="authenticateOption === AuthenticateOption.SIGN_UP">
        Sign up a new account
      </h2>
      <form [formGroup]="loginForm" class="form form--login">
        <div class="form__group">
          <label class="form__label" for="email">Email address</label>
          <input formControlName="email" class="form__input" id="email" type="email" placeholder="you@example.com"
                 required="required"/>
        </div>
        <div class="form__group">
          <label class="form__label" for="password">Password</label>
          <input formControlName="password" class="form__input" id="password" type="password" placeholder="••••••••"
                 required="required"
                 minlength="8"/>
        </div>
        <div class="form__group" *ngIf="authenticateOption === AuthenticateOption.SIGN_UP">
          <label class="form__label" for="passwordConfirm">Password Confirm</label>
          <input formControlName="passwordConfirm" class="form__input" id="passwordConfirm" type="password"
                 placeholder="••••••••"
                 required="required"
                 />
        </div>
        <div class="form__group" *ngIf="authenticateOption === AuthenticateOption.LOG_IN">
          <div class="buttons-container">
            <button class="btn btn--green" (click)="logIn()">Log in</button>
            <button class="btn btn--white" (click)="sendResetPasswordEmail()">Forgot password</button>
          </div>
        </div>
        <div class="form__group" *ngIf="authenticateOption === AuthenticateOption.SIGN_UP">
          <button class="btn btn--green" (click)="signUp()">Sign up</button>
        </div>
        <ng-container *ngIf="validationErrors.length > 0 || authError">
          <div class="validation-container">
            <div *ngFor="let error of validationErrors" class="validation-error">
              {{error}}
            </div>
            <div class="validation-error" *ngIf="authError">{{authError}}</div>
          </div>
        </ng-container>
      </form>
    </div>
  `,
  styleUrls: ['login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {

  readonly AuthenticateOption: typeof AuthenticateOption = AuthenticateOption;
  authenticateOption!: AuthenticateOption;
  loginForm: FormGroup;
  validationErrors: string[] = [];
  authError?: string = undefined;

  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
              private changeDetection: ChangeDetectorRef,
              private store: Store<AppState>) {
    this.loginForm = fb.group({
      email: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      password: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      passwordConfirm: [undefined, Validators.compose([Validators.maxLength(255), this.validatePasswordConfirm.bind(this)])]
    });
    this.authenticateOption = this.route.snapshot.data['option'];
  }

  ngOnInit(): void {
    this.store.select(authError).subscribe(authError => {
      this.authError = authError;
      this.changeDetection.detectChanges();
    });
  }

  validatePasswordConfirm(control: AbstractControl): ValidationErrors | null {
    if(this.authenticateOption !== undefined && this.authenticateOption === AuthenticateOption.SIGN_UP) {
      if(this.loginForm.value.password !== control.value) {
        return {invalidPasswordConfirm: true}
      }
    }
    return null;
  }


  logIn(): void {
    this.validationErrors = [];
    this.authError = undefined;
    if (this.loginForm.valid) {
      this.store.dispatch(loginStart({request: this.loginForm.value}));
    } else {
        this.prepareValidationErrors();
    }
  }

  signUp(): void {
    this.validationErrors = [];
    this.authError = undefined;
    if (this.loginForm.valid) {
      this.store.dispatch(signupStart({request: this.loginForm.value}));
    } else {
      this.prepareValidationErrors();
    }
  }

  prepareValidationErrors(): void {
    const controls = this.loginForm.controls;
    for (const name in this.loginForm.controls) {
      if (controls[name].invalid) {
        if (name === 'email') {
          this.validationErrors.push('email field must be of email pattern');
        }
        if (name === 'password') {
          this.validationErrors.push('password must be minimum 8 characters long');
        }
        if (name === 'passwordConfirm') {
          console.log(controls[name]);
          this.validationErrors.push('password and passwordConfirm must be the same');
        }
      }
    }
  }

  sendResetPasswordEmail(): void {
    this.dialog.open(ForgotPasswordPopupComponent, {});
  }
}
