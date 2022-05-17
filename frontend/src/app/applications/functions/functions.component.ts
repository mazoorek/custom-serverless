import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ApplicationsService} from '../applications.service';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {DeletePopupComponent} from '../../popup/delete-popup.component';
import {selectApplication} from '../../store/applications/applications.selectors';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../store/app.reducers';
import {Application, Function} from '../../store/applications/applications.model';
import {filter} from 'rxjs';
import {createFunction, moveToFunction, deleteFunction} from '../../store/applications/applications.actions';

@Component({
  selector: 'settings',
  template: `
    <h2>Functions</h2>
    <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef>Function name</mat-header-cell>
        <mat-cell *matCellDef="let func">
          <span>{{func.name}}</span>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="delete">
        <mat-header-cell *matHeaderCellDef class="action-cell"></mat-header-cell>
        <mat-cell *matCellDef="let func" class="action-cell action-cell--delete"
                  (click)="deleteFunction(func.name, $event)">
          <mat-icon>delete</mat-icon>
        </mat-cell>
      </ng-container>

      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell">You have no functions</td>
      </tr>

      <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedColumns;" (click)="showFunction(row.name)"></mat-row>
    </table>

    <form [formGroup]="functionForm" class="form--function">
      <div class="form__group">
        <label class="form__label" for="name">Function name</label>
        <input formControlName="name"
               class="form__input"
               id="name"
               required="required"
               placeholder="type your function name"/>
      </div>
      <button class="btn btn--green" (click)="createFunction()">Create new function</button>
    </form>
  `,
  styleUrls: ['./functions.component.scss']
})
export class FunctionsComponent implements OnInit {

  displayedColumns: string[] = ['name', 'delete'];
  dataSource: Function[] = [];
  functionForm: FormGroup;
  application?: Application;

  constructor(private applicationsService: ApplicationsService,
              private changeDetection: ChangeDetectorRef,
              private router: Router,
              private fb: FormBuilder,
              private store: Store<AppState>,
              private dialog: MatDialog) {
    this.functionForm = fb.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(255)])]
    });
  }

  ngOnInit(): void {
    this.store.pipe(
      select(selectApplication),
      filter(application => !!application)
    ).subscribe(application => {
      this.application = application
      this.dataSource = this.application!.functions;
      this.changeDetection.detectChanges();
    });
  }

  createFunction(): void {
    let functionName = this.functionForm.value.name;
    this.store.dispatch(createFunction({appName: this.application!.name, functionName}));
  }

  showFunction(functionName: string): void {
    this.store.dispatch(moveToFunction({appName: this.application!.name, functionName}));
  }

  deleteFunction(functionName: string, event: Event): void {
    event.stopPropagation();
    this.dialog.open(DeletePopupComponent, {
      data: {
        name: functionName
      },
    }).afterClosed().subscribe(deleted => {
        if (deleted) {
          this.store.dispatch(deleteFunction({appName: this.application!.name, functionName}));
        }
      }
    );
  }
}
