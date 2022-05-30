import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexStroke,
  ApexXAxis,
  ApexFill,
  ApexTooltip
} from "ng-apexcharts";
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { BookingService } from 'src/app/services/booking.service';
import { CustomerService } from 'src/app/services/customer.service';
import { BookingModel } from 'src/app/services/entitys/booking.model';
import { CustomerModel } from 'src/app/services/entitys/customer.model';
import { PetHistoryModel } from 'src/app/services/entitys/pet-history.model';
import { PetModel } from 'src/app/services/entitys/pet.model';
import { MobileSupportServive } from 'src/app/services/mobile-support.service';
import { AddCalendarComponent } from '../../add-calendar/add-calendar/add-calendar.component';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
};
@Component({
  selector: 'app-view-pet-detail-c',
  templateUrl: './view-pet-detail-c.component.html',
  styleUrls: ['./view-pet-detail-c.component.scss'],
})
export class ViewPetDetailCComponent implements OnInit, AfterViewInit, OnDestroy {
  public chartOptions: Partial<ChartOptions>;
  @Input() data: PetModel;
  @Output() onCreateHistory = new EventEmitter<PetModel>();
  @Output() onEditHistory = new EventEmitter<PetHistoryModel>();
  @Output() onEditPet = new EventEmitter<PetModel>();
  @Output() onBack = new EventEmitter<PetModel>();
  @Input() popup: boolean = false;
  destroy$ = new Subject();
  listCus: CustomerModel[] = [];
  constructor(private bookingService: BookingService, private cusService: CustomerService, public mobileSupportServive: MobileSupportServive, public loadingController: LoadingController, private modalCtrl: ModalController) {
    this.getListCus();
  }
  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
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
  ngAfterViewInit(): void {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 1000)
  }
  back($event) {
    this.onBack.emit(this.data);
  }
  ngOnInit() {
    this.forworder();
    this.chartOptions = {
      series: [
        {
          name: "Cân nặng",
          data: this.data.histories.map(item => item.weight),
          color: "#78bec3"
        }
      ],
      chart: {
        type: "bar",
        height: 250
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "5%"
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        categories:
          this.data.histories.map(item => `${String(item.date.getDate()).padStart(2, '0')}.${String(item.date.getMonth() + 1).padStart(2, '0')}.${item.date.getFullYear()}`)
      },
      yaxis: {
        title: {
          text: " (kg)"
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return " " + val + " kg";
          }
        }
      }
    };
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 2000)
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
  onOpenBooking() {
    this.cusService.get(this.data.customerId).pipe(take(1), takeUntil(this.destroy$)).subscribe(async cus => {
      const item: BookingModel = {
        userName: cus.fullName,
        petName: this.data.name,
        priority: null,
        time: null,
        note: null,
        brand: 'Q9',
        cusId: this.data.customerId
      }

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
          selectedItem: cus,
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
    })

  }
  async addEvent(item: BookingModel) {
    if (item.id) {
      this.bookingService.update(item);
    } else {
      this.bookingService.add(item);
    }
  }
  forworder() {
    if (this.popup) {
      const map = {
        onCreateHistory: this.onCreateHistory,
        onEditHistory: this.onEditHistory,
        onEditPet: this.onEditPet,
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
}



