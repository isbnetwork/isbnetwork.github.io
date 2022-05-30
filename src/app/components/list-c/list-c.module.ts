import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ListCComponent } from './list-c/list-c.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
@NgModule({
  declarations: [
    ListCComponent
  ],
  imports: [
    IonicModule,
    CommonModule,
    InfiniteScrollModule
  ],
  exports: [ListCComponent]
})
export class ListCModule { }
