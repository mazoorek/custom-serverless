import {Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {MainService, TestFunctionRequest} from './main.service';
import {EditorComponent} from 'ngx-monaco-editor/lib/editor.component';
import {editor, MarkerSeverity} from 'monaco-editor';
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import {WebsocketService} from './websocket.service';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'app-main',
  template: `
    <ngx-monaco-editor class="my-code-editor"
                       [options]="validateEditorOptions"
                       (onInit)="onPackageJsonEditorInit($event)"
                       [ngModel]="packageJsonCode"
                       (ngModelChange)="onPackageJsonCodeChange($event)">
    </ngx-monaco-editor>
    <button mat-raised-button color="primary" (click)="validatePackageJson()" [disabled]="!validJsonSyntax">validate
      package.json
    </button>
    <ngx-monaco-editor #testEditor
                       class="my-code-editor"
                       [options]="testEditorOptions"
                       [ngModel]="testCode"
                       (onInit)="onTestFunctionEditorInit($event)"
                       (ngModelChange)="onTestCodeChange($event)">
    </ngx-monaco-editor>
    <button mat-raised-button color="primary" (click)="testFunction()" [disabled]="!validJavascriptSyntax">test
      function
    </button>
    <form>
      <mat-form-field class="input-container" appearance="fill">
        <mat-label>Function app name</mat-label>
        <input matInput value="test" #functionAppNameInput autocomplete="off">
      </mat-form-field>
    </form>
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

  @ViewChild('functionAppNameInput')
  functionAppNameInput!: ElementRef;

  @ViewChild('testEditor')
  testEditor!: EditorComponent;

  displayedColumns: string[] = ['applicationName'];
  dataSource: string[] = [];

  validJsonSyntax: boolean = true;
  validJavascriptSyntax: boolean = true;

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
    (args) => {
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
    return response;
    }
  `;


  packageJsonEditor!: IStandaloneCodeEditor;
  testFunctionEditor!: IStandaloneCodeEditor;

  constructor(private mainService: MainService, private websocketService: WebsocketService, @Inject(DOCUMENT) private document: Document) {
    this.mainService.getApps().subscribe(apps => this.dataSource = apps);
  }

  onPackageJsonCodeChange(updatedCode: string): void {
    this.packageJsonCode = updatedCode;
  }

  onPackageJsonEditorInit(packageJsonEditor: IStandaloneCodeEditor): void {
    this.packageJsonEditor = packageJsonEditor;
    (<any>window).monaco.editor.onDidChangeMarkers(() => {
      let markers = (<any>window).monaco.editor.getModelMarkers({owner: "json"})
        .filter((marker: editor.IMarker) => marker.severity === MarkerSeverity.Error);
      this.validJsonSyntax = markers.length === 0;
    });
  }

  onTestFunctionEditorInit(testFunctionEditor: IStandaloneCodeEditor): void {
    this.testFunctionEditor = testFunctionEditor;
    (<any>window).monaco.editor.onDidChangeMarkers(() => {
      let markers = (<any>window).monaco.editor.getModelMarkers({owner: "javascript"})
        .filter((marker: editor.IMarker) => marker.severity === MarkerSeverity.Error);
      this.validJavascriptSyntax = markers.length === 0;
    });
  }

  onTestCodeChange(updatedCode: string): void {
    this.testCode = updatedCode;
  }

  testFunction() {
    const clientAppName: string = this.functionAppNameInput.nativeElement.value;
    let request: TestFunctionRequest = {
      code: this.testCode,
      args: {},
      clientAppName: clientAppName
    };
    this.mainService.getRuntime(clientAppName).subscribe(response => {
      if (!response.runtimeReady) {
        this.websocketService.connect();
        this.websocketService.onOpen$.subscribe(_ => {
          console.log("ws connection opened");
          this.websocketService.sendMessage(clientAppName);
          this.websocketService.onMessage$.subscribe((message: Event) => {
            console.log("received message: " + message);
            if((message as MessageEvent).data === 'ready') {
              this.websocketService.closeWebSocket();
              this.mainService.testFunction(request).subscribe(response => {
                console.log(response);
              });
            }
          });
        });
      } else {
        this.mainService.testFunction(request).subscribe(response => {
          console.log(response);
        });
      }
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
