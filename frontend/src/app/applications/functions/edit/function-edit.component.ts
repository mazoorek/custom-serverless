import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {WebsocketService} from '../../../websocket/websocket.service';
import {editor, MarkerSeverity} from 'monaco-editor';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ApplicationsService} from '../../applications.service';
import {selectApplicationName, selectFunction} from '../../../store/applications/applications.selectors';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../store/app.reducers';
import {Function, TestFunctionRequest} from '../../../store/applications/applications.model';
import {filter} from 'rxjs';
import {updateFunction} from '../../../store/applications/applications.actions';
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

export enum EditOption {
  METADATA = 'METADATA',
  CONTENT = 'CONTENT'
}

@Component({
  selector: 'function-edit',
  template: `
    <h2>functions</h2>
    <div class="spinner-container" *ngIf="functionLoading">
      <mat-spinner></mat-spinner>
      <div>Loading function data...</div>
    </div>
    <ng-container *ngIf="!functionLoading">
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
        <ng-container *ngIf="editFunctionError && editOption === EditOption.METADATA">
          <div class="validation-container">
            <div class="validation-error">{{editFunctionError}}</div>
          </div>
        </ng-container>
      </form>
    </ng-container>

    <ngx-monaco-editor class="code-editor"
                       [options]="contentEditorOptions"
                       [style.height.px]="contentEditorHeight"
                       [ngModel]="contentCode"
                       (onInit)="onContentFunctionEditorInit($event)"
                       (ngModelChange)="onContentCodeChange($event)">
    </ngx-monaco-editor>

    <ng-container *ngIf="!functionLoading">
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
      <ng-container *ngIf="editFunctionError && editOption === EditOption.CONTENT">
        <div class="validation-container">
          <div class="validation-error">{{editFunctionError}}</div>
        </div>
      </ng-container>
      <ng-container *ngIf="functionContentSyntaxErrors.length > 0">
        <div class="validation-error validation-error--title">
          Function content can not be processed due to syntax errors:
        </div>
        <div *ngFor="let error of functionContentSyntaxErrors" class="validation-error">
          {{error}}
        </div>
      </ng-container>
      <div class="spinner-container" *ngIf="functionSavingLoading">
        <mat-spinner></mat-spinner>
        <div>Function is being saved...</div>
      </div>
      <div class="spinner-container" *ngIf="functionTestingLoading">
        <mat-spinner></mat-spinner>
        <div>Function is being tested...</div>
      </div>
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
    </ng-container>
  `,
  styleUrls: ['./function-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FunctionEditComponent implements OnInit {

  readonly EditOption: typeof EditOption = EditOption;
  editOption: EditOption = EditOption.CONTENT;

  contentEditorOptions = {theme: 'vs-dark', language: 'javascript', automaticLayout: true, scrollBeyondLastLine: false};
  contentFunctionEditor!: IStandaloneCodeEditor;
  contentCode: string = '';
  functionContentSyntaxErrors: string[] = [];
  functionMetadataForm: FormGroup;
  function?: Function;
  applicationName: string = '';
  inputEditorOptions = {theme: 'vs-dark', language: 'json', automaticLayout: true, scrollBeyondLastLine: false};
  inputCode: string = `{\n    \"args\":{},\n    \"cache\":{},\n    \"edgeResults\":{}\n}`;
  inputEditor!: IStandaloneCodeEditor;
  inputSyntaxErrors: string[] = [];
  contentEditorHeight: number = 500;
  inputEditorHeight: number = 500;
  resultError: string = '';
  result: string = '';
  editFunctionError?: string;
  functionSavingLoading: boolean = false;
  functionTestingLoading: boolean = false;
  functionLoading: boolean;

  constructor(private applicationsService: ApplicationsService,
              private websocketService: WebsocketService,
              private changeDetection: ChangeDetectorRef,
              private store: Store<AppState>,
              private fb: FormBuilder) {
    this.functionMetadataForm = fb.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      idempotent: [false, Validators.compose([Validators.required, Validators.maxLength(255)])]
    });
    this.functionLoading = true;
  }

  ngOnInit(): void {
    this.store.pipe(
      select(selectFunction),
      filter(func => !!func)
    ).subscribe(func => {
      this.function = func;
      this.contentCode = func!.content;
      this.functionMetadataForm.controls['name'].patchValue(func?.name);
      this.functionMetadataForm.controls['idempotent'].patchValue(func?.idempotent);
      this.editFunctionError = func?.editFunctionError;
      this.functionSavingLoading = false;
      this.changeDetection.detectChanges();
    });
    this.store.select(selectApplicationName).subscribe(appName => this.applicationName = appName!);
  }

  editFunctionMetadata(): void {
    this.editOption = EditOption.METADATA;
    this.resultError = '';
    this.store.dispatch(updateFunction({
      appName: this.applicationName,
      functionName: this.function!.name,
      function: this.functionMetadataForm.value
    }));
  }

  editFunctionContent(): void {
    this.editOption = EditOption.CONTENT;
    this.resultError = '';
    if(this.functionContentSyntaxErrors.length === 0) {
      this.store.dispatch(updateFunction(
        {
          appName: this.applicationName,
          functionName: this.function!.name,
          function: {content: this.contentCode, name: this.function!.name} as Function
        }
      ));
      this.functionSavingLoading = true;
    }
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
    this.functionLoading = false;
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
    this.editFunctionError = undefined;
    if (this.functionContentSyntaxErrors.length === 0 && this.inputSyntaxErrors.length === 0) {

      let request: TestFunctionRequest = {
        code: this.contentCode,
        clientAppName: this.applicationName,
        ...JSON.parse(this.inputCode)
      };
      this.functionTestingLoading = true;
      this.changeDetection.detectChanges();
      this.applicationsService.getRuntime(this.applicationName).subscribe(response => {
        if (!response.runtimeReady) {
          this.websocketService.connect();
          this.websocketService.onOpen$.subscribe(_ => {
            console.log("ws connection opened");
            this.websocketService.sendMessage(this.applicationName);
            this.websocketService.onMessage$.subscribe((message: Event) => {
              console.log("received message: " + (message as MessageEvent).data);
              if ((message as MessageEvent).data === 'ready') {
                this.applicationsService.testFunction(request).subscribe(response => {
                  this.result = JSON.stringify(response, null, 2);
                  this.resultError = '';
                  this.functionTestingLoading = false;
                  this.changeDetection.detectChanges();
                }, error => {
                  this.resultError = error?.error?.error ? error?.error?.error : 'failed to test function';
                  this.functionTestingLoading = false;
                  this.changeDetection.detectChanges();
                });
              } else if ((message as MessageEvent).data === 'failed') {
                this.resultError = 'setting up runtime failed';
                this.functionTestingLoading = false;
                this.changeDetection.detectChanges();
                console.log('setting up runtime failed');
              }
            });
          });
        } else {
          this.applicationsService.testFunction(request).subscribe(response => {
            this.result = JSON.stringify(response, null, 2);
            this.resultError = '';
            this.functionTestingLoading = false;
            this.changeDetection.detectChanges();
          }, error => {
            this.resultError = error?.error?.error ? error?.error?.error : 'failed to test function';
            this.functionTestingLoading = false;
            this.changeDetection.detectChanges();
          });
        }
      });
    }
  }
}
