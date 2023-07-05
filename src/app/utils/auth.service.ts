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
      console.log(this.cognitoUser)
    }
  
    public async signOut() {
      await Auth.signOut();
    }
  
    public async answerCustomChallenge(answer: string) {
      console.log(this.cognitoUser)
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
      this.dataToken = localStorage.getItem(nameToken);


      if(this.dataToken != null){
        const decode = jwt_decode(this.dataToken) as any
        const tokenExpire=Number(decode.exp as string)
        const now=Number(new Date().getTime().toString().substring(0,10))
        return tokenExpire>now
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
      this.dataToken = localStorage.getItem(nameToken);
       //console.log("TOKEN" , this.dataToken)
      return localStorage.getItem(nameToken);
    }

    getNameTokenId(){

      let nameTokenid = this.initNameToken + 'LastAuthUser';

     return localStorage.getItem(nameTokenid);

    }

    resetSecurityObject(): void {
      this.signOut();
    }

    getParameterToken(parameter){
      const tokenId=this.getAutorizationToken()
      const decode = jwt_decode(tokenId) as any
      console.log(decode[parameter])
      return decode[parameter]
    }
  
    async getCurrentToken(): Promise<string | null> {
      try {
        const session = await Auth.currentSession();
        const accessToken = session.getAccessToken();
        const token = accessToken.getJwtToken();
        return token;
      } catch (error) {
        console.log('Error al obtener el token:', error);
        return null;
      }
    }
    async refreshToken(){
      const currentToken = await this.getCurrentToken();
      if (currentToken) {
        try {
          const user = await Auth.currentAuthenticatedUser();
          const cognitoUser = await Auth.currentAuthenticatedUser();
          const refreshedUser = cognitoUser.refreshSession(user.signInUserSession.refreshToken);
          const refreshedToken = refreshedUser.signInUserSession.accessToken.jwtToken;
          console.log('Token actualizado:', refreshedToken);
        } catch (error) {
          console.log('Error al actualizar el token:', error);
        }
      }
    }
  }
  