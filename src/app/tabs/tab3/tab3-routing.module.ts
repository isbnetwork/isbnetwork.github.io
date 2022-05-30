import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserEditComponent } from './page/user-edit/user-edit.component';
import { UserViewerComponent } from './page/user-viewer/user-viewer.component';
import { Tab3Page } from './tab3.page';

const routes: Routes = [
  {
    path: '',
    component: Tab3Page,
    children:[{
      path: 'edit/:id',
      component: UserEditComponent
    },
    {
      path: 'view/:id',
      component: UserViewerComponent
    }

  ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab3PageRoutingModule {}
