import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab3Page } from './tab3.page';

import { Tab3PageRoutingModule } from './tab3-routing.module';
import { ExploreContainerComponentModule } from 'src/app/explore-container/explore-container.module';
import { ListCModule } from 'src/app/components/list-c/list-c.module';
import { UserEditCModule } from 'src/app/components/user-edit-c/user-edit-c.module';
import { UserEditComponent } from './page/user-edit/user-edit.component';
import { UserViewerComponent } from './page/user-viewer/user-viewer.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab3PageRoutingModule,
    ListCModule,
    UserEditCModule,
  ],
  declarations: [
    Tab3Page,
    UserEditComponent,
    UserViewerComponent]
})
export class Tab3PageModule {}
