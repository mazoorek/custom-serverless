import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../user/user.service';
import {ResponseResult} from '../store/user/user.model';


@Component({
  selector: 'forgot-password-popup',
  template: `
    <div>
      <div mat-dialog-content>
        <form [formGroup]="emailForm" class="form form--login">
          <div class="form__group">
            <label class="form__label" for="email">Email address</label>
            <input formControlName="email" class="form__input" id="email" type="email" placeholder="you@example.com"
                   required="required"/>
          </div>
          <div class="buttons-container">
            <button class="btn btn--green" (click)="sendResetPasswordEmail()">Reset password</button>
            <button [matDialogClose]="" class="btn btn--white">Close</button>
          </div>

          <ng-container *ngIf="validationErrors.length > 0 || emailSentResult">
            <div class="validation-container">
              <div *ngFor="let error of validationErrors" class="validation-error">
                {{error}}
              </div>
              <div class="validation-valid" *ngIf="emailSentResult?.success">
                {{emailSentResult?.message}}
              </div>
              <div class="validation-error" *ngIf="!emailSentResult?.success">
                {{emailSentResult?.message}}
              </div>
            </div>
          </ng-container>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./forgot-password-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordPopupComponent {
  emailForm: FormGroup;
  emailSentResult?: ResponseResult;
  validationErrors: string[] = [];

  constructor(private dialogRef: MatDialogRef<ForgotPasswordPopupComponent>,
              private userService: UserService,
              private changeDetection: ChangeDetectorRef,
              private fb: FormBuilder) {
    this.emailForm = fb.group({
      email: ['', Validators.compose([Validators.required, Validators.maxLength(255)])]
    });
  }

  sendResetPasswordEmail(): void {
    this.emailSentResult = undefined;
    this.validationErrors = [];
    if (this.emailForm.valid) {
      this.userService.sendResetPasswordEmail(this.emailForm.value.email).subscribe(
        () => {
          this.emailSentResult = {
            success: true,
            message: 'Reset password email sent successfully'
          };
          this.changeDetection.detectChanges();
        },
        (error) => {
          this.emailSentResult = {
            success: false,
            message: error.error.message
          };
          this.changeDetection.detectChanges();
        }
      );
    } else {
      this.prepareValidationErrors();
      this.changeDetection.detectChanges();
    }
  }

  prepareValidationErrors(): void {
    const controls = this.emailForm.controls;
    for (const name in this.emailForm.controls) {
      if (controls[name].invalid) {
        if (name === 'email') {
          this.validationErrors.push('email field must be of email pattern');
        }
        if (name === 'password') {
        }
      }
    }
  }
}
