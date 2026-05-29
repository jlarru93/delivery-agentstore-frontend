import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    private routeActive: ActivatedRoute,
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
      this.toRedirect()
    } catch (err) {
      this.flagButtonnumberphone=false;
      this.phoneSubmitted=true;
      // this.errorSignIn = err.message;
      this.messageService.add({severity:'warn', summary: 'Error', detail: 'Datos incorrectos, no se puede ingresar'});
    }
  }

  toRedirect(){
    this.routeActive.queryParams.subscribe((param)=>{
      let dst='/main'
      let queryParams={}
      const paramDst=param['destination'] as string
      if(paramDst){
        dst=paramDst.split("?")[0]
        queryParams=this.converQueryParamsStringToObject(paramDst)
        console.log("queryParams:::",queryParams)
      }
      this.router.navigate([dst],{queryParams:queryParams});
    })
   
  }

  converQueryParamsStringToObject(query:string){
    if(!query || query?.trim()?.length==0){
      return {}
    }
    // Crea una instancia de la clase URL
    const urlObj = new URL(query, 'http://localhost'); // Base URL es requerida
    // Crear un objeto para almacenar los query parameters
    const params: Record<string, string> = {};
    // Itera sobre los query parameters y agrégalos al objeto
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
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

  /**
   * Abre el form público de registro de comercios — Apple Guideline 3.2.
   * En Capacitor `window.open(_, '_blank')` delega al navegador del sistema
   * (Safari en iOS, Chrome en Android), que es lo que Apple espera ver.
   */
  openRegister(): void {
    window.open('https://piwi.pe/#/comercios/registro', '_blank');
  }

}
