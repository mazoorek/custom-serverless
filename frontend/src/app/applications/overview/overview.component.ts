import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Application, ApplicationsService} from '../applications.service';
import {DeletePopupComponent} from '../../popup/delete-popup.component';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'overview',
  template: `
    <h2>overview</h2>
    <div class="buttons-container">
      <button *ngIf="!application.up" class="btn btn--green" (click)="startApp()">START</button>
      <button *ngIf="!!application.up" class="btn btn--orange" (click)="stopApp()">STOP</button>
      <button class="btn btn--orange" (click)="deleteApp()">DELETE</button>
    </div>
    <form [formGroup]="applicationForm" class="form--application">
      <div class="form__group">
        <label class="form__label" for="name">Application name</label>
        <input formControlName="name"
               class="form__input"
               id="name"
               required="required"
               placeholder="type your application name"/>
      </div>
      <button class="btn btn--green" (click)="editApp()">Edit application name</button>
    </form>
  `,
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent {

  applicationForm: FormGroup;
  application: Application;

  constructor(private applicationsService: ApplicationsService,
              private fb: FormBuilder, private router: Router, private dialog: MatDialog) {
    this.application = this.applicationsService.currentApplication;
    // TODO unique validation
    this.applicationForm = fb.group({
      name: [this.application.name, Validators.compose([Validators.required, Validators.maxLength(255)])]
    });
  }

  editApp(): void {
    this.applicationsService.editApp(this.application.name, this.applicationForm.value.name).subscribe(() => {
      this.application.name = this.applicationForm.value.name;
    });
  }

  startApp(): void {
    this.applicationsService.startApp(this.application.name).subscribe(() => {
      this.applicationsService.getApp(this.application.name).subscribe(() => {
        this.application = this.applicationsService.currentApplication;
      });
    });
  }

  stopApp(): void {
    this.applicationsService.stopApp(this.application.name).subscribe(() => {
      this.applicationsService.getApp(this.application.name).subscribe(() => {
        this.application = this.applicationsService.currentApplication;
      });
    });
  }

  deleteApp(): void {
    this.dialog.open(DeletePopupComponent, {
      data: {
        appName: this.application.name
      },
    }).afterClosed().subscribe(deleted => {
        if (deleted) {
          this.applicationsService.deleteApp(this.application.name).subscribe(() => {
            this.applicationsService.getApps().subscribe(() => {
              this.router.navigate(['applications']);
            });
          })
        }
      }
    );
  }
}
