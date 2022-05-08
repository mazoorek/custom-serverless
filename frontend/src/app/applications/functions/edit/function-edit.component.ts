import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
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
                       [style.height.px]="contentEditorHeight"
                       [ngModel]="contentCode"
                       (onInit)="onContentFunctionEditorInit($event)"
                       (ngModelChange)="onContentCodeChange($event)">
    </ngx-monaco-editor>
    <div class="function__input">
      <div>Input definition for testing function</div>
      <ngx-monaco-editor class="code-editor"
                         [options]="inputEditorOptions"
                         [style.height.px]="inputEditorHeight"
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
    <ng-container *ngIf="resultError">
      <div class="validation-error validation-error--title">
        Error result:
      </div>
      <div class="validation-error">
        {{resultError}}
      </div>
    </ng-container>
    <ng-container *ngIf="result">
      <mat-card class="mat-elevation-z4">
        <div class="validation-valid validation-valid--title">
          Result:
        </div>
        <div class="validation-valid">
          <pre>{{result}}</pre>
        </div>
      </mat-card>
    </ng-container>
  `,
  styleUrls: ['./function-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FunctionEditComponent {

  contentEditorOptions = {theme: 'vs-dark', language: 'javascript', automaticLayout: true, scrollBeyondLastLine: false};
  contentFunctionEditor!: IStandaloneCodeEditor;
  contentCode: string;
  functionContentSyntaxErrors: string[] = [];

  functionMetadataForm: FormGroup;
  currentFunction: Function;
  application: Application;

  inputEditorOptions = {theme: 'vs-dark', language: 'json', automaticLayout: true, scrollBeyondLastLine: false};
  inputCode: string = `{\n\n}`;
  inputEditor!: IStandaloneCodeEditor;
  inputSyntaxErrors: string[] = [];
  contentEditorHeight: number = 500;
  inputEditorHeight: number = 500;
  resultError: string = '';
  result: string = '';

  constructor(private applicationsService: ApplicationsService,
              private websocketService: WebsocketService,
              private changeDetection: ChangeDetectorRef,
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
          .subscribe(() => {
            this.currentFunction = this.applicationsService.currentFunction;
          });
      });
  }

  editFunctionContent(): void {
    this.applicationsService.editFunction(this.application.name, this.currentFunction.name, {content: this.contentCode} as Function)
      .subscribe(() => {
        this.applicationsService.getFunction(this.application.name, this.currentFunction.name)
          .subscribe(() => {
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
      this.changeDetection.detectChanges();
    });
    this.contentEditorHeight = this.contentFunctionEditor.getContentHeight() + 20;
    this.changeDetection.detectChanges();
    this.contentFunctionEditor.getModel()?.onDidChangeContent(event => {
      if (event.changes[0].text.startsWith('\r\n') || event.changes[0].text.startsWith('\n')) {
        this.contentEditorHeight = this.contentFunctionEditor.getContentHeight() + 20;
        this.changeDetection.detectChanges();
      }
    });
  }

  onInputEditorInit(inputEditor: IStandaloneCodeEditor): void {
    this.inputEditor = inputEditor;
    (<any>window).monaco.editor.onDidChangeMarkers(() => {
      this.inputSyntaxErrors = (<any>window).monaco.editor.getModelMarkers({owner: "json"})
        .filter((marker: editor.IMarker) => marker.severity === MarkerSeverity.Error)
        .map((marker: editor.IMarker) => marker.message);
      this.changeDetection.detectChanges();
    });
    this.inputEditorHeight = this.inputEditor.getContentHeight() + 20;
    this.changeDetection.detectChanges();
    this.inputEditor.getModel()?.onDidChangeContent(event => {
      if (event.changes[0].text.startsWith('\n')) {
        this.inputEditorHeight = this.inputEditor.getContentHeight() + 20;
        this.changeDetection.detectChanges();
      }
    });
  }

  onInputCodeChange(updatedCode: string): void {
    this.inputCode = updatedCode;
  }

  onContentCodeChange(updatedCode: string): void {
    this.contentCode = updatedCode;
  }

  testFunction() {
    this.result = '';
    if (this.functionContentSyntaxErrors.length === 0 && this.inputSyntaxErrors.length === 0) {
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
                  this.result = JSON.stringify(response, null, 2);
                  this.resultError = '';
                  this.changeDetection.detectChanges();
                }, error => {
                  this.resultError = error?.error?.error;
                  this.resultError = '';
                  this.changeDetection.detectChanges();
                });
              } else if ((message as MessageEvent).data === 'failed') {
                console.log('setting up runtime failed');
              }
            });
          });
        } else {
          this.applicationsService.testFunction(request).subscribe(response => {
            this.result = JSON.stringify(response, null, 2);
            console.log(this.result);
            this.resultError = '';
            this.changeDetection.detectChanges();
          }, error => {
            this.resultError = error?.error?.error;
            this.changeDetection.detectChanges();
          });
        }
      });
    }
  }
}
