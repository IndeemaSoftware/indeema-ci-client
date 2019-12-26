import { Injectable } from '@angular/core';
import {Restangular} from 'ngx-restangular';
import {StorageService} from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
      private rest: Restangular,
      private storage: StorageService
  ) {}

  /**
   * Setup JWT token for API client
   *
   * @param jwt
   */
  setJWT(jwt = null): void{
    if(jwt)
      this.rest = this.rest.withConfig((RestangularConfigurer) => {
        RestangularConfigurer.setDefaultHeaders({ 'Authorization': 'Bearer ' + jwt });
      });
    else
      this.rest = this.rest.withConfig((RestangularConfigurer) => {
        RestangularConfigurer.setDefaultHeaders({ 'Authorization': undefined });
      });
  }

  /**
   * Get request to strapi
   * @return {Promise}
   */
  get(url, params = {}): Promise<any>{
    return new Promise((resolve, reject) => {
      this.rest.all(url).customGET('', params)
          .toPromise()
          .then((res) => {
            resolve(res)
          }, (err) => {
            let message = err.data.message;

            reject(message);
          })
    });
  }

  /**
   * Create by POST request
   *
   * @param url
   * @param body
   * @return {Promise}
   */
  create(url, body): Promise<any>{
    return new Promise((resolve, reject) => {
      this.rest.all(url)
          .customPOST(
              body,
              undefined,
              undefined,
              {
                'Content-Type': undefined
              }
          ).toPromise()
          .then((res) => {
            resolve(res)
          }, (err) => {
            let message = err.data.message;

            reject(message);
          })
    });
  }

  /**
   * Update by PUT request
   *
   * @param url
   * @param body
   * @return {Promise}
   */
  update(url, body): Promise<any> {
    return new Promise((resolve, reject) => {
      this.rest.all(url)
          .customPUT(
              body,
              undefined,
              undefined,
              {
                'Content-Type': undefined
              }
          ).toPromise()
          .then((res) => {
            resolve(res)
          }, (err) => {
            let message = err.data.message;

            reject(message);
          })
    });
  }

  /**
   * Remove by DELETE request
   *
   * @param url
   * @return {Promise}
   */
  remove(url): Promise<any> {
    return new Promise((resolve, reject) => {
      this.rest.all(url)
          .customDELETE('', {}).toPromise()
          .then((res) => {
            resolve(res)
          }, (err) => {
            let message = err.data.message;

            reject(message);
          })
    });
  }
}
