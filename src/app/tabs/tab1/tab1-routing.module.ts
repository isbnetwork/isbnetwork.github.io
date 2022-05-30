import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddPetComponent } from './pages/add-pet/add-pet.component';
import { EditPetComponent } from './pages/edit-pet/edit-pet.component';
import { PetEditHistoryComponent } from './pages/pet-history/pet-edit-history.component';
import { PetHistoryComponent } from './pages/pet-history/pet-history.component';
import { ViewCustomerComponent } from './pages/view-customer/view-customer.component';
import { ViewPetDetailComponent } from './pages/view-pet-detail/view-pet-detail.component';
import { Tab1Page } from './tab1.page';

const routes: Routes = [
  {
    path: '',
    component: Tab1Page,
    children: [
      {
        path: 'customer-new',
        loadChildren: () => import('./pages/add-customer/add-customer/add-customer.module').then( m => m.AddCustomerModule)
      },
      {
        path: 'customer/pet/:id',
        component: AddPetComponent
      },
      {
        path: 'customer/edit/pet/:customerId/:petId',
        component: EditPetComponent
      },
      {
        path: 'view-customer/:id',
        component: ViewCustomerComponent
      },
      {
        path: 'customer/pet/view/:customerId/:petId',
        component: ViewPetDetailComponent
      },
      {
        path: 'customer/pet/history/create/:customerId/:petId',
        component: PetHistoryComponent
      },
      {
        path: 'customer/pet/history/edit/:customerId/:petId/:historyId',
        component: PetEditHistoryComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab1PageRoutingModule {}
