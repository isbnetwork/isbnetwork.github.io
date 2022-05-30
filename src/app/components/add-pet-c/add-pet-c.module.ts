import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddPetCComponent } from './add-pet-c/add-pet-c.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { PopupAvatarComponent } from './popup-avatar/popup-avatar.component';
import { NzProgressModule } from 'ng-zorro-antd/progress';
@NgModule({
  declarations: [AddPetCComponent,PopupAvatarComponent],
  imports: [
    ImageCropperModule,
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzProgressModule
  ],
  exports: [AddPetCComponent, PopupAvatarComponent]
})
export class AddPetCModule { }
