import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument
} from '@angular/fire/firestore';

import { from, Observable, of } from 'rxjs';
import { map, mapTo, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Role } from './role.enum';
import { UserModel } from './entitys/user.model';
import { defaultAvatar } from './constant';
import { IFireStoreService } from './i-fire-store.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
const TABLE = 'users';
@Injectable({
  providedIn: 'root'
})

export class AuthService extends IFireStoreService<UserModel>  {
  mikrotikServer = environment;
  user$: Observable<UserModel | any>;
  ip = "118.69.76.221:8728";
  constructor( private http: HttpClient,private afAuth: AngularFireAuth, protected afs: AngularFirestore, private router: Router) {
    super(afs, TABLE);
    this.afAuth.idTokenResult
    .pipe(
        map(token => <any>token?.claims ?? {admin:false})
    ).subscribe( k => {
      console.log(k)
    })
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<UserModel>(`users/${user.uid}`).snapshotChanges().pipe(
            map( doc => {
              if (doc.payload.exists) {
                const data = doc.payload.data() as UserModel;
                const payloadId = doc.payload.id;
                console.log(" co")
                return { id: payloadId, ...data };
              } else {
                console.log("khong co")
                //  this.signOut().then( () => {
                //   window.location.reload();
                //  });
              }
            }),
            map(this.toDateObject.bind(this))
          );
        } else {
          return of(null);
        }
      })
    );
  }
    createAccountMikrotikLaravel(user: UserModel): Observable<UserModel> {
      return  this.http.post(this.mikrotikServer.mikrotik +"/api/mikrotik/create", {
          email: user.email,
          token: user.token,
          server : this.ip
          }).pipe(map( (rs: any[]) => {
            if ((rs[1] as any[]) .length > 0) {
              return user
            } else {
              return null
            }
          } ))
      }
      checkUserMikrotik(userName: string): Observable<boolean> {
        return  this.http.post(this.mikrotikServer.mikrotik +"/api/check-user.php", {
            email: userName,
            server : this.ip
            }).pipe(map( (rs: any) => {
              return (rs.STATUS === "OK")
            } ))
        }
      createAccountMikrotik(user: UserModel): Observable<UserModel> {
          return  this.http.post(this.mikrotikServer.mikrotik +"/api/create.php", {
              email: user.email,
              token: user.token,
              server : this.ip
              }).pipe(map( (rs: any) => {
                if (rs.STATUS === "OK") {
                  return user
                } else {
                  return null
                }
              } ))
          }

   googleSignIn(): Observable<UserModel>{
    // const provider = new firebase.auth.OAuthProvider('google.com');
    // provider.setCustomParameters({response_type : "code"})
    // from( this.afAuth.signInWithPopup(provider)).subscribe( data =>{
    //   console.log(data)
    // })
    const provider = new firebase.auth.OAuthProvider('google.com');
    provider.setCustomParameters({response_type : "token"});
    // provider.addScope('profile');
    provider.addScope('email');
    return from( this.afAuth.signInWithPopup(provider)).pipe(
        switchMap((res: firebase.auth.UserCredential) => {

          const user: firebase.User = res.user;
          const { uid, email } = user;
          const userRef: AngularFirestoreDocument<UserModel> = this.afs.doc(`users/${user.uid}`);
          return   this.afs.doc(`users/${user.uid}`).get().pipe(switchMap( u => {
            let data = {
              uid,
              email,
              photoURL: defaultAvatar,
              displayName: user.displayName,
              emailVerified: false,
              role: Role.CASHIER,
              active: false,
            } as UserModel;
            if(u.exists) {
              let userTemp  = u.data() as UserModel;
             data = {
               ...data,
               ...userTemp
             }
            }
            return from(userRef.set(data, { merge: true })).pipe(
              switchMap( it =>  from(res.user.getIdTokenResult()).pipe(map( tokenResult =>{
                data.token = tokenResult.token;
                return data
              })))

            );
          }))

        })
      )
  }

  login(email: string, password: string): Observable<firebase.User> {
    return from(this.afAuth.signInWithEmailAndPassword(email, password)).pipe(map(it => it.user))
  }
  register(userModel: UserModel): Observable<UserModel> {
    return from(this.afAuth
      .createUserWithEmailAndPassword(userModel.email, userModel.password)).pipe(
        switchMap((res: firebase.auth.UserCredential) => {
          const user: firebase.User = res.user;
          const { uid, email } = user;
          delete userModel.password;
          const data = {
            uid,
            email,
            photoURL: defaultAvatar,
            displayName: userModel.displayName,
            emailVerified: false,
            role: Role.CASHIER,
            active: false,
            ...userModel
          } as UserModel;
          const userRef: AngularFirestoreDocument<UserModel> = this.afs.doc(`users/${user.uid}`);
          return from(userRef.set(data, { merge: true })).pipe(mapTo(data))
        })
      )
  }
  async signOut() {
    await this.afAuth.signOut();
  }
}



