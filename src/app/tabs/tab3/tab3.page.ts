import { filter } from '@angular-devkit/schematics';
import { query } from '@angular/animations';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, Subject, Subscriber } from 'rxjs';
import { debounceTime, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ItemList } from 'src/app/components/list-c/list-c/list-c.component';
import { AuthService } from 'src/app/services/auth.service';
import { removeAccents } from 'src/app/services/db-utils';
import { UserModel } from 'src/app/services/entitys/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  destroy$ = new Subject<string>();
  data: ItemList[] = [];
  size = 10;
  private searchName = new Subject<string>();
  keyWork = '';
  title = 'Thêm nhân viên';
  isAdmin = false;
  constructor(private router: Router, private userService: UserService, private auth: AuthService) {
    this.init();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
  readonly item$ = this.searchName.pipe(
    debounceTime(250),
    switchMap(keyWork => this.search(keyWork))
  );
  search(keyWork: string): Observable<ItemList[]> {
    return of(this.data.filter(p => { return removeAccents(p.search.toUpperCase()).indexOf(removeAccents(keyWork.toUpperCase())) != -1; }).sort((a, b) => a.fullName.localeCompare(b.fullName)).slice(0, this.size));
  }
  init() {
    this.userService.getAll().pipe(takeUntil(this.destroy$)).subscribe(list => {
      this.data = [...list.map(it => {
        return {
          url: it.photoURL,
          fullName: it.displayName,
          desc: it.phone,
          search: it.displayName,
          id: it.uid
        }
      })];
      this.searchName.next('');
    })
  }
  scrollDownEnd() {
    this.size += 10;
    console.log('load more ' + this.size)
    this.searchName.next(this.keyWork);
  }
  searchByName($event) {
    this.size = 10;
    this.keyWork = $event;
    this.searchName.next($event);
  }
  selectRow(item: ItemList) {
    this.router.navigate([`/home/tabs/tab3/view`, item.id])
  }
  create($event) {
    this.auth.signOut().then(() => {
      this.router.navigate([`/forms/register`]);
    });
  }
}
