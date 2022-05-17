import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ApplicationsService} from '../../applications.service';
import {Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../store/app.reducers';
import {
  selectApplication,
  selectApplicationName,
  selectEndpoint
} from '../../../store/applications/applications.selectors';
import {Endpoint} from '../../../store/applications/applications.model';
import {filter} from 'rxjs';
import {updateEndpoint} from '../../../store/applications/applications.actions';

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
export class EndpointEditComponent implements OnInit {
  endpointForm: FormGroup;
  endpoint?: Endpoint;
  applicationName?: string;

  constructor(private applicationsService: ApplicationsService,
              private changeDetection: ChangeDetectorRef,
              private router: Router,
              private store: Store<AppState>,
              private fb: FormBuilder) {
    this.endpointForm = fb.group({
      url: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      functionName: ['', Validators.compose([Validators.required, Validators.maxLength(255)])]
    });
  }

  ngOnInit(): void {
    this.store.pipe(
      select(selectEndpoint),
      filter(endpoint => !!endpoint)
    ).subscribe(endpoint => {
      this.endpoint = endpoint;
      this.endpointForm.controls['url'].patchValue(endpoint?.url);
      this.endpointForm.controls['functionName'].patchValue(endpoint?.functionName);
      this.changeDetection.detectChanges();
    });
    this.store.select(selectApplicationName).subscribe(appName => this.applicationName = appName);
  }

  editEndpoint(): void {
    this.store.dispatch(updateEndpoint({
      appName:this.applicationName!,
      endpointUrl: this.endpoint!.url,
      endpoint: this.endpointForm.value
    }));
  }
}
