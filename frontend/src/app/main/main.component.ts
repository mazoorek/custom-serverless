import {Component, ElementRef, ViewChild} from '@angular/core';
import {MainService} from './main.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-main',
  template: `
    <div class="center">
      <div *ngFor="let app of apps$ | async">{{app}}</div>
      <input type="text" #appNameInput>
      <button (click)="createApp()">create app</button>
    </div>
  `,
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  @ViewChild('appNameInput') appNameInput!: ElementRef;
  apps$: Observable<String[]> = this.mainService.getApps();

  constructor(private mainService: MainService) {
  }

  getApps(): void {
    this.mainService.getApps().subscribe(response => {
      console.log(response);
    });
  }

  createApp(): void {
    let appName = this.appNameInput.nativeElement.value;
    this.mainService.createApps(appName).subscribe(response => {
      console.log(response);
    });
  }
}
