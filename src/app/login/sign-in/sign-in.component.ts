import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/utils/auth.service';
import { COUNTRYCODE, NUMBERPHONELENGTH } from 'src/app/utils/constant';
import { CountryCode, CountryCodes } from 'src/app/utils/country-codes';

@Component({
  selector: 'app-login',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  providers: [MessageService]
})
export class SignInComponent {

  dark: boolean;

  flagButtonnumberphone:boolean=false;
  userName?:string;
  password?:string;
  phoneSubmitted!:boolean;
  errorUserName : string="";
  errorPassword : string="";
  errorSignIn : string="";
  numberPhoneLength= NUMBERPHONELENGTH;

  //dropCountry
  countryCodes: CountryCode[] = CountryCodes;
  selectCountryCode:CountryCode=CountryCodes.find(country=>country.dial_code==COUNTRYCODE);

  constructor(
    private router: Router, 
    private auth: AuthService,
    private messageService: MessageService) { }

   public async signIn() {
    console.log("123")
    if(this.validateForm()){
      return
    }
    
    this.flagButtonnumberphone=true;
    try {
      await this.auth.signIn(this.userName,this.password);
      this.flagButtonnumberphone=false;
      this.router.navigate(['/main']);
    } catch (err) {
      this.flagButtonnumberphone=false;
      this.phoneSubmitted=true;
      // this.errorSignIn = err.message;
      this.messageService.add({severity:'warn', summary: 'Error', detail: 'Datos incorrectos, no se puede ingresar'});
    }
  }

  validateForm(){
    this.phoneSubmitted=false;
      this.errorUserName=""
      this.errorPassword=""
      this.errorSignIn=""
      
    if(this.validUserName(this.userName)){
      this.phoneSubmitted=true;
      // this.errorUserName="Celular es requerido"
      this.messageService.add({severity:'warn', summary: 'Error', detail: 'Celular es requerido'});
      return true
    }
    if(this.validPaswword(this.password)){
      this.phoneSubmitted=true;
      // this.errorPassword="password no coincide"
      this.messageService.add({severity:'warn', summary: 'Error', detail: 'La contraseña no coincide'});
      return true
    }
    return false
   }

   validUserName(userName?:string):boolean{
    if(!userName){
      return true;
    }
    if(userName.length < 3){
      return true;
    }

    return false;
  }

  validPaswword(password?:string):boolean{
    if(password.length<6){
      return true;
    }
    return false;
  }

}
