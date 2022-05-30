import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { defaultAvatar } from 'src/app/services/constant';
import { PetModel } from 'src/app/services/entitys/pet.model';
import { PopupAvatarComponent } from '../popup-avatar/popup-avatar.component';
export class AddPetDataModel extends PetModel { }
enum FormField {
  avatar = 'avatar',
  name = 'name',
  birthDay = 'birthDay',
  breed = 'breed',
  species = 'species',
  sex = 'sex',
  code = 'code'
}
@Component({
  selector: 'app-add-pet-c',
  templateUrl: './add-pet-c.component.html',
  styleUrls: ['./add-pet-c.component.scss']
})
export class AddPetCComponent implements OnInit, OnDestroy {
  FormField = FormField;
  form: FormGroup;
  @Input() data: AddPetDataModel;
  @Output() onSubmit = new EventEmitter<AddPetDataModel>();
  @Output() onBack = new EventEmitter<AddPetDataModel>();
  submited = false;
  @Input() popup: boolean = false;
  destroy$ = new Subject();
  constructor(public alertController: AlertController, private formBuilder: FormBuilder, private modalCtrl: ModalController) { }
  ngOnInit() {
    this.forworder();
    this.form = this.formBuilder.group({
      [FormField.name]: [this.data.name, [Validators.required]],
      [FormField.birthDay]: [this.data.birthDay],
      [FormField.breed]: [this.data.breed],
      [FormField.species]: [this.data.species],
      [FormField.sex]: [this.data.sex || 'MALE'],
      [FormField.code]: [this.data.code],
      [FormField.avatar]: [this.data.avatar || defaultAvatar]
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  forworder() {
    if (this.popup) {
      const map = {
        onSubmit: this.onSubmit,
        onBack: this.onBack
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
  async submit() {
    this.submited = true;
    //  if(this.form.controls[FormField.birthDay].errors) {
    //   this.notifyCreate("Thông tin không hợp lệ" ,  "Ngày không đúng định dạng");
    //       return ;
    //  }
    const data = this.form.getRawValue() as AddPetDataModel;
    if (this.form.valid) {
      this.onSubmit.emit(Object.assign(this.data, data))
      // await this.modalCtrl.dismiss({
      //   data: Object.assign(this.data ,this.form.getRawValue())
      //  });
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
  async fileChangeEvent(imageChangedEvent: any) {
    const modal = await this.modalCtrl.create({
      component: PopupAvatarComponent,
      cssClass: 'modal-custom-class',
      showBackdrop: false,
      componentProps: {
        imageChangedEvent
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && typeof data === 'object') {
      if (data.data) {
        const item = data.data as string;
        this.form.controls[FormField.avatar].setValue(item);
      }
    }
  }
}
