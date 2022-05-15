import {ChangeDetectorRef, Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Application, ApplicationsService, Endpoint, Function} from '../../applications.service';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {AppState} from '../../../store/app.reducers';
import {selectApplicationName} from '../../../store/applications/applications.selectors';

@Component({
  selector: 'endpoint-edit',
  template: `
    <form [formGroup]="endpointForm" class="form--endpoint">
      <div class="form__group">
        <label class="form__label" for="url">Endpoint url</label>
        <input formControlName="url"
               class="form__input"
               id="url"
               required="required"
               placeholder="type your endpoint url"/>
      </div>
      <div class="form__group">
        <label class="form__label" for="name">Function name</label>
        <input formControlName="functionName"
               class="form__input"
               id="functionName"
               required="required"
               placeholder="type your function name"/>
      </div>
      <button class="btn btn--green" (click)="editEndpoint()">Edit endpoint</button>
    </form>
  `,
  styleUrls: ['./endpoint-edit.component.scss']
})
export class EndpointEditComponent {
  endpointForm: FormGroup;
  currentEndpoint: Endpoint;
  applicationName?: string;

  constructor(private applicationsService: ApplicationsService,
              private changeDetection: ChangeDetectorRef,
              private router: Router,
              private store: Store<AppState>,
              private fb: FormBuilder) {
    this.currentEndpoint = this.applicationsService.currentEndpoint;
    this.store.select(selectApplicationName).subscribe(appName => this.applicationName = appName);
    this.endpointForm = fb.group({
      url: [this.currentEndpoint.url, Validators.compose([Validators.required, Validators.maxLength(255)])],
      functionName: [this.currentEndpoint.functionName, Validators.compose([Validators.required, Validators.maxLength(255)])]
    });
  }

  editEndpoint(): void {
    this.applicationsService.editEndpoint(this.applicationName!, this.currentEndpoint.url, this.endpointForm.value)
      .subscribe(() => {
        this.applicationsService.getEndpoint(this.applicationName!, this.endpointForm.value.url)
          .subscribe( () => {
            this.currentEndpoint = this.applicationsService.currentEndpoint;
          });
      });
  }
}
