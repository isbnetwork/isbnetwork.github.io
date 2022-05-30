import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface ItemList {
  url: string;
  fullName: string;
  desc: string;
  search: string;
  id: string;
}
@Component({
  selector: 'app-list-c',
  templateUrl: './list-c.component.html',
  styleUrls: ['./list-c.component.scss']
})
export class ListCComponent implements OnInit {
  @Input() title = 'Thêm khách hàng';
  @Input() data: ItemList[] = [];
  @Output() onSearch = new EventEmitter<string>();
  @Output() onSelect = new EventEmitter<ItemList>();
  @Output() onCrate = new EventEmitter<void>();
  @Output() onScrollDownEnd = new EventEmitter<void>();
  constructor() { }

  ngOnInit() { }
  searchByName($event) {
    this.onSearch.next($event.target.value);
  }
  create() {
    this.onCrate.emit();
  }

  onScrollDown(ev: any) {
    this.onScrollDownEnd.emit();
  }

  onScrollUp(ev: any) { }
}
