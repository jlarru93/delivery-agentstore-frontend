import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Auth } from 'aws-amplify';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { environment } from 'src/environments/environment';
import jwt_decode from 'jwt-decode';
const serviceToken = 'CognitoIdentityServiceProvider.';

@Injectable({
    providedIn: 'root'
  })
  export class AuthService {
    
    initNameToken = serviceToken + environment.userPoolWebClientId+ "."//'CognitoIdentityServiceProvider.sn8a6iuosla634lfs21127p0a.';
    dataToken = "";
    private cognitoUser: CognitoUser & { challengeParam: {USERNAME:string,phone:string,uuid:string} };
  
    // Get access to window object in the Angular way
    private window: Window;
    constructor(@Inject(DOCUMENT) private document: Document) {
      this.window = this.document.defaultView;
    }
  
    public async signIn(userName: string,password: string) {
      this.cognitoUser = await Auth.signIn(userName,password);
      
    }
  
    public async signOut() {
      await Auth.signOut();
    }
  
    public async answerCustomChallenge(answer: string) {
      
      this.cognitoUser = await Auth.sendCustomChallengeAnswer(this.cognitoUser, answer,this.cognitoUser.challengeParam);
      return this.isAuthenticated();
    }
  
    public getPublicChallengeParameters() {
      return this.cognitoUser.challengeParam;
    }
  
    public async signUp(sms: string, fullName: string) {
      const params = {
        username: sms,
        password: this.getRandomString(30),
        attributes: {
          name: fullName
        }
      };
      await Auth.signUp(params);
    }
  
    private getRandomString(bytes: number) {
      const randomValues = new Uint8Array(bytes);
      this.window.crypto.getRandomValues(randomValues);
      return Array.from(randomValues).map(this.intToHex).join('');
    }
  
    private intToHex(nr: number) {
      return nr.toString(16).padStart(2, '0');
    }
  
    public async  isAuthenticated()  {
      try {
       await  Auth.currentSession();
        return true;
      } catch {
        return false;
      }
    }


    public isAllAuthenticated():boolean{
      this.dataToken="";
      const nameToken = this.initNameToken + this.getNameTokenId() + '.idToken';
      this.dataToken = this.getStorageValue(nameToken) || '';


      if(this.dataToken != null){
        const decode = jwt_decode(this.dataToken) as any;
        const tokenExpire=Number(decode.exp as string);
        const now=Number(new Date().getTime().toString().substring(0,10));
        return tokenExpire>now;
      }else{
        return false;
      }
    }
  
    public async getUserDetails() {
      if (!this.cognitoUser) {
        this.cognitoUser = await Auth.currentAuthenticatedUser();
      }
      return await Auth.userAttributes(this.cognitoUser);
    }

    getAutorizationToken(){
      this.dataToken="";
      const nameToken = this.initNameToken + this.getNameTokenId() + '.idToken';
      this.dataToken = this.getStorageValue(nameToken);
      return this.getStorageValue(nameToken);
    }

    getUserDataToken(){const nameToken = this.initNameToken + this.getNameTokenId() + '.userData';
      return nameToken
    }

    getNameTokenId(){

      let nameTokenid = this.initNameToken + 'LastAuthUser';

      const nameTokenId=this.getStorageValue(nameTokenid)
      return nameTokenId

    }

    resetSecurityObject(): void {
      this.signOut();
    }

    getParameterToken(parameter){
      const tokenId=this.getAutorizationToken()
      const decode = jwt_decode(tokenId) as any
      
      return decode[parameter]
    }
  
    async getCurrentToken(): Promise<string | null> {
      try {
        const session = await Auth.currentSession();
        const accessToken = session.getAccessToken();
        const token = accessToken.getJwtToken();
        return token;
      } catch (error) {
        
        return null;
      }
    }

    async refreshToken(): Promise<boolean> {
      try {
        // Auth.currentSession() automáticamente refresca el token si está expirado
        // y el refreshToken es válido
        const session = await Auth.currentSession();
        
        if (session.isValid()) {
          console.log('Token refrescado exitosamente');
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Error al refrescar token:', error);
        return false;
      }
    }

    getStorageValue(name: string): string {
      // Ahora lee de localStorage en vez de cookies
      return localStorage.getItem(name) || '';
    }

    getUserFromToken(){
      const token=this.getAutorizationToken()
      const decode = jwt_decode(token) as any
      const userToken={
          id:decode?.id??-1,
          name:decode?.name??"-",
          type:decode?.userType??"-",
          zoneIds : decode?.zoneIds??""
      }
      return userToken
    }
  }