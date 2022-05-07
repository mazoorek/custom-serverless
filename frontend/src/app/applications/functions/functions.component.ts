import {ChangeDetectorRef, Component} from '@angular/core';
import {Application, ApplicationsService, Function} from '../applications.service';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {DeletePopupComponent} from '../../popup/delete-popup.component';

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
export class FunctionsComponent {

  displayedColumns: string[] = ['name', 'delete'];

  dataSource: Function[] = [];

  functionForm: FormGroup;
  application: Application;

  constructor(private applicationsService: ApplicationsService,
              private changeDetection: ChangeDetectorRef,
              private router: Router,
              private fb: FormBuilder,
              private dialog: MatDialog) {
    this.application = this.applicationsService.currentApplication;
    this.dataSource = this.application.functions;
    this.functionForm = fb.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(255)])]
    });
  }

  createFunction(): void {
    let functionName = this.functionForm.value.name;
    this.applicationsService.createFunction(this.application.name, functionName).subscribe(_ => {
      this.applicationsService.getFunction(this.application.name, functionName).subscribe(() => {
        this.router.navigate(['applications', this.application.name, 'functions', functionName, 'edit']);
      });
    });
  }

  showFunction(functionName: string): void {
    this.applicationsService.getFunction(this.application.name, functionName).subscribe(() => {
      this.router.navigate(['applications', this.application.name, 'functions', functionName, 'edit']);
    });
  }

  deleteFunction(functionName: string, event: Event): void {
    event.stopPropagation();
    this.dialog.open(DeletePopupComponent, {
      data: {
        name: functionName
      },
    }).afterClosed().subscribe(deleted => {
        if (deleted) {
          this.applicationsService.deleteFunction(this.application.name, functionName).subscribe(() => {
            this.applicationsService.getApp(this.application.name).subscribe(() => {
              this.dataSource = this.applicationsService.currentApplication.functions;
              this.changeDetection.markForCheck();
            });
          })
        }
      }
    );
  }
}
