import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonDatetime, ModalController } from '@ionic/angular';
import { DisabledTimeFn } from 'ng-zorro-antd/date-picker';
import { brands } from 'src/app/services/constant';
import { range } from 'src/app/services/db-utils';
import { BookingModel } from 'src/app/services/entitys/booking.model';
import { CustomerModel } from 'src/app/services/entitys/customer.model';

enum FormField {
  userName = 'userName',
  petName = 'petName',
  priority = 'priority',
  time = 'time',
  note = 'note',
  brand = 'brand'
}

@Component({
  selector: 'app-add-calendar',
  templateUrl: './add-calendar.component.html',
  styleUrls: ['./add-calendar.component.scss'],
})
export class AddCalendarComponent implements OnInit {
  brands = brands;
  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;
  FormField = FormField;
  title: string;
  btnTitle: string;
  @Input() data: BookingModel;
  form: FormGroup;
  submited = false;
  @Input() popup: boolean = false;

  //dropdown cus by name
  openDrop: boolean = false;
  selectedItem: CustomerModel;
  @Input() listCus: CustomerModel[];
  filterListCus: CustomerModel[] = [];

  @Input() openFromTab1: boolean;
  yearValues = '2022,2023';
  constructor(private formBuilder: FormBuilder, private modalCtrl: ModalController, private alertCtrl: AlertController) { }
  ngOnInit() {
  const start =  new Date().getFullYear() - 10;
  const end = 20;
  const listTemp = []
  for(let i = start ; i < (start + end) ; i++ )  {
      listTemp.push(i);
  }
  this.yearValues = listTemp.join(',');
    this.title = this.isEdit ? 'Chỉnh sửa cuộc hẹn' : 'Thêm cuộc hẹn';
    this.btnTitle = this.isEdit ? 'Cập nhật' : 'Hoàn thành';
    this.form = this.formBuilder.group({
      [FormField.userName]: [this.data.userName, [Validators.required, Validators.minLength(2)]],
      [FormField.petName]: [this.data.petName, [Validators.required, Validators.minLength(2)]],
      [FormField.priority]: [this.data.priority || 'BT', [Validators.required]],
      [FormField.brand]: [this.data.brand, [Validators.required]],
      [FormField.time]: [this.data.time, [Validators.required]],
      [FormField.note]: [this.data.note]
    });
  }

  onSelectItem(cus: CustomerModel) {
    this.selectedItem = cus;
    this.form.controls[FormField.userName].setValue(cus.fullName);
    this.openDrop = false;
  }

  onSearchCus($event) {
    let value = $event.target.value;
    value = (value || '').toLowerCase();
    if (value == '') {
      this.openDrop = false;
      return;
    }

    this.filterListCus = this.listCus.filter(c => {
      const name = c.fullName.toLowerCase();
      const phone = c.phone;
      return name.includes(value) || phone.includes(value);
    });
    this.openDrop = this.filterListCus.length > 0 ? true : false;
  }

  //
  get isEdit(): boolean {
    return this.data && this.data.id != null
  }
  mobileDateTime() {
    this.datetime.open();
  }
  valueDateChange(value) {
    this.form.controls[FormField.time].setValue(new Date(value));
  }
  async submit() {
    this.submited = true;
    if (this.form.valid) {
      if (this.selectedItem != undefined)
        this.data.cusId = this.selectedItem.id;
      await this.modalCtrl.dismiss({
        data: Object.assign(this.data, this.form.getRawValue())
      });
    }
  }
  get invalid(): boolean {
    return this.submited
  }
  async remove() {
    // Perfom PayPal or Stripe checkout process
    let alert = await this.alertCtrl.create({
      header: 'Xác nhận',
      message: 'Bạn có muốn xóa cuộc hẹn này không ?',
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
            this.modalCtrl.dismiss({ deleted: true });
          }
        }
      ]
    });
    await alert.present();
  }
  async close() {
    await this.modalCtrl.dismiss();
  }

  disabledDateTime: DisabledTimeFn = () => ({
    nzDisabledHours: () => [...range(0, 8), ...range(19, 24)],
    nzDisabledMinutes: () => [],
    nzDisabledSeconds: () => []
  });

}
