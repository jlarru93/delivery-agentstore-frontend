import {Component, OnInit} from '@angular/core';
import {PrimeNGConfig} from 'primeng/api';
import { MqttService } from './modules/service/mqtt.service';
import * as JsEncryptModule from 'jsencrypt';
import * as forge from 'node-forge';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit{

    horizontalMenu: boolean;

    darkMode = false;

    menuColorMode = 'light';

    menuColor = 'layout-menu-light';

    themeColor = 'blue';

    layoutColor = 'blue';

    ripple = true;

    inputStyle = 'outlined';

    constructor(private primengConfig: PrimeNGConfig,private mqtt:MqttService) {}

    ngOnInit() {
        console.log("appComponenete")
        this.primengConfig.ripple = true;
        


        this.generateRSAKeyPair().then((keyPair:any) => {
            console.log('Clave Privada (PEM):', keyPair.privateKey);
            console.log('Clave Pública (PEM):', keyPair.publicKey);
            const datoEncriptado=this.encryptData(this.dataToEncrypt,keyPair.publicKey)
            console.log("datoEncriptado",datoEncriptado)
            if(datoEncriptado!=false){
                this.decryptData(datoEncriptado as string,keyPair.privateKey).then((decryptedData) => {
                    console.log('Dato desencriptado:', decryptedData);
                  })
                  .catch((error) => {
                    console.error('Error al desencriptar los datos:', error);
                  });
            }
        })
        .catch((error) => {
        console.error('Error al generar el par de claves:', error);
        });
    }
    dataToEncrypt = 'Datos confidenciales';

    encryptData(data: string, publicKey: string) {
        //const publicKeyPEM = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
        const rsa = new JsEncryptModule.JSEncrypt();
        rsa.setPublicKey(publicKey);
        return rsa.encrypt(data)
    }

    generateRSAKeyPair() {
        return new Promise((resolve, reject) => {
          try {
            const rsa = forge.pki.rsa;
            const keyPair = rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
            const privateKeyPEM = forge.pki.privateKeyToPem(keyPair.privateKey);
            const publicKeyPEM = forge.pki.publicKeyToPem(keyPair.publicKey);
            
            resolve({ privateKey: privateKeyPEM, publicKey: publicKeyPEM });
          } catch (error) {
            reject(error);
          }
        });
    }

    decryptData(encryptedData: string, privateKeyPEM: string) {
        return new Promise((resolve, reject) => {
          try {
            const privateKey = forge.pki.privateKeyFromPem(privateKeyPEM);
            const encryptedBytes = forge.util.decode64(encryptedData);
            const decryptedBytes = privateKey.decrypt(encryptedBytes);
            const decryptedData = forge.util.decodeUtf8(decryptedBytes);
            
            resolve(decryptedData);
          } catch (error) {
            reject(error);
          }
        });
      }
}
