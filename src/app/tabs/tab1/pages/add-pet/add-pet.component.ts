import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { AddPetCComponent, AddPetDataModel } from 'src/app/components/add-pet-c/add-pet-c/add-pet-c.component';
import { defaultAvatar } from 'src/app/services/constant';
import { CustomerService } from 'src/app/services/customer.service';
import { base64ToFile } from 'src/app/services/db-utils';
import { Action, MobileSupportServive } from 'src/app/services/mobile-support.service';

@Component({
  selector: 'app-add-pet',
  templateUrl: './add-pet.component.html',
  styleUrls: ['./add-pet.component.scss'],
  providers: [MobileSupportServive]
})
export class AddPetComponent implements OnInit, OnDestroy {
  @Input() data: AddPetDataModel  = null;
  destroy$ = new Subject();
  constructor(
    public mobileSupportServive: MobileSupportServive,
    private spinner: NgxSpinnerService , private router: Router , private route: ActivatedRoute,private customerService: CustomerService) { }
  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
  ngOnInit() {
    this.route.params.pipe(
      takeUntil( this.destroy$)
      ).subscribe( (item) => {
        this.data = {
          avatar : null,
          name :null,
          birthDay : null,
          breed : null,
          species  :null,
          sex : null,
          code  :null,
          customerId : item.id
      };
      this.mobileSupportServive.toPopup(this.data, AddPetCComponent, {}).subscribe( (data: Action) => {
        switch (data.action) {
          case 'onBack':
            this.back(data.state);
            break;
          case 'onSubmit':
            this.submit(data.state);
              break;
          default:
            break;
        }
      });
      })

  }
  submit( data: AddPetDataModel ) {
    this.spinner.show();
    let file: File  =  null;
      try {
     file = base64ToFile(data.avatar, `pet-${new Date().getTime()}`);
      } catch (error) { }

     if(file === null) {
      this.data = null;
       this.customerService.addPet(data,data.customerId).pipe(takeUntil(this.destroy$)).subscribe( () => {
        this.router.navigateByUrl(`/home/tabs/tab1/view-customer/${data.customerId}`).then( _ => {
          this.spinner.hide();
        })
      });
     } else {
      this.data = null;
      this.customerService.uploadAvatar(file, data.customerId).pipe(
        switchMap( url =>   this.customerService.addPet({...data ,avatar: url},data.customerId) ),
        takeUntil(this.destroy$)).subscribe ( _ => {
          this.router.navigateByUrl(`/home/tabs/tab1/view-customer/${data.customerId}`).then( _ => {
            this.spinner.hide();
          })
      })
     }
  }
  back( data: AddPetDataModel ) {
    this.router.navigate([`/home/tabs/tab1/view-customer`,data.customerId]);
  }

}
