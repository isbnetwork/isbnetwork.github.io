import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PetsImageViewComponent } from './pets-image-view/pets-image-view.component';
import { NzImageModule } from 'ng-zorro-antd/image';
import { IonicModule } from '@ionic/angular';


@NgModule({
  declarations: [PetsImageViewComponent],
  imports: [
    CommonModule,
    IonicModule,
    NzImageModule
  ],
  exports: [PetsImageViewComponent]
})
export class PetsImageViewModule { }
