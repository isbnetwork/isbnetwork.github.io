import { Injectable, Type } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { from, Observable, of } from "rxjs";
import { filter, map, switchMap } from "rxjs/operators";
export interface Action {
  action: string;
  state: any;
}
@Injectable()
export class MobileSupportServive {
  constructor( public modalController: ModalController) {}
  toPopup<T>(item: T , component : Type<any> , input: any): Observable<Action> {
    if(!this.isMobile) {
      return of({action: 'EMPTY' , state: null});
    }
    const modal =  this.modalController.create({
      component,
      cssClass: 'modal-custom-full-screem',
      showBackdrop: false,
      animated: false,
      componentProps: {
        data: item,
        popup: true,
        ...input
      },
    });
  return from(modal).pipe(
      switchMap( (d) => {
        d.present();
        return d.onWillDismiss()
      }),
      filter( data => data && typeof data === 'object'),
      map( data => data.data)
    ) as Observable<Action>;
  }
  get isMobile() {
    return ((window.innerWidth < 768));
  }
}
