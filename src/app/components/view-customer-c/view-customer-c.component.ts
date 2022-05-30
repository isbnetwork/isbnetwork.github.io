import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { CustomerModel } from 'src/app/services/entitys/customer.model';
import { PetModel } from 'src/app/services/entitys/pet.model';
import { AddPetDataModel } from '../add-pet-c/add-pet-c/add-pet-c.component';
import { CustomerService } from 'src/app/services/customer.service';
import { BookingService } from 'src/app/services/booking.service';
import { BookingModel } from 'src/app/services/entitys/booking.model';
import { AddCalendarComponent } from '../add-calendar/add-calendar/add-calendar.component';
import { MobileSupportServive } from 'src/app/services/mobile-support.service';
import { CalendarEvent } from 'angular-calendar';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
  addHours,
  isThisSecond,
} from 'date-fns';

const colors: any = {
  RQT: {
    primary: '#FF7575',
    secondary: 'rgba(255, 0, 0, 0.2)',
  },
  QT: {
    primary: '#FEEA37',
    secondary: 'rgba(255, 230, 0, 0.2)',
  },
  TB: {
    primary: '#78BEC3',
    secondary: 'rgba(120, 190, 195, 0.2)',
  },
};

@Component({
  selector: 'app-view-customer-c',
  templateUrl: './view-customer-c.component.html',
  styleUrls: ['./view-customer-c.component.scss'],
  providers: [MobileSupportServive]
})
export class ViewCustomerCComponent implements OnInit, OnDestroy {
  @Input() data: CustomerModel;
  @Output() onEditCustomer = new EventEmitter<CustomerModel>();
  @Output() onEditPet = new EventEmitter<PetModel>();
  @Output() onDeletePet = new EventEmitter<PetModel>();
  @Output() onNewPet = new EventEmitter<CustomerModel>();
  @Output() onViewPet = new EventEmitter<AddPetDataModel>();
  @Output() onBack = new EventEmitter<AddPetDataModel>();
  submited = false;
  @Input() popup: boolean = false;
  destroy$ = new Subject();
  listBookingOfCus: BookingModel[] = [];
  listCus: CustomerModel[] = [];
  constructor(public loadingController: LoadingController, private cdf: ChangeDetectorRef, public mobileSupportServive: MobileSupportServive, private cusService: CustomerService, private bookingService: BookingService, public alertController: AlertController, private formBuilder: FormBuilder, private modalCtrl: ModalController) { }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngOnInit() {
    this.forworder();
    this.getListBooking();
    this.getListCus();
  }
  getListCus() {
    this.cusService.getAll()
      .pipe().subscribe(list => {
        this.listCus = [...list.map(it => {
          return {
            url: it.url,
            fullName: it.fullName,
            desc: it.desc,
            search: it.search,
            id: it.id,
            phone: it.phone,
            address: it.address,
            seqNo: it.seqNo,
            pets: it.pets
          }
        })];
      })
  }
  getListBooking() {
    this.bookingService.getListByCondition((ref) => ref.where("cusId", "==", this.data.id))
      .pipe().subscribe(list => {
        this.listBookingOfCus = [...list.map(it => {
          return {
            id: it.id,
            userName: it.userName,
            petName: it.petName,
            priority: it.priority,
            time: it.time,
            note: it.note,
            cusId: it.cusId,
            brand: it.brand
          }
        })];
      });
  }

  async onOpenBooking(item?: BookingModel) {
    this.presentLoading();
    const modal = await this.modalCtrl.create({
      component: AddCalendarComponent,
      cssClass: this.mobileSupportServive.isMobile ? 'modal-custom-full-screem' : 'modal-custom-class',
      showBackdrop: false,
      animated: false,
      componentProps: {
        popup: this.mobileSupportServive.isMobile,
        data: item,
        listCus: this.listCus,
        selectedItem: this.data,
        openFromTab1: true,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && typeof data === 'object') {
      if (data.data) {
        const item = data.data as BookingModel;
        this.addEvent({ ...item });
      }
      if (data.deleted) {
        this.bookingService.delete(item);
      }
    }
  }
  async addEvent(item: BookingModel) {
    if (item.id) {
      this.bookingService.update(item);
    } else {
      this.bookingService.add(item);
    }
    this.cdf.detectChanges();
  }
  async onDelete(item) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirm!',
      message: 'Bạn có muốn xóa không!',
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
            this.onDeletePet.emit(Object.assign(item, item))
          }
        }
      ]
    });
    await alert.present();
  }
  forworder() {
    if (this.popup) {
      const map = {
        onEditCustomer: this.onEditCustomer,
        onEditPet: this.onEditPet,
        onNewPet: this.onNewPet,
        onViewPet: this.onViewPet,
        onBack: this.onBack,
        onDeletePet: this.onDeletePet,
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
  back($event) {
    this.onBack.emit();
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
  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 100,
      mode: 'ios',
    });
    await loading.present();
  }
}
