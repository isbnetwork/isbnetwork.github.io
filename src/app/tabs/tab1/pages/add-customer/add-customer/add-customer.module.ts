import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddCustomerComponent } from '../add-customer.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ListCModule } from 'src/app/components/list-c/list-c.module';
import { AddCustomerCModule } from 'src/app/components/add-customer-c/add-customer-c.module';
import { AddPetCModule } from 'src/app/components/add-pet-c/add-pet-c.module';
import { ViewCustomerCModule } from 'src/app/components/view-customer-c/view-customer-c.module';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { ViewPetDetailCModule } from 'src/app/components/view-pet-detail-c/view-pet-detail-c.module';
import { PetsImageViewModule } from 'src/app/components/pets-image-view/pets-image-view.module';
import { PetHistoryCModule } from 'src/app/components/pet-history-c/pet-history-c.module';
import { RouterModule } from '@angular/router';
import { EditCustomerComponent } from '../edit-customer.component';


@NgModule({
  declarations: [AddCustomerComponent, EditCustomerComponent],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{
      path: '',
      component: AddCustomerComponent
    }, {
      path: 'edit/:id',
      component: EditCustomerComponent
    }]),
    ListCModule,
    AddCustomerCModule,
    AddPetCModule,
    ViewCustomerCModule,
    NzSpinModule,
    ViewPetDetailCModule,
    PetsImageViewModule,
    PetHistoryCModule
  ]
})
export class AddCustomerModule { }
