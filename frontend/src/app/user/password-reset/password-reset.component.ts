import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ResponseResult} from '../../store/user/user.model';
import {UserService} from '../user.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../store/app.reducers';
import {ActivatedRoute, Router} from '@angular/router';
import {userPasswordReset} from '../../store/user/user.actions';

@Component({
  selector: 'password-reset',
  template: `
    <div class="password-reset-form">
      <h2>
        Reset your password
      </h2>
      <form [formGroup]="passwordForm" class="form form--login">
        <div class="form__group">
          <label class="form__label" for="password">Password</label>
          <input formControlName="password" class="form__input" id="password" type="password" placeholder="••••••••"
                 required="required"
                 minlength="8"/>
        </div>
        <div class="form__group">
          <label class="form__label" for="passwordConfirm">Confirm Password</label>
          <input formControlName="passwordConfirm" class="form__input" id="passwordConfirm" type="password"
                 placeholder="••••••••"
                 required="required"
                 minlength="8"/>
        </div>
        <button class="btn btn--green" (click)="resetPassword()">Reset Password</button>
        <ng-container *ngIf="resetPasswordResult">
          <div class="change--success" *ngIf="resetPasswordResult.success">
            {{resetPasswordResult.message}}
          </div>
          <div class="change--failed" *ngIf="!resetPasswordResult.success">
            {{resetPasswordResult.message}}
          </div>
        </ng-container>
      </form>
    </div>
  `,
  styleUrls: ['./password-reset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordResetComponent {
  passwordForm: FormGroup;
  resetPasswordResult?: ResponseResult;

  constructor(private fb: FormBuilder,
              private changeDetection: ChangeDetectorRef,
              private userService: UserService,
              private route: ActivatedRoute,
              private router: Router,
              private store: Store<AppState>) {
    this.passwordForm = fb.group({
      password: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      passwordConfirm: ['', Validators.compose([Validators.maxLength(255)])]
    });
  }

  resetPassword(): void {
    let token = this.route.snapshot.paramMap.get('resetToken');
    this.userService.resetPassword(this.passwordForm.value, token!).subscribe((user) => {
        this.store.dispatch(userPasswordReset({user}));
        this.router.navigate([`/applications`]);
      },
      (error) => {
        this.resetPasswordResult = {
          success: false,
          message: error.error.message
        };
        this.changeDetection.detectChanges();
      });
  }
}
