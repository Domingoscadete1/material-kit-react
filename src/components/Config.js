export default class Config {
    static API_URL = 'http://localhost:8000/';
    static APP_NAME = 'MeuApp';
    static API_URL_WS = '8125-105-168-51-155.ngrok-free.app';
    static API_MEDIA_URL='http://localhost:8000';
    static getApiUrlMedia() {
      return this.API_MEDIA_URL;
    }
    static getApiUrl() {
      return this.API_URL;
    }
    static getApiUrlWs() {
      return this.API_URL_WS;
    }
    
  }
  