import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { ExploreContainerComponentModule } from '../../explore-container/explore-container.module';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { ListCModule } from 'src/app/components/list-c/list-c.module';
import { AddCustomerCModule } from 'src/app/components/add-customer-c/add-customer-c.module';
import { AddPetComponent } from './pages/add-pet/add-pet.component';
import { AddPetCModule } from 'src/app/components/add-pet-c/add-pet-c.module';
import { ViewCustomerComponent } from './pages/view-customer/view-customer.component';
import { ViewCustomerCModule } from 'src/app/components/view-customer-c/view-customer-c.module';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { EditPetComponent } from './pages/edit-pet/edit-pet.component';
import { ViewPetDetailComponent } from './pages/view-pet-detail/view-pet-detail.component';
import { PetHistoryComponent } from './pages/pet-history/pet-history.component';
import { ViewPetDetailCModule } from 'src/app/components/view-pet-detail-c/view-pet-detail-c.module';
import { PetsImageViewModule } from 'src/app/components/pets-image-view/pets-image-view.module';
import { PetHistoryCModule } from 'src/app/components/pet-history-c/pet-history-c.module';
import { PetEditHistoryComponent } from './pages/pet-history/pet-edit-history.component';
import { MobileSupportServive } from 'src/app/services/mobile-support.service';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab1PageRoutingModule,
    ListCModule,
    AddCustomerCModule,
    AddPetCModule,
    ViewCustomerCModule,
    NzSpinModule,
    ViewPetDetailCModule,
    PetsImageViewModule,
    PetHistoryCModule
  ],
  declarations: [Tab1Page,
    AddPetComponent, ViewCustomerComponent,
    EditPetComponent, ViewPetDetailComponent,
    PetHistoryComponent, PetEditHistoryComponent
  ],
  providers: [MobileSupportServive]
})
export class Tab1PageModule { }
