import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest, Subject } from 'rxjs';
import { filter, finalize, pluck, switchMap, take, takeUntil } from 'rxjs/operators';
import { AddPetDataModel } from 'src/app/components/add-pet-c/add-pet-c/add-pet-c.component';
import { ViewPetDetailCComponent } from 'src/app/components/view-pet-detail-c/view-pet-detail-c/view-pet-detail-c.component';
import { defaultAvatar } from 'src/app/services/constant';
import { CustomerService } from 'src/app/services/customer.service';
import { base64ToFile } from 'src/app/services/db-utils';
import { CustomerModel } from 'src/app/services/entitys/customer.model';
import { PetHistoryModel } from 'src/app/services/entitys/pet-history.model';
import { PetModel } from 'src/app/services/entitys/pet.model';
import { Action, MobileSupportServive } from 'src/app/services/mobile-support.service';

@Component({
  selector: 'app-view-pet-detail',
  templateUrl: './view-pet-detail.component.html',
  styleUrls: ['./view-pet-detail.component.scss'],
  providers: [MobileSupportServive]
})
export class ViewPetDetailComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();
  data: PetModel;
  constructor(
    public mobileSupportServive: MobileSupportServive,
    private spinner: NgxSpinnerService,
    private router: Router, private route: ActivatedRoute,
    private customerService: CustomerService) { }
  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
  ngOnInit() {
    this.spinner.show();
    this.route.params.pipe(
      switchMap(data =>
        combineLatest(
          [
            this.customerService.getPet(data.customerId, data.petId).pipe(take(1)),
            this.customerService.getPetHistories(data.customerId, data.petId).pipe(take(1))
          ]
        )
      ),
      takeUntil(this.destroy$)).subscribe(([pet, histories]) => {
        this.data = { ...pet, histories };
        this.spinner.hide();
        this.mobileSupportServive.toPopup(this.data, ViewPetDetailCComponent, {}).subscribe( (data: Action) => {
          switch (data.action) {
            case 'onCreateHistory':
              this.createHistory(data.state);
              break;
            case 'onEditHistory':
              this.editHistory(data.state);
                break;
            case 'onEditPet':
              this.editPet(data.state);
                    break;
            case 'onBack':
                 this.back(data.state);
                    break;
            default:
              break;
          }
        });

      });
  }
  back($event: PetModel) {
    this.router.navigate(['/home/tabs/tab1/view-customer',  $event.customerId])
  }
  createHistory($event: PetModel) {
    this.router.navigate(['/home/tabs/tab1/customer/pet/history/create', $event.customerId, $event.id])
  }
  editHistory($event: PetHistoryModel) {
    const customerId = this.route.snapshot.paramMap.get('customerId');
    const petId = this.route.snapshot.paramMap.get('petId');
    this.router.navigate(['/home/tabs/tab1/customer/pet/history/edit', customerId, petId, $event.id])
  }
  editPet($event: PetModel) {
    const customerId = this.route.snapshot.paramMap.get('customerId');
    const petId = this.route.snapshot.paramMap.get('petId');
    this.router.navigate(['/home/tabs/tab1/customer/edit/pet', customerId, petId])
  }
}
