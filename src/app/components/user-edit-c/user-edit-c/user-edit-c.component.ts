import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { defaultAvatar } from 'src/app/services/constant';
import { UserModel } from 'src/app/services/entitys/user.model';
import { PopupAvatarComponent } from '../../add-pet-c/popup-avatar/popup-avatar.component';
import { Role } from 'src/app/services/role.enum';
import { AuthService } from 'src/app/services/auth.service';

enum FormField {
  role = 'role',
  passport = 'passport',
  displayName = 'displayName',
  phone = 'phone',
  address = 'address',
  photoURL = 'photoURL',
  active = 'active'
}
@Component({
  selector: 'app-user-edit-c',
  templateUrl: './user-edit-c.component.html',
  styleUrls: ['./user-edit-c.component.scss'],
})
export class UserEditCComponent implements OnInit, OnDestroy {
  @Input() data: UserModel;
  @Input() currAcc: UserModel;
  destroy$ = new Subject();
  FormField = FormField;
  form: FormGroup;
  submited = false;
  nameBtnActive = '';
  nameRole = '';
  isMine = false;
  fullName = '';
  displayAddress = '';
  displayStatus = '';
  @Output() onSubmit = new EventEmitter<UserModel>();
  @Output() onDelete = new EventEmitter<UserModel>();
  @Output() onEdit = new EventEmitter<UserModel>();
  @Output() onBack = new EventEmitter<UserModel>();
  @Input() viewOnly = false;
  @Input() isAdmin: boolean;
  @Input() title = 'Chỉnh sửa thông tin';
  @Input() popup: boolean = false;
  constructor(private auth: AuthService, private alertCtrl: AlertController, private modalCtrl: ModalController, private spiner: NgxSpinnerService, private router: Router, public alertController: AlertController, private formBuilder: FormBuilder) { }
  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  ngOnInit() {
    this.auth.user$.subscribe(
      x => {
        this.currAcc = x;
        this.isAdmin = this.currAcc.role === Role.ADMIN ? true : false;
        this.isMine = this.data.id == this.currAcc.id ? true : false;
      })
    this.forworder();
    this.form = this.formBuilder.group({
      [FormField.role]: [{ value: this.data.role || 'BLOCK', disabled: this.viewOnly }, [Validators.required]],
      [FormField.displayName]: [{ value: this.data.displayName, disabled: this.viewOnly }, [Validators.required]],
      [FormField.phone]: [this.data.phone, [Validators.required, Validators.pattern(/((09|03|07|08|05)+([0-9]{8})\b)/g)]],
      [FormField.address]: [{ value: this.data.address, disabled: this.viewOnly }],
      [FormField.photoURL]: [{ value: this.data.photoURL || defaultAvatar, disabled: this.viewOnly }],
      [FormField.active]: [{ value: this.data.active ? 'ĐANG HOẠT ĐỘNG' : 'ĐANG KHÓA', disabled: this.viewOnly }, [Validators.required]],

    });
    if (this.viewOnly) {
      this.form.controls[FormField.phone].disable();
    }
    this.nameBtnActive = this.data.active ? 'KHÓA TÀI KHOẢN' : 'MỞ TÀI KHOẢN';
    this.nameRole = this.data.role == Role.ADMIN ? 'GIÁM ĐỐC' : this.data.role == Role.DOCTOR ? 'BÁC SĨ' : 'CASHIER';
    this.fullName = this.data.displayName.toUpperCase();
    this.displayAddress = this.data.address == '' ? 'Chưa cập nhật' : this.data.address;
    this.displayStatus = this.data.active ? 'ĐANG HOẠT ĐỘNG' : 'ĐANG KHÓA';
  }
  forworder() {
    if (this.popup) {
      const map = {
        onSubmit: this.onSubmit,
        onEdit: this.onEdit,
        onBack: this.onBack,
        onDelete: this.onDelete,
      };
      Object.keys(map).forEach(key => {
        map[key].pipe(
          takeUntil(this.destroy$)
        ).subscribe(data => {
          this.modalCtrl.dismiss({
            action: key, state: data
          })
        });
      })
    }
  }
  register() {
    this.submited = true;
    if (this.form.valid) {
      const userModel: UserModel = this.form.getRawValue();
      const dataForm = this.form.getRawValue();
      userModel.active = dataForm.active == 'ĐANG HOẠT ĐỘNG' ? true : false;
      this.onSubmit.emit(Object.assign(this.data, userModel)
      )
    }
  }
  acctiveOrBlockUser() {
    // this.data.active = !this.data.active;
    const userModel: UserModel = this.form.getRawValue();
    const dataForm = this.form.getRawValue();
    userModel.active = dataForm.active == 'ĐANG HOẠT ĐỘNG' ? false : true;
    this.onSubmit.emit(Object.assign(this.data, userModel))
  }
  async deleteUser() {
    // Perfom PayPal or Stripe checkout process
    let alert = await this.alertCtrl.create({
      header: 'Xác nhận',
      message: 'Bạn có muốn xóa tài khoản này không ?',
      buttons: [
        {
          text: 'Không',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Có',
          handler: () => {
            const userModel: UserModel = this.form.getRawValue();
            const dataForm = this.form.getRawValue();
            userModel.active = dataForm.active == 'ĐANG HOẠT ĐỘNG' ? true : false;
            this.onDelete.emit(Object.assign(this.data, userModel));
            // this.modalCtrl.dismiss({ deleted: true });
          }
        }
      ]
    });
    await alert.present();

  }
  async close() {
    await this.modalCtrl.dismiss();
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
  async fileChangeEvent(imageChangedEvent: any) {
    if (this.viewOnly) {
      return
    }
    const modal = await this.modalCtrl.create({
      component: PopupAvatarComponent,
      cssClass: 'modal-custom-class',
      showBackdrop: false,
      animated: false,
      componentProps: {
        imageChangedEvent
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && typeof data === 'object') {
      if (data.data) {
        const item = data.data as string;
        this.form.controls[FormField.photoURL].setValue(item);
      }
    }
  }

}
