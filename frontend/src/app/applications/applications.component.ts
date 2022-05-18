import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ApplicationsService} from './applications.service';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {DeletePopupComponent} from '../popup/delete-popup.component';
import {AppState} from '../store/app.reducers';
import { Store } from '@ngrx/store';
import {selectApplications} from '../store/applications/applications.selectors';
import {ApplicationsActions} from '../store/applications';
import {
  deleteApplication, moveToApplication,
  startApplication,
  stopApplication
} from '../store/applications/applications.actions';
import {Application} from '../store/applications/applications.model';

@Component({
  selector: 'applications',
  template: `
    <h2>Applications</h2>
    <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef>Application name</mat-header-cell>
        <mat-cell *matCellDef="let application">
          <span>{{application.name}}</span>
        </mat-cell>
      </ng-container>
      <ng-container matColumnDef="up">
        <mat-header-cell *matHeaderCellDef>Application state</mat-header-cell>
        <mat-cell *matCellDef="let application">
          <span>{{!!application.up ? 'RUNNING' : 'STOPPED'}}</span>
        </mat-cell>
      </ng-container>
      <ng-container matColumnDef="outdated">
        <mat-header-cell *matHeaderCellDef></mat-header-cell>
        <mat-cell *matCellDef="let application" class="outdated">
          <div *ngIf="application.outdated">
            <div class="outdated">OUTDATED</div>
            <div>RESTART NEEDED</div>
          </div>
        </mat-cell>
      </ng-container>
      <ng-container matColumnDef="changeState">
        <mat-header-cell *matHeaderCellDef class="action-cell action-cell--change-state"></mat-header-cell>
        <mat-cell *matCellDef="let application" class="action-cell action-cell--change-state">
          <button *ngIf="!application.up" class="btn btn--green" (click)="startApp(application.name, $event)">START</button>
          <button *ngIf="!!application.up" class="btn btn--orange" (click)="stopApp(application.name, $event)">STOP</button>
        </mat-cell>
      </ng-container>
      <ng-container matColumnDef="delete">
        <mat-header-cell *matHeaderCellDef class="action-cell"></mat-header-cell>
        <mat-cell *matCellDef="let application" class="action-cell action-cell--delete"
                  (click)="deleteApp(application.name, $event)">
          <mat-icon>delete</mat-icon>
        </mat-cell>
      </ng-container>

      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell">You have no applications</td>
      </tr>

      <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedColumns;" (click)="showApp(row.name)"></mat-row>
    </table>


    <form [formGroup]="applicationForm" class="form--application">
      <div class="form__group">
        <label class="form__label" for="name">Application name</label>
        <input formControlName="name"
               class="form__input"
               id="name"
               required="required"
               placeholder="type your application name"/>
      </div>
      <button class="btn btn--green" (click)="createApp()">Create new application</button>
    </form>

  `,
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent  implements  OnInit {

  displayedColumns: string[] = ['name', 'up', 'outdated', 'changeState', 'delete'];
  dataSource: Application[] = [];

  applicationForm: FormGroup;

  constructor(private applicationsService: ApplicationsService,
              private changeDetection: ChangeDetectorRef,
              private router: Router,
              private fb: FormBuilder,
              private store: Store<AppState>,
              private dialog: MatDialog) {
    // TODO validation and blocking create button
    this.applicationForm = fb.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(255)])]
    });
  }

  ngOnInit(): void {
    this.store.select(selectApplications).subscribe(apps => {
      this.dataSource = apps;
      this.changeDetection.detectChanges();
    });
  }

  createApp(): void {
    this.store.dispatch(ApplicationsActions.createApplication({appName: this.applicationForm.value.name}));
  }

  startApp(appName: string, event: Event): void {
    event.stopPropagation();
    this.store.dispatch(startApplication({appName}));
  }

  stopApp(appName: string, event: Event): void {
    event.stopPropagation();
    this.store.dispatch(stopApplication({appName}));
  }

  deleteApp(appName: string, event: Event): void {
    event.stopPropagation();
    this.dialog.open(DeletePopupComponent, {
      data: {
        name: appName
      },
    }).afterClosed().subscribe(deleted => {
        if (deleted) {
          this.store.dispatch(deleteApplication({appName}));
        }
      }
    );
  }

  showApp(appName: string): void {
    this.store.dispatch(moveToApplication({appName}));
  }
}
