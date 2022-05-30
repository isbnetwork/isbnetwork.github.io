import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewPetDetailCComponent } from './view-pet-detail-c/view-pet-detail-c.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import{ NgApexchartsModule } from "ng-apexcharts";
import { PetsImageViewModule } from '../pets-image-view/pets-image-view.module';
import { HeaderMobileCModule } from '../header-mobile-c/header-mobile-c.module';
@NgModule({
  declarations: [ViewPetDetailCComponent],
  imports: [
    ImageCropperModule,
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzProgressModule,
    NgApexchartsModule,
    PetsImageViewModule,
    HeaderMobileCModule
  ],
  exports:[ViewPetDetailCComponent]
})
export class ViewPetDetailCModule { }
