import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { ItemList } from 'src/app/components/list-c/list-c/list-c.component';
import { CustomerService } from 'src/app/services/customer.service';
import { removeAccents } from 'src/app/services/db-utils';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnDestroy {
  destroy$ = new Subject<string>();
  data: ItemList[] = [];
  size = 10 ;
  private searchName = new Subject<string>();
  keyWork = '';
  constructor(private router: Router,private customerService: CustomerService) {
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
      return of(this.data.filter(p => { return removeAccents(p.search.toUpperCase()).indexOf(removeAccents(keyWork.toUpperCase())) != -1; }).sort( (a, b) => a.fullName.localeCompare(b.fullName)).slice(0, this.size));
  }
  init() {
    this.customerService.getAll().pipe(takeUntil(this.destroy$)).subscribe(list => {
      this.data = [...list.map(it => {
        return {
          url: it.url,
          fullName: it.fullName,
          desc: it.desc,
          search: it.search,
          id:it.id
        }
      })];
      this.searchName.next('');
    })
  }
  scrollDownEnd() {
    this.size+=10;
    console.log('load more ' + this.size )
    this.searchName.next(this.keyWork);
  }
  searchByName($event) {
    this.size = 10;
    this.keyWork = $event;
    this.searchName.next($event);
  }
  selectRow(item: ItemList ) {
    this.router.navigate([`/home/tabs/tab1/view-customer`,item.id])
  }
  create($event) {
    this.router.navigate([`/home/tabs/tab1/customer-new`]);
  }
}
