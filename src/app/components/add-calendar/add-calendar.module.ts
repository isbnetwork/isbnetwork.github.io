import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddCalendarComponent } from './add-calendar/add-calendar.component';
import { IonicModule } from '@ionic/angular';

import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderMobileCModule } from '../header-mobile-c/header-mobile-c.module';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';

@NgModule({
  declarations: [AddCalendarComponent],
  imports: [
    CommonModule,
    IonicModule,
    NzDatePickerModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderMobileCModule,
    NzTimePickerModule
  ],
  exports: [AddCalendarComponent]
})
export class AddCalendarModule { }
