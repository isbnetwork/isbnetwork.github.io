import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { filter, pluck, switchMap, take, takeUntil } from 'rxjs/operators';
import { AddCustomerCComponent, DataModel } from 'src/app/components/add-customer-c/add-customer-c/add-customer-c.component';
import { CustomerService } from 'src/app/services/customer.service';
import { Action, MobileSupportServive } from 'src/app/services/mobile-support.service';

@Component({
  selector: 'app-edit-customer',
  template: `
      <div class="pet-land-body">
          <div class="content-wraper">
            <app-edit-customer-c *ngIf="data && !mobileSupportServive.isMobile"
            (onSubmit)="submit($event)"
              [data]="data"></app-edit-customer-c>
          </div>
    </div>
  `,
  styleUrls: ['./add-customer.component.scss'],
  providers: [MobileSupportServive]
})
export class EditCustomerComponent implements OnInit, OnDestroy {
  data: DataModel ;
  destroy$ = new Subject();
  constructor(
   public mobileSupportServive: MobileSupportServive,
    private route: ActivatedRoute, private router: Router ,private spinner: NgxSpinnerService ,private customerService: CustomerService) {
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngOnInit() {
      this.route.params.pipe(
        pluck('id'),
        filter(id => !!id),
        switchMap( customerId => this.customerService.get(customerId).pipe(take(1))),
        takeUntil(this.destroy$)
        ).subscribe( item => {
          this.data = item;
          this.mobileSupportServive.toPopup(this.data, AddCustomerCComponent, {}).subscribe( (data: Action) => {
            switch (data.action) {
              case 'onSubmit':
               this.submit(data.state)
                break;
              case 'onBack':
                this.router.navigate([`/home/tabs/tab1/view-customer`, (data.state as DataModel ).id ] )
                break;
              default:
                break;
            }
          });
        })
  }
  submit(data: DataModel) {
    this.spinner.show();
    this.customerService.createCustomer(data).subscribe( it => {
      if(this.route.snapshot.paramMap.get('id')) {
        this.router.navigate([`/home/tabs/tab1/view-customer`,it.id]).then( _ => {
          this.spinner.hide();
        })
      } else {
        this.router.navigate([`/home/tabs/tab1/customer/pet`,it.id]).then( _ => {
          this.spinner.hide();
        })
      }

    })
  }
}
