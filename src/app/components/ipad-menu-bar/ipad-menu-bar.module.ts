import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IpadMenuBarComponent } from './ipad-menu-bar/ipad-menu-bar.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [IpadMenuBarComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [IpadMenuBarComponent]
})
export class IpadMenuBarModule { }
