import { Component, Input, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-popup-avatar',
  templateUrl: './popup-avatar.component.html',
  styleUrls: ['./popup-avatar.component.scss'],
})
export class PopupAvatarComponent implements OnInit {
  @Input() imageChangedEvent: any = '';
  croppedImage: any = '';
  constructor( private modalCtrl: ModalController,) { }
  ngOnInit() {
  }
  imageCropped(event: ImageCroppedEvent) {
      this.croppedImage = event.base64;
  }
  async submit() {
      await this.modalCtrl.dismiss({
        data: this.croppedImage
       });
  }
}
