import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ApplicationsService} from '../applications.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {DeletePopupComponent} from '../../popup/delete-popup.component';
import {selectApplication} from '../../store/applications/applications.selectors';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../store/app.reducers';
import {Application, Endpoint} from '../../store/applications/applications.model';
import {filter} from 'rxjs';
import {createEndpoint, deleteEndpoint, moveToEndpoint} from 'src/app/store/applications/applications.actions';

@Component({
  selector: 'endpoints',
  template: `
    <h2>endpoints</h2>
    <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
      <ng-container matColumnDef="url">
        <mat-header-cell *matHeaderCellDef>Endpoint url</mat-header-cell>
        <mat-cell *matCellDef="let endpoint">
          <span>{{endpoint.url}}</span>
        </mat-cell>
      </ng-container>
      <ng-container matColumnDef="functionName">
        <mat-header-cell *matHeaderCellDef>Function name</mat-header-cell>
        <mat-cell *matCellDef="let endpoint">
          <span>{{endpoint.functionName}}</span>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="delete">
        <mat-header-cell *matHeaderCellDef class="action-cell"></mat-header-cell>
        <mat-cell *matCellDef="let endpoint" class="action-cell action-cell--delete"
                  (click)="deleteEndpoint(endpoint.url, $event)">
          <mat-icon>delete</mat-icon>
        </mat-cell>
      </ng-container>

      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell">You have no endpoints</td>
      </tr>

      <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedColumns;" (click)="moveToEndpoint(row.url)"></mat-row>
    </table>

    <ng-container *ngIf="deleteEndpointError">
      <div class="validation-container">
        <div class="validation-error" *ngIf="deleteEndpointError">{{deleteEndpointError}}</div>
      </div>
    </ng-container>

    <form [formGroup]="endpointForm" class="form--endpoint">
      <div class="form__group">
        <label class="form__label" for="url">Endpoint url</label>
        <input formControlName="url"
               class="form__input"
               id="url"
               required="required"
               placeholder="type your endpoint url"/>
      </div>
      <div class="form__group">
        <label class="form__label" for="name">Function name</label>
        <input formControlName="functionName"
               class="form__input"
               id="functionName"
               required="required"
               placeholder="type your function name"/>
      </div>
      <button class="btn btn--green" (click)="createEndpoint()">Create new endpoint</button>
      <ng-container *ngIf="createEndpointError">
        <div class="validation-container">
          <div class="validation-error">{{createEndpointError}}</div>
        </div>
      </ng-container>
    </form>
  `,
  styleUrls: ['./endpoints.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EndpointsComponent implements OnInit {
  displayedColumns: string[] = ['url', 'functionName', 'delete'];
  dataSource: Endpoint[] = [];
  endpointForm: FormGroup;
  application?: Application;
  createEndpointError?: string;
  deleteEndpointError?: string;

  constructor(private applicationsService: ApplicationsService,
              private changeDetection: ChangeDetectorRef,
              private router: Router,
              private fb: FormBuilder,
              private store: Store<AppState>,
              private dialog: MatDialog) {
    this.endpointForm = fb.group({
      url: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      functionName: ['', Validators.compose([Validators.required, Validators.maxLength(255)])]
    });
  }

  ngOnInit(): void {
    this.store.pipe(
      select(selectApplication),
      filter(application => !!application)
    ).subscribe(application => {
      this.application = application
      this.dataSource = this.application!.endpoints;
      this.createEndpointError = this.application?.createEndpointError;
      this.deleteEndpointError = this.application?.deleteEndpointError;
      this.changeDetection.detectChanges();
    });
  }

  createEndpoint(): void {
    this.store.dispatch(createEndpoint({appName: this.application!.name, endpoint: this.endpointForm.value}));
  }

  moveToEndpoint(endpointUrl: string): void {
    this.store.dispatch(moveToEndpoint({appName: this.application!.name, endpointUrl}));
  }

  deleteEndpoint(endpointUrl: string, event: Event): void {
    event.stopPropagation();
    this.dialog.open(DeletePopupComponent, {
      data: {
        name: endpointUrl
      },
    }).afterClosed().subscribe(deleted => {
        if (deleted) {
          this.store.dispatch(deleteEndpoint({appName: this.application!.name, endpointUrl}));
        }
      }
    );
  }
}
