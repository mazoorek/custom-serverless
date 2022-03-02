import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTabChangeEvent, MatTabGroup} from '@angular/material/tabs/tab-group';

@Component({
  selector: 'app-root',
  template: `
    <mat-tab-group #matTabGroup (selectedTabChange)="onTabChange($event)" [color]="'primary'" [selectedIndex]="1">
      <mat-tab label="Applications" ></mat-tab>
      <mat-tab label="Functions"></mat-tab>
    </mat-tab-group>
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('matTabGroup')
  matTabGroup!: MatTabGroup;

  onTabChange(event: MatTabChangeEvent): void {
    console.log(event.index);
  }

  ngAfterViewInit(): void {
    this.matTabGroup.focusTab(0);
    this.matTabGroup.selectedIndex = 0;
  }
}
