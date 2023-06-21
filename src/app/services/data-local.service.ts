import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Browser } from '@capacitor/browser';
import { File as IonFile } from '@awesome-cordova-plugins/file/ngx';

import { Register } from '../models/register';
import { NavController } from '@ionic/angular';
import { EmailComposer } from '@awesome-cordova-plugins/email-composer/ngx';

@Injectable({
  providedIn: 'root',
})
export class DataLocalService {
  public registers: Register[] = [];

  constructor(
    private navCtrl: NavController,
    private file: IonFile,
    private emailComposer: EmailComposer
  ) {
    this.getRegisterLS();
  }

  public async saveRegisterLS(format: string, text: string) {
    const newRegister = new Register(format, text);
    this.registers.unshift(newRegister);
    await Preferences.set({
      key: 'register',
      value: JSON.stringify(this.registers),
    });
    this.onOpenRegister(newRegister);
  }

  public async getRegisterLS() {
    const { value } = await Preferences.get({ key: 'register' });
    if (value) {
      this.registers = JSON.parse(value);
    }
  }

  public async onOpenRegister(register: Register) {
    this.navCtrl.navigateForward('/tabs/tab2');

    switch (register.type) {
      case 'http':
        this.openCapacitorSite(register.text);
        break;
      case 'geo':
        this.openMap(register);
        break;
    }
  }

  public openCapacitorSite = async (url: string) => {
    await Browser.open({ url });
  };

  public openMap = (register: Register) => {
    const lngLnt = register.text.split('/@')[1];
    this.navCtrl.navigateForward(`/tabs/map?q=${lngLnt}`);
  };

  public sendEmail() {
    const arrTemp = [];
    const titles = 'Tipo, Formato, Creando en, Text\n';

    arrTemp.push(titles);

    this.registers.forEach((register) => {
      const line = `${register.type}, ${register.format}, ${register.created}, ${register.text}\n`;

      arrTemp.push(line);
    });

    this.createPhysicalFile(arrTemp.join(''));
  }

  public createPhysicalFile(text: string) {
    this.file
      .checkFile(this.file.dataDirectory, 'registers.csv')
      .then((exist) => {
        console.log(exist);
        return this.writeInFile(text);
      })
      .catch((err) => {
        console.log({ err });
        return this.file
          .createFile(this.file.dataDirectory, 'registers.csv', false)
          .then((create) => this.writeInFile(text))
          .catch((err2) => console.log({ err2 }));
      });
  }

  private async writeInFile(text: string) {
    await this.file.writeExistingFile(
      this.file.dataDirectory,
      'registers.csv',
      text
    );

    console.log(this.file.dataDirectory + 'registers.csv');

    const file = this.file.dataDirectory + 'registers.csv';

    const email = {
      to: 'hugoandresdiazbernal@gmail.com',
      // cc: 'erika@mustermann.de',
      // bcc: ['john@doe.com', 'jane@doe.com'],
      attachments: [
        file,
        // 'file://img/logo.png',
        // 'res://icon.png',
        // 'base64:icon.png//iVBORw0KGgoAAAANSUhEUg...',
        // 'file://README.pdf',
      ],
      subject: 'Registros generados',
      body: 'Registros generados el dia de hoy',
      isHtml: true,
    };

    this.emailComposer.open(email);
  }
}
