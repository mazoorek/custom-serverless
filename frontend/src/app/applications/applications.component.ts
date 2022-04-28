import {Component, ElementRef, ViewChild} from '@angular/core';
import {MainService} from '../main/main.service';

@Component({
  selector: 'applications',
  template: `
    <h2>Applications</h2>
    <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
      <ng-container matColumnDef="applicationName">
        <th mat-header-cell *matHeaderCellDef> Application name</th>
        <td mat-cell *matCellDef="let element"> {{element}} </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
    <form>
      <mat-form-field class="input-container" appearance="fill">
        <mat-label>App name</mat-label>
        <input matInput value="" #appNameInput autocomplete="off">
      </mat-form-field>
    </form>
    <button mat-raised-button color="primary" (click)="createApp()">create app</button>
  `,
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent {

  @ViewChild('appNameInput')
  appNameInput!: ElementRef;

  displayedColumns: string[] = ['applicationName'];
  dataSource: string[] = [];

  constructor(private mainService: MainService) {
    this.mainService.getApps().subscribe(apps => this.dataSource = apps);
  }

  createApp(): void {
    let appName = this.appNameInput.nativeElement.value;
    this.mainService.createApps(appName).subscribe(_ => {
      this.mainService.getApps().subscribe(apps => this.dataSource = apps);
    });
  }

}