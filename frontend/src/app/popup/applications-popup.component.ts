import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';


@Component({
  selector: 'app-musicians-popup',
  template: `
    <div>
      <div mat-dialog-content>
        Do you really want to delete {{data.appName}}?
      </div>
      <div class="buttons-container">
        <button [mat-dialog-close]="false" class="btn btn--white">Close</button>
        <button [mat-dialog-close]="true" class="btn btn--orange">Delete</button>
      </div>
    </div>
  `,
  styleUrls: ['./applications-popup.component.scss']
})
export class ApplicationsPopupComponent {

  constructor(private dialogRef: MatDialogRef<ApplicationsPopupComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {appName: string}) {
  }
}
