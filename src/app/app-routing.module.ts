import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {AngularFireAuthGuard, customClaims, hasCustomClaim, redirectUnauthorizedTo}
    from '@angular/fire/auth-guard';
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['forms/login']);
const routes: Routes = [
  {
    path: '',
    redirectTo: 'forms/login',
    pathMatch: 'full'
  },
  // {
  //   path: 'home',
  //   loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
  //   canActivate: [AngularFireAuthGuard],
  //   data: {
  //       authGuardPipe: redirectUnauthorizedToLogin
  //   }
  // },
  {
    path: 'forms',
    loadChildren: () => import('./forms/forms.module').then( m => m.FormsPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, useHash: true })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
