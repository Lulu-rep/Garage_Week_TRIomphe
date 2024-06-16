import { HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';

export interface Options {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  observe?: 'body';
  context?: HttpContext;
  params?:
    | HttpParams
    | {
        [param: string]:
          | string
          | number
          | boolean
          | ReadonlyArray<string | number | boolean>;
      };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  transferCache?:
    | {
        includeHeaders?: string[];
      }
    | boolean;
}

export interface SensorData {
    _id?:string;
    temperature:number;
    humidity:number;
    light:number;
    dust:number;
    date:Date;
}

export interface Machine {
  _id:string;
  name:string;
}

export interface User {
  login:string;
  password:string;
}