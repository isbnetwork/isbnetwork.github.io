import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor() {
    document.body.setAttribute('data-theme', 'light');
    document.body.classList.toggle('dark', false);
  }
  get isMobile() {
    return ((window.innerWidth < 768));
  }
}
