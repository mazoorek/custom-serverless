import {Component, ElementRef, ViewChild} from '@angular/core';
import {MainService} from './main.service';

@Component({
  selector: 'app-main',
  template: `
    <ngx-monaco-editor class="my-code-editor" [options]="editorOptions" [ngModel]="code"
                       (ngModelChange)="onCodeChange($event)"></ngx-monaco-editor>
    <button mat-raised-button color="primary" (click)="validatePackageJson()">validate package.json</button>
    <div class="center">
      <div style="height: 500px">
      </div>
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
    </div>
  `,
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  @ViewChild('appNameInput') appNameInput!: ElementRef;
  displayedColumns: string[] = ['applicationName'];
  dataSource: string[] = [];

  // editorOptions = {theme: 'vs-dark', language: 'javascript'};
  editorOptions = {theme: 'vs-dark', language: 'json'};
  code: string = `
   {
    "name": "sandbox",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
      "test": "echo \\"Error: no test specified\\" && exit 1"
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "dependencies": {
      "express": "^4.17.3",
      "package-json-validator": "^0.6.3"
    }
  }
  `;
  options = {
    theme: 'vs-dark'
  };


  constructor(private mainService: MainService) {
    this.mainService.getApps().subscribe(apps => this.dataSource = apps);
  }

  onCodeChange(updatedCode: string): void {
    this.code = updatedCode;
  }

  validatePackageJson() {
    this.mainService.validatePackageJson(this.code).subscribe(response => {
      console.log(response);
    });
  }

  createApp(): void {
    let appName = this.appNameInput.nativeElement.value;
    this.mainService.createApps(appName).subscribe(_ => {
      this.mainService.getApps().subscribe(apps => this.dataSource = apps);
    });
  }
}
