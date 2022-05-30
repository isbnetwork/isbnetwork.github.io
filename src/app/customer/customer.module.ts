import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerComponent } from './page/customer/customer.component';
import { IonicModule } from '@ionic/angular';
import { IpadMenuBarModule } from '../components/ipad-menu-bar/ipad-menu-bar.module';


@NgModule({
  declarations: [
    CustomerComponent
  ],
  imports: [
    IonicModule,
    CommonModule,
    CustomerRoutingModule,
    IpadMenuBarModule
  ]
})
export class CustomerModule { }
