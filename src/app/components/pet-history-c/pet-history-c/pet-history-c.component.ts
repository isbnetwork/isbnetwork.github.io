import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { range } from 'src/app/services/db-utils';
import { PetHistoryModel } from 'src/app/services/entitys/pet-history.model';
import * as cloneDeep from 'lodash/cloneDeep';
import { AlertController, ModalController } from '@ionic/angular';
import { defaultIfEmpty, takeUntil } from 'rxjs/operators';
import { forkJoin, Subject } from 'rxjs';
import { UserDoctor } from 'src/app/services/entitys/user.model';
import { UserService } from 'src/app/services/user.service';
import { Role } from 'src/app/services/role.enum';
import { MobileSupportServive } from 'src/app/services/mobile-support.service';
import { CustomerService } from 'src/app/services/customer.service';
import { NgxSpinnerService } from 'ngx-spinner';
export interface ItemThumb {
  url: string;
  active: boolean;
}
enum FormField {
  day = 'day',
  month = 'month',
  year = 'year',
  temperature = 'temperature',
  weight = 'weight',
  treatment = 'treatment',
  lesions = 'lesions',
  doctor = 'doctor',
  images = 'images'
}
@Component({
  selector: 'app-pet-history-c',
  templateUrl: './pet-history-c.component.html',
  styleUrls: ['./pet-history-c.component.scss'],
})
export class PetHistoryCComponent implements OnInit, OnDestroy {
  optionDay = [...range(1, 32).map(it => String(it).padStart(2, '0'))];
  optionMonth = [...range(1, 13).map(it => String(it).padStart(2, '0'))];
  optionYear = [...range(2020, 2030)];
  FormField = FormField;
  form: FormGroup;
  @Output() onSubmit = new EventEmitter<PetHistoryModel>();
  @Input() data: PetHistoryModel;
  submited = false;
  maxSize = 2;
  pointer = 0;
  @Output() onBack = new EventEmitter<PetHistoryModel>();
  @Input() popup: boolean = false;
  destroy$ = new Subject();

  //dropdown cus by name
  openDrop: boolean = false;
  selectedItem: UserDoctor;
  filterListUser: UserDoctor[] = [];
  listUser: UserDoctor[] = [];

  constructor(private spinner: NgxSpinnerService,private customerService: CustomerService,public mobileSupport: MobileSupportServive,private modalCtrl: ModalController, private formBuilder: FormBuilder, public alertController: AlertController, private userService: UserService) {
  }
  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
  ngOnInit() {
    this.forworder();
    this.getListUser();
    this.form = this.formBuilder.group({
      [FormField.day]: [String(this.data.date.getDate()).padStart(2, '0'), [Validators.required]],
      [FormField.month]: [String(this.data.date.getMonth() + 1).padStart(2, '0'), [Validators.required]],
      [FormField.year]: [this.data.date.getFullYear(), [Validators.required]],
      [FormField.temperature]: [this.data.temperature, [Validators.required, Validators.pattern("^[0-9.]*$")]],
      [FormField.weight]: [this.data.weight, [Validators.required, Validators.pattern("^[0-9.]*$")]],
      [FormField.lesions]: [this.data.lesions],
      [FormField.doctor]: [this.data.doctor],
      [FormField.treatment]: [this.data.treatment],
      [FormField.images]: [this.data.images],
    });
  }
  getListUser() {
    this.userService.getAll().pipe(takeUntil(this.destroy$)).subscribe(list => {
      this.listUser = [...list.map(it => {
        return {
          displayName: it.displayName,
          role: Role.DOCTOR
        }
      })];
    })
  }
  onSelectItem(user: UserDoctor) {
    this.selectedItem = user;
    console.log(this.selectedItem)
    this.form.controls[FormField.doctor].setValue(user.displayName);
    this.openDrop = false;
  }

  onSearchUser($event) {
    let value = $event.target.value;
    value = (value || '').toLowerCase();
    if (value == '') {
      this.openDrop = false;
      return;
    }

    this.filterListUser = this.listUser.filter(c => {
      const name = c.displayName.toLowerCase();
      const role = c.role;
      return name.includes(value) || role.includes(value);
    });
    this.openDrop = this.filterListUser.length > 0 ? true : false;
  }
  get itemThumb(): string[] {
    return this.form.controls[FormField.images].value
  }
  nexItem() {
    if (this.pointer < this.itemThumb.length) {
      this.pointer = this.pointer + this.maxSize;
    }
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
  preIitem() {
    if (this.pointer - this.maxSize >= 0) {
      this.pointer = this.pointer - this.maxSize;
    }
  }
  get listThumb(): ItemThumb[] {
    const rs = this.itemThumb.slice(this.pointer, this.pointer + this.maxSize).map(it => {
      return {
        url: it,
        active: true
      }
    });
    const len = this.maxSize - rs.length;
    for (let i = 0; i < len; i++) {
      rs.push({ url: '', active: false })
    }
    return rs;
  }
  fileChangeEvent($event) {
    this.pointer = 0;
    const files: File[] = $event.target.files;
    this.spinner.show();
    forkJoin([...files].map((file: File) => {
        return  this.customerService.uploadImage(file)
    })).pipe(
      defaultIfEmpty([])
    ) .pipe(
      takeUntil(this.destroy$)
    ).
    subscribe((imgs: string[]) => {
      this.form.controls[FormField.images].setValue(
        [...this.itemThumb, ...imgs]
      )
      this.spinner.hide();
     } );
  }
  converToPetHistory(data: any): PetHistoryModel {
    const temp = cloneDeep(data);
    const { day, month, year } = temp;
    const date = new Date(year, Number(month) - 1, day);
    delete temp.day;
    delete temp.month;
    delete temp.year;
    return Object.assign({ ...this.data, date }, temp)
  }
  async submit() {
    this.submited = true;
    if (this.form.valid) {
      this.onSubmit.emit(this.converToPetHistory(this.form.getRawValue()))
    }
  }
  async remove(item: ItemThumb) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirm!',
      message: 'Bạn có muốn xóa hình ảnh này!',
      mode: 'ios',
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
            const patchVaue = this.form.controls[FormField.images].value as string[];
            this.form.controls[FormField.images].setValue([...patchVaue.filter(it => item.url !== it)])
          }
        }
      ]
    });
    await alert.present();

  }
  back($event) {
    this.onBack.emit(this.data);
  }
}

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});
