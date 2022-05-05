import {ChangeDetectorRef, Component} from '@angular/core';
import {editor, MarkerSeverity} from 'monaco-editor';
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import {Application, ApplicationsService} from '../applications.service';

@Component({
  selector: 'dependencies',
  template: `
    <h2>dependencies</h2>
    <ngx-monaco-editor class="code-editor"
                       [options]="packageJsonEditorOptions"
                       (onInit)="onPackageJsonEditorInit($event)"
                       [ngModel]="application.packageJson"
                       (ngModelChange)="onPackageJsonCodeChange($event)">
    </ngx-monaco-editor>
    <button class="btn btn--green validate-button" (click)="savePackageJson()">
      VALIDATE AND SAVE
    </button>
    <ng-container *ngIf="syntaxErrors.length > 0">
      <div class="validation-error validation-error--title">Dependencies has not been saved due to syntax errors:</div>
      <div *ngFor="let error of syntaxErrors" class="validation-error">
        {{error}}
      </div>
    </ng-container>
    <ng-container *ngIf="validationErrors.length > 0">
      <div class="validation-error validation-error--title">Dependencies has not been saved due to validation errors:
      </div>
      <div *ngFor="let error of validationErrors" class="validation-error">
        {{error}}
      </div>
    </ng-container>
  `,
  styleUrls: ['./dependencies.component.scss']
})
export class DependenciesComponent {

  packageJsonEditorOptions = {theme: 'vs-dark', language: 'json'};
  packageJsonCode: string;
  packageJsonEditor!: IStandaloneCodeEditor;
  application: Application;
  validationErrors: string[] = [];
  syntaxErrors: string[] = [];

  constructor(private applicationsService: ApplicationsService, private changeDetection: ChangeDetectorRef) {
    this.application = this.applicationsService.currentApplication;
    this.packageJsonCode = this.application.packageJson;
  }

  onPackageJsonEditorInit(packageJsonEditor: IStandaloneCodeEditor): void {
    this.packageJsonEditor = packageJsonEditor;
    (<any>window).monaco.editor.onDidChangeMarkers(() => {
      this.syntaxErrors = (<any>window).monaco.editor.getModelMarkers({owner: "json"})
        .filter((marker: editor.IMarker) => marker.severity === MarkerSeverity.Error)
        .map((marker: editor.IMarker) => marker.message);
      this.changeDetection.markForCheck();
    });
  }

  onPackageJsonCodeChange(updatedCode: string): void {
    this.packageJsonCode = updatedCode;
  }

  savePackageJson() {
    if (this.syntaxErrors.length == 0) {
      this.applicationsService.saveDependencies(this.application.name, this.packageJsonCode).subscribe(response => {
        this.validationErrors = response.errors;
        this.changeDetection.markForCheck();
      });
    }
  }
}
