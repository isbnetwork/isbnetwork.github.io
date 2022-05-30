import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { UserModel } from '../services/entitys/user.model';
export enum ISACTIVE {
  DEFAULT,
  ACTIVE,
  BLOCK
}

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  currentAcc: UserModel;
  isActive: number = ISACTIVE.DEFAULT;
  constructor(private authService: AuthService, private router: Router, public alertController: AlertController) {

  }
  ngOnInit() {
    this.authService.user$.subscribe(
      (x) => {
        if (x != null && x != undefined) {
          this.currentAcc = x;
          this.isActive = this.currentAcc.active ? ISACTIVE.ACTIVE : ISACTIVE.BLOCK
          if (this.isActive == ISACTIVE.BLOCK) {
            this.authService.signOut().then(() => {
              this.router.navigate(['/forms/block'])
            });
          }
        }
      })
  }
  async logOut() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirm!',
      message: 'Bạn có muốn đăng xuất không!',
      mode: 'ios',
      buttons: [
        {
          text: 'Không',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }, {
          text: 'Có',
          handler: () => {
            this.authService.signOut().then(() => {
              this.router.navigate(['/forms/login'])
            })
          }
        }
      ]
    });
    await alert.present();
  }
  login() {
    this.router.navigate(['/forms/login']);
  }
}
