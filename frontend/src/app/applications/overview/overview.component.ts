import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Application, ApplicationsService} from '../applications.service';
import {DeletePopupComponent} from '../../popup/delete-popup.component';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../store/app.reducers';
import {selectApplication} from '../../store/applications/applications.selectors';
import {isLoggedIn} from '../../store/user/user.selectors';
import {distinctUntilChanged, filter} from 'rxjs';
import {
  deleteSelectedApplication,
  editSelectedApplicationName,
  startApplication,
  startSelectedApplication,
  stopSelectedApplication
} from '../../store/applications/applications.actions';

@Component({
  selector: 'overview',
  template: `
    <h2>overview</h2>
    <div class="buttons-container">
      <button *ngIf="!application?.up" class="btn btn--green" (click)="startApp()">START</button>
      <button *ngIf="!!application?.up" class="btn btn--orange" (click)="stopApp()">STOP</button>
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
export class OverviewComponent implements OnInit {

  applicationForm: FormGroup;
  application?: Application;

  constructor(private applicationsService: ApplicationsService,
              private store: Store<AppState>,
              private changeDetection: ChangeDetectorRef,
              private fb: FormBuilder, private router: Router, private dialog: MatDialog) {
    // TODO unique validation
    this.applicationForm = this.fb.group({
      name: [this.application?.name, Validators.compose([Validators.required, Validators.maxLength(255)])]
    });
  }

  ngOnInit(): void {
    this.store.pipe(
      select(selectApplication),
      filter(application => !!application)
    ).subscribe(application => {
      this.application = application;
      this.applicationForm.controls['name'].patchValue(application?.name);
      this.changeDetection.detectChanges();
    });
  }

  editApp(): void {
    this.store.dispatch(editSelectedApplicationName({
      oldAppName: this.application!.name,
      appName: this.applicationForm.value.name
    }));
  }

  startApp(): void {
    this.store.dispatch(startSelectedApplication({appName: this.application!.name}));
  }

  stopApp(): void {
    this.store.dispatch(stopSelectedApplication({appName: this.application!.name}));
  }

  deleteApp(): void {
    this.dialog.open(DeletePopupComponent, {
      data: {
        appName: this.application!.name
      },
    }).afterClosed().subscribe(deleted => {
        if (deleted) {
          this.store.dispatch(deleteSelectedApplication({appName: this.application!.name}));
        }
      }
    );
  }
}
