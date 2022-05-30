import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { range } from 'src/app/services/db-utils';
import * as cloneDeep from 'lodash/cloneDeep';
import { UserModel } from 'src/app/services/entitys/user.model';
import { AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
export class UserFormModel extends UserModel {
  confirmPassword: string;
}
enum FormField {
  day = 'day',
  month = 'month',
  year = 'year',
  passport = 'passport',
  displayName = 'displayName',
  phone = 'phone',
  email = 'email',
  password = 'password',
  confirmPassword = 'confirmPassword',
  address = 'address'
}
export enum ISACTIVE {
  DEFAULT,
  ACTIVE,
  BLOCK
}
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();
  FormField = FormField;
  form: FormGroup;
  submited = false;
  optionDay = [...range(1, 32).map(it => String(it).padStart(2, '0'))];
  optionMonth = [...range(1, 13).map(it => String(it).padStart(2, '0'))];
  optionYear = [...range(1980, 2010)];
  constructor(private spiner: NgxSpinnerService, private router: Router, public alertController: AlertController, private formBuilder: FormBuilder, private authService: AuthService) { }
  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      [FormField.day]: ["12", [Validators.required]],
      [FormField.month]: ["12", [Validators.required]],
      [FormField.year]: [1995, [Validators.required]],
      [FormField.displayName]: [null, [Validators.required]],
      [FormField.phone]: [null, [Validators.pattern(/((09|03|07|08|05)+([0-9]{8})\b)/g)]],
      [FormField.passport]: [null],
      [FormField.email]: [null, [Validators.required, Validators.email]],
      [FormField.password]: [null, [Validators.required]],
      [FormField.confirmPassword]: [null, [Validators.required]],
      address: ""
    },
      {
        validator: this.MustMatch('password', 'confirmPassword')
      });
  }
  register() {
    this.submited = true;
    this.spiner.show();
    if (this.form.valid) {
      const userModel: UserFormModel = this.converToForm(this.form.getRawValue());
      delete userModel.confirmPassword;
      this.authService.register(userModel)
        .pipe(takeUntil(this.destroy$))
        .subscribe(res => {
          this.spiner.hide();
          this.alertController.create({
            mode: 'ios',
            header: 'Đăng ký thành công',
            message: 'Chào mừng bạn đến với PetLand',
            buttons: [{
              text: 'OK'
            }]
          }).then(alert => {
            let status = userModel.active ? ISACTIVE.ACTIVE : ISACTIVE.BLOCK
            if (status == ISACTIVE.BLOCK) {
              this.authService.signOut().then(() => {
                this.router.navigate(['/forms/block'])
                alert.present();
              });
            } else {
              this.router.navigate(['/home/tabs/tab1']);
              alert.present();
            }
          });
        }, error => {
          this.spiner.hide();
          if (error.code === 'auth/email-already-in-use') {
            this.notifyCreate("Vui lòng kiểm tra Email", "Địa chỉ email đã được đăng ký trước đó");
          }
        })
    } else {
      this.spiner.hide();
    }
  }
  converToForm(data: any): UserFormModel {
    const temp = cloneDeep(data);
    const { day, month, year } = temp;
    const date = new Date(year, Number(month) - 1, day);
    delete temp.day;
    delete temp.month;
    delete temp.year;
    return Object.assign({ ...temp, date }, temp)
  }
  MustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors.mustMatch) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    }
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

}
