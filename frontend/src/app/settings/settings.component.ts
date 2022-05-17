import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
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
      <ng-container *ngIf="changeEmailResult">
        <div class="change--success" *ngIf="changeEmailResult.success">
          {{changeEmailResult.message}}
        </div>
        <div class="change--failed" *ngIf="!changeEmailResult.success">
          {{changeEmailResult.message}}
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
               minlength="8"/>
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
      <ng-container *ngIf="changePasswordResult">
        <div class="change--success" *ngIf="changePasswordResult.success">
          {{changePasswordResult.message}}
        </div>
        <div class="change--failed" *ngIf="!changePasswordResult.success">
          {{changePasswordResult.message}}
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

  constructor(private fb: FormBuilder,
              private changeDetection: ChangeDetectorRef,
              private userService: UserService,
              private store: Store<AppState>) {
    // TODO validations
    this.emailForm = fb.group({
      email: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      password: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
    });
    this.passwordForm = fb.group({
      oldPassword: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      newPassword: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      newPasswordConfirm: ['', Validators.compose([Validators.maxLength(255)])]
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

  changeEmail(): void {
    this.changeEmailResult = undefined;
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
  }

  changePassword(): void {
    this.changePasswordResult = undefined;
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
  }
}
