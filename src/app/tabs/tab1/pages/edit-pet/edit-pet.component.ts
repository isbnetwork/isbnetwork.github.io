import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { filter, pluck, switchMap, take, takeUntil } from 'rxjs/operators';
import { AddPetCComponent, AddPetDataModel } from 'src/app/components/add-pet-c/add-pet-c/add-pet-c.component';
import { defaultAvatar } from 'src/app/services/constant';
import { CustomerService } from 'src/app/services/customer.service';
import { base64ToFile } from 'src/app/services/db-utils';
import { PetModel } from 'src/app/services/entitys/pet.model';
import { Action, MobileSupportServive } from 'src/app/services/mobile-support.service';

@Component({
  selector: 'app-edit-pet',
  templateUrl: './edit-pet.component.html',
  styleUrls: ['./edit-pet.component.scss'],
  providers: [MobileSupportServive]
})
export class EditPetComponent  implements OnInit, OnDestroy {
  data: AddPetDataModel ;
  destroy$ = new Subject();
  constructor( public mobileSupportServive: MobileSupportServive,
    private spinner: NgxSpinnerService , private router: Router , private route: ActivatedRoute,private customerService: CustomerService) { }
  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
  ngOnInit() {
    this.route.params.pipe(
      switchMap( data => this.customerService.getPet(data.customerId,data.petId).pipe(take(1)))
      ).subscribe( (item: PetModel) => {
        this.data = item;
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
    const avatar = data.avatar ;
    let file: File  = null  ;
    try {
       file = base64ToFile(data.avatar, `pet-${new Date().getTime()}`);
    } catch (error) {}
     if(file === null ) {
       this.customerService.addPet(data,data.customerId).pipe(takeUntil(this.destroy$)).subscribe( () => {
        this.router.navigate([`/home/tabs/tab1/view-customer`,data.customerId]).then( _ => {
          this.spinner.hide();
        })
      });
     } else {
      this.customerService.uploadAvatar(file, data.customerId).pipe(
        switchMap( url =>   this.customerService.addPet({...data ,avatar: url},data.customerId) ),
        takeUntil(this.destroy$)).subscribe ( _ => {
          this.router.navigate([`/home/tabs/tab1/view-customer`,data.customerId]).then( _ => {
            this.spinner.hide();
          })
      })
     }
  }
  back( data: AddPetDataModel ) {
    this.router.navigate([`/home/tabs/tab1/view-customer`,data.customerId]);
  }
}
