import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PetHistoryCComponent } from './pet-history-c/pet-history-c.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzImageModule } from 'ng-zorro-antd/image';
import { HeaderMobileCModule } from '../header-mobile-c/header-mobile-c.module';

@NgModule({
  declarations: [PetHistoryCComponent],
  imports: [
    ImageCropperModule,
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzProgressModule,
    NzImageModule,
    HeaderMobileCModule
  ],
  exports: [PetHistoryCComponent]
})
export class PetHistoryCModule { }
