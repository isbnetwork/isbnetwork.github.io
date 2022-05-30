import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewCustomerCComponent } from './view-customer-c.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { HeaderMobileCModule } from '../header-mobile-c/header-mobile-c.module';



@NgModule({
  declarations: [ViewCustomerCComponent],
  imports: [
    ImageCropperModule,
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzProgressModule,
    HeaderMobileCModule
  ],
  exports : [ViewCustomerCComponent]
})
export class ViewCustomerCModule { }
