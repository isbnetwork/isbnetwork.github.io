import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { filter, pluck, switchMap, take, takeUntil } from 'rxjs/operators';
import { AddCustomerCComponent, DataModel } from 'src/app/components/add-customer-c/add-customer-c/add-customer-c.component';
import { CustomerService } from 'src/app/services/customer.service';
import { Action, MobileSupportServive } from 'src/app/services/mobile-support.service';

@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.scss'],
  providers: [MobileSupportServive]
})
export class AddCustomerComponent implements OnInit, OnDestroy {
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
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(
      (event) => {
        if (event instanceof NavigationEnd && event.url.includes('/home/tabs/tab1/customer-new')) {
          // Handle Navigation End
            // Handle Navigation Start
            console.log('Vo')
            this.data = {
              fullName: null,
              phone: null,
              address: null,
              desc: null,
              url: null,
              seqNo: null,
              search: null
            }
            this.mobileSupportServive.toPopup(this.data, AddCustomerCComponent, {}).subscribe( (data: Action) => {
              switch (data.action) {
                case 'onSubmit':
                 this.submit(data.state)
                  break;
                case 'onBack':
                    this.router.navigate([`/home/tabs/tab1`] )
                  break;
                default:
                  break;
              }
            });
        }
      });
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
