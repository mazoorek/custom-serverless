import {Component, ElementRef, ViewChild} from '@angular/core';
import {EditorComponent} from 'ngx-monaco-editor/lib/editor.component';
import {MainService, TestFunctionRequest} from '../../main/main.service';
import {WebsocketService} from '../../main/websocket.service';
import {editor, MarkerSeverity} from 'monaco-editor';
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

@Component({
  selector: 'functions',
  template: `
    <h2>functions</h2>
    <ngx-monaco-editor #testEditor
                       class="my-code-editor"
                       [options]="testEditorOptions"
                       [ngModel]="testCode"
                       (onInit)="onTestFunctionEditorInit($event)"
                       (ngModelChange)="onTestCodeChange($event)">
    </ngx-monaco-editor>
    <button mat-raised-button color="primary" (click)="testFunction()" [disabled]="!validJavascriptSyntax">
      test function
    </button>
    <form>
      <mat-form-field class="input-container" appearance="fill">
        <mat-label>Function app name</mat-label>
        <input matInput value="something" #functionAppNameInput autocomplete="off">
      </mat-form-field>
    </form>
  `,
  styleUrls: ['./functions.component.scss']
})
export class FunctionsComponent {
  @ViewChild('functionAppNameInput')
  functionAppNameInput!: ElementRef;

  @ViewChild('testEditor')
  testEditor!: EditorComponent;

  validJavascriptSyntax: boolean = true;

  testEditorOptions = {theme: 'vs-dark', language: 'javascript'};
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


  testFunctionEditor!: IStandaloneCodeEditor;

  constructor(private mainService: MainService, private websocketService: WebsocketService) {
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
            console.log("received message: " + (message as MessageEvent).data);
            if ((message as MessageEvent).data === 'ready') {
              this.mainService.testFunction(request).subscribe(response => {
                console.log(response);
              });
            } else if ((message as MessageEvent).data === 'failed') {
              console.log('setting up runtime failed');
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
}
