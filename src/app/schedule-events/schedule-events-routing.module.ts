import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScheduleMainPageComponent } from './schedule-main-page/schedule-main-page.component';

const routes: Routes = [{
  path: '',
  component: ScheduleMainPageComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScheduleEventsRoutingModule { }
