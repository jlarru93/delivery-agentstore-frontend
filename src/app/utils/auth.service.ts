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
    // Sin internet NO es "sin sesión": un error de red al renovar el token conserva al usuario dentro.
    return (await this.sessionState()) !== 'invalid';
  }


    public isAllAuthenticated():boolean{
      this.dataToken="";
      const nameToken = this.initNameToken + this.getNameTokenId() + '.idToken';
      this.dataToken = this.getStorageValue(nameToken) || '';


      if(this.dataToken != null && this.dataToken !== ''){
        try {
          const decode = jwt_decode(this.dataToken) as any;
          const tokenExpire=Number(decode.exp as string);
          const now=Number(new Date().getTime().toString().substring(0,10));
          return tokenExpire>now;
        } catch {
          return false;
        }
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

  // ── Sesión: "sin conexión" NO es "sesión vencida" ──
  // El SDK de Cognito solo borra la sesión cuando el servidor dice que ya no sirve (NotAuthorizedException: refresh token vencido o
  // revocado). Un error de red al renovar el token (sin internet, señal débil) deja la sesión intacta: no hay que sacar al usuario.
  public isNetworkError(err: any): boolean {
    const code = err?.code ?? err?.name;
    const msg = String(err?.message ?? err ?? '');
    return code === 'NetworkError' || /network error|failed to fetch|load failed|timed? ?out/i.test(msg);
  }

  // ¿Quedó guardado el refresh token de este equipo? (la sesión sigue existiendo aunque ahora no haya internet)
  private hasStoredSession(): boolean {
    const user = this.getNameTokenId();
    if (!user) return false;
    return !!localStorage.getItem(this.initNameToken + user + '.refreshToken');
  }

  // valid = sesión vigente (renovada si hacía falta); network = no se pudo renovar por falta de conexión, la sesión sigue guardada;
  // invalid = no hay sesión o el servidor la rechazó (hay que iniciar sesión otra vez)
  public async sessionState(): Promise<'valid' | 'network' | 'invalid'> {
    try {
      await Auth.currentSession();
      return 'valid';
    } catch (error) {
      if (this.isNetworkError(error) && this.hasStoredSession()) {
        console.warn('[Auth] sin conexión para renovar la sesión; se conserva');
        return 'network';
      }
      return 'invalid';
    }
  }

  // Igual que refreshToken() pero distingue la falta de conexión de la sesión vencida
  public async refreshOutcome(): Promise<'ok' | 'network' | 'invalid'> {
    const state = await this.sessionState();
    return state === 'valid' ? 'ok' : state;
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