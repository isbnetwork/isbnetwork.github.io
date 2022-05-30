import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest, from, Subject } from 'rxjs';
import { filter, pluck, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { ViewCustomerCComponent } from 'src/app/components/view-customer-c/view-customer-c.component';
import { CustomerService } from 'src/app/services/customer.service';
import { CustomerModel } from 'src/app/services/entitys/customer.model';
import { PetModel } from 'src/app/services/entitys/pet.model';
import { Action, MobileSupportServive } from 'src/app/services/mobile-support.service';

@Component({
  selector: 'app-view-customer',
  templateUrl: './view-customer.component.html',
  styleUrls: ['./view-customer.component.scss'],
  providers: [MobileSupportServive]
})
export class ViewCustomerComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();
  data: CustomerModel;
  constructor(
    public mobileSupportServive: MobileSupportServive, public alertController: AlertController,
    private spiner: NgxSpinnerService, private router: Router, private route: ActivatedRoute, private customerService: CustomerService) { }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngOnInit() {
    this.route.params.pipe(
      pluck('id'),
      filter(id => !!id),
      tap(() => this.spiner.show()),
      switchMap((customerId: string) =>
        combineLatest([this.customerService.get(customerId).pipe(take(1)), this.customerService.listPets(customerId).pipe(take(1))]),
      ),
      takeUntil(this.destroy$))
      .subscribe(([customer, pets]) => {
        this.data = { ...customer, pets };
        this.spiner.hide();
        this.mobileSupportServive.toPopup(this.data, ViewCustomerCComponent, {}).subscribe((data: Action) => {
          switch (data.action) {
            case 'onBack':
              this.router.navigate(['/home/tabs/tab1']);
              break;
            case 'onEditCustomer':
              this.editCustomer(data.state);
              break;
            case 'onNewPet':
              this.newPet(data.state);
              break;
            case 'onEditPet':
              this.editPet(data.state);
              break;
            case 'onViewPet':
              this.viewPet(data.state);
              break;
            case 'onDeletePet':
              this.deletePet(data.state);
              break;
            default:
              break;
          }
        });
      })
  }
  editCustomer($event: CustomerModel) {
    this.router.navigate(['/home/tabs/tab1/customer-new/edit', $event.id])
  }
  newPet($event: CustomerModel) {
    this.router.navigate(['/home/tabs/tab1/customer/pet', $event.id])
  }
  editPet($event: PetModel) {
    this.router.navigate(['/home/tabs/tab1/customer/edit/pet', $event.customerId, $event.id])
  }
  viewPet($event: PetModel) {
    this.router.navigate(['/home/tabs/tab1/customer/pet/view', $event.customerId, $event.id])
  }
  deletePet(pet: PetModel) {
    this.spiner.show();
    this.customerService.deletePet(pet.customerId, pet);
    this.spiner.hide();
    this.notifyCreate("Thành công", "Thông tin đã được cập nhật");
  }
  notifyCreate(header: string, massage: string) {
    this.alertController.create({
      mode: 'ios',
      header: header,
      message: massage,
      buttons: [{
        text: 'OK',
        handler: () => {
        }
      }]
    }).then(alert => { alert.present(); });
  }
}
