import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';


@Component({
  selector: 'delete-popup',
  template: `
    <div>
      <div mat-dialog-content>
        Do you really want to delete {{data.name}}?
      </div>
      <div class="buttons-container">
        <button [mat-dialog-close]="false" class="btn btn--white">Close</button>
        <button [mat-dialog-close]="true" class="btn btn--orange">Delete</button>
      </div>
    </div>
  `,
  styleUrls: ['./delete-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeletePopupComponent {

  constructor(private dialogRef: MatDialogRef<DeletePopupComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {name: string}) {
  }
}
