import {ChangeDetectorRef, Component} from '@angular/core';
import {Application, ApplicationsService, Endpoint} from '../applications.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {DeletePopupComponent} from '../../popup/delete-popup.component';
import {selectApplication} from '../../store/applications/applications.selectors';
import {Store} from '@ngrx/store';
import {AppState} from '../../store/app.reducers';

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
      <mat-row *matRowDef="let row; columns: displayedColumns;" (click)="showEndpoint(row.url)"></mat-row>
    </table>

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
    </form>
  `,
  styleUrls: ['./endpoints.component.scss']
})
export class EndpointsComponent {
  displayedColumns: string[] = ['url', 'functionName', 'delete'];

  dataSource: Endpoint[] = [];

  endpointForm: FormGroup;
  application?: Application;

  constructor(private applicationsService: ApplicationsService,
              private changeDetection: ChangeDetectorRef,
              private router: Router,
              private fb: FormBuilder,
              private store: Store<AppState>,
              private dialog: MatDialog) {
    this.store.select(selectApplication).subscribe(application => {
      this.application = application
      this.dataSource = this.application!.endpoints;
    });
    this.endpointForm = fb.group({
      url: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      functionName: ['', Validators.compose([Validators.required, Validators.maxLength(255)])]
    });
  }

  createEndpoint(): void {
    let endpointUrl = this.endpointForm.value.url;
    this.applicationsService.createEndpoint(this.application!.name, this.endpointForm.value).subscribe(_ => {
      this.applicationsService.getEndpoint(this.application!.name, endpointUrl).subscribe(() => {
        this.router.navigate(['applications', this.application!.name, 'endpoints', endpointUrl, 'edit']);
      });
    });
  }

  showEndpoint(endpointUrl: string): void {
    this.applicationsService.getEndpoint(this.application!.name, endpointUrl).subscribe(() => {
      this.router.navigate(['applications', this.application!.name, 'endpoints', endpointUrl, 'edit']);
    });
  }

  deleteEndpoint(endpointUrl: string, event: Event): void {
    event.stopPropagation();
    this.dialog.open(DeletePopupComponent, {
      data: {
        name: endpointUrl
      },
    }).afterClosed().subscribe(deleted => {
        if (deleted) {
          this.applicationsService.deleteEndpoint(this.application!.name, endpointUrl).subscribe(() => {
            this.applicationsService.loadApplication(this.application!.name).subscribe(() => {
              // this.dataSource = this.applicationsService.currentApplication.endpoints;
              // this.changeDetection.markForCheck();
            });
          })
        }
      }
    );
  }
}
