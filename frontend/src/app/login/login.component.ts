import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

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
          <input formControlName="email" class="form__input" id="email" type="email" placeholder="you@example.com" required="required"/>
        </div>
        <div class="form__group">
          <label class="form__label" for="password">Password</label>
          <input formControlName="password" class="form__input" id="password" type="password" placeholder="••••••••" required="required"
                 minlength="8"/>
        </div>
        <div class="form__group" *ngIf="authenticateOption === AuthenticateOption.SIGN_UP">
          <label class="form__label" for="passwordConfirm">Password Confirm</label>
          <input formControlName="passwordConfirm" class="form__input" id="passwordConfirm" type="password" placeholder="••••••••"
                 required="required"
                 minlength="8"/>
        </div>
        <div class="form__group" *ngIf="authenticateOption === AuthenticateOption.LOG_IN">
          <button class="btn btn--green" (click)="logIn()">Log in</button>
        </div>
        <div class="form__group" *ngIf="authenticateOption === AuthenticateOption.SIGN_UP">
          <button class="btn btn--green" (click)="signUp()">Sign up</button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {

  readonly AuthenticateOption: typeof AuthenticateOption = AuthenticateOption;

  _authenticateOption!: AuthenticateOption;

  @Input()
  set authenticateOption(authenticateOption: AuthenticateOption) {
    this.loginForm.reset();
    this._authenticateOption = authenticateOption;
  }

  get authenticateOption() {
    return this._authenticateOption;
  }

  loginForm: FormGroup;

  constructor(private authService: AuthService,  private fb: FormBuilder) {
    // TODO validations
    this.loginForm = fb.group({
      email: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      password: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      passwordConfirm: [undefined, Validators.compose([Validators.maxLength(255)])]
    });
  }


  ngOnInit(): void {
  }

  logIn(): void {
    this.authService.logIn(this.loginForm.value).subscribe((user) => {

      },
      (error) => console.log(error)
    );
  }

  signUp(): void {
    this.authService.signUp(this.loginForm.value).subscribe( (user) => {

    },
      (error) => console.log(error)
    );
  }
}