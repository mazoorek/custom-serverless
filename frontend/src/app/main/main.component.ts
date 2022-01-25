import {Component, ElementRef, ViewChild} from '@angular/core';
import {MainService} from './main.service';
import {Observable, of} from 'rxjs';

@Component({
  selector: 'app-main',
  template: `
    <div class="center">
      <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
        <ng-container matColumnDef="applicationName">
          <th mat-header-cell *matHeaderCellDef> Application name </th>
          <td mat-cell *matCellDef="let element"> {{element}} </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
      <form>
        <mat-form-field class="input-container" appearance="fill">
          <mat-label>App name</mat-label>
          <input matInput  value="" #appNameInput autocomplete="off">
        </mat-form-field>
      </form>
      <button mat-raised-button color="primary" (click)="createApp()">create app</button>
    </div>
  `,
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  @ViewChild('appNameInput') appNameInput!: ElementRef;
  apps$: Observable<String[]> = of(["ab", "cd"]);
  displayedColumns: string[] = ['applicationName'];
  dataSource: string[] = [];

  constructor(private mainService: MainService) {
    this.mainService.getApps().subscribe(apps => this.dataSource = apps);
  }

  createApp(): void {
    let appName = this.appNameInput.nativeElement.value;
    this.mainService.createApps(appName).subscribe(response => {
      console.log(response);
    });
  }
}
