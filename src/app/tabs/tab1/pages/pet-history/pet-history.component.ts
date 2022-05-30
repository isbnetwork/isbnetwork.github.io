import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest, forkJoin, of, pipe, Subject } from 'rxjs';
import { defaultIfEmpty, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { PetHistoryCComponent } from 'src/app/components/pet-history-c/pet-history-c/pet-history-c.component';
import { CustomerService } from 'src/app/services/customer.service';
import { base64ToFile } from 'src/app/services/db-utils';
import { PetHistoryModel } from 'src/app/services/entitys/pet-history.model';
import { PetModel } from 'src/app/services/entitys/pet.model';
import { Action, MobileSupportServive } from 'src/app/services/mobile-support.service';

@Component({
  selector: 'app-pet-history',
  templateUrl: './pet-history.component.html',
  styleUrls: ['./pet-history.component.scss'],
  providers: [MobileSupportServive]
})
export class PetHistoryComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();
  data: PetHistoryModel;
  dataPet: PetModel;
  constructor(private spinner: NgxSpinnerService,
    public mobileSupportServive: MobileSupportServive,
    private router: Router, private route: ActivatedRoute,
    private customerService: CustomerService) { }
  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
  ngOnInit() {
    this.data = {
      date: new Date(),
      temperature: null,
      weight: null,
      treatment: null,
      lesions: null,
      doctor: null,
      images: []
    }
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
        this.dataPet = { ...pet, histories };
        this.spinner.hide();
        this.mobileSupportServive.toPopup(this.data, PetHistoryCComponent, {}).subscribe((data: Action) => {
          switch (data.action) {
            case 'onSubmit':
              this.submit(data.state);
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
  submit($event: PetHistoryModel) {
    this.spinner.show();
    const customerId = this.route.snapshot.paramMap.get('customerId');
    const petId = this.route.snapshot.paramMap.get('petId');
    forkJoin($event.images.map((it: string) => {
      try {
        const file = base64ToFile(it, `pet-history-${new Date().getTime()}`);
        return this.customerService.uploadHistoryPet(file, customerId, petId)
      } catch {
        return of(it);
      }
    })).pipe(
      defaultIfEmpty([]),
      switchMap((images: string[]) => {
        return this.customerService.addPetHistory({ ...$event, images }, customerId, petId)
      })
    )
      .pipe(
        takeUntil(this.destroy$)
      ).subscribe(item => {
        this.spinner.hide();
        this.router.navigate(['/home/tabs/tab1/customer/pet/view', customerId, petId]);
      })
  }
  back($event: PetHistoryModel) {
    const customerId = this.route.snapshot.paramMap.get('customerId');
    const petId = this.route.snapshot.paramMap.get('petId');
    this.router.navigate(['/home/tabs/tab1/customer/pet/view', customerId, petId]);
  }
}
