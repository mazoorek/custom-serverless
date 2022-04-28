import {Component} from '@angular/core';
import {MainService} from '../../main/main.service';
import {editor, MarkerSeverity} from 'monaco-editor';
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

@Component({
  selector: 'dependencies',
  template: `
    <h2>dependencies</h2>
    <ngx-monaco-editor class="my-code-editor"
                       [options]="validateEditorOptions"
                       (onInit)="onPackageJsonEditorInit($event)"
                       [ngModel]="packageJsonCode"
                       (ngModelChange)="onPackageJsonCodeChange($event)">
    </ngx-monaco-editor>
    <button mat-raised-button color="primary" (click)="validatePackageJson()" [disabled]="!validJsonSyntax">validate
      package.json
    </button>
  `,
  styleUrls: ['./dependencies.component.scss']
})
export class DependenciesComponent {

  validJsonSyntax: boolean = true;
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

  packageJsonEditor!: IStandaloneCodeEditor;

  constructor(private mainService: MainService) {
  }

  onPackageJsonEditorInit(packageJsonEditor: IStandaloneCodeEditor): void {
    this.packageJsonEditor = packageJsonEditor;
    (<any>window).monaco.editor.onDidChangeMarkers(() => {
      let markers = (<any>window).monaco.editor.getModelMarkers({owner: "json"})
        .filter((marker: editor.IMarker) => marker.severity === MarkerSeverity.Error);
      this.validJsonSyntax = markers.length === 0;
    });
  }

  onPackageJsonCodeChange(updatedCode: string): void {
    this.packageJsonCode = updatedCode;
  }

  validatePackageJson() {
    this.mainService.validatePackageJson(this.packageJsonCode).subscribe(response => {
      console.log(response);
    });
  }

}
