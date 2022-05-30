
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { combineLatest, from, Observable, of, Subject, throwError } from 'rxjs';
import { concatMap, first, last, map, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { convertSnaps, dateToStr, removeAccents } from './db-utils';
import { CustomerModel } from './entitys/customer.model';
import { OrderByDirection } from './entitys/firestore-types';
import { IFireStoreService } from './i-fire-store.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { PetModel } from './entitys/pet.model';
import { PetHistoryModel } from './entitys/pet-history.model';
const TABLE = 'CUSTOMER';
@Injectable({
  providedIn: 'root',
})
export class CustomerService extends IFireStoreService<CustomerModel> {
  constructor(protected afs: AngularFirestore, private storage: AngularFireStorage) {
    super(afs, TABLE);
  }

  add(data: CustomerModel, id?: string) {
    return this.crudService.add(data, id);
  }
  get(id: string): Observable<CustomerModel> {
    return this.crudService.get(id);
  }
  update(data: CustomerModel) {
    return this.crudService.update(data);
  }

  delete(data: CustomerModel) {
    return this.crudService.delete(data.id);
  }

  getAll(): Observable<CustomerModel[]> {
    return this.crudService.list().pipe(map(this.toDate.bind(this)));
  }

  getListByCondition(query: (ref: any) => any): Observable<CustomerModel[]> {
    return this.crudService.listByCondition(query).pipe(map(this.toDate.bind(this)));
  }

  // .where('title', '>=', term).where('title', '<=', term + '~');
  findCustomer(text: string, sortOrder: OrderByDirection = 'asc',
    pageNumber = 0, pageSize = 3): Observable<CustomerModel[]> {
    return this.afs.collection(`${TABLE}`,
      ref => ref.orderBy("search", sortOrder)
        .where('search', '>=', text.toUpperCase())
        .where('search', '<=', text.toUpperCase() + "\uf8ff")
        .limit(pageSize)
        .startAfter(pageNumber * pageSize)
    )
      .get()
      .pipe(
        map(results => convertSnaps<CustomerModel>(results))
      )
  }
  uploadHistoryPet(file: File, customerId: string, petId: string): Observable<string> {
    const filePath = `${TABLE}/${customerId}/${petId}/${(dateToStr())}/${file.name}`;
    const task = this.storage.upload(filePath, file, {
      cacheControl: "max-age=2592000,public"
    });
    return task.snapshotChanges().pipe(
      last(),
      concatMap(() => this.storage.ref(filePath).getDownloadURL()));
  }
  uploadImage(file: File): Observable<string> {
    const filePath = `${TABLE}/TEMP-HISTORE/${(dateToStr())}/${file.name}.jpg`;
    const task = this.storage.upload(filePath, file, {
      cacheControl: "max-age=2592000,public"
    });
    return task.snapshotChanges().pipe(
      last(),
      concatMap(() => this.storage.ref(filePath).getDownloadURL()));
  }
  uploadAvatar(file: File, customerId: string): Observable<string> {
    const filePath = `${TABLE}/${customerId}/${file.name}`;
    const task = this.storage.upload(filePath, file, {
      cacheControl: "max-age=2592000,public"
    });
    return task.snapshotChanges().pipe(
      last(),
      concatMap(() => this.storage.ref(filePath).getDownloadURL()));
  }
  uploadThumbnail(file: File, customerId: string): Observable<{ percentage: number, url: string }> {
    const filePath = `${TABLE}/${customerId}/${file.name}`;
    const task = this.storage.upload(filePath, file, {
      cacheControl: "max-age=2592000,public"
    });
    return new Observable(ob => {
      const destroy$ = new Subject();
      task.percentageChanges().subscribe(p => {
        ob.next({ percentage: p, url: null });
      })
      task.snapshotChanges().pipe(
        last(),
        concatMap(() => this.storage.ref(filePath).getDownloadURL())).pipe(takeUntil(destroy$)).subscribe(
          url => {
            ob.next({ percentage: 100, url: url });
            ob.complete();
          }
        )
      return () => { destroy$.next(null); destroy$.complete(); }
    })
  }
  getPet(customerId: string, id?: string): Observable<PetModel> {
    return this.afs.doc(`${TABLE}/${customerId}/pet/${id}`).snapshotChanges()
      .pipe(
        map(doc => {
          if (doc.payload.exists) {
            const data = doc.payload.data() as PetModel;
            const payloadId = doc.payload.id;
            return { id: payloadId, ...data };
          }
        })
      )
  }
  deletePet(customerId: string, pet: Partial<PetModel>) {
    this.afs.doc(`${TABLE}/${customerId}/pet/${pet.id}`).delete()
      .catch(error => { console.log(error); })
      .then(() => console.log(`Deleting question (${pet.id}) in (${customerId})`));
  }
  addPet(newpet: Partial<PetModel>, customerId: string) {
    const customer = this.afs.collection(`${TABLE}/${customerId}/pet`);
    const item = { ...newpet }
    return from(newpet.id ? this.afs.doc(`${TABLE}/${customerId}/pet/${newpet.id}`).set(item) : customer.add(item)).pipe(
      map((res: any) => {
        return {
          id: newpet.id ?? res.id,
          ...item
        }
      }),
      switchMap(() =>
        this.get(customerId).pipe(
          first(),
          switchMap(cus => {
            return this.afs.collection(`${TABLE}/${cus.id}/pet`).get()
              .pipe(
                first(),
                map(results => convertSnaps<PetModel>(results)),
                map(results => {
                  cus.url = results.map(it => it.avatar)[0] || cus.url;
                  return results;
                }),
                map(list => list.map(it => it.name).join(' - ')),
                map(desc => {
                  cus.desc = desc;
                  return cus;
                })
              )
          }),
          switchMap((model: CustomerModel) => this.update(model))
        )
      )
    );
  }
  getPetHistory(customerId: string, petId: string, historyId: string): Observable<PetHistoryModel> {
    return this.afs.doc(`${TABLE}/${customerId}/pet/${petId}/history/${historyId}`).snapshotChanges()
      .pipe(
        map(doc => {
          if (doc.payload.exists) {
            const data = doc.payload.data() as PetHistoryModel;
            const payloadId = doc.payload.id;
            return { id: payloadId, ...data };
          }
        }),
        map(this.toDateObject.bind(this))
      )
  }
  getPetHistories(customerId: string, petId: string): Observable<PetHistoryModel[]> {
    return this.afs.collection(`${TABLE}/${customerId}/pet/${petId}/history`, (ref) =>
      ref.orderBy("date")).get()
      .pipe(
        map(results => convertSnaps<PetHistoryModel>(results)),
        map(this.toDate.bind(this))
      )
  }
  addPetHistory(newPetHistory: Partial<PetHistoryModel>, customerId: string, petId: string) {
    const customer = this.afs.collection(`${TABLE}/${customerId}/pet/${petId}/history`);
    const item = { ...newPetHistory }
    return from(newPetHistory.id ? this.afs.doc(`${TABLE}/${customerId}/pet/${petId}/history/${newPetHistory.id}`).set(item) : customer.add(item)).pipe(
      map((res: any) => {
        return {
          id: newPetHistory.id ?? res.id,
          ...item
        }
      })
    );
  }
  listPets(customerId: String): Observable<PetModel[]> {
    return this.afs.collection(`${TABLE}/${customerId}/pet`).get()
      .pipe(
        map(results => convertSnaps<PetModel>(results))
      );
  }
  createCustomer(newCustomer: Partial<CustomerModel>) {
    return this.afs.collection(TABLE,
      ref => ref.orderBy("seqNo", "desc").limit(1))
      .get()
      .pipe(
        concatMap(result => {
          const customer = convertSnaps<CustomerModel>(result);
          const lastSeqNo = customer[0]?.seqNo ?? 0;
          const item = {
            ...newCustomer,
            seqNo: lastSeqNo + 1
          }
          item.search = removeAccents(`${item.fullName} ${item.phone}`).toUpperCase();
          let save$: Observable<any>;

          if (newCustomer.id) {
            save$ = from(this.afs.doc(`${TABLE}/${newCustomer.id}`).set(item));
          }
          else {
            item.url = 'assets/pets/default-avatar.jpg';
            save$ = from(this.afs.collection(TABLE).add(item));
          }
          return save$
            .pipe(
              map(res => {
                return {
                  id: newCustomer.id ?? res.id,
                  ...item
                }
              })
            );
        })
      )
  }
}
