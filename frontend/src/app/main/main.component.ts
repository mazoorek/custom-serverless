import {Component, ElementRef, ViewChild} from '@angular/core';
import {MainService} from './main.service';
import {EditorComponent} from 'ngx-monaco-editor/lib/editor.component';

@Component({
  selector: 'app-main',
  template: `
    <ngx-monaco-editor class="my-code-editor" [options]="validateEditorOptions" [ngModel]="packageJsonCode"
                       (ngModelChange)="onPackageJsonCodeChange($event)"></ngx-monaco-editor>
    <button mat-raised-button color="primary" (click)="validatePackageJson()">validate package.json</button>
    <ngx-monaco-editor #testEditor class="my-code-editor" [options]="testEditorOptions" [ngModel]="testCode"
                       (ngModelChange)="onTestCodeChange($event)"></ngx-monaco-editor>
    <button mat-raised-button color="primary" (click)="testFunction()">test function</button>
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
  @ViewChild('appNameInput')
  appNameInput!: ElementRef;

  @ViewChild('testEditor')
  testEditor!: EditorComponent;

  displayedColumns: string[] = ['applicationName'];
  dataSource: string[] = [];

  testEditorOptions = {theme: 'vs-dark', language: 'javascript'};
  validateEditorOptions = {theme: 'vs-dark', language: 'json'};
  packageJsonCode: string = `
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
  testCode: string = `
  let data = \`
{
  "name": "sandbox",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \\\\"Error: no test specified\\\\" && exit 1"
  },
  "keywords": [],
  "author": "name",
  "license": "ISC",
  "dependencies": {
    "package-json-validator": "^0.6.3"
  }
}
\`;

let PJV=require('package-json-validator').PJV;
let response = PJV.validate(data);
  `;


  constructor(private mainService: MainService) {
    this.mainService.getApps().subscribe(apps => this.dataSource = apps);
  }

  onPackageJsonCodeChange(updatedCode: string): void {
    this.packageJsonCode = updatedCode;
  }

  onTestCodeChange(updatedCode: string): void {
    this.testEditor.model;
    this.testCode = updatedCode;
  }

  testFunction() {
    this.mainService.testFunction(this.testCode).subscribe(response => {
      console.log(response);
    });
  }

  validatePackageJson() {
    this.mainService.validatePackageJson(this.packageJsonCode).subscribe(response => {
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
