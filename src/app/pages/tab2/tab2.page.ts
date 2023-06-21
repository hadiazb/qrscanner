import { Component } from '@angular/core';
import { DataLocalService } from '../../services/data-local.service';
import { Register } from 'src/app/models/register';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  public registers: Register[] = [];
  constructor(private dataLocalService: DataLocalService) {}

  ionViewWillEnter() {
    this.loadRegisters();
  }

  public sendEmail() {
    this.dataLocalService.sendEmail();
  }

  public async onOpenRegister(register: Register) {
    await this.dataLocalService.onOpenRegister(register);
  }

  public loadRegisters() {
    this.registers = this.dataLocalService.registers;
  }
}
