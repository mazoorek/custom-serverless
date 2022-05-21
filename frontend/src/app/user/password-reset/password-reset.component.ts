import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
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
          />
        </div>
        <button class="btn btn--green" (click)="resetPassword()">Reset Password</button>
        <ng-container *ngIf="validationErrors.length > 0 || resetPasswordResult">
          <div class="validation-container">
            <div *ngFor="let error of validationErrors" class="validation-error">
              {{error}}
            </div>
            <div class="validation-error" *ngIf="!resetPasswordResult?.success">{{resetPasswordResult?.message}}</div>
            <div class="validation-valid" *ngIf="resetPasswordResult?.success">{{resetPasswordResult?.message}}</div>
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
  validationErrors: string[] = [];

  constructor(private fb: FormBuilder,
              private changeDetection: ChangeDetectorRef,
              private userService: UserService,
              private route: ActivatedRoute,
              private router: Router,
              private store: Store<AppState>) {
    this.passwordForm = fb.group({
      password: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      passwordConfirm: ['', Validators.compose([Validators.maxLength(255), this.validatePasswordConfirm.bind(this)])]
    });
  }

  validatePasswordConfirm(control: AbstractControl): ValidationErrors | null {
    if(this.passwordForm?.value?.password !== control.value) {
      return {invalidPasswordConfirm: true}
    }
    return null;
  }

  resetPassword(): void {
    this.validationErrors = [];
    this.resetPasswordResult = undefined;
    if(this.passwordForm.valid) {
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
    } else {
      this.prepareValidationErrors();
    }
  }

  prepareValidationErrors(): void {
    const controls = this.passwordForm.controls;
    for (const name in this.passwordForm.controls) {
      if (controls[name].invalid) {
        if (name === 'password') {
          this.validationErrors.push('password must be minimum 8 characters long');
        }
        if (name === 'passwordConfirm') {
          this.validationErrors.push('password and passwordConfirm must be the same');
        }
      }
    }
  }
}
