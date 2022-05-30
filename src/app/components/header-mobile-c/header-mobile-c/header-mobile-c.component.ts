import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-header-mobile-c',
  templateUrl: './header-mobile-c.component.html',
  styleUrls: ['./header-mobile-c.component.scss'],
})
export class HeaderMobileCComponent implements OnInit {
  @Output() onBack = new EventEmitter<void>();
  constructor() { }

  ngOnInit() {}

}
