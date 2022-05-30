import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserEditCComponent } from './user-edit-c/user-edit-c.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AddPetCModule } from '../add-pet-c/add-pet-c.module';

@NgModule({
  declarations: [UserEditCComponent],
  imports: [
    CommonModule,
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    AddPetCModule
  ],
  exports:[UserEditCComponent]
})
export class UserEditCModule { }
