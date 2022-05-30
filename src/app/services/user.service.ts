import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { from, Observable } from 'rxjs';
import { concatMap, last, map } from 'rxjs/operators';
import { UserModel } from './entitys/user.model';
import { IFireStoreService } from './i-fire-store.service';
const TABLE = 'users';
@Injectable({
  providedIn: 'root',
})
export class UserService extends IFireStoreService<UserModel> {
  constructor(protected afs: AngularFirestore, private storage: AngularFireStorage) {
    super(afs, TABLE);
  }

  add(data: UserModel, id?: string) {
    return this.crudService.add(data, id);
  }
  get(id: string): Observable<UserModel> {
    return this.crudService.get(id);
  }

  update(data: UserModel): Observable<UserModel> {
    return from(this.crudService.update(data));
  }

  delete(data: UserModel) {
    return this.crudService.delete(data.id);
  }
  uploadAvatar(file: File, uid: string): Observable<string> {
    const filePath = `${TABLE}/${uid}/${file.name}`;
    const task = this.storage.upload(filePath, file, {
      cacheControl: "max-age=2592000,public"
    });
    return task.snapshotChanges().pipe(
      last(),
      concatMap(() => this.storage.ref(filePath).getDownloadURL()));
  }
  getAll(): Observable<UserModel[]> {
    return this.crudService.list().pipe(map(this.toDate.bind(this)));
  }
}
