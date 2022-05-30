import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScheduleEventsRoutingModule } from './schedule-events-routing.module';
import { ScheduleMainPageComponent } from './schedule-main-page/schedule-main-page.component';
import { ScheduleIpadComponent } from './pages/schedule-ipad/schedule-ipad.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ScheduleMobileComponent } from './pages/schedule-mobile/schedule-mobile.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { IpadMenuBarModule } from '../components/ipad-menu-bar/ipad-menu-bar.module';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { AddCalendarModule } from '../components/add-calendar/add-calendar.module';
@NgModule({
  declarations: [
    ScheduleMainPageComponent,
    ScheduleMobileComponent,
    ScheduleIpadComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ScheduleEventsRoutingModule,
    NgbModalModule,
    FlatpickrModule.forRoot(),
    IpadMenuBarModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    NzDatePickerModule,
    AddCalendarModule,
    ReactiveFormsModule
  ],
  exports: [ScheduleIpadComponent]
})
export class ScheduleEventsModule {}
