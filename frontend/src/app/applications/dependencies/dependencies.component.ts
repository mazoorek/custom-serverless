import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {editor, MarkerSeverity} from 'monaco-editor';
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import {selectApplication} from '../../store/applications/applications.selectors';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../store/app.reducers';
import {filter} from 'rxjs';
import {Application, DependenciesResponse} from '../../store/applications/applications.model';
import {ApplicationsService} from '../applications.service';
import {saveDependencies} from '../../store/applications/applications.actions';

@Component({
  selector: 'dependencies',
  template: `
    <h2>dependencies</h2>
    <ngx-monaco-editor class="code-editor"
                       [options]="packageJsonEditorOptions"
                       [style.height.px]="packageJsonEditorHeight"
                       (onInit)="onPackageJsonEditorInit($event)"
                       [ngModel]="application?.packageJson"
                       (ngModelChange)="onPackageJsonCodeChange($event)">
    </ngx-monaco-editor>
    <button class="btn btn--green validate-button" (click)="saveDependencies()">
      VALIDATE AND SAVE
    </button>
    <ng-container *ngIf="this.syntaxErrors.length > 0">
      <div class="validation-error validation-error--title">Dependencies cannot be saved due to syntax errors:</div>
      <div *ngFor="let error of syntaxErrors" class="validation-error">
        {{error}}
      </div>
    </ng-container>
    <ng-container *ngIf="validationResult !== undefined && validationResult.errors.length > 0">
      <div class="validation-error validation-error--title">Dependencies have not been saved due to validation errors:
      </div>
      <div *ngFor="let error of validationResult?.errors" class="validation-error">
        {{error}}
      </div>
    </ng-container>
    <div class="validation-valid" *ngIf="validationResult?.valid">
      Dependencies have been saved
    </div>
  `,
  styleUrls: ['./dependencies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DependenciesComponent implements OnInit {

  packageJsonEditorOptions = {theme: 'vs-dark', language: 'json', automaticLayout: true, scrollBeyondLastLine: false};
  packageJsonCode: string = '';
  packageJsonEditor!: IStandaloneCodeEditor;
  application?: Application;
  validationResult?: DependenciesResponse = undefined;
  syntaxErrors: string[] = [];
  packageJsonEditorHeight: number = 500;

  constructor(private applicationsService: ApplicationsService, private changeDetection: ChangeDetectorRef, private store: Store<AppState>) {
  }

  ngOnInit(): void {
    this.store.pipe(
      select(selectApplication),
      filter(application => !!application)
    )
      .subscribe(application => {
        this.application = application;
        this.packageJsonCode = application!.packageJson;
        this.validationResult = application!.validationResult;
        console.log('tutaj');
        this.changeDetection.detectChanges();
      });
  }

  onPackageJsonEditorInit(packageJsonEditor: IStandaloneCodeEditor): void {
    this.packageJsonEditor = packageJsonEditor;
    (<any>window).monaco.editor.onDidChangeMarkers(() => {
      this.syntaxErrors = (<any>window).monaco.editor.getModelMarkers({owner: "json"})
        .filter((marker: editor.IMarker) => marker.severity === MarkerSeverity.Error)
        .map((marker: editor.IMarker) => marker.message);
      this.validationResult = undefined;
      this.changeDetection.detectChanges();
    });
    this.packageJsonEditorHeight = this.packageJsonEditor.getContentHeight() + 20;
    this.changeDetection.detectChanges();
    this.packageJsonEditor.getModel()?.onDidChangeContent(event => {
      if (event.changes[0].text.startsWith('\n')) {
        this.packageJsonEditorHeight = this.packageJsonEditor.getContentHeight() + 20;
      }
    });
  }

  onPackageJsonCodeChange(updatedCode: string): void {
    this.packageJsonCode = updatedCode;
  }

  saveDependencies() {
    this.validationResult = undefined;
    if (this.syntaxErrors.length == 0) {
      this.store.dispatch(saveDependencies({appName: this.application!.name, packageJson: this.packageJsonCode}));
      // this.applicationsService.saveDependencies(this.application!.name, this.packageJsonCode).subscribe(response => {
      //   this.validationResult = response;
      //   this.changeDetection.detectChanges();
      // });
    }
  }
}
