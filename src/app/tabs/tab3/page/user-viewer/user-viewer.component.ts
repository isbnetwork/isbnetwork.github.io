import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, Subject } from 'rxjs';
import { switchMap, take, takeUntil } from 'rxjs/operators';
import { UserEditCComponent } from 'src/app/components/user-edit-c/user-edit-c/user-edit-c.component';
import { AuthService } from 'src/app/services/auth.service';
import { base64ToFile } from 'src/app/services/db-utils';
import { UserModel } from 'src/app/services/entitys/user.model';
import { Action, MobileSupportServive } from 'src/app/services/mobile-support.service';
import { Role } from 'src/app/services/role.enum';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-viewer',
  templateUrl: './user-viewer.component.html',
  styleUrls: ['./user-viewer.component.scss'],
  providers: [MobileSupportServive]
})
export class UserViewerComponent implements OnInit, OnDestroy {
  data: UserModel;
  currAcc: UserModel;
  destroy$ = new Subject();
  viewOnly = true;
  isAdmin = false;
  constructor(
    private auth: AuthService,
    public mobileSupportServive: MobileSupportServive, public alertController: AlertController, private router: Router, private spinner: NgxSpinnerService, private route: ActivatedRoute, private userService: UserService) {
    this.route.params.pipe(
      switchMap(data => this.userService.get(data.id).pipe(take(1)))
      // takeUntil(this.destroy$)
    ).subscribe((item: UserModel) => {
      this.data = item;
      this.auth.user$.subscribe(
        x => {
          if (x != null) {
            this.currAcc = x;
            if (this.currAcc.role === Role.ADMIN)
              this.isAdmin = true;
          }
          this.mobileSupportServive.toPopup(this.data, UserEditCComponent, { viewOnly: true, isAdmin: this.isAdmin })
            .pipe(takeUntil(this.destroy$)).
            subscribe((data: Action) => {
              switch (data.action) {
                case 'onEdit':
                  this.edit(data.state);
                  break;
                case 'onSubmit':
                  this.submit(data.state);
                  break;
                case 'onBack':
                  this.router.navigate(['/home/tabs/tab3']).then( () => {
                      if(this.mobileSupportServive.isMobile) {
                        window.location.reload();
                      }
                  });
                  break;
                default:
                  break;
              }
            });
        });

    })
  }
  ngOnInit() {

  }
  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
  submit(data: UserModel) {
    this.spinner.show();
    let file: File = null;
    try {
      file = base64ToFile(data.photoURL, `pet-${new Date().getTime()}`);
    } catch (error) { }

    if (file === null) {
      this.data = null;
      this.userService.update(data).pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.notifyCreate("Thành công", "Thông tin đã được cập nhật");
        this.spinner.hide();

      })
    }
    else {
      this.data = null;
      this.userService.uploadAvatar(file, data.id).pipe(
        switchMap(url => this.userService.update({ ...data, photoURL: url })),
        takeUntil(this.destroy$)).subscribe(_ => {
          this.notifyCreate("Thành công", "Thông tin đã được cập nhật");
          this.spinner.hide();
        })
    }
  }
  notifyCreate(header: string, massage: string) {
    this.alertController.create({
      mode: 'ios',
      header: header,
      message: massage,
      buttons: [{
        text: 'OK',
        handler: () => {
          this.router.navigate(['/home/tabs/tab3']).then(() => {
            if(this.mobileSupportServive.isMobile) {
              window.location.reload();
            }
          })
        }
      }]
    }).then(alert => {
      alert.present();
    });
  }
  edit($event: UserModel) {
    this.router.navigate(['/home/tabs/tab3/edit', $event.id])
  }

}
