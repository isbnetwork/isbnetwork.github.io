import { AngularFirestore } from '@angular/fire/firestore';
import { Timestamp } from './entitys/firestore-types';
import { FirestoreCrudService } from './firestore-crud.service';
export class IFireStoreService<T> {
  public crudService: FirestoreCrudService<T>;
  constructor(protected afs: AngularFirestore, table: string) {
    this.crudService = new FirestoreCrudService<T>(afs, table);
  }
  convertTimestampToDate(timestamp: Timestamp | any): Date | any {
    return timestamp instanceof Timestamp
      ? new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate()
      : timestamp;
  }
  toDate(items: T[]): T[] {
    return items.map((it: T) => {
      Object.keys(it).forEach((key) => {
        it[key] =
          it[key] instanceof Timestamp
            ? this.convertTimestampToDate(it[key])
            : it[key];
      });
      return it;
    }) as any;
  }
  toDateObject(it: T): T {
    Object.keys(it).forEach((key) => {
      it[key] =
        it[key] instanceof Timestamp
          ? this.convertTimestampToDate(it[key])
          : it[key];
    });
    return it;
  }
}
