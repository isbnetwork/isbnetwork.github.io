import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
} from '@angular/core';
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
import { of, Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import { getISOWeek } from 'date-fns';
import { LoadingController, ModalController } from '@ionic/angular';
import { AddCalendarComponent } from 'src/app/components/add-calendar/add-calendar/add-calendar.component';
import { BookingModel } from 'src/app/services/entitys/booking.model';
import { BookingService } from 'src/app/services/booking.service';
import { map, take, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MobileSupportServive } from 'src/app/services/mobile-support.service';
import { CustomerService } from 'src/app/services/customer.service';
import { CustomerModel } from 'src/app/services/entitys/customer.model';
import { brands } from 'src/app/services/constant';

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
const BRAND = 'BRAND';
enum EventSchedule {
  DROPPED = 'DROPPED',
  CLICK = 'CLICK',
}
@Component({
  selector: 'app-schedule-ipad',
  templateUrl: './schedule-ipad.component.html',
  styleUrls: ['./schedule-ipad.component.scss'],
  providers: [MobileSupportServive]
})
export class ScheduleIpadComponent {
  brands = brands;
  brand = 'Q9'
  EventSchedule = EventSchedule;
  locale = 'vi';
  date = new Date();
  rangeDate = null;
  listCus: CustomerModel[] = [];
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        // console.log(event.meta)
        // this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        // this.handleEvent('Deleted', event);
      },
    },
  ];

  refresh = new Subject<void>();

  events: CalendarEvent<BookingModel>[] = [];

  activeDayIsOpen: boolean = true;
  eventDay = {};
  listDate: Date[] = [];
  form: FormGroup;
  constructor(
    public mobileSupportServive: MobileSupportServive,
    private modal: NgbModal,
    public modalController: ModalController,
    public loadingController: LoadingController,
    private cdf: ChangeDetectorRef,
    private bookingService: BookingService,
    private cusService: CustomerService,
    private formBuilder: FormBuilder
  ) {
    this.setView(this.isMobile ? CalendarView.Day : CalendarView.Week);
    this.brand = this.getBrand();
    this.initData(this.brand);
    this.form = this.formBuilder.group({
      month: [this.viewDate.getMonth()]
    });
    this.form.controls.month.valueChanges.subscribe(data => {
      this.monthChange(data);
    })
    this.changeDate(this.viewDate);
  }
  changeDate(date: Date) {
    this.form.controls.month.setValue(date.getMonth(), { emitEvent: false });
    this.listDate = this.toListDate(date);
  }
  nextWeek() {
    this.changeDate(addDays(endOfWeek(this.listDate[this.listDate.length - 1]), 1))
  }
  preWeek() {
    this.changeDate(subDays(startOfWeek(this.listDate[0]), 1))
  }
  monthChange($event) {
    this.changeDate(new Date(this.viewDate.getFullYear(), $event, this.viewDate.getDate()));
  }
  toListDate(date: Date): Date[] {
    const dayStartWeek = startOfWeek(date);
    const result: Date[] = [];
    for (let i = 0; i < 7; i++) {
      result.push(addDays(dayStartWeek, i))
    }
    return result;
  }
  getBrand(): string {
    if (localStorage.getItem(BRAND)) {
      return localStorage.getItem(BRAND);
    } else {
      localStorage.setItem(BRAND, this.brand);
      return this.brand;
    }
  }
  setBrand(brand: string): void {
    localStorage.setItem(BRAND, this.brand);
  }
  get isMobile() {
    return ((window.innerWidth < 768));
  }
  initData(brand: string) {
    this.getListCus();
    this.bookingService
      .getAll(brand)
      .pipe(map(this.toCalendarEvent))
      .subscribe((events: CalendarEvent<BookingModel>[]) => {
        this.eventDay =
          events.map(it => it.meta.time).map(this.dateToStr).reduce(
            (pre, cur) => {
              pre[cur] = true;
              return pre;
            }, {}
          )
          ;
        this.events = events;
        this.cdf.detectChanges();
      });
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
  dateToStr(date: Date): string {
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
  }
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    event.meta.time = newStart;
    this.handleEvent(EventSchedule.DROPPED, event);
  }
  valueChange($event) {
    this.brand = $event.detail.value;
    this.setBrand(this.brand)
    this.initData(this.brand);
  }
  handleEvent(action: EventSchedule, event: CalendarEvent): void {
    switch (action) {
      case EventSchedule.DROPPED:
        const item = event.meta;
        this.bookingService.update(item);
        break;
      case EventSchedule.CLICK:
        this.addCalande(event.meta);
        break;
      default:
        break;
    }
  }
  toCalendarEvent(items: BookingModel[]): CalendarEvent<BookingModel>[] {
    return items.map((item) => {
      return {
        title: `<b>${item.userName}</b>  </br> ${item.petName}`,
        start: item.time,
        end: addHours(item.time, 1),
        color: colors[item.priority],
        draggable: true,
        cssClass: 'my-custom-class',
        resizable: {
          beforeStart: false,
          afterEnd: false,
        },
        meta: item,
      };
    });
  }
  async addEvent(item: BookingModel) {
    if (item.id) {
      this.bookingService.update(item);
    } else {
      this.events = [
        ...this.events,
        {
          title: `${item.userName} - ${item.petName}`,
          start: item.time,
          end: addHours(item.time, 1),
          color: colors[item.priority],
          draggable: true,
          cssClass: 'my-custom-class',
          resizable: {
            beforeStart: false,
            afterEnd: false,
          },
          meta: item,
        },
      ];
      this.bookingService.add(item);
    }
    this.cdf.detectChanges();
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter((event) => event !== eventToDelete);
  }
   addCalande(item?: BookingModel) {
    ( item ?  this.cusService.get(item.cusId) : of(null)).pipe(take(1)).subscribe(async cus => {
      console.log(cus)
      this.presentLoading();
      const modal = await this.modalController.create({
        component: AddCalendarComponent,
        cssClass: this.mobileSupportServive.isMobile ? 'modal-custom-full-screem' : 'modal-custom-class',
        showBackdrop: false,
        animated: false,
        componentProps: {
          popup: this.mobileSupportServive.isMobile,
          data: item || {
            userName: null,
            petName: null,
            priority: null,
            time: null,
            note: null,
            brand: this.brand,
            cusId: null
          },
          selectedItem:cus,
          listCus: this.listCus
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
    })

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
  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  onChange(result: Date): void {
    this.viewDate = result;
    this.changeDate(result);
  }

  getWeek(result: Date): void {
    console.log('week: ', getISOWeek(result));
  }
}
