import { Component, Input, OnInit } from '@angular/core';
import { PetHistoryModel } from 'src/app/services/entitys/pet-history.model';

@Component({
  selector: 'app-pets-image-view',
  templateUrl: './pets-image-view.component.html',
  styleUrls: ['./pets-image-view.component.scss'],
})
export class PetsImageViewComponent implements OnInit {
  @Input() data : PetHistoryModel[];
  constructor() { }

  ngOnInit() {}

}
