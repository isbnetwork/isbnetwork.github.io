import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderMobileCComponent } from './header-mobile-c/header-mobile-c.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [HeaderMobileCComponent],
  imports: [
    IonicModule,
    CommonModule
  ],
  exports: [HeaderMobileCComponent]
})
export class HeaderMobileCModule { }
