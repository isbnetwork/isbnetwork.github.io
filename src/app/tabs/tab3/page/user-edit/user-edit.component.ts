import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { switchMap, take, takeUntil } from 'rxjs/operators';
import { UserEditCComponent } from 'src/app/components/user-edit-c/user-edit-c/user-edit-c.component';
import { base64ToFile } from 'src/app/services/db-utils';
import { UserModel } from 'src/app/services/entitys/user.model';
import { Action, MobileSupportServive } from 'src/app/services/mobile-support.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
  providers: [MobileSupportServive]
})
export class UserEditComponent implements OnInit, OnDestroy {
  data: UserModel;
  destroy$ = new Subject();
  constructor(public mobileSupportServive: MobileSupportServive,
    public alertController: AlertController, private router: Router, private spinner: NgxSpinnerService, private route: ActivatedRoute, private userService: UserService) {
    this.route.params.pipe(
      switchMap(data => this.userService.get(data.id).pipe(take(1)))
    ).subscribe((item: UserModel) => {
      this.data = item;
      this.mobileSupportServive.toPopup(this.data, UserEditCComponent, { viewOnly: false })
        .pipe(takeUntil(this.destroy$)).
        subscribe((data: Action) => {
          switch (data.action) {
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
            case 'onDelete':
              this.delete(data.state);
              break;
            default:
              break;
          }
        });
    })
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
  delete(data: UserModel) {
    this.spinner.show();
    this.userService.delete(data).then(() => {
      this.router.navigate([`/home/tabs/tab3`]).then(_ => {
        this.spinner.hide();
        window.location.reload();
      })
    })
  }
  notifyCreate(header: string, massage: string) {
    this.alertController.create({
      mode: 'ios',
      header: header,
      message: massage,
      buttons: [{
        text: 'OK'
      }]
    }).then(alert => { alert.present(); });
  }
  ngOnInit() { }

}
