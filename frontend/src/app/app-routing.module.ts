import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {TestComponent} from './test/test.component';
import {MainComponent} from './main/main.component';

const routes: Routes = [
  {path: '', component: TestComponent},
  {path: 'test', component: MainComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
