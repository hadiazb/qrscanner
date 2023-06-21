import { Component } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { DataLocalService } from 'src/app/services/data-local.service';

import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  public scannerResult = '';
  public showContent = '';

  constructor(private dataLocalService: DataLocalService) {}

  ionViewWillLeave() {
    this.stopScan();
  }

  public async checkPermission() {
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (status.granted) {
        return true;
      }

      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async startScan() {
    try {
      const permission = await this.checkPermission();
      if (!permission) {
        return;
      }

      await BarcodeScanner.hideBackground();
      document.querySelector('body')!.classList.add('scanner-active');
      this.showContent = 'hidden';
      const result = await BarcodeScanner.startScan();
      BarcodeScanner.showBackground();
      document.querySelector('body')!.classList.remove('scanner-active');
      this.showContent = '';
      if (result.hasContent) {
        this.scannerResult = result.content;
        this.dataLocalService.saveRegisterLS(result.format, result.content);
      }
    } catch (error) {
      this.stopScan();
    }
  }

  public stopScan() {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    document.querySelector('body')!.classList.remove('scanner-active');
    this.showContent = '';
  }
}
