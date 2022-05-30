import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BookingModel } from './entitys/booking.model';
import { IFireStoreService } from './i-fire-store.service';
const TABLE = 'BOOKING';
@Injectable({
  providedIn: 'root',
})
export class BookingService extends IFireStoreService<BookingModel> {
  constructor(protected afs: AngularFirestore) {
    super(afs, TABLE);
  }

  add(data: BookingModel, id?: string) {
    return this.crudService.add(data, id);
  }

  update(data: BookingModel) {
    return this.crudService.update(data);
  }

  delete(data: BookingModel) {
    return this.crudService.delete(data.id);
  }

  getAll(brand: string) {
    return this.crudService.listByCondition((ref) => ref.where("brand", "==", brand)).pipe(map(this.toDate.bind(this)));
  }

  getListByCondition(query: (ref: any) => any): Observable<BookingModel[]> {
    return this.crudService.listByCondition(query).pipe(map(this.toDate.bind(this)));
  }
}
