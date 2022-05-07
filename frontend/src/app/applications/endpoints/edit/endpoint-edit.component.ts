import {ChangeDetectorRef, Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Application, ApplicationsService, Endpoint, Function} from '../../applications.service';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

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
  application: Application;
  currentEndpoint: Endpoint;

  constructor(private applicationsService: ApplicationsService,
              private changeDetection: ChangeDetectorRef,
              private router: Router,
              private fb: FormBuilder) {
    this.currentEndpoint = this.applicationsService.currentEndpoint;
    this.application = this.applicationsService.currentApplication;
    this.endpointForm = fb.group({
      url: [this.currentEndpoint.url, Validators.compose([Validators.required, Validators.maxLength(255)])],
      functionName: [this.currentEndpoint.functionName, Validators.compose([Validators.required, Validators.maxLength(255)])]
    });
  }

  editEndpoint(): void {
    this.applicationsService.editEndpoint(this.application.name, this.currentEndpoint.url, this.endpointForm.value)
      .subscribe(() => {
        this.applicationsService.getEndpoint(this.application.name, this.endpointForm.value.url)
          .subscribe( () => {
            this.currentEndpoint = this.applicationsService.currentEndpoint;
          });
      });
  }
}
