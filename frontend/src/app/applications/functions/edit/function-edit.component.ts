import {Component} from '@angular/core';
import {TestFunctionRequest} from '../../../main/main.service';
import {WebsocketService} from '../../../main/websocket.service';
import {editor, MarkerSeverity} from 'monaco-editor';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Application, ApplicationsService, Function} from '../../applications.service';
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

@Component({
  selector: 'function-edit',
  template: `
    <h2>functions</h2>
    <form [formGroup]="functionMetadataForm" class="form--function">
      <div class="form__group">
        <label class="form__label" for="name">Function name</label>
        <input formControlName="name"
               class="form__input"
               id="name"
               required="required"
               placeholder="type your application name"/>
      </div>
      <div class="form__group">
        <label class="form__label" for="idempotent">Idempotent</label>
        <mat-checkbox formControlName="idempotent">Cache results for the same function arguments</mat-checkbox>
      </div>
      <button class="btn btn--green" (click)="editFunctionMetadata()">Edit function metadata</button>
    </form>
    <ngx-monaco-editor class="code-editor"
                       [options]="contentEditorOptions"
                       [ngModel]="contentCode"
                       (onInit)="onContentFunctionEditorInit($event)"
                       (ngModelChange)="onContentCodeChange($event)">
    </ngx-monaco-editor>
    <div class="function__input">
      <div>Input definition for testing function</div>
      <ngx-monaco-editor class="code-editor"
                         [options]="inputEditorOptions"
                         (onInit)="onInputEditorInit($event)"
                         [ngModel]="inputCode"
                         (ngModelChange)="onInputCodeChange($event)">
      </ngx-monaco-editor>
      <ng-container *ngIf="inputSyntaxErrors.length > 0">
        <div class="validation-error validation-error--title">
          Function content can not be processed due to input syntax errors:
        </div>
        <div *ngFor="let error of inputSyntaxErrors" class="validation-error">
          {{error}}
        </div>
      </ng-container>
    </div>
    <div class="buttons-container">
      <button class="btn btn--white" (click)="testFunction()">test function</button>
      <button class="btn btn--green" (click)="editFunctionContent()">edit function content</button>
    </div>
    <ng-container *ngIf="functionContentSyntaxErrors.length > 0">
      <div class="validation-error validation-error--title">
        Function content can not be processed due to syntax errors:
      </div>
      <div *ngFor="let error of functionContentSyntaxErrors" class="validation-error">
        {{error}}
      </div>
    </ng-container>
  `,
  styleUrls: ['./function-edit.component.scss']
})
export class FunctionEditComponent {

  contentEditorOptions = {theme: 'vs-dark', language: 'javascript'};
  contentFunctionEditor!: IStandaloneCodeEditor;
  contentCode: string;
  functionContentSyntaxErrors: string[] = [];

  functionMetadataForm: FormGroup;
  currentFunction: Function;
  application: Application;

  inputEditorOptions = {theme: 'vs-dark', language: 'json'};
  inputCode: string =`{}`;
  inputEditor!: IStandaloneCodeEditor;
  inputSyntaxErrors: string[] = [];

  constructor(private applicationsService: ApplicationsService,
              private websocketService: WebsocketService,
              private fb: FormBuilder) {
    this.currentFunction = this.applicationsService.currentFunction;
    this.application = this.applicationsService.currentApplication;
    this.contentCode = this.currentFunction.content;
    this.functionMetadataForm = fb.group({
      name: [this.currentFunction.name, Validators.compose([Validators.required, Validators.maxLength(255)])],
      idempotent: [this.currentFunction.idempotent, Validators.compose([Validators.required, Validators.maxLength(255)])]
    });
  }

  editFunctionMetadata(): void {
    this.applicationsService.editFunction(this.application.name, this.currentFunction.name, this.functionMetadataForm.value)
      .subscribe(() => {
        this.applicationsService.getFunction(this.application.name, this.functionMetadataForm.value.name)
          .subscribe( () => {
            this.currentFunction = this.applicationsService.currentFunction;
          });
      });
  }

  editFunctionContent(): void {
    this.applicationsService.editFunction(this.application.name, this.currentFunction.name, {content: this.contentCode} as Function)
      .subscribe(() => {
        this.applicationsService.getFunction(this.application.name, this.currentFunction.name)
          .subscribe( () => {
            this.currentFunction = this.applicationsService.currentFunction;
          });
      });
  }

  onContentFunctionEditorInit(testFunctionEditor: IStandaloneCodeEditor): void {
    this.contentFunctionEditor = testFunctionEditor;
    (<any>window).monaco.editor.onDidChangeMarkers(() => {
      this.functionContentSyntaxErrors = (<any>window).monaco.editor.getModelMarkers({owner: "javascript"})
        .filter((marker: editor.IMarker) => marker.severity === MarkerSeverity.Error)
        .map((marker: editor.IMarker) => marker.message);
    });
  }

  onInputEditorInit(inputEditor: IStandaloneCodeEditor): void {
    this.inputEditor = inputEditor;
    (<any>window).monaco.editor.onDidChangeMarkers(() => {
      this.inputSyntaxErrors = (<any>window).monaco.editor.getModelMarkers({owner: "json"})
        .filter((marker: editor.IMarker) => marker.severity === MarkerSeverity.Error)
        .map((marker: editor.IMarker) => marker.message);
    });
  }

  onInputCodeChange(updatedCode: string): void {
    this.inputCode = updatedCode;
  }

  onContentCodeChange(updatedCode: string): void {
    this.contentCode = updatedCode;
  }

  testFunction() {
    if(this.functionContentSyntaxErrors.length === 0 && this.inputSyntaxErrors.length === 0) {
      let request: TestFunctionRequest = {
        code: this.contentCode,
        args: JSON.parse(this.inputCode),
        clientAppName: this.application.name
      };
      this.applicationsService.getRuntime(this.application.name).subscribe(response => {
        if (!response.runtimeReady) {
          this.websocketService.connect();
          this.websocketService.onOpen$.subscribe(_ => {
            console.log("ws connection opened");
            this.websocketService.sendMessage(this.application.name);
            this.websocketService.onMessage$.subscribe((message: Event) => {
              console.log("received message: " + (message as MessageEvent).data);
              if ((message as MessageEvent).data === 'ready') {
                this.applicationsService.testFunction(request).subscribe(response => {
                  console.log(response);
                });
              } else if ((message as MessageEvent).data === 'failed') {
                console.log('setting up runtime failed');
              }
            });
          });
        } else {
          this.applicationsService.testFunction(request).subscribe(response => {
            console.log(response);
          });
        }
      });
    }
  }
}
